---
name: create-skill
description: Use this skill when the user asks to "create a new skill", "create a new skill for X", or scaffold custom workflows, runbooks, and procedures into .agents/skills/.
---

# Create Skill

Scaffolds and standardizes new custom skills within the Antigravity environment.

## Skill Specification Requirements
Each skill must reside in its own folder under `.agents/skills/<skill-name>/` with a `SKILL.md` entrypoint:
- **Frontmatter**:
  - `name`: Lowercase, hyphen-separated identifier (e.g., `database-migration`).
  - `description`: 3rd-person description specifying exactly WHAT the skill does and WHEN the agent should activate it.
- **Body**:
  - Overview & Purpose
  - Trigger Syntax & Invocation commands
  - Step-by-step procedure & commands
  - Verification & validation criteria

## When to Activate
- The user prompts: `create a new skill`, `create a new skill for <name>`, or asks to teach or persist a new repeatable workflow.

## Generation Procedure
1. Determine the skill identifier `<skill-name>`.
2. Create `.agents/skills/<skill-name>/SKILL.md`.
3. Fill in YAML frontmatter with precise triggers and third-person description.
4. Provide structured, executable steps, guardrails, and validation methods.
5. Register the skill in `.agents/skills.json` if needed.
