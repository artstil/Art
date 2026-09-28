## 2024-05-24 - Accessibility on Icon-only Buttons
**Learning:** Icon-only buttons without visible text must have ARIA labels to be screen-reader friendly and prevent WCAG 2.5.3 (Label in Name) violations. Also, relying solely on active states without explicit focus indicators harms keyboard navigation accessibility.
**Action:** Always add `aria-label` providing a descriptive label and `focus-visible` utility classes (e.g. `focus-visible:ring-2 focus-visible:outline-none`) to all icon-only buttons.
