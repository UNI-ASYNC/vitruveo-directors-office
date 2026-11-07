#!/usr/bin/env node
// One-time exact spelling correction in the Office Sentinel's own launch messages.
// Only replaces "Old Jug" with "Oldjug" in existing bot-owned messages,
// in three allowlisted Office channels. Does not repost, delete or alter other authors.
import "dotenv/config";
import {Client,GatewayIntentBits,ChannelType,PermissionFlagsBits as P} from "discord.js";
import {posts} from "./launch-posts.mjs";
const GUILD="1020154218029531197";
const permitted=new Set(["about-the-office","office-announcements","rules"]);
const mode=process.argv[2]||"--check";
if(!["--check","--apply"].includes(mode))throw new Error("Expected --check or --apply");
if(process.env.DISCORD_GUILD_ID!==GUILD||!process.env.DISCORD_BOT_TOKEN)
 throw new Error("Set DISCORD_GUILD_ID and DISCORD_BOT_TOKEN in your local shell.");
if(mode==="--apply"&&process.env.DISCORD_OFFICE_EDIT_CONFIRM!=="CORRECT_OLDJUG_SPELLING")
 throw new Error("Missing DISCORD_OFFICE_EDIT_CONFIRM=CORRECT_OLDJUG_SPELLING.");
const client=new Client({intents:[GatewayIntentBits.Guilds]});
try{
 await client.login(process.env.DISCORD_BOT_TOKEN);
 const guild=await client.guilds.fetch(GUILD);
 const me=await guild.members.fetchMe();
 const changes=[];
 for(const p of posts.filter(p=>permitted.has(p.channel))){
   const ch=await guild.channels.fetch(p.id);
   if(ch?.guildId!==GUILD||ch.name!==p.channel||ch.type!==ChannelType.GuildText)
    throw new Error("Wrong channel "+p.channel);
   if(!ch.permissionsFor(me)?.has(P.ReadMessageHistory))
    throw new Error("Cannot view message history in "+p.channel);
   const recent=await ch.messages.fetch({limit:100});
   const before=p.text.replaceAll("Oldjug","Old Jug");
   const old=[...recent.values()].filter(m=>m.author.id===client.user.id&&m.content===before);
   const updated=[...recent.values()].filter(m=>m.author.id===client.user.id&&m.content===p.text);
   if(old.length>1)throw new Error("Multiple candidate messages in "+p.channel+"; refused.");
   if(old.length&&updated.length)throw new Error("Both old and new versions found in "+p.channel+"; refused.");
   if(old.length)changes.push({p,m:old[0]});
   console.log("#"+p.channel+": "+(old.length?"CORRECT SPELLING":updated.length?"ALREADY CORRECT":"NO EXACT MATCH; NO EDIT"));
 }
 if(mode==="--check"){
   console.log("CHECK ONLY: "+changes.length+" exact bot-owned messages ready for correction; nothing edited.");
 }else{
   for(const {p,m} of changes){
     await m.edit({content:p.text,allowedMentions:{parse:[]}});
     console.log("CORRECTED #"+p.channel+" "+m.id);
   }
   console.log("DONE: "+changes.length+" messages edited in place. No reposts or deletions.");
 }
}finally{client.destroy();}
