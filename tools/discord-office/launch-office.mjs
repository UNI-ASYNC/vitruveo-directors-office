#!/usr/bin/env node
/**
 * One-step Vitruveo Office launch: verify -> grant the BOT posting permissions
 * on five explicitly allowlisted channels -> send short native Discord text.
 * Does not modify @everyone, role hierarchy, categories, server settings,
 * node-holder permissions, existing messages, PFN, or the Network Status bot.
 * --plan: offline; --check: live read-only; --apply: explicit confirmed write.
 */
import "dotenv/config";
import { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } from "discord.js";
import { posts } from "./launch-posts.mjs";

const GUILD="1020154218029531197";
const CONFIRM="APPROVE_OFFICE_LAUNCH_1020154218029531197";
const mode=process.argv[2] || "--plan";
if(!["--plan","--check","--apply"].includes(mode)) throw new Error("Choose --plan, --check or --apply");
if(mode==="--plan"){
 for(const p of posts){
   if(p.text.length>1900) throw new Error("Overlength post: "+p.channel);
   console.log("\n#"+p.channel+" ("+p.text.length+" characters)\n"+p.text);
 }
 console.log("\nPLAN ONLY. On apply, bot-specific View/Send/History overrides will be added as needed, followed by native Discord posts. No PDFs.");
 process.exit(0);
}
if(process.env.DISCORD_GUILD_ID!==GUILD)throw new Error("Target guild mismatch. No changes.");
if(!process.env.DISCORD_BOT_TOKEN)throw new Error("Missing bot token in environment.");
if(mode==="--apply" && process.env.DISCORD_OFFICE_LAUNCH_CONFIRM!==CONFIRM)
 throw new Error("Missing explicit launch approval in environment. No changes.");

const needed=[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory];
const client=new Client({intents:[GatewayIntentBits.Guilds]});
try{
 await client.login(process.env.DISCORD_BOT_TOKEN);
 const guild=await client.guilds.fetch(GUILD);
 const me=await guild.members.fetchMe();
 if(me.permissions.has(PermissionFlagsBits.Administrator))
  throw new Error("Refusing Administrator: remove it before publishing.");
 await guild.channels.fetch();
 const targets=[];
 for(const p of posts){
   if(p.text.length>1900)throw new Error("Overlength post: "+p.channel);
   const ch=guild.channels.cache.get(p.id);
   if(!ch||ch.guildId!==GUILD||ch.name!==p.channel||ch.type!==ChannelType.GuildText)
     throw new Error("Channel ID/name/type mismatch: "+p.channel+". No changes.");
   targets.push({p,ch});
 }
 // Preflight all targets before starting any Discord write.
 const needsOverwrite=targets.filter(({ch})=>needed.some(bit=>!ch.permissionsFor(me)?.has(bit)));
 if(needsOverwrite.length&&!me.permissions.has(PermissionFlagsBits.ManageChannels))
   throw new Error("The Sentinel lacks Manage Channels. Required for these channels: "+needsOverwrite.map(x=>x.p.channel).join(", ")+". No changes.");
 console.log("Guild:",guild.name,GUILD);
 console.log("Bot:",client.user.username);
 for(const {p,ch} of targets)
   console.log("#"+p.channel,needed.every(bit=>ch.permissionsFor(me)?.has(bit))?"POST ACCESS OK":"BOT-SPECIFIC PERMISSION REPAIR NEEDED");
 if(mode==="--check"){console.log("CHECK ONLY. No changes.");process.exit(0);}
 // Grant only bot-member-specific overwrites, not @everyone or other roles.
 // This sidesteps existing read-only channel overrides without making them writable.
 for(const {p,ch} of needsOverwrite){
   await ch.permissionOverwrites.edit(me.id,{
     ViewChannel:true,SendMessages:true,ReadMessageHistory:true
   },{reason:"Director-approved Vitruveo Office one-time announcement publishing"});
   await ch.fetch();
   console.log("GRANTED BOT POST ACCESS",p.channel);
 }
 // Read and dedupe before publishing, no edits or deletions of existing posts.
 // Discord exposes message contents for the bot's own posts, even without Message Content intent.
 for(const {p,ch} of targets){
   const fresh=await guild.channels.fetch(p.id);
   if(!needed.every(bit=>fresh.permissionsFor(me)?.has(bit)))
     throw new Error("Still missing post permission in #"+p.channel+". Stopped.");
   const recent=await fresh.messages.fetch({limit:100});
   const own=[...recent.values()].filter(m=>m.author.id===client.user.id);
   if(own.some(m=>m.content===p.text)){
     console.log("SKIP ALREADY POSTED",p.channel);continue;
   }
   const heading=p.text.split("\n")[0];
   if(own.some(m=>m.content.startsWith(heading)&&m.content!==p.text))
     throw new Error("A different launch message from this bot already exists in #"+p.channel+". Stopped; no duplicate posted there.");
   const sent=await fresh.send({content:p.text,allowedMentions:{parse:[]},flags:4});
   console.log("POSTED #"+p.channel+" ID "+sent.id);
 }
 console.log("LAUNCH POSTS FINISHED. Actual Community join-screen Rules Screening may require separate manual setup; the #rules channel is posted.");
 console.log("Recommended next: remove temporary Manage Channels/Manage Roles from bot once all changes are checked.");
}finally{client.destroy();}
