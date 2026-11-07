#!/usr/bin/env node
// OFFLINE DRY RUN ONLY. Reads local inventory; does not connect to Discord or change anything.
import { readFile } from "node:fs/promises";

const expectedGuild="1020154218029531197";
const inventoryPath=process.argv[2] || "discord-office-inventory.json";
const inventory=JSON.parse(await readFile(inventoryPath,"utf8"));
if (inventory.guild?.id!==expectedGuild) throw new Error("Inventory guild does not match the Vitruveo Director's Office.");

const existingNames=new Set(inventory.channels.map(c=>c.name.toLowerCase()));
const existingRoles=new Set(inventory.roles.map(r=>r.name.toLowerCase()));

const channels=[
  {name:"about-the-office",kind:"text",access:"public read-only",topic:"What the Vitruveo Director's Office does, and how the public can participate."},
  {name:"office-announcements",kind:"text",access:"public read-only",topic:"Inauguration and verified public notices."},
  {name:"beef-room",kind:"text",access:"public discussion",topic:"Personal spats and off-topic arguments go here. No threats, doxxing, scams or harassment."},
  {name:"office-progress",kind:"text",access:"public read-only",topic:"Public issue links, blockers, and independently verified outcomes."},
  {name:"node-holder-council",kind:"text",access:"verified node holders",topic:"Verified holders discuss node entitlements, governance proposals and representation."},
  {name:"validator-operations",kind:"text",access:"verified active validators",topic:"Validator operations; never post keys or credentials."},
  {name:"office-workroom",kind:"text",access:"staff only",topic:"Office triage and GitHub issue coordination."},
  {name:"moderation-log",kind:"text",access:"staff only",topic:"Safety interventions and moderation record."}
];
const optional=[{name:"about-profile-nft",kind:"text",access:"public read-only",topic:"Optional external software use case, conditional on network verification; no integration commitment."}];
const roles=["Node Holder - Verified","Active Validator - Verified","Office Volunteer","Office Staff"];
console.log("VITRUVEO DIRECTOR'S OFFICE — OFFLINE DRY RUN");
console.log("Guild:",inventory.guild.name,inventory.guild.id);
console.log("Existing:",inventory.roles.length,"roles,",inventory.channels.length,"channel/category entries");
console.log("\nPRESERVE EXISTING CHANNELS / CATEGORIES:");
inventory.channels.forEach(c=>console.log("KEEP  "+c.name+" ["+c.id+"]"));
console.log("\nROLES (new, no assignment):");
roles.forEach(name=>console.log((existingRoles.has(name.toLowerCase())?"KEEP  ":"CREATE ")+name));
console.log("\nCHANNEL PROPOSALS:");
channels.forEach(c=>console.log((existingNames.has(c.name)?"KEEP  ":"CREATE ")+ "#"+c.name+" — "+c.access+" — "+c.topic));
console.log("\nOPTIONAL — requires separate approval:");
optional.forEach(c=>console.log((existingNames.has(c.name)?"KEEP  ":"OPTION ")+ "#"+c.name+" — "+c.access));
console.log("\nMANUAL ONLY: server entry Rules Screening, onboarding, staff and holder eligibility, inauguration post, channel-specific permission verification.");
console.log("NO ACTION: do not alter Network Status bot, #rules, existing Forum, #general, voice channels, messages, or Profile NFT repo.");
console.log("\nThis script is strictly read-only and did not access Discord.");
