## 2025-02-23 - Accessibility improvements to icon-only buttons
**Learning:** Icon-only buttons without visual text are particularly prone to accessibility issues because screen readers may announce the icon cryptically or announce nothing at all, while keyboard users might miss where focus currently is.
**Action:** Adding `aria-label` to the `<button>` element along with `aria-hidden="true"` to its internal SVG ensures semantic reading, while `focus-visible` ring utilities clarify focus for keyboard users without disrupting mouse user click aesthetics.
