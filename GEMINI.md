# Custom Skills and Commands Reference & Project Rules

This environment is configured with specialized custom skills, workflow commands, and coding discipline guidelines.

## Syntax Quick Reference

| Skill / Command | Syntax Trigger | Purpose |
| :--- | :--- | :--- |
| **Ponytail** | `apply ponytail` / `run a ponytail audit` | Strip over-engineering, remove bloated abstractions, force shortest and cleanest solution. |
| **Frontend Design** | `apply frontend design` | Enforce modern, premium UI aesthetics (glassmorphism, vibrant gradients, micro-animations). |
| **Security Review** | `apply security review` / `run a security review` | Scan for XSS, CSRF, NoSQL/SQL injections, broken auth/IDOR, and secret leaks. |
| **Browser Skills** | `use browser subagent` / `use the browser to check this page` | Automate web interactions, verify layouts, and test login/user flows via browser subagent. |
| **Create Skill** | `create a new skill` / `create a new skill for <name>` | Scaffold standardized custom skills into `.agents/skills/`. |
| **Android CLI** | `use android cli` | Build APKs/AABs, run Gradle tasks, manage ADB devices, and orchestrate emulators. |
| **Grill Me** | `/grill-me` | Conduct a relentless interactive interview to stress-test architecture and design decisions. |
| **Goal** | `/goal <objective>` | Execute long-running, autonomous tasks end-to-end with self-directed error correction. |
| **Schedule** | `/schedule` | Set up background timers or recurring cron monitoring using the native schedule tool. |
| **Learn** | `/learn` | Persist hard-won lessons, bug fixes, and project-specific conventions to local config. |
| **Karpathy Guidelines** | `apply karpathy guidelines` / `follow Karpathy's guidelines` | Enforce disciplined LLM coding (simplicity, surgical changes, explicit assumptions, verification). |

---

## Active Behavioral Guidelines

### 1. Karpathy Coding Guidelines (Default Active Background)
- **Simplicity**: Resist premature abstractions, unneeded design patterns, and speculative generality.
- **Surgical Edits**: Modify only what is strictly necessary. Never perform unrelated formatting or code reorganizations.
- **Explicit Assumptions**: Inspect real code and schemas; never guess API signatures or parameters.
- **Verification**: Always verify changes with builds, tests, or inspection commands.

### 2. Ponytail Execution
When asked to `apply ponytail` or audit code:
- Audit for bloated classes, unnecessary wrappers, redundant DTO mappers, and convoluted inheritance.
- Replace complex code with standard language primitives and direct calls.

### 3. Frontend Design Standards
When asked to `apply frontend design`:
- Apply glassmorphism (`backdrop-filter: blur()`, translucent backgrounds, hairline borders).
- Use vibrant gradients, subtle radial illumination, and refined micro-interactions (`active: scale(0.98)`).
- Ensure accessible contrast and fluid responsiveness.

### 4. Security Review Protocols
When asked to `run a security review`:
- Review input sanitization, parameterized queries, CORS policies, CSRF protections, auth middleware, and secret exposure.
- Provide severity-ranked findings with concrete remediation diffs.

### 5. Browser Automation
When asked to `use browser subagent`:
- Delegate tasks to the built-in `browser` subagent with explicit URLs, actionable steps, and verifiable completion criteria.

### 6. Android CLI Workflows
When asked to `use android cli`:
- Run Gradle wrapper commands (`./gradlew assembleDebug`, `assembleRelease`), ADB commands (`adb install -r`, `adb logcat`), and emulator controls.

### 7. Interactive Grilling (`/grill-me`)
When triggered:
- Interview the user with 1-2 sharp, probing questions at a time.
- Pressure-test edge cases, scalability limits, failure states, and developer ergonomics until a solid design is agreed upon.

### 8. Autonomous Goal Mode (`/goal`)
When triggered:
- Deconstruct the goal, execute systematically, self-correct errors from logs, and report a full summary upon completion.

### 9. Scheduling & Timers (`/schedule`)
When triggered:
- Use the native `schedule` tool for non-blocking one-shot delays or recurring cron triggers. Never use `sleep` in terminal loops.

### 10. Knowledge Learning (`/learn`)
When triggered:
- Synthesize root causes and proven solutions into `AGENTS.md` / `GEMINI.md` or a new skill in `.agents/skills/`.
