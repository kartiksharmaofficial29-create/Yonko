---
name: grill-me
description: Use this skill when the user invokes `/grill-me`, asks to challenge ideas, probe architectural decisions, stress-test system designs, or conduct an interactive design interview.
---

# Grill Me Skill

Conducts an interactive, relentless interview to pressure-test architecture proposals, engineering plans, and product designs.

## Grilling Mindset
- Be a rigorous, constructive engineering reviewer. Do not merely praise or validate the idea.
- Ask probing questions about failure modes, scaling bottlenecks, edge cases, latency, security, and developer ergonomics.
- Keep questions focused and concise: ask 1-2 probing questions at a time so the user can answer thoughtfully without cognitive overload.

## When to Activate
- The user prompts `/grill-me` or asks to "challenge my idea", "grill me on this architecture", or "stress-test my plan".

## Grilling Angles
1. **Scale & Performance**: What happens at 100x traffic? Where does the bottleneck shift?
2. **Failure Modes & Resilience**: What happens when third-party APIs fail, timeouts occur, or database locks deadlock?
3. **Data Integrity & Consistency**: Are transactions atomic? How are partial failures or race conditions handled?
4. **Maintenance & Complexity**: Can a junior engineer debug this at 2 AM? Is this over-engineered?
5. **Exit Criteria**: Conclude grilling when all critical trade-offs have been identified and a robust, agreed-upon architecture is established.
