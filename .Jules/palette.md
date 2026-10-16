## 2024-05-18 - Systemic Missing Labels on Icon-Only Buttons
**Learning:** Standard icon-only buttons throughout the app (calendar navigation, floating action buttons, and modal close buttons) were systematically lacking screen reader labels and clear keyboard focus indicators, creating a significant accessibility barrier.
**Action:** When adding or reviewing icon-only buttons, consistently apply `aria-label` for screen readers, `aria-hidden="true"` on internal SVG/Lucide icons to avoid redundant announcements, and `focus-visible` utility classes for keyboard navigation support.
