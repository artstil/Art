## 2024-03-05 - Added ARIA labels and focus states to icon buttons
**Learning:** Found several icon-only buttons across the app lacking screen reader support and proper keyboard focus indicators.
**Action:** Always add descriptive `aria-label` attributes and `focus-visible:ring` Tailwind classes to any interactive elements that do not contain visible text.