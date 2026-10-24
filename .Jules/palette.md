## 2024-05-24 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons (like modal close, floating action buttons, and control elements) often lack necessary ARIA labels and keyboard focus indicators, making them functionally invisible to screen readers and difficult to use for keyboard-only users.
**Action:** Applied semantic ARIA labels, `aria-hidden="true"` to internal SVGs, and consistent `focus-visible` utility classes to all icon-only buttons to ensure they are accessible without affecting the visual design.
