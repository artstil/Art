## 2024-05-18 - Accessibility for Icon-only Buttons
**Learning:** Icon-only buttons (like modal close buttons, play/pause controls, and calendar navigation chevrons) must have explicit `aria-label`s for screen readers and visible focus states (`focus-visible:ring-2`) for keyboard navigation to be accessible. Relying solely on the icon SVG is insufficient for many users.
**Action:** Always add descriptive `aria-label` attributes and Tailwind `focus-visible` utility classes to all interactive elements that lack visible text labels in this design system.
