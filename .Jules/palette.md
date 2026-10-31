## 2023-11-01 - Icon-Only Button Accessibility
**Learning:** Found a pattern where interactive icon-only buttons (Previous/Next Month, Sim Play, Modals) lacked both ARIA labels and visual focus outlines. This pattern breaks both screen reader usability and keyboard navigation testing. Adding internal `aria-hidden="true"` to SVGs is also crucial to avoid double-announcements.
**Action:** Always verify icon-only interactive elements for `aria-label`, `focus-visible` styles, and internal `aria-hidden` attributes on SVG components.
