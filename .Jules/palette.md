## 2024-05-18 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Icon-only buttons across the app (calendar navigation, FAB, mobile controls, and modal close buttons) lacked both `aria-label`s and visible focus states (`focus-visible`), making them inaccessible for screen readers and keyboard users.
**Action:** Always add descriptive `aria-label`s and `focus-visible:ring-2` to icon-only buttons.
