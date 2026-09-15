## 2025-05-15 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Found several icon-only buttons in the main navigation and dialog modals (like chevron navigation and close buttons) lacking `aria-label` attributes and visible focus states, which makes them inaccessible to screen readers and keyboard users.
**Action:** Always add descriptive `aria-label`s to icon-only buttons (like `aria-label="Previous month"`) and ensure they have `focus-visible:ring-2 focus-visible:outline-none` classes for keyboard navigability.
