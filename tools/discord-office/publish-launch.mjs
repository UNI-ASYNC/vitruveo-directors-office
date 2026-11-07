#!/usr/bin/env node
// Native-text Discord publisher. Read-only preview/preflight by default.
// Explicit --publish and confirmation required to send anything.
// This script does not upload PDFs or assets, edit channels, change roles or delete posts.
import "dotenv/config";
import { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, MessageFlags } from "discord.js";
import { posts } from "./launch-posts.mjs";

const GUILD="1020154218029531197";
const [mode="--preview"]=process.argv.slice(2);
if(!["--preview","--check","--publish"].includes(mode)) throw new Error("Choose --preview, --check or --publish");
if(mode==="--preview"){
  console.log("VITRUVEO DIRECTOR'S OFFICE — NATIVE DISCORD LAUNCH POSTS");
  for(const p of posts){
    if(p.text.length>1900)throw new Error("Too long: "+p.channel);
    console.log("\n========== #"+p.channel+" ["+p.id+"] ("+p.text.length+" chars) ==========");
    console.log(p.text);
  }
  console.log("\nPREVIEW ONLY: nothing sent. No PDFs, files, or attachments.");
  process.exit(0);
}
if(process.env.DISCORD_GUILD_ID!==GUILD) throw new Error("Wrong guild ID");
if(!process.env.DISCORD_BOT_TOKEN)throw new Error("DISCORD_BOT_TOKEN missing");
if(mode==="--publish"&&process.env.DISCORD_OFFICE_POST_CONFIRM!=="POST_APPROVED_OFFICE_LAUNCH")
 throw new Error("No publish confirmation. No messages sent.");
const client=new Client({intents:[GatewayIntentBits.Guilds]});
try{
 await client.login(process.env.DISCORD_BOT_TOKEN);
 const guild=await client.guilds.fetch(GUILD);
 const me=await guild.members.fetchMe();
 const checks=[];
 for(const p of posts){
   const ch=await guild.channels.fetch(p.id);
   if(!ch||ch.guildId!==GUILD||ch.name!==p.channel||ch.type!==ChannelType.GuildText)
     throw new Error("Channel name/id/type mismatch for "+p.channel+". No messages sent.");
   const perm=ch.permissionsFor(me);
   const needed=[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory];
   const missing=needed.filter(bit=>!perm?.has(bit)).map(bit=>String(bit));
   const recent=missing.length?[]:[...(await ch.messages.fetch({limit:50})).values()];
   const own=recent.filter(m=>m.author.id===client.user.id);
   const matching=own.some(m=>m.content===p.text);
   const competing=own.some(m=>m.content.startsWith(p.text.split("\n")[0]) && m.content!==p.text);
   checks.push({p,ch,missing,matching,competing});
   console.log("#"+p.channel+": "+(missing.length?"MISSING PERMISSIONS":matching?"ALREADY POSTED":competing?"EXISTING DIFFERENT BOT POST — REVIEW":"READY"));
 }
 if(checks.some(x=>x.missing.length||x.competing)){
   console.error("STOP: resolve inaccessible channels or conflicting previous posts first. Zero messages sent.");
   process.exitCode=1;
 }else if(mode==="--check"){
   console.log("CHECK ONLY: no messages sent.");
 }else{
   for(const x of checks){
     if(x.matching){console.log("SKIP #"+x.p.channel+" (already present)");continue;}
     await x.ch.send({content:x.p.text,flags:MessageFlags.SuppressEmbeds,allowedMentions:{parse:[]}});
     console.log("POSTED #"+x.p.channel);
   }
   console.log("DONE: posts sent. Manually review and pin as appropriate. Rules Screening is separate.");
 }
}finally{client.destroy();}
