# Vitruveo Director's Office — Discord inauguration / launch kit
**Draft; approval required before live installation.** Guild: `1020154218029531197`.

## Identity and server settings
- Server display name: **Vitruveo Director's Office**
- Public description: **An open community office for Vitruveo network questions, node and validator operations, research, concerns, criticism, evidence, and practical solutions. Directed by Old Jug; independent research support by UNI-ASYNC.**
- Office title: **Public Director's Office — Vitruveo Network & Node Validators**
- Banner text: **DISCUSS • QUESTION • CHALLENGE • SOLVE • BUILD**
- Do not claim UNI-ASYNC owns Vitruveo or has operational keys; don't describe Profile NFT as the owner.
- Preserve existing server icon/banner if the director prefers them.

## Actual Discord structure — preserve existing IDs and history

### WELCOME & OFFICE
- `#rules` **existing** — community rules; official join-screen Rules Screening version from `docs/DISCORD-OFFICE-RULES-DRAFT.md`.
- `#about-the-office` **new, read-only** — mission, director's role and limits, UNI-ASYNC/public GitHub distinction.
- `#office-announcements` **new, read-only** — inauguration and later verified notices.
- `#about-profile-nft` **optional, read-only** — neutral two-paragraph note: independently built software potentially evaluating Vitruveo as a Web3 rail, contingent on meeting engineering/verification conditions; no commitment.

### PUBLIC COUNTER
- `#general` **existing** — greetings, informal community discussion; leave history.
- `what-are-your-concerns` **existing forum** — one post per SUBJECT, not per complainant; do not auto-delete criticism. Forum post guidance: subject, claim/question, evidence/link/date, suggested answer or fix, optional GitHub link. Suggested forum tags: **Question**, **Complaint**, **Node / Validator**, **Network & Governance**, **Software / RPC**, **Docs / Website**, **History / Transparency**, **Idea / Solution**, **Needs Evidence**, **Tracked in GitHub**. Keep tags under Discord limits; avoid using tags as verdicts.
- `#beef-room` **new public text channel** — spats, personal arguments, off-topic back-and-forth. Profanity and strongly expressed opinions allowed; not targeted threats/doxxing/harassment/scams. Redirect instead of deleting, but preserve substantive evidence and claims in the original Forum thread.

### STATUS & ACCOUNTABILITY
- `#network-status` **existing** — preserve Vitruveo Network Status bot and its operation. Proposed restriction to bot/staff posting only requires separate explicit approval and permissions test.
- `#office-progress` **new, read-only** — link only approved public GitHub issues from https://github.com/UNI-ASYNC/vitruveo-directors-office/issues ; distinguish proposed, pending, verified complete and blocked.

### NODE HOLDERS — ROLE GATED
- `#node-holder-council` **new, restricted** — verified holder discussion, including owners not running validating nodes.
- `#validator-operations` **new, restricted** — active operators, infrastructure and release planning. No private keys or seed phrases.
- No auto-voting rights from roles until entitlement levels and rules are independently documented; do not assume NFT proof where entitlement may be off-chain.

### OFFICE STAFF — ROLE GATED
- `#office-workroom` **new, restricted** — triage and GitHub case decisions.
- `#moderation-log` **new, restricted** — manual record of necessary safety intervention, no ideological moderation.

### EXISTING VOICE
- `Lobby`, `test` remain unchanged initially.

## Proposed roles
`@everyone`: public rules, public forum, general, beef room, announcements and status.
`Node Holder — Verified`: node-holder council; manual initial verification.
`Active Validator — Verified`: validator operations (and optionally holder council subject to entitlement).
`Office Volunteer`: help review, no automatic issue authority.
`Office Staff`: restricted triage, non-admin.
`Director`: server owner/admin arranged manually; bot must never assign this role.
`Vitruveo Office Sentinel`: limited setup/reading; no permanent Administrator.
Retain the existing managed `Vitruveo Network Status` bot role and permissions unless specifically approved.

## Inauguration post (publish ONLY after director approves live launch)
🏛️ **THE VITRUVEO DIRECTOR'S OFFICE IS OPEN**

I'm Old Jug. The doors are open.

This office is for the people who own nodes, run validators, build software, use this chain, or just want an answer about what's going on. Bring questions, complaints, technical problems, history, concerns, evidence, and solutions. **You don't have to agree with me, the Foundation, or anybody else.**

If you have a solid concern, let's hear it. If you've got a workable fix, even better. If someone posts fabricated baloney, let's put the facts next to it and see what survives. No one gets thrown out just for holding an opinion.

The **`what-are-your-concerns` Forum** is where we discuss **subjects**, not open a separate case for every person. Keep useful information in those threads. If it turns into a personal spat, take it to **`#beef-room`**. Don't plug up the working discussion.

The **`#network-status`** channel shows the network feeds. The **`#office-progress`** channel will show actionable work and the links to our public GitHub tracker. Not every post earns a ticket; some need evidence, some need answers, and some are just conversation. This office will document what we can verify and push forward what we can actually work on.

We are trying to make independent node operation, verifiable releases, developer access, and community participation more practical. We're not pretending we already hold the production keys or control other people's decisions.

**This is not a fan club, and it isn't a censorship club. It's a working public office.**

Bring the problem. Bring the receipts. Bring a solution. Let's see what we can actually get done.

— **Old Jug**
Director, Vitruveo & Node Validator Operations
Independent research and development support: **UNI-ASYNC**
Public work: https://github.com/UNI-ASYNC/vitruveo-directors-office/issues

## Short channel descriptions
- rules: **Read first. Say what you think; keep working threads on subject; beef goes to the beef room.**
- about-the-office: **Purpose, director's role, authority boundaries, and public records.**
- office-announcements: **Official office posts and verified notices.**
- about-profile-nft: **A potential external software use case for Vitruveo, not an integration commitment.**
- general: **Everyday community conversation.**
- what-are-your-concerns: **Open public Forum: one thread per subject; bring questions, evidence, complaints and solutions.**
- beef-room: **Your argument belongs here, not in the working threads. Speak freely; no threats, doxxing or scams.**
- network-status: **Vitruveo network status feed.**
- office-progress: **Public GitHub-linked issues, decisions, blockers, and proven outcomes.**
- node-holder-council: **Verified node holders discuss entitlements, representation, and proposals.**
- validator-operations: **Verified validator coordination and operational work.**
- office-workroom: **Staff triage and office coordination.**
- moderation-log: **Office safety interventions and follow-ups.**

## Installation sequence (not executed)
1. Read-only inventory is done; compare captured IDs and permission overwrites.
2. Produce exact server diff; agree roles, access model, and Rules Screening behavior.
3. Director approves; invite bot temporarily with needed non-admin permissions. Re-check bot role position.
4. Additive creation of missing channels/roles; **no deletion, bulk renaming, message rewriting, or moving existing threads**. Existing #rules and Forum IDs must be preserved.
5. Configure welcome content and Rules Screening after manual review; publish inauguration at launch, not during testing.
6. Verify access as normal member, node holder, validator, office staff; ensure bot feed not broken.
7. Remove temporary Manage Channels/Manage Roles; save post-change audit.

## Visual asset pack
Custom emojis/stickers are supplemental. Use unique original designs and public-facing, non-impersonating names. Review Discord's current file size/dimension limits at upload, and set explicit names and emoji IDs. No third-party unlicensed artwork.
