#!/usr/bin/env node
// Publish the EXACT "How to participate" section of the repository README
// to the existing Discord #office-progress channel. No duplicated copy text.
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { Client,GatewayIntentBits,ChannelType,PermissionFlagsBits as P,MessageFlags } from "discord.js";
const GUILD="1020154218029531197";
const CHANNEL="1568441579226796063";
const NAME="office-progress";
const START="## How to participate\n\n";
const END="\n## Public development proposals";
const CONFIRM="PUBLISH_SHARED_PARTICIPATION_GUIDE";
const mode=process.argv[2]||"--preview";
if(!["--preview","--check","--apply"].includes(mode))
 throw new Error("Use --preview, --check or --apply");
const readme=await readFile(new URL("../../README.md",import.meta.url),"utf8");
const s=readme.indexOf(START);
const e=readme.indexOf(END,s+START.length);
if(s<0||e<0)throw new Error("Participation section not found or boundary changed in README.md.");
const message=readme.slice(s+START.length,e).trim();
if(!message.startsWith("**HOW TO PARTICIPATE — VITRUVEO DIRECTOR'S OFFICE**")||message.length>1900)
 throw new Error("Unexpected participation guide heading or overlong content: "+message.length);
if(mode==="--preview"){
 console.log("Exact GitHub README section -> Discord #office-progress ("+message.length+" characters):\n\n"+message);
 console.log("\nPREVIEW ONLY: no Discord connection or posts.");
 process.exit(0);
}
if(process.env.DISCORD_GUILD_ID!==GUILD||!process.env.DISCORD_BOT_TOKEN)
 throw new Error("Set Office Sentinel DISCORD_GUILD_ID and DISCORD_BOT_TOKEN privately.");
if(mode==="--apply"&&process.env.DISCORD_OFFICE_PARTICIPATION_CONFIRM!==CONFIRM)
 throw new Error("Missing DISCORD_OFFICE_PARTICIPATION_CONFIRM="+CONFIRM);
const client=new Client({intents:[GatewayIntentBits.Guilds]});
try{
 await client.login(process.env.DISCORD_BOT_TOKEN);
 const guild=await client.guilds.fetch(GUILD);
 const ch=await guild.channels.fetch(CHANNEL);
 const me=await guild.members.fetchMe();
 if(!ch||ch.guildId!==GUILD||ch.name!==NAME||ch.type!==ChannelType.GuildText)
   throw new Error("Office channel name/id/type mismatch: no posts made.");
 const perms=ch.permissionsFor(me);
 for(const bit of [P.ViewChannel,P.SendMessages,P.ReadMessageHistory]){
   if(!perms?.has(bit))throw new Error("Office Sentinel lacks message access in #"+NAME);
 }
 const recent=await ch.messages.fetch({limit:100});
 const own=[...recent.values()].filter(m=>m.author.id===client.user.id);
 const exact=own.find(m=>m.content===message);
 const heading="**HOW TO PARTICIPATE — VITRUVEO DIRECTOR'S OFFICE**";
 const alternate=own.filter(m=>m.content.startsWith(heading)&&m.content!==message);
 console.log("Office #"+NAME+": "+(exact?"ALREADY POSTED":alternate.length?"CONFLICT: prior different guide exists":"READY"));
 if(alternate.length)throw new Error("Conflicting Office Sentinel guide detected. Refusing duplicate; inspect existing post.");
 if(mode==="--check"){
   console.log("CHECK ONLY. No messages sent.");
 }else if(exact){
   console.log("SKIP: exactly matching README guide already posted.");
 }else{
   const sent=await ch.send({content:message,allowedMentions:{parse:[]},flags:MessageFlags.SuppressEmbeds});
   console.log("POSTED shared README guide to #"+NAME+" as message "+sent.id);
 }
}finally{client.destroy();}
