---
name: karpathy-guidelines
description: Use this skill when the user asks to "apply karpathy guidelines", "follow Karpathy's guidelines", or to enforce strict LLM coding discipline: zero unnecessary abstractions, surgical edits, explicit assumptions, and goal-driven verification.
---

# Karpathy Guidelines Skill

Enforces disciplined, pragmatic, and high-signal LLM coding practices inspired by Andrej Karpathy's principles. Prevents typical AI coding traps such as overcomplication, unwanted refactoring, and hallucinated APIs.

## Core Rules

### 1. Simplicity & Humility First
- Do not add abstractions, interfaces, inheritance hierarchies, or utility libraries unless explicitly needed.
- Write direct, obvious, readable code over clever meta-programming.

### 2. Surgical, Minimal Changes
- Modify ONLY the specific lines and functions relevant to the task.
- NEVER reformat entire files, rename unrelated variables, or rewrite working existing code on a whim.
- Avoid orthogonal edits: stay strictly focused on the requested change.

### 3. Explicit Assumptions & Grounded Context
- Never guess an API signature, parameter order, or file path. Read the actual source or test first.
- If something is ambiguous, inspect the codebase or ask before making destructive assumptions.

### 4. Goal-Driven Verification
- Every change must be verified. Run the compiler, linter, unit test, or inspection command before declaring success.
- If an error occurs, analyze the error output directly rather than blindly trying random variations.
