## 2023-10-24 - Accessibility of Icon-Only Buttons
**Learning:** Found that multiple icon-only buttons (like calendar chevrons, close modal buttons, and the FAB) were missing `aria-label` attributes and focus-visible states, violating WCAG 2.5.3 and failing keyboard accessibility.
**Action:** Adding descriptive `aria-label`s and `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary` (or appropriate accent color) to all such buttons.
