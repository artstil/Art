## 2024-10-08 - Icon-Only Button Accessibility Pattern
**Learning:** Found a recurrent accessibility issue pattern where icon-only buttons (like FABs, play/pause toggles, and modal close buttons) lacked `aria-label` attributes and clear keyboard focus states. This makes navigation difficult for screen reader users and keyboard-only users.
**Action:** Always ensure that any button containing only an icon or SVG receives an appropriate `aria-label` and `focus-visible` utility classes (e.g., `focus-visible:ring-2`) to guarantee both semantic meaning and visual keyboard focus.
