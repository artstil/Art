## 2024-05-18 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Icon-only controls like modal close buttons and calendar navigation lacked `aria-label`s, rendering them completely inaccessible to screen reader users, and were missing `focus-visible` styling for keyboard navigation.
**Action:** Always add descriptive `aria-label`s, `title`s for tooltips, and `focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-theme-primary/50` to icon-only buttons to ensure they are accessible to both screen readers and keyboard users.
