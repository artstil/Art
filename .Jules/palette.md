## 2023-10-27 - Icon-only Button Accessibility
**Learning:** Icon-only buttons without `aria-label`s are inherently inaccessible to screen readers, and rely heavily on visual cues. They also lack clear keyboard focus indicators by default.
**Action:** Always add descriptive `aria-label` attributes to icon-only buttons (like FABs, modal close buttons, play/pause toggles). Combine this with `focus-visible` utility classes (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2`) to ensure keyboard navigability is visually apparent.
