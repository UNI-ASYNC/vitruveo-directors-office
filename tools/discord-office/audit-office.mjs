#!/usr/bin/env node
// Read-only office launch security audit. Inspect the public/member role matrix,
// restricted rooms, forum subjects, posted launch messages, and screening flag.
// No roles, permissions, channels, or posts are modified.
import "dotenv/config";
import { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits as P } from "discord.js";
import { posts } from "./launch-posts.mjs";
import { subjects } from "./forum-subjects.mjs";
const GUILD="1020154218029531197";
if(process.env.DISCORD_GUILD_ID!==GUILD || !process.env.DISCORD_BOT_TOKEN)
 throw new Error("Set DISCORD_GUILD_ID and DISCORD_BOT_TOKEN privately.");
const client=new Client({intents:[GatewayIntentBits.Guilds]});
const errors=[],warnings=[];
const pass=(v,msg)=>{console.log((v?"PASS ":"FAIL ")+msg);if(!v)errors.push(msg);};
const warn=(v,msg)=>{console.log((v?"PASS ":"WARN ")+msg);if(!v)warnings.push(msg);};
try{
 await client.login(process.env.DISCORD_BOT_TOKEN);
 const guild=await client.guilds.fetch(GUILD);
 await guild.channels.fetch();await guild.roles.fetch();
 const me=await guild.members.fetchMe();
 const roles={};
 for(const name of ["Node Holder - Verified","Active Validator - Verified","Office Staff"]){
   const role=guild.roles.cache.find(r=>r.name===name&&!r.managed);
   pass(!!role,"Role exists: "+name);
   roles[name]=role;
 }
 const channel=name=>guild.channels.cache.find(c=>c.name===name);
 const everyone=guild.roles.everyone;
 const can=(ch,who,perm)=>!!(ch&&who&&ch.permissionsFor(who)?.has(perm));
 const restricted=[
  ["node-holder-council","Node Holder - Verified"],
  ["validator-operations","Active Validator - Verified"],
  ["office-workroom",null],
  ["moderation-log",null],
 ];
 for(const [name,allowed] of restricted){
   const ch=channel(name);
   pass(!!ch && ch.type===ChannelType.GuildText,"Private channel exists: #"+name);
   if(!ch)continue;
   pass(!can(ch,everyone,P.ViewChannel),"@everyone cannot view #"+name);
   pass(can(ch,roles["Office Staff"],P.ViewChannel),"Office Staff can view #"+name);
   for(const roleName of ["Node Holder - Verified","Active Validator - Verified"]){
     const should=allowed===roleName;
     pass(can(ch,roles[roleName],P.ViewChannel)===should,roleName+(should?" can":" cannot")+" view #"+name);
   }
   const unexpected=ch.permissionOverwrites.cache.filter(o=>o.type===0 &&
      o.id!==everyone.id && o.id!==roles["Office Staff"]?.id &&
      o.id!==roles[allowed]?.id && o.allow.has(P.ViewChannel));
   warn(unexpected.size===0,"No unexpected VIEW-allow role override in #"+name);
 }
 for(const name of ["about-the-office","office-announcements","office-progress","rules","beef-room"]){
   const ch=channel(name);
   pass(!!ch && ch.type===ChannelType.GuildText,"Public text channel #"+name);
   if(!ch)continue;
   pass(can(ch,everyone,P.ViewChannel),"@everyone can view #"+name);
   pass(can(ch,everyone,P.SendMessages)===(name==="beef-room"),
      "@everyone "+(name==="beef-room"?"can":"cannot")+" post in #"+name);
 }
 const forums=guild.channels.cache.filter(c=>c.type===ChannelType.GuildForum&&c.name==="what-are-your-concerns");
 pass(forums.size===1,"Exactly one public what-are-your-concerns Forum");
 if(forums.size===1){
   const f=forums.first();
   pass(can(f,everyone,P.ViewChannel),"@everyone can view Forum");
   pass(can(f,everyone,P.CreatePublicThreads),"@everyone can create Forum subjects");
   pass(can(f,everyone,P.SendMessagesInThreads),"@everyone can reply in Forum subjects");
   if(can(f,me,P.ViewChannel)){
     const active=await f.threads.fetchActive();
     const archived=await f.threads.fetchArchived({type:"public",limit:100});
     const normalized=s=>s.normalize("NFKC").toLowerCase().replace(/^[^a-z0-9]+/u,"").replace(/\s+/g," ").trim();
     const names=new Set([...active.threads.values(),...archived.threads.values()].map(t=>normalized(t.name)));
     for(const s of subjects)pass(names.has(normalized(s.title)),"Subject thread: "+s.title);
   }else warn(false,"Bot cannot inspect Forum threads");
 }
 for(const p of posts){
   const ch=guild.channels.cache.get(p.id);
   if(!ch||!can(ch,me,P.ReadMessageHistory)){warn(false,"Cannot inspect post #"+p.channel);continue;}
   const recent=await ch.messages.fetch({limit:100});
   const own=[...recent.values()].filter(m=>m.author.id===client.user.id);
   const exact=own.some(m=>m.content===p.text);
   const legacy=own.some(m=>m.content===p.text.replaceAll("Oldjug","Old Jug"));
   pass(exact||legacy,"Launch message present in #"+p.channel);
   if(legacy&&!exact)warn(false,"Older post spells Old Jug with a space in #"+p.channel+"; original remains unchanged");
 }
 console.log("\nSCREENING STATUS");
 const screening=guild.features.includes("MEMBER_VERIFICATION_GATE_ENABLED");
 warn(screening,"Discord Membership/Rules Screening feature enabled");
 console.log("Rules channel:",guild.rulesChannelId||"NOT SET");
 console.log("Guild verification level:",guild.verificationLevel);
 console.log("\nSENTINEL PRIVILEGES — READ ONLY");
 for(const perm of [P.Administrator,P.ManageGuild,P.ManageRoles,P.ManageChannels,P.ManageMessages]){
   console.log(String(perm),me.permissions.has(perm)?"GRANTED":"not granted");
 }
 for(const role of [...me.roles.cache.values()].filter(r=>r.id!==everyone.id)){
   console.log("Bot role:",role.name,"managed="+role.managed,"editable="+role.editable,
     "guild permissions="+role.permissions.toArray().join(","));
 }
 console.log("\nRESULT:",errors.length,"failures,",warnings.length,"warnings.");
 if(errors.length)process.exitCode=1;
}finally{client.destroy();}
