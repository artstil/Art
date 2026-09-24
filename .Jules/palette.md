## 2026-09-24 - Icon-only button Accessibility
**Learning:** Icon-only buttons (like modal closes, FABs, and pagination controls) are completely invisible to screen readers without ARIA labels, creating a severe accessibility trap. Keyboard users also need explicit focus states (focus-visible) as browser defaults are often overridden or invisible on custom styled buttons.
**Action:** Always verify if a button relies solely on an SVG/icon for its meaning. If so, immediately add a descriptive aria-label and ensure focus-visible utility classes are present.
