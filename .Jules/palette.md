## 2024-09-01 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found several icon-only buttons (like modal close buttons, previous/next month buttons, and a floating action button) lacking `aria-label`s and visual focus indicators (`focus-visible` classes). This severely reduces screen reader usability and keyboard navigation.
**Action:** Always add descriptive `aria-label` attributes to any icon-only button and ensure it includes `focus-visible:ring-2` (or similar depending on the component's style) to maintain accessible interactions in `App.tsx` and future components.
