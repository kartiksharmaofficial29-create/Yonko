---
name: browser-skills
description: Use this skill when the user asks to "use browser subagent", "use the browser to check this page", test login flows, visually verify UI rendering, or scrape dynamic web content.
---

# Browser Skills

Automates web interactions, user flow testing, and visual UI verification using the Antigravity `browser` subagent.

## When to Activate
- The user prompts: `use browser subagent`, `use the browser to check this page`, or requests UI verification, login testing, visual debugging, or web interaction on local or live web applications.

## How to Delegate to Browser Subagent
When browser interaction is needed, invoke the built-in `browser` subagent with a clear, specific brief:
1. Provide the target URL (e.g., `http://localhost:3000` or target live site).
2. Specify exact user flow steps (e.g., "Click login button, fill email field with ..., submit, and verify dashboard renders").
3. Define concrete completion conditions (e.g., "Take a screenshot of the resulting dashboard and verify the user profile dropdown is visible").

## Best Practices
- If testing a local server, ensure the server is already running before directing the browser subagent to the port.
- When inspecting responsive designs or visual layout bugs, instruct the subagent to take screenshots at specific viewport dimensions.
