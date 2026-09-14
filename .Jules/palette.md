
## 2024-05-18 - Missing Accessible Names on Modal Closures and Mobile Controls
**Learning:** Found a systemic pattern where icon-only buttons (like 'X' to close modals or calendar navigation carets) lacked `aria-label`s, violating WCAG principles for screen readers. Furthermore, interactive controls on mobile layouts, like the floating action button and simulation playback, lacked distinct visual focus rings when accessed via keyboard navigation.
**Action:** Always ensure that every icon-only button is accompanied by a descriptive `aria-label` and explicit `focus-visible` styling using Tailwind utilities (`focus-visible:ring-2 focus-visible:outline-none`) to guarantee both screen reader comprehension and keyboard operability across all viewports.
