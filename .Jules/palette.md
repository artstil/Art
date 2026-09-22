## 2024-10-27 - Icon-only buttons accessibility pattern
**Learning:** Found a recurring accessibility issue pattern in the app's components where icon-only buttons (like FABs, modal close buttons, and calendar navigation) were missing ARIA labels and keyboard focus states, causing WCAG violations for screen reader users.
**Action:** Always verify that interactive elements without visible text have descriptive `aria-label` attributes and clear `focus-visible` styles for keyboard navigation when reviewing or modifying UI components.
