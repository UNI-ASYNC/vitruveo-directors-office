# Vitruveo Director's Office — Discord Sentinel (proposal)

Target Discord guild: `1020154218029531197`.
Maintained in UNI-ASYNC independent research; Old Jug directs the community-facing office.
This is separate from `oldjug/pro-file-nft` and its PFN Sentinel. Do not modify, redeploy, or reuse PFN's live environment, configuration, token, or server.

## Established starting state (screenshots, Nov 6 2026)
- Discord Community enabled; rules/guidelines channel `#rules`.
- Public subject-based Forum `what-are-your-concerns` (retain; one post per subject, **not** per complainant).
- `#general`, `#network-status`; voice `Lobby`, `test`.
- Vitruveo Network Status bot installed; preserve its role and channel.
- Community Updates and Safety Notifications not assigned in provided screenshots.
- Only Vitruveo Network Status role visible besides @everyone; no verified member roles yet.
- Onboarding not configured. Safety protections partially enabled.
- Historical Profile NFT poster removed by owner. Optional future `#about-profile-nft` is informational only, with **no** integration commitment.

## Policy / purpose
- Public place to ask tough questions, submit criticism and evidence, discuss chain history, propose improvements, and hold conversations without GitHub accounts.
- Do not remove disagreement or criticism merely for being uncomfortable. Enforce narrowly defined Discord safety rules against credible threats, doxxing, spam, impersonation, fraud, credential theft, and other platform-rule violations.
- Not every post becomes an issue. Director and staff triage substantive subjects, connect them to existing public GitHub issues, or create new public issues after review. Do not publish sensitive material.
- Public discussion is distinct from the technical record in this repository and private UNI-ASYNC research.
- Accurately distinguish director role from control of network keys/production systems.

## Initial target layout — not yet approved for application
- Keep `#rules`, `#general`, `#network-status`, existing Forum, voice channels, all posts and channel IDs.
- Add `#office-information` (public read-only), `#office-progress` (public read-only).
- Add `#beef-room` (public text, open discussion) for personal disputes, heated back-and-forth, and off-topic arguments. The public subject-based Forum remains for substantive questions, evidence, and actionable subjects. Redirect escalating spats to this room rather than derailing forum threads; moving must not be used to suppress substantive criticism. Allow profanity, strong disagreement and criticism, but not credible threats, doxxing, targeted harassment, scams, or other Discord policy violations. No automatic bans or deletion on ordinary disagreement. Keep the room out of GitHub mirroring unless a separable actionable issue is identified.
- Optional `#about-profile-nft` (short neutral explanation: potential external user of Vitruveo, conditional technical evaluation; no promise).
- Role-gated `#node-holder-discussion`, `#validator-operations`; separate verified node-holder and active-validator roles, no automatic on-chain proof assumptions.
- Staff-only `#office-workroom`, `#moderation-log` if actually needed.
- Public Forum seeded or tagged by subject: nodes/entitlements; validators; governance/decentralization; network history; software/releases; RPC; website/docs; community accountability. Prefer tags and a few pinned threads over many new channels.
- GitHub tracking seeds: public issues #1, #2, #3, #4, #5, #6, #8.

## Phased rollout
1. **Read only:** run `tools/discord-office/inventory.mjs` with a separate bot token and Guild ID. Verify screenshots against exported channel types, roles, overwrites, feature flags; save exports locally and redact before sharing.
2. **Proposal:** compare inventory with plan; display exact create/edit actions, existing channel IDs, permission diffs, and rollback instructions. No rename/delete by default.
3. **Approval:** explicit director approval of changes; separate Vitruveo bot application/credentials, least privilege and no Administrator permission.
4. **Apply:** additive/idempotent Discord setup only; protect existing Network Status bot, Forum history and PFN.
5. **Audit:** fetch server again, test view/post/reply permissions for ordinary community member vs node holder vs staff, and post public office explanation.

## Safeguards
- No automatic deletion, banning, bulk renaming, moving channels or editing existing content.
- No wallet/validator key collection. Node-holder eligibility requires a safe documented verification method; proposals/votes are nonbinding unless governance authorizes them.
- Do not automatically mirror every message to GitHub or make unsupported allegations public.
- Do not change Discord Community status, onboarding, safety policy or bot permissions during inventory.
