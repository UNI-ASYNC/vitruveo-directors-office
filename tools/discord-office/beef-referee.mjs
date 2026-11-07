#!/usr/bin/env node
/**
 * Vitruveo Office Forum-only beef referee.
 *
 * Watches the existing "what-are-your-concerns" Forum (not DM/private rooms).
 * Carefully bounded text heuristics avoid policing opinions or profanity alone.
 * After a warning and continued mutual personal insults, applies 300-second
 * slowmode to the ONE discussion for 300 seconds. It never times out members.
 * The Beef Room is unaffected. Restores the exact prior slowmode on expiry.
 *
 * Requires Gateway Message Content privileged intent, GuildMessages and
 * bot permissions ViewChannel, SendMessagesInThreads, ManageThreads.
 * --check does not modify Discord; --run requires explicit confirmation.
 * This script must stay running; state survives process restart.
 */
import "dotenv/config";
import {Client,GatewayIntentBits,ChannelType,PermissionFlagsBits as P} from "discord.js";
import {readFile,writeFile,rename} from "node:fs/promises";

const GUILD="1020154218029531197",FORUM="what-are-your-concerns",BEEF="beef-room";
const STATE_FILE="beef-referee-state.json";
const WINDOW_MS=180000, COOLDOWN_MS=300000, SLOWMODE_SECS=300;
const mode=process.argv[2]||"--check";
if(!["--check","--run"].includes(mode))throw new Error("Use --check or --run");
if(process.env.DISCORD_GUILD_ID!==GUILD || !process.env.DISCORD_BOT_TOKEN)
 throw new Error("Set DISCORD_GUILD_ID and DISCORD_BOT_TOKEN privately.");
if(mode==="--run" && process.env.DISCORD_BEEF_REFEREE_CONFIRM!=="RUN_FORUM_ONLY_REFEREE")
 throw new Error("Missing DISCORD_BEEF_REFEREE_CONFIRM=RUN_FORUM_ONLY_REFEREE");
const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent]});
const events=new Map(),lastWarned=new Map();
let state={};let saving=Promise.resolve();let restoring=false;
const directed=/(\byou\b|\byour\b|\byou're\b|<@!?\d+>)/i;
// Strict targeted insults, not criticism of institutions or generic swearing.
const insulting=/\b(you(?:'re| are)?\s+(?:an?\s+)?(?:idiot|moron|liar|clown|stupid|dumb|fraud)|shut\s+up|your\s+brain|you're\s+full\s+of\s+(?:shit|crap)|you\s+don't\s+know\s+shit)\b/i;
function normalize(s){return String(s||"").toLowerCase();}
async function save(){
 const snapshot=JSON.stringify(state,null,2)+"\n";
 saving=saving.catch(()=>{}).then(async()=>{
  await writeFile(STATE_FILE+".tmp",snapshot,{mode:0o600});
  await rename(STATE_FILE+".tmp",STATE_FILE);
 });
 return saving;
}
async function restoreDue(){
 if(restoring)return;restoring=true;
 try{
 for(const [id,entry] of Object.entries(state)){
   if(Date.now()<entry.until)continue;
   try{
     const thread=await client.channels.fetch(id);
     if(!thread||!thread.isThread()||thread.parentId!==entry.forumId){
       console.log("CANNOT RESTORE: thread moved or missing",id);continue;
     }
     // If a moderator changed slowmode in the meantime, do not overwrite it.
     if(thread.rateLimitPerUser!==SLOWMODE_SECS){
       console.log("KEEP MANUAL CHANGE",id,thread.rateLimitPerUser);
     }else{
       await thread.setRateLimitPerUser(entry.previous,"Referee five-minute cooling period finished");
       console.log("RESTORED FORUM THREAD",id,"slowmode=",entry.previous);
     }
     delete state[id]; await save();
   }catch(e){console.error("RESTORE RETRY",id,e.message);}
 }
 }finally{restoring=false;}
}
async function handleMessage(m,forum,beef){
 if(m.author.bot||!m.guild||m.guild.id!==GUILD)return;
 const thread=m.channel;
 if(!thread.isThread()||thread.parentId!==forum.id || state[thread.id])return;
 if(!m.content)return;
 const now=Date.now();
 const history=(events.get(thread.id)||[]).filter(x=>now-x.time<WINDOW_MS);
 const lower=normalize(m.content);
 history.push({id:m.author.id,time:now,friction:directed.test(lower)&&insulting.test(lower)});
 events.set(thread.id,history.slice(-30));
 // Require two people BOTH targeting each other across a sustained exchange,
 // not just a single heated or profane message.
 const count=new Map();
 for(const h of history){
   const x=count.get(h.id)||{total:0,friction:0};
   x.total++; if(h.friction)x.friction++;
   count.set(h.id,x);
 }
 const pair=[...count.entries()].filter(([id,x])=>x.total>=3 && x.friction>=2);
 if(pair.length<2 || history.length<8)return;
 const prior=lastWarned.get(thread.id);
 if(!prior || now-prior.time>WINDOW_MS){
   if(mode==="--run"){
     await thread.send({content:`🥊 **Take the personal argument to <#${beef.id}>.** This Forum thread is for the subject, not a back-and-forth spat. Disagreement and criticism are welcome. If the personal attacks keep going, this thread gets a temporary five-minute slowmode. No one is timed out from the server.`,allowedMentions:{parse:[]}});
   }else console.log("WOULD WARN",thread.name,thread.id);
   lastWarned.set(thread.id,{time:now,frictions:history.filter(x=>x.friction).length});
   return;
 }
 const newFrictions=history.filter(x=>x.friction).length-prior.frictions;
 if(now-prior.time<12000 || newFrictions<3)return;
 if(mode==="--check"){console.log("WOULD COOLDOWN",thread.name);return;}
 const previous=thread.rateLimitPerUser || 0;
 if(previous>=SLOWMODE_SECS){console.log("ALREADY SLOWMODE",thread.name);return;}
 // Save desired restore state BEFORE mutating Discord. If Discord call fails,
 // rollback saved state immediately to avoid a phantom restore.
 state[thread.id]={previous,until:Date.now()+COOLDOWN_MS,forumId:forum.id};
 await save();
 try{
   await thread.setRateLimitPerUser(SLOWMODE_SECS,"Repeated mutual personal attacks after referee warning");
   console.log("COOLDOWN",thread.name,thread.id,"for 5 minutes; Beef Room open");
 }catch(e){delete state[thread.id];await save();throw e;}
 events.delete(thread.id);lastWarned.delete(thread.id);
}
try{
 try{state=JSON.parse(await readFile(STATE_FILE,"utf8"));}catch(e){if(e.code!=="ENOENT")throw e;}
 await client.login(process.env.DISCORD_BOT_TOKEN);
 const guild=await client.guilds.fetch(GUILD);
 const channels=await guild.channels.fetch();
 const forum=[...channels.values()].filter(x=>x&&x.name===FORUM&&x.type===ChannelType.GuildForum);
 const beef=[...channels.values()].filter(x=>x&&x.name===BEEF&&x.type===ChannelType.GuildText);
 if(forum.length!==1||beef.length!==1)throw new Error("Expected exactly one intended Forum and Beef Room.");
 const me=await guild.members.fetchMe();
 const required=[P.ViewChannel,P.SendMessagesInThreads,P.ManageThreads];
 for(const bit of required){
   if(!forum[0].permissionsFor(me)?.has(bit))throw new Error("Missing Forum permission "+String(bit));
 }
 if(!client.options.intents.has(GatewayIntentBits.MessageContent))throw new Error("Message content intent is required");
 console.log("REFEREE",mode,"Forum",forum[0].id,"Beef Room",beef[0].id,
   "cooldown 300 seconds in affected thread only; never server timeout");
 if(mode==="--check"){
   console.log("CHECK COMPLETE: no messages sent, no permissions changed. Live listener not started.");
   client.destroy();
 }else{
   client.on("messageCreate",m=>{handleMessage(m,forum[0],beef[0]).catch(e=>console.error("HANDLE",e.message));});
   await restoreDue();
   const interval=setInterval(()=>{restoreDue().catch(e=>console.error(e.message))},10000);
   interval.unref();
   console.log("LISTENING. Leave this process running. Ctrl+C to stop; cooldown restore state persists.");
   const stop=()=>{clearInterval(interval);client.destroy();process.exit(0);};
   process.once("SIGINT",stop);process.once("SIGTERM",stop);
 }
}catch(e){console.error("REFEREE ERROR:",e.message);client.destroy();process.exitCode=1;}
