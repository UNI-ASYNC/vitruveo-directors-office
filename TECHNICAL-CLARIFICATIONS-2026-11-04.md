# Technical clarification — AI Wars Trends settlement (November 4, 2026)

**Status:** Dated, bounded independent read-only observation of an application contract on Vitruveo mainnet. **Not** an official Vitruveo or Vertical Foundation notice, and **not** a claim of game fairness, independent oracle inputs or validator decentralization.

The Director's Office public issue tracker did **not** contain a specific claim that AI Wars Trends had no settlements. This note clarifies what subsequent evidence shows; it does not retroactively edit an earlier issue.

## What the chain records

A read-only JSON-RPC scan on November 4, 2026 queried Vitruveo chain ID **1490**, the AI Wars NFT/game proxy [`0x269879505D6313Dde37b481C5F4124669638BF91`](https://explorer.vitruveo.ai/address/0x269879505D6313Dde37b481C5F4124669638BF91), and blocks **5,288,262 through 5,305,542** (24 hours, ending 16:52:54 UTC). The scan reported all `eth_getLogs` chunks completed.

| Recorded event | Count |
| --- | ---: |
| `BetPlaced` | 84 |
| `GameResolved` | 30 |
| `Won` | 21 |
| `Burned` | 27 |
| `PrizeMinted` | 31 |

Event amounts were **43,400 VTRU staked**, **9,100 VTRU winning stakes returned**, **34,300 VTRU sent to the dead address**, and **4,550 separate credits awarded**. Credits are not native VTRU cash payouts. A dead-address transfer is **not** proof of a native `totalSupply()` reduction.

Example [game result and settlement transaction (block 5,302,329)](https://explorer.vitruveo.ai/tx/0xeb5af39ef87a6ad45da5862b8f362a0709728d9a508aeea8f40dbd8b78d7b0d8) contains the reported `Won`, `Burned`, and `PrizeMinted` events. Its [earlier bet transaction (block 5,302,309)](https://explorer.vitruveo.ai/tx/0x119de3266f256cdd9128aa25f4eef6378df9dd6ff515f80f567b7793c2f87d67) has a matching game serial.

## Version correction

The proxy's November 4 implementation slot pointed to **`0xacca0a8916026711876ab6c79064c1abbebf3652`**, not the earlier October 29 implementation (`0xe5e9dc...`). Published V5 source defines `Won`, `Burned`, `Refunded`, `PrizeMinted` and `settle()` / `claimFor()`. **The former `Claimed` signature is not a valid standalone payment test for V5.** A V5 winning bet returns the original VTRU stake and awards separate credits, rather than the older implementation's 150% native-VTRU payout.

Therefore a categorical **“no on-chain bets or game settlements”** claim is incompatible with the recorded November 4 data. This is a correction of an *interpretation*, not an accusation about any person.

## Limits and reproducibility

This is a single-address, 24-hour log scan. It establishes observed on-chain events but not whether external AI-game data honestly selects winners, how many unique people participated, or whether all possible balances and historic games reconcile. The source-to-runtime binary relationship of the newer implementation and individual transaction receipts were not independently rechecked by a separate endpoint during this review. Verify with `eth_getStorageAt` on the EIP-1967 implementation slot and `eth_getLogs`/`eth_getTransactionReceipt` for the cited blocks and transactions.

**No impact on unrelated findings:** existing Director's Office proposals regarding validator setup, independent RPCs, source releases, documentation and website repairs retain their individual evidence dates and remain proposals, not completed implementation work.
