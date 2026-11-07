#!/usr/bin/env node
// Native Discord Forum configuration (guidelines, tags, default reaction).
// Changes only the one existing, allowlisted public Forum channel.
// Never changes member permissions, posts, existing subject threads or other bots.
import "dotenv/config";
import {Client,GatewayIntentBits,ChannelType,PermissionFlagsBits as P} from "discord.js";

const GUILD="1020154218029531197";
const FORUM="1568293263243350068";
const NAME="what-are-your-concerns";
const CONFIRM="APPLY_OFFICE_FORUM_SETTINGS";
const GUIDELINES="Bring a concern, question, evidence, technical problem or practical solution. Use an existing subject discussion when it fits; start a new one when it doesn't. Criticism and disagreement are welcome. Explain what happened and include public links or evidence when possible. Don't post private keys, threats, doxxing or scams. Take personal spats to #beef-room. GitHub accounts are not required.";
const TAG_NAMES=["Question","Concern","Evidence","Technical Problem","Proposal","Solution","Status Update"];
const EMOJI="👍";
const mode=process.argv[2]||"--check";
if(!["--check","--apply"].includes(mode)) throw new Error("Use --check or --apply");
if(process.env.DISCORD_GUILD_ID!==GUILD||!process.env.DISCORD_BOT_TOKEN)
 throw new Error("Set DISCORD_GUILD_ID and DISCORD_BOT_TOKEN privately.");
if(mode==="--apply"&&process.env.DISCORD_OFFICE_FORUM_SETTINGS_CONFIRM!==CONFIRM)
 throw new Error("Approval missing: set DISCORD_OFFICE_FORUM_SETTINGS_CONFIRM="+CONFIRM);
const client=new Client({intents:[GatewayIntentBits.Guilds]});
try{
 await client.login(process.env.DISCORD_BOT_TOKEN);
 const guild=await client.guilds.fetch(GUILD);
 const forum=await guild.channels.fetch(FORUM);
 if(!forum||forum.guildId!==GUILD||forum.type!==ChannelType.GuildForum||forum.name!==NAME)
  throw new Error("Expected Forum ID/name/type not found. No changes.");
 const member=await guild.members.fetchMe();
 const guildGrant=member.permissions.has(P.ManageChannels);
 const forumGrant=forum.permissionsFor(member)?.has(P.ManageChannels)===true;
 console.log("Manage Channels — server:",guildGrant?"ALLOW":"MISSING");
 console.log("Manage Channels — Forum:",forumGrant?"ALLOW":"DENIED");
 if(!forumGrant){
   const everyone=forum.permissionOverwrites.cache.get(guild.roles.everyone.id);
   const memberOverride=forum.permissionOverwrites.cache.get(member.id);
   const blockedRoles=[...member.roles.cache.values()].filter(r=>{
     const o=forum.permissionOverwrites.cache.get(r.id);
     return o?.deny.has(P.ManageChannels);
   }).map(r=>r.name);
   console.log("Forum category:",forum.parent?.name||"(none)");
   console.log("@everyone Forum deny:",everyone?.deny.has(P.ManageChannels)===true);
   console.log("Office Sentinel Forum deny:",memberOverride?.deny.has(P.ManageChannels)===true);
   console.log("Office Sentinel Forum allow:",memberOverride?.allow.has(P.ManageChannels)===true);
   console.log("Bot role Forum denies:",blockedRoles.join(", ")||"(none)");
   console.log("No changes made. A bot cannot grant itself a missing permission.");
   console.log(guildGrant
     ?"NEXT: Server owner must allow Manage Channels specifically for Office Sentinel on this Forum, or remove a blocking override."
     :"NEXT: Server owner must first grant Manage Channels to the Office Sentinel's server integration; channel permission alone cannot grant an absent guild permission.");
   if(mode==="--apply")throw new Error("Stopped before writing: Manage Channels not effective in Forum.");
   console.log("CHECK ONLY; settings preview is still available below.");
 }
 const previous=forum.availableTags.map(t=>({
   id:t.id,name:t.name,moderated:t.moderated,
   ...(t.emojiId?{emojiId:t.emojiId}:t.emojiName?{emojiName:t.emojiName}:{})
 }));
 const present=new Set(previous.map(t=>t.name.toLowerCase()));
 const missing=TAG_NAMES.filter(n=>!present.has(n.toLowerCase()));
 const target=[...previous,...missing.map(name=>({name,moderated:false}))];
 if(target.length>20)throw new Error("Forum tag limit of 20 would be exceeded. No changes.");
 const desiredReaction={name:EMOJI};
 const currentReaction=forum.defaultReactionEmoji;
 const topicSame=forum.topic===GUIDELINES;
 const reactionSame=currentReaction?.name===EMOJI;
 console.log("FORUM",forum.name,forum.id);
 console.log("Guidelines:",topicSame?"UNCHANGED":"SET",GUIDELINES);
 console.log("Existing tags:",previous.map(t=>t.name).join(", ")||"(none)");
 console.log("Add tags:",missing.join(", ")||"(none)");
 console.log("Default reaction:",reactionSame?"UNCHANGED":"SET "+EMOJI);
 if(mode==="--check"){
   console.log("CHECK ONLY: no changes made.");
 }else{
   // Single channel edit avoids partial configuration and preserves existing tags/IDs.
   await forum.edit({
     topic:GUIDELINES,
     availableTags:target,
     defaultReactionEmoji:desiredReaction
   },"Oldjug-approved public Forum settings: guidelines, issue-type tags and default reaction");
   const confirmed=await guild.channels.fetch(FORUM);
   console.log("UPDATED GUIDELINES:",confirmed.topic===GUIDELINES);
   console.log("UPDATED TAGS:",TAG_NAMES.every(n=>confirmed.availableTags.some(t=>t.name===n)));
   console.log("UPDATED REACTION:",confirmed.defaultReactionEmoji?.name===EMOJI);
   console.log("DONE: Forum settings changed; existing posts and permissions left untouched.");
 }
}finally{client.destroy();}
