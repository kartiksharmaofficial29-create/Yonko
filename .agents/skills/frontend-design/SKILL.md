---
name: frontend-design
description: Use this skill when the user asks to "apply frontend design", build or update web user interfaces, buttons, layouts, or enforce a modern, premium aesthetic (glassmorphism, vibrant gradients, micro-animations, Tailwind/CSS).
---

# Frontend Design Skill

Enforces a premium, modern, visually stunning aesthetic across web user interfaces, buttons, cards, navigation, and layouts.

## Visual Design Principles
- **Glassmorphism & Depth**: Modern frosted glass styling using `backdrop-filter: blur(...)`, translucent backgrounds (`rgba(255, 255, 255, 0.05)` to `0.15`), and razor-thin subtle borders (`1px solid rgba(255, 255, 255, 0.1)`).
- **Vibrant Lighting & Gradients**: Subtle radial glow effects, rich modern gradients (e.g., deep indigo/violet to vibrant cyan/amber accents), avoiding flat muddy color palettes.
- **Polished Micro-Interactions**:
  - Smooth hover transitions (`transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1)`).
  - Tactile button clicks (`transform: scale(0.98)` on active state).
  - Elegant focus rings with glow offsets for high accessibility.
- **Typography & Rhythm**: High contrast, crisp typography hierarchies, proper line-height (`1.5` to `1.6` for body, `1.1` to `1.2` for headings), and deliberate whitespace spacing.

## When to Activate
- The user prompts: `apply frontend design`, or asks to design, restyle, or polish any UI component, landing page, dashboard, or layout.

## Implementation Checklist
1. **Inspect Layout & Theme**: Check whether the project uses Tailwind CSS, Vanilla CSS, CSS Modules, or UI libraries (e.g. Radix, Lucide).
2. **Inject Modern Elements**:
   - Add glass card containers with subtle drop shadows (`box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37)`).
   - Enhance interactive controls with subtle hover glow and active feedback.
   - Ensure responsive grid/flex layouts that look great on both mobile and desktop.
3. **Verify Contrast & Animation**: Ensure accessibility contrast ratios (WCAG AA minimum) and smooth 60fps CSS transitions without layout shifts.
