## PALETTE'S JOURNAL
## 2024-05-18 - Unlabelled Icon-Only Buttons in Navigation & Modals
**Learning:** A recurring pattern in this application is the use of unlabelled icon-only buttons for primary actions (like Previous/Next month navigation, Play/Pause simulation, floating action buttons, and modal close buttons). This poses a significant accessibility barrier as screen readers cannot interpret their purpose, and they lack visible focus rings for keyboard users.
**Action:** When working on navigation elements, modals, and floating action buttons, ensure they have explicit `aria-label`s, `focus-visible` styles for keyboard accessibility, and `aria-hidden="true"` on their inner SVG/icons to prevent redundant or confusing screen reader announcements.
