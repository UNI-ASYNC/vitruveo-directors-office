#!/usr/bin/env node
// Read-only Discord guild structure inventory. No changes to Discord.
import "dotenv/config";
import { Client, GatewayIntentBits, PermissionsBitField } from "discord.js";
import { writeFile } from "node:fs/promises";

const guildId = process.env.DISCORD_GUILD_ID;
const token = process.env.DISCORD_BOT_TOKEN;
const expected = "1020154218029531197";
if (!guildId || !token) throw new Error("Set DISCORD_GUILD_ID and DISCORD_BOT_TOKEN in local environment.");
if (guildId !== expected) throw new Error("Guild ID mismatch. Refusing to inspect any other server.");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
try {
  await client.login(token);
  const guild = await client.guilds.fetch(guildId);
  const [channels, roles] = await Promise.all([guild.channels.fetch(), guild.roles.fetch()]);
  const roleList = [...roles.values()].filter(Boolean).sort((a,b)=>b.position-a.position);
  const inventory = {
    capturedAt: new Date().toISOString(),
    guild: { id: guild.id, name: guild.name, features: guild.features,
      verificationLevel: guild.verificationLevel,
      rulesChannelId: guild.rulesChannelId,
      publicUpdatesChannelId: guild.publicUpdatesChannelId,
      systemChannelId: guild.systemChannelId },
    roles: roleList.map(r=>({
      id:r.id, name:r.name, position:r.position, managed:r.managed,
      permissions:r.permissions.toArray() })),
    channels: [...channels.values()].filter(Boolean).sort((a,b)=>a.rawPosition-b.rawPosition).map(ch=>({
      id:ch.id, name:ch.name, type:ch.type, parentId:ch.parentId,
      position:ch.rawPosition,
      topic: typeof ch.topic==="string" ? ch.topic : null,
      availableTags: Array.isArray(ch.availableTags)
        ? ch.availableTags.map(t=>({id:t.id,name:t.name,moderated:t.moderated}))
        : [],
      permissionOverwrites: [...ch.permissionOverwrites.cache.values()].map(o=>({
        id:o.id, type:o.type, allow:new PermissionsBitField(o.allow.bitfield).toArray(),
        deny:new PermissionsBitField(o.deny.bitfield).toArray()
      }))
    }))
  };
  const file = process.argv[2] || "discord-office-inventory.json";
  await writeFile(file,JSON.stringify(inventory,null,2)+"\n",{flag:"wx",mode:0o600});
  console.log("Read-only inventory saved to "+file);
  console.log("Guild: "+guild.name+"; roles: "+inventory.roles.length+"; channels: "+inventory.channels.length);
  console.log("Review and redact channel topics/IDs before sharing publicly.");
} finally {
  client.destroy();
}
