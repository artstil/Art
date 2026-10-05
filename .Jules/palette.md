## 2025-03-02 - Icon-only buttons accessibility pattern
**Learning:** Found multiple icon-only buttons (calendar navigation, mobile playback, FAB, and modal closes) missing `aria-label`s and proper keyboard focus states. The standard utility class pattern `focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-theme-primary` works well with this app's existing styling approach.
**Action:** Always verify icon-only interactive elements have screen reader labels and clear keyboard focus rings.
