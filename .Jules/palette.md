## 2024-05-18 - [Accessibility of Icon-Only Buttons]
**Learning:** Icon-only buttons (like calendar navigation, mobile FABs, and modal close buttons) often lack ARIA labels and focus states, making them inaccessible to screen readers and difficult to use for keyboard navigators.
**Action:** Always add descriptive `aria-label` attributes and `focus-visible` utility classes to icon-only buttons to ensure WCAG compliance.
