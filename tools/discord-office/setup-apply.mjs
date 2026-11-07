#!/usr/bin/env node
// Vitruveo Director's Office additive installer. No deletes, moves, renames,
// permission edits on preexisting channels, member assignments, or message posts.
import "dotenv/config";
import { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } from "discord.js";

const GUILD="1020154218029531197";
const mode=process.argv[2] ?? "--help";
if (!["--apply","--help"].includes(mode)) throw new Error("Expected --apply or --help");
if(mode==="--help") {
 console.log("This script only creates MISSING roles/categories/channels. No existing content is altered.");
 console.log("To deploy, configure DISCORD_BOT_TOKEN privately, DISCORD_GUILD_ID="+GUILD);
 console.log("and DISCORD_OFFICE_APPLY_CONFIRM=CREATE_MISSING_OFFICE_STRUCTURE, then run node setup-apply.mjs --apply");
 process.exit(0);
}
if(process.env.DISCORD_GUILD_ID!==GUILD) throw new Error("Wrong guild ID; stopped.");
if(process.env.DISCORD_OFFICE_APPLY_CONFIRM!=="CREATE_MISSING_OFFICE_STRUCTURE")
 throw new Error("Explicit apply confirmation not set; stopped.");
if(!process.env.DISCORD_BOT_TOKEN)throw new Error("Missing DISCORD_BOT_TOKEN.");

const client=new Client({intents:[GatewayIntentBits.Guilds]});
let errors=0;
try {
 await client.login(process.env.DISCORD_BOT_TOKEN);
 const guild=await client.guilds.fetch(GUILD);
 if(guild.id!==GUILD)throw new Error("Fetched wrong guild.");
 await guild.roles.fetch();await guild.channels.fetch();
 const me=await guild.members.fetchMe();
 if(!me.permissions.has(PermissionFlagsBits.ManageRoles)||
    !me.permissions.has(PermissionFlagsBits.ManageChannels))
  throw new Error("Bot requires temporary Manage Roles and Manage Channels. No changes made.");
 if(me.permissions.has(PermissionFlagsBits.Administrator))
  throw new Error("Refusing to run with Administrator permission.");
 const roleNames=["Node Holder - Verified","Active Validator - Verified","Office Volunteer","Office Staff"];
 const roles={};
 for(const name of roleNames){
  let role=guild.roles.cache.find(r=>r.name===name && !r.managed);
  if(role){console.log("KEEP ROLE",name);roles[name]=role;continue;}
  role=await guild.roles.create({name,permissions:0n,mentionable:false,hoist:false,reason:"Approved additive Director's Office launch"});
  console.log("CREATE ROLE",name,role.id);roles[name]=role;
 }
 const everyone=guild.roles.everyone.id;
 const safeRead=[
  {id:everyone,allow:[PermissionFlagsBits.ViewChannel],deny:[PermissionFlagsBits.SendMessages,PermissionFlagsBits.CreatePublicThreads,PermissionFlagsBits.CreatePrivateThreads]}
 ];
 const staff=[roles["Office Staff"].id];
 const targetDefs=[
  ["about-the-office","What this public office does, and how to participate.","readonly"],
  ["office-announcements","Inauguration and verified public notices.","readonly"],
  ["beef-room","Personal spats and off-topic arguments belong here. No threats, doxxing, scams or targeted harassment.","public"],
  ["office-progress","Public issue links, blockers and independently verified outcomes.","readonly"],
  ["node-holder-council","Verified node holders discuss representation and network proposals.","node"],
  ["validator-operations","Verified active validators coordinate technical work. Never post private keys.","validator"],
  ["office-workroom","Office issue intake and work coordination.","staff"],
  ["moderation-log","Safety intervention record, not a channel for punishing criticism.","staff"]
 ];
 const baseCategory=guild.channels.cache.find(c=>c.type===ChannelType.GuildCategory && c.name==="Text Channels");
 if(!baseCategory)throw new Error("Existing Text Channels category not found; stopped before creating channels.");
 let privateCategory=guild.channels.cache.find(c=>c.type===ChannelType.GuildCategory && c.name==="Office Restricted");
 const privatePerms=[
  {id:everyone,deny:[PermissionFlagsBits.ViewChannel]},
  {id:roles["Office Staff"].id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]}
 ];
 if(!privateCategory){
  privateCategory=await guild.channels.create({name:"Office Restricted",type:ChannelType.GuildCategory,permissionOverwrites:privatePerms,reason:"Office staff/holder gated areas"});
  console.log("CREATE CATEGORY",privateCategory.name,privateCategory.id);
 } else console.log("KEEP CATEGORY",privateCategory.name);
 for (const [name,topic,access] of targetDefs){
  const existing=guild.channels.cache.find(c=>c.name===name);
  if(existing){console.log("KEEP CHANNEL",name,existing.id,"(permissions untouched)");continue;}
  const overwrites= access==="readonly" ? [
   ...safeRead,
   {id:roles["Office Staff"].id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages]}
  ]:access==="public" ? [
   {id:everyone,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]}
  ]:access==="node" ? [
   {id:everyone,deny:[PermissionFlagsBits.ViewChannel]},
   {id:roles["Node Holder - Verified"].id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]},
   {id:roles["Office Staff"].id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]}
  ]:access==="validator" ? [
   {id:everyone,deny:[PermissionFlagsBits.ViewChannel]},
   {id:roles["Active Validator - Verified"].id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]},
   {id:roles["Office Staff"].id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]}
  ]:privatePerms;
  const parent=["node","validator","staff"].includes(access)?privateCategory.id:baseCategory.id;
  try{
   const channel=await guild.channels.create({name,type:ChannelType.GuildText,parent,topic,permissionOverwrites:overwrites,reason:"Approved additive Director's Office launch"});
   console.log("CREATE CHANNEL",name,channel.id);
  }catch(e){errors++;console.error("FAILED",name,e.message);}
 }
 console.log("DONE. Check channel access manually. Existing rules, Forum, bots and messages were not changed.");
 console.log("Remaining manual steps: community join screening; pin inauguration; verified role assignments; optional Profile NFT note.");
 if(errors)process.exitCode=1;
}finally{client.destroy();}
