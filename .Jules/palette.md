## 2024-05-24 - Accessibility improvements
**Learning:** Found multiple icon-only buttons missing ARIA labels which makes the UI inaccessible for screen reader users. Also noticed keyboard accessibility can be improved on some interactive elements.
**Action:** Will add `aria-label` to all icon-only buttons to ensure standard accessibility. Will also ensure interactive elements are keyboard focusable if needed.

## 2024-05-24 - Icon-only button accessibility
**Learning:** Found multiple icon-only buttons (like modals' close buttons, FAB, navigation) missing ARIA labels which makes the UI inaccessible for screen reader users. Also noticed keyboard accessibility can be improved on these interactive elements.
**Action:** Added `aria-label` to all icon-only buttons to ensure standard accessibility. Added `focus-visible` utility classes for keyboard focus styling and `aria-hidden="true"` to internal SVG icons to prevent redundant screen reader announcements.
