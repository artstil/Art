## 2024-05-18 - WCAG 2.5.3 Awareness
**Learning:** Adding `aria-label` to buttons that already have visible text overrides the visible text in the accessibility tree, which violates WCAG 2.5.3 (Label in Name).
**Action:** Only add `aria-label` to purely icon-only buttons. Do not add them to buttons that already have text context.
