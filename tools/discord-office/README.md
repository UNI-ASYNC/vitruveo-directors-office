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

## Stage 2: offline setup proposal (no token required)

From this folder, after obtaining a saved inventory, run:

```powershell
node setup-preview.mjs
```

This compares your saved inventory with the proposed office channels and roles and prints **KEEP / CREATE / OPTIONAL**. It has no Discord login, does not send API requests, and makes **zero** server changes. The full launch wording is in `docs/DISCORD-OFFICE-INAUGURATION-KIT.md`; community entry rules are in `docs/DISCORD-OFFICE-RULES-DRAFT.md`.

Do not run any apply command yet; a permissions-safe, separately approved deployment program is not ready. Preserve the existing Vitruveo Network Status bot and Profile NFT Sentinel untouched.

## Stage 3: short native Discord launch messages (no PDFs)

Launch content is in `launch-posts.mjs` with five channel-specific messages. Each heading matches its destination channel. Existing messages and channels are not edited or deleted.

1. `node publish-launch.mjs --preview` — no Discord connection, print exact five messages and lengths.
2. Give Vitruveo Office Sentinel **View Channel, Send Messages, Read Message History** in these specific channels (not Administrator): `#about-the-office`, `#office-announcements`, `#beef-room`, `#office-progress`, `#rules`. For read-only channels, give the bot-specific allow while keeping @everyone's Send Messages denied.
3. Privately set `DISCORD_BOT_TOKEN` and `DISCORD_GUILD_ID=1020154218029531197`; run `node publish-launch.mjs --check` to validate exact channel IDs/names, permissions, and prior posts **without sending**.
4. Only after approving displayed text, set `DISCORD_OFFICE_POST_CONFIRM=POST_APPROVED_OFFICE_LAUNCH` and run `node publish-launch.mjs --publish`. Repeated runs skip identical posts by this bot found in recent channel history, and refuse conflicting headed bot posts.
5. Inspect the five messages in Discord, pin useful launch posts manually, configure Community Rules Screening separately, and remove unnecessary setup permissions (Manage Roles/Manage Channels).

The Discord publisher sends only native text, suppresses link previews, does not create PDFs or files, and will not replace old posts. It does **not** run or modify the Profile NFT Sentinel.
