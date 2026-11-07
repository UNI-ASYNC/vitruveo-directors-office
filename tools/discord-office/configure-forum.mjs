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
 if(!forum.permissionsFor(member)?.has(P.ManageChannels))
  throw new Error("Office Sentinel needs Manage Channels in this Forum to edit its settings. No changes made.");
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
