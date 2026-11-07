#!/usr/bin/env node
// Edit only original, bot-authored Forum starter messages to replace non-URL
// GitHub issue references with clickable full HTTPS links. No repost/delete.
import "dotenv/config";
import {Client,GatewayIntentBits,ChannelType,PermissionFlagsBits as P} from "discord.js";
import {subjects} from "./forum-subjects.mjs";

const GUILD="1020154218029531197";
const FORUM="1568293263243350068";
const CONFIRM="FIX_FORUM_ISSUE_LINKS";
const mode=process.argv[2]||"--check";
if(!["--check","--apply"].includes(mode))throw new Error("Expected --check or --apply");
if(process.env.DISCORD_GUILD_ID!==GUILD||!process.env.DISCORD_BOT_TOKEN)
 throw new Error("Set DISCORD_GUILD_ID and DISCORD_BOT_TOKEN locally.");
if(mode==="--apply"&&process.env.DISCORD_OFFICE_LINKS_CONFIRM!==CONFIRM)
 throw new Error("Missing DISCORD_OFFICE_LINKS_CONFIRM="+CONFIRM);
const oldReference=/https:\/\/github\.com\/UNI-ASYNC\/vitruveo-directors-office\/issues\/(\d+)/g;
const client=new Client({intents:[GatewayIntentBits.Guilds]});
try{
 await client.login(process.env.DISCORD_BOT_TOKEN);
 const guild=await client.guilds.fetch(GUILD);
 const forum=await guild.channels.fetch(FORUM);
 if(!forum||forum.guildId!==GUILD||forum.type!==ChannelType.GuildForum||forum.name!=="what-are-your-concerns")
   throw new Error("Forum ID/name/type mismatch. Nothing edited.");
 const me=await guild.members.fetchMe();
 if(!forum.permissionsFor(me)?.has(P.ReadMessageHistory))
   throw new Error("Sentinel cannot read Forum messages.");
 const active=await forum.threads.fetchActive();
 const archived=await forum.threads.fetchArchived({type:"public",limit:100});
 const threads=[...new Map([...active.threads.values(),...archived.threads.values()].map(t=>[t.id,t])).values()];
 const changes=[];
 for(const subject of subjects.filter(s=>s.body.includes("https://github.com/"))){
   const matching=threads.filter(t=>t.parentId===FORUM&&t.name===subject.title);
   if(matching.length!==1)throw new Error("Expected exactly one subject thread: "+subject.title);
   const thread=matching[0];
   const starter=await thread.fetchStarterMessage();
   if(!starter||starter.author.id!==client.user.id)
     throw new Error("Starter message not owned by Office Sentinel: "+subject.title);
   const legacy=subject.body.replace(oldReference,"UNI-ASYNC/vitruveo-directors-office/$1");
   if(starter.content===subject.body){
     console.log("ALREADY CLICKABLE",subject.title);
   }else if(starter.content===legacy){
     console.log("FIX LINKS",subject.title);
     changes.push({thread,starter,text:subject.body});
   }else throw new Error("Starter text differs from approved source for "+subject.title+"; no edits.");
 }
 console.log("Eligible Forum starters:",changes.length);
 if(mode==="--check"){
   console.log("CHECK ONLY: No messages edited.");
 }else{
   for(const x of changes){
     await x.starter.edit({content:x.text,allowedMentions:{parse:[]}});
     console.log("CORRECTED",x.thread.name,x.starter.id);
   }
   console.log("DONE: "+changes.length+" original Forum opening posts updated; no reposts or deletions.");
 }
}finally{client.destroy();}
