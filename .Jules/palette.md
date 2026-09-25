## 2024-10-24 - Accessibility for Icon-Only Buttons
**Learning:** Icon-only navigation buttons (e.g., calendar arrows) and modal close buttons lack screen reader context and keyboard focus indicators by default in this app's components.
**Action:** When creating or updating icon-only buttons, always apply explicit `aria-label`s for screen readers and `focus-visible` utility classes (like `focus-visible:ring-2 focus-visible:outline-none`) to ensure keyboard navigability.
