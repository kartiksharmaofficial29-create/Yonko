---
name: schedule
description: Use this skill when the user invokes `/schedule`, requests automated background checks, recurring cron tasks, or one-time timers to monitor builds/services.
---

# Schedule & Automation Skill

Automates scheduled monitoring, one-time delayed checks, and recurring background jobs using Antigravity's scheduling tools.

## When to Activate
- The user prompts `/schedule`, or asks to set a timer, poll an endpoint, or run a background job periodically.

## Capabilities & Usage
- **One-Shot Timers**: Use the `schedule` tool with `DurationSeconds` (e.g., wait for a long build or deployment) and specify a notification prompt.
- **Recurring Schedules**: Use the `schedule` tool with `CronExpression` for scheduled tasks (e.g. recurring health checks).
- **Non-Polling Reactive Wakeup**: Never use `sleep` in terminal commands; use the native `schedule` tool so execution wakes up reactively when the timer expires.
