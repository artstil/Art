## 2023-10-25 - Icon-Only Accessibility Gap
**Learning:** Icon-only interactive elements, specifically navigation buttons (calendars) and modal close icons (X buttons), frequently lack semantic labelling and explicit keyboard focus states in this repository's initial design system.
**Action:** Always verify `aria-label` and `focus-visible` ring utilities exist on `<button>` elements that only contain `<svg>` or `<lucide-react>` icons during reviews.
