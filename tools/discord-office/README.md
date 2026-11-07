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

## Preferred: ONE PowerShell-driven office launch

`launch-office.mjs` is the replacement for the manual-permission procedure. It verifies guild and channel IDs first, makes only **bot-specific posting permission overwrites** on the five launch channels if necessary, then sends the short native posts, skipping duplicates. Existing public/staff access rules, messages, channels, Profile NFT, and Network Status bot are not changed. **Do not run the older publisher as well.**

```powershell
cd "$HOME\vitruveo-directors-office"
git pull
cd tools\discord-office
node .\launch-office.mjs --plan
```

When approved, in the same PowerShell session containing `DISCORD_GUILD_ID` and the privately entered `DISCORD_BOT_TOKEN`, run:
```powershell
node .\launch-office.mjs --check
$env:DISCORD_OFFICE_LAUNCH_CONFIRM = "APPROVE_OFFICE_LAUNCH_1020154218029531197"
node .\launch-office.mjs --apply
Remove-Item Env:DISCORD_OFFICE_LAUNCH_CONFIRM
```

For fresh PowerShell sessions, enter the private token locally with `Read-Host -AsSecureString`; never put it in a script or share it. Temporary **Manage Channels** permission is necessary only if the bot currently lacks posting rights in one of the five channels. Read-only `--check` reports that. The installer **does not** alter Community Rules Screening/onboarding, which is distinct from posting text in #rules and may require a separate supported workflow. Review each post in Discord, then remove temporary Manage Channels/Manage Roles. Bot tokens should remain only in the current shell environment, cleared afterward.

## Subject-based public Forum (recommended)

One public Forum discussion per broad **subject**, with links to related GitHub issues where appropriate. This does **not** create a thread per issue and does not touch the restricted channels.

```powershell
cd "$HOME\vitruveo-directors-office"
git pull
cd tools\discord-office
node .\seed-forum.mjs --plan
node .\seed-forum.mjs --check
$env:DISCORD_OFFICE_FORUM_CONFIRM = "CREATE_OFFICE_FORUM_SUBJECTS"
node .\seed-forum.mjs --apply
Remove-Item Env:DISCORD_OFFICE_FORUM_CONFIRM
```

Requires the private Office Sentinel bot token and guild ID in the shell. The bot needs **View Channel, Create Public Threads, Send Messages in Threads** in the existing `what-are-your-concerns` Forum. It will refuse to proceed rather than modify permissions or grant itself access. It scans active and most recent 100 public archived threads to avoid duplicates, skips matched subject titles, and creates only missing discussions. Older archived threads beyond the returned 100 may need audit before rerunning. All nine subjects are in `forum-subjects.mjs`. Name is `Oldjug` (no space).

## Final security audit + screening limitation

Run in the existing shell with the **Office Sentinel** token and guild ID:

```powershell
cd "$HOME\vitruveo-directors-office"
git pull
cd tools\discord-office
node .\audit-office.mjs
```

This read-only audit checks the nine Forum subjects, launch posts, public text channel permissions, four restricted channels, verified-role access, the Discord membership screening feature flag, and the Office Sentinel's remaining guild role privileges. Errors and warnings are reported without making changes. The older launch posts may still use the prior spelling "Old Jug"; the audit recognizes those as installed and flags them for correction rather than falsely claiming they're missing.

**Discord Rules Screening is different from posting #rules.** Discord removed public documentation for reading/editing the Membership Screening object using bots. If the audit prints a missing screening flag, the supported path is Discord Server Settings > Safety Setup > DM and Spam Protection > Members must accept rules before they can talk or DM. Do not attempt undocumented endpoints from the bot.

**Temporary guild-wide bot permissions:** The bot cannot safely remove permissions from its own managed integration role through the bot token. The audit will report them and the role's managed/editable status. Never change @everyone or protected holder/staff roles to reduce the bot's powers. A server owner can adjust the bot's granted guild permissions in Discord server settings/Integrations or reauthorize the app with a smaller permission set, after verifying that ongoing Sentinel tasks will still work. Retain View Channel, Send Messages, Read Message History, Create Public Threads and Send Messages in Threads as needed; do not leave Administrator enabled.
