## 2024-03-24 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found multiple icon-only buttons (like modal close 'X', next/prev month arrows, and play/pause controls) without ARIA labels, making them inaccessible to screen readers. This pattern is common in modal and calendar components in this app.
**Action:** Always add descriptive `aria-label` attributes to any `<button>` element that only contains an icon (e.g., `<ChevronLeft>`, `<X>`, etc.) to ensure screen reader compatibility.
