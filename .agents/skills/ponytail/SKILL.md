---
name: ponytail
description: Use this skill when the user asks to "apply ponytail", "run a ponytail audit", or requests lean, non-over-engineered, shortest, and most efficient code solutions without bloated abstractions.
---

# Ponytail Skill

Forces the simplest, laziest, shortest, and most efficient implementation. Audits and removes unnecessary design patterns, bloated wrapper layers, and premature abstractions.

## Core Philosophy
- **YAGNI (You Aren't Gonna Need It)**: Do not build generalized frameworks for single-use tasks.
- **Flatter is Better**: Eliminate intermediary classes, factories, single-implementation interfaces, and pass-through wrapper functions.
- **Shortest Working Solution**: The best code is often the code you didn't write. If 10 lines of standard library or direct calls solve the problem, do not write a 100-line architecture around it.

## When to Activate
- The user prompts: `apply ponytail`, `run a ponytail audit`, or asks to "simplify the code" or "make it less over-engineered".
- When developing new features where the simplest possible direct path is desired.

## Audit & Refactoring Procedure
1. **Identify Redundancies**:
   - Inspect files for pass-through functions, single-use abstraction wrappers, redundant DTO mappers, and speculative configuration objects.
2. **Flatten Hierarchy**:
   - Collapse excessive layers (Controller -> Service -> Repository -> DAO) when direct queries or concise modules do the job cleanly.
   - Replace complex inheritance or strategy patterns with simple conditional logic or plain functions where appropriate.
3. **Delete Dead Code**:
   - Strip unused helper functions, commented-out blocks, and "future-proof" boilerplate that has no current consumers.
4. **Preserve Functionality**:
   - Ensure external behavior, API contracts, and edge cases remain fully functional and passing tests.
