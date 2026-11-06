# Read-only Discord inventory

This is an isolated Vitruveo office utility, **not** the Profile NFT Sentinel.
Never reuse the Profile NFT live token or .env.

Requirements: Node.js 20+, a Discord bot **already invited** into guild `1020154218029531197` with View Channels; do not grant Administrator. The bot must be able to see each channel you want inventoried.

From this folder:
```bash
npm install --no-save discord.js dotenv
```
Set environment variables privately on your own computer (do not commit the token):
```text
DISCORD_GUILD_ID=1020154218029531197
DISCORD_BOT_TOKEN=<private bot token>
```
Run:
```bash
node inventory.mjs
```
It writes a new `discord-office-inventory.json` file in the current working directory and refuses to overwrite an existing one. Keep this export private until reviewed. It does not collect messages or member lists, make changes, manage roles, or edit the server.

**Important:** The existing *Vitruveo Network Status* bot is not automatically authorized for this job. Prefer a separate least-privilege Office Sentinel bot. A bot with insufficient channel access produces an incomplete inventory; compare to the administrator's screenshots.
