#!/usr/bin/env node
// Create or inspect subject-based threads in an existing Discord forum.
// Never creates an additional forum, changes permissions, deletes posts, or
// posts to any channel outside the designated what-are-your-concerns Forum.
import "dotenv/config";
import { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } from "discord.js";
import { subjects } from "./forum-subjects.mjs";

const GUILD="1020154218029531197";
const FORUM_NAME="what-are-your-concerns";
const CONFIRM="CREATE_OFFICE_FORUM_SUBJECTS";
const mode=process.argv[2]||"--plan";
if(!["--plan","--check","--apply"].includes(mode))throw new Error("Choose --plan, --check or --apply");
for(const s of subjects){
 if(s.title.length>100 || s.body.length>1900)throw new Error("Invalid forum subject size: "+s.title);
}
if(mode==="--plan"){
 for(const s of subjects)console.log("\n========== "+s.title+" =========\n"+s.body);
 console.log("\nPLAN ONLY: nine subject-based Forum discussions; no Issue # thread titles, no Discord changes.");
 process.exit(0);
}
if(process.env.DISCORD_GUILD_ID!==GUILD)throw new Error("Wrong Discord server; stopped.");
if(!process.env.DISCORD_BOT_TOKEN)throw new Error("Set DISCORD_BOT_TOKEN privately.");
if(mode==="--apply"&&process.env.DISCORD_OFFICE_FORUM_CONFIRM!==CONFIRM)
 throw new Error("Missing approval DISCORD_OFFICE_FORUM_CONFIRM="+CONFIRM);
const client=new Client({intents:[GatewayIntentBits.Guilds]});
try{
 await client.login(process.env.DISCORD_BOT_TOKEN);
 const guild=await client.guilds.fetch(GUILD);
 const me=await guild.members.fetchMe();
 if(me.permissions.has(PermissionFlagsBits.Administrator))throw new Error("Administrator is not needed. Remove it from the bot.");
 const channels=await guild.channels.fetch();
 const forums=[...channels.values()].filter(c=>c && c.type===ChannelType.GuildForum && c.name===FORUM_NAME);
 if(forums.length!==1)throw new Error("Expected exactly one Forum named "+FORUM_NAME+"; found "+forums.length+". No changes.");
 const forum=forums[0];
 const permissions=forum.permissionsFor(me);
 const required=[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.CreatePublicThreads,PermissionFlagsBits.SendMessagesInThreads];
 const missing=required.filter(x=>!permissions?.has(x));
 if(missing.length)throw new Error("Office Sentinel lacks Forum posting permissions (View Channel / Create Public Threads / Send Messages in Threads). No changes. A script cannot grant itself permissions.");
 // Inspect both active and public archived posts, to avoid duplicate subjects.
 const active=await forum.threads.fetchActive();
 const archived=await forum.threads.fetchArchived({type:"public",limit:100});
 const existing=[...active.threads.values(),...archived.threads.values()];
 const normalize=s=>s.normalize("NFKC").toLowerCase().replace(/^[^a-z0-9]+/u,"").replace(/\s+/g," ").trim();
 const existingNames=new Set(existing.map(t=>normalize(t.name)));
 const pending=subjects.filter(s=>!existingNames.has(normalize(s.title)));
 console.log("Forum:",forum.name,forum.id);
 for(const s of subjects) console.log((pending.includes(s)?"CREATE ":"KEEP   ")+s.title);
 if(mode==="--check"){console.log("CHECK ONLY; zero changes.");process.exit(0);}
 // Create one native Forum post per subject. No role/channel changes.
 for(const s of pending){
   const thread=await forum.threads.create({
     name:s.title,
     message:{content:s.body,allowedMentions:{parse:[]}},
     reason:"Oldjug-approved subject-based public Office Forum"
   });
   console.log("CREATED "+s.title+" "+thread.url);
 }
 console.log("DONE: "+pending.length+" new Forum subjects. No preexisting threads were edited.");
}finally{client.destroy();}
