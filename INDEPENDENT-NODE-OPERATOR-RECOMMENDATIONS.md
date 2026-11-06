# Independent Node-Operator Recommendations

**Status:** Public working recommendation from UNI-ASYNC for discussion.

This document describes a practical direction an independent technical reviewer would recommend for improving Vitruveo node operations. It is not an official network directive or a claim that every item has been adopted.

The objective is to make node operation easier to understand, repeat, verify, maintain, and recover across independent operators.

## Recommended direction

### 1. Establish a standard node setup

Maintain one current, tested setup path covering the supported environment, software installation, network configuration, synchronization, startup, health checks, backup, and recovery.

A node holder should be able to follow the published process and determine whether the node is operating correctly without depending on one-off instructions.

### 2. Document technical node roles

Clearly distinguish the technical jobs a node may perform, such as validator operation, non-validating/full-node service, RPC/API service, monitoring, and other supported network functions.

Commercial packages or ownership tiers should be documented separately from the technical requirements of the role being operated.

### 3. Build a guided installation process

Once the supported baseline is established, provide a guided installer or equivalent tooling that can check the host environment, install the correct software, apply known configuration, assist synchronization, and report a clear health result.

### 4. Standardize updates and recovery

Use identifiable software versions, understandable release notes, integrity verification, backup guidance, post-update health checks, and documented recovery procedures.

The goal is for independent operators to understand what they are running and how to recover it.

### 5. Support independently operated RPC/API services

Where appropriate, document a reproducible way for operators to provide independent Vitruveo RPC/API connectivity.

Public RPC services should be appropriately separated and protected so application traffic does not unnecessarily expose validator-signing infrastructure.

### 6. Provide useful operator status information

Develop a non-sensitive status surface that can help operators see basic node health, synchronization, software version, connectivity, service status, and relevant maintenance information.

No private keys, seed phrases, signing credentials, or similar secrets should be collected by a public status system.

### 7. Maintain a node-holder handbook

Keep the operating lifecycle in one discoverable place:

**Install → Verify → Monitor → Update → Troubleshoot → Backup → Recover**

The handbook should evolve as operators identify real-world problems and better procedures.

### 8. Test independent operation and recovery

As the operator network develops, routinely test restart, synchronization, backup restoration, endpoint failure, software updates, network interruption, and recovery across independently operated environments.

The objective is not simply to have nodes online. It is to make the operating model repeatable, understandable, resilient, and independently verifiable.

## Node-holder input requested

This is a working recommendation and is open for public comment.

Node holders and operators are encouraged to share practical experience that can improve the plan, including:

- installation or synchronization problems;
- missing documentation;
- monitoring information that would be useful;
- update or recovery problems;
- tasks a guided installer should handle; and
- improvements that would make independent node operation easier.

Please keep credentials, private keys, seed phrases, private server-access information, and other sensitive material out of public comments.

Discussion and operator feedback can be posted on **[Issue #1 — Guided node installation](https://github.com/UNI-ASYNC/vitruveo-directors-office/issues/1)**.
