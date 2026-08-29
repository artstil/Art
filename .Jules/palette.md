## 2026-08-29 - [Added ARIA Labels to Icon-Only Buttons]
**Learning:** Found several icon-only buttons (FAB, modal close buttons, calendar navigation, simulation play/pause) missing ARIA labels and focus-visible states, reducing accessibility for screen reader and keyboard users.
**Action:** Always ensure any button containing only an icon (like Lucide React components or SVGs) has a descriptive `aria-label` and visible focus styles (e.g., `focus-visible:ring-2 focus:outline-none`) to maintain keyboard navigation and WCAG compliance.
