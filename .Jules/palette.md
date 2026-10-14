
## 2024-10-14 - Icon-only buttons accessibility pattern
**Learning:** In this application's design system, standard icon-only buttons lack proper screen reader support and keyboard focus visibility out of the box. Simply adding `onClick` isn't enough for true accessibility.
**Action:** When adding or auditing icon-only buttons, consistently apply `aria-label` for screen readers, `aria-hidden="true"` on the internal SVG to prevent double announcements, and Tailwind's `focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-theme-primary` for proper keyboard focus indication.
