# Vitruveo — Independent Network Development

**Public development workspace maintained by UNI-ASYNC.**

I'm interested in contributing practical improvements to Vitruveo's open-source ecosystem. This is **not an effort to take over the chain, its repositories, or its existing maintainers' responsibilities**. It's a place to show the work I see a need for, test ideas independently, and offer fixes for upstream review.

My focus is making Vitruveo easier for independent operators to install, maintain, verify, and recover, while exploring options for transparent, shared validator-operator governance. Governance changes are **proposals for discussion**, not claims of existing authority or approval.

## Current public recommendation

### [Independent Node-Operator Recommendations](INDEPENDENT-NODE-OPERATOR-RECOMMENDATIONS.md)

This is UNI-ASYNC's current independent technical recommendation for improving Vitruveo node operations. It outlines a practical direction for repeatable node setup, clearly defined technical roles, guided installation, safe updates and recovery, independent RPC/API services, operator status information, a node-holder handbook, and resilience testing.

**Node holders, operators, developers, and maintainers are invited to review the recommendation and contribute practical feedback.**

## Public development issues

| Issue | Topic | Purpose |
| --- | --- | --- |
| [#4 — Verifiable client releases](issues/4) | Source and releases | Establish reproducible builds and transparent release identification |
| [#5 — Node-owner handbook](issues/5) | Documentation and support | Publish reliable instructions and an operator support route |
| [#6 — Progress, decisions and blockers](issues/6) | Public coordination | Record proposals, decisions, dependencies, and tested results |
| [🚨 #8 — HIGH PRIORITY: Website and documentation audit](issues/8) | Public-facing repairs | Verify and fix broken links, legacy redirects, navigation and developer-documentation problems; some repairs require maintainer access |


### Dated public technical clarifications

**[November 4, 2026 — AI Wars Trends settlement observation](TECHNICAL-CLARIFICATIONS-2026-11-04.md)** — a bounded chain-1490 read-only scan documents actual betting, posted results, winning-stake returns, dead-address transfers and prize minting. It corrects reliance on the older contract's `Claimed` event; it does not establish game-result fairness or official adoption.

### Retired public issue references

These numbers are retained **only for orientation**. The original public issue pages have been removed and the links no longer work. They are **not open tasks** in this repository.

| Former issue | Topic | Status |
| --- | --- | --- |
| **#7 — Mainnet precompile test evidence** | Historical Shizazles mainnet compatibility tests | **Retired from public tracker; research preserved in private records** |
| **#9 — Website, AI Chat and MCP functionality** | Historical external observations and developer-tool checks | **Retired from public tracker; research preserved in private records** |

The current public website, redirect, and documentation repair work remains in [#8](issues/8). No links to removed issues are provided here.

## Where I want to help

- Make node and validator installation repeatable for qualified operators.
- Improve backup, recovery, monitoring, and safe software updates.
- Verify public source and releases against the authoritative production baseline before proposing compatibility-sensitive changes.
- Support independently operated RPC endpoints and clear developer documentation.
- Explore **validator-operator governance**: possible voting procedures, release review, and shared operational stewardship. This is separate from how validators reach blockchain consensus, and would require agreement and proper authority before implementation.

## Current starting point

The immediate technical dependency is identifying the authoritative production release or source commit and the supported node-installation procedure. With that established, contributors can build and test improvements independently, then offer pull requests to the appropriate Vitruveo maintainers.

## Working with maintainers

These are **independent suggestions, not assigned Vitruveo tasks**. I'll respect the current maintainers' review process and submit relevant fixes through forks and pull requests. Nothing here authorizes production deployments, changes to consensus or validator membership, transfer of control, or use of privileged signing keys.

Please use [the public issues](https://github.com/UNI-ASYNC/vitruveo-directors-office/issues) for constructive, non-sensitive feedback. Do not publish credentials, private keys, or undisclosed vulnerability details.
