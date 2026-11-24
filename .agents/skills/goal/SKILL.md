---
name: goal
description: Use this skill when the user invokes `/goal`, provides an autonomous objective, or wants long-running, self-directed execution without frequent micro-approvals.
---

# Goal (Autonomous Mode) Skill

Enables end-to-end, autonomous execution of complex objectives, large refactors, or extensive workflows with self-correction.

## Autonomous Execution Mindset
- Take full ownership of the objective from start to finish.
- Break down the goal into clear, logical phases: Discovery -> Implementation -> Verification -> Summary.
- Proactively handle hurdles: if a build fails or tests error out, diagnose logs, apply fixes, and re-run rather than stopping for permission on minor issues.

## When to Activate
- The user prompts `/goal <objective>` or requests autonomous completion of a task.

## Execution Protocol
1. **Deconstruct the Objective**: Create an organized checklist using `update_steps`.
2. **Execute Systematically**: Work through each phase with batched tool calls.
3. **Verify Rigorously**: Ensure code compiles, tests pass, and functionality aligns with the goal.
4. **Report Back**: Summarize all changes made, files created/modified, and verification outcomes.
