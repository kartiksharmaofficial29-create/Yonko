---
name: learn
description: Use this skill when the user invokes `/learn`, asks to remember a project-specific workflow, save debugging insights, or persist guidelines so mistakes are not repeated.
---

# Learn & Knowledge Persistence Skill

Captures hard-won project insights, debugging resolutions, and team conventions so future agent interactions remember them automatically.

## When to Activate
- The user prompts `/learn` after resolving a complex issue, finding a project quirk, or setting up a special environment configuration.

## Persistence Procedure
1. **Synthesize the Learning**:
   - What was the problem/symptom?
   - What was the root cause?
   - What is the verified, exact solution or rule?
2. **Persist Locally**:
   - Update `AGENTS.md` or `GEMINI.md` in the workspace root with a clear, concise rule under a "Learned Rules & Conventions" section.
   - For complex, multi-step procedures, scaffold a dedicated skill under `.agents/skills/<topic>/SKILL.md`.
3. **Confirm to User**: Briefly summarize the rule saved and verify where it was recorded.
