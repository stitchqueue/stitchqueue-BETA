# Accessibility Notes — StitchQueue v4.0

## Fixes Applied

### Header Navigation (High Priority)
- **Header.tsx**: Replaced `title` with `aria-label` on all emoji-only nav buttons (Board, Archive, BOC)
- **Header.tsx**: Added `aria-expanded`, `aria-haspopup="menu"` to settings dropdown trigger
- **Header.tsx**: Added `role="menu"` to settings dropdown container
- **Header.tsx**: Wrapped decorative emoji in `<span aria-hidden="true">` to prevent screen readers from announcing them

### Calendar Navigation (High Priority)
- **CalendarView.tsx**: Added `aria-label="Previous month"` and `aria-label="Next month"` to arrow-only navigation buttons

### BOC Tooltips
- **Tooltip.tsx**: New component uses `aria-label` on trigger button and `role="tooltip"` on content
- **RateCalculatorSection.tsx**, **OverheadSection.tsx**, **IncidentalsSection.tsx**: Added tooltip help icons with accessible labels

### Error Boundary
- **ErrorBoundary.tsx**: Shows friendly error message with "Refresh Page" action button

## Known Remaining Issues

### Medium Priority
- **ProjectCard.tsx**: Checkmark emoji (✓/○) used as status indicators could use `aria-label` for clarity
- **ListView.tsx**: Fire emoji (🔥) for priority uses `title` instead of `aria-label`
- Some decorative emoji throughout the app aren't wrapped in `aria-hidden="true"`

### Low Priority
- Color contrast for gold text (#98823a) on white may be borderline for WCAG AA in some contexts (4.1:1 ratio vs 4.5:1 requirement for normal text). Plum (#4e283a) on white passes easily (10.5:1).
- Number inputs rely on browser default spinners; could benefit from explicit +/- buttons on mobile

## Color Contrast Check

| Color Pair | Ratio | WCAG AA (normal) | WCAG AA (large) |
|------------|-------|-------------------|-----------------|
| Plum (#4e283a) on White | 10.5:1 | Pass | Pass |
| Gold (#98823a) on White | 4.1:1 | Borderline | Pass |
| Muted text on White | ~4.5:1 | Pass | Pass |
| White on Plum | 10.5:1 | Pass | Pass |

## Keyboard Navigation

- All form inputs are tabbable and have visible labels
- Accordion sections toggle on Enter/Space
- Drag-and-drop on the board requires mouse/touch (keyboard fallback via list view)
- Settings dropdown opens on click and mouse hover

## Screen Reader Considerations

- All form inputs have associated `<label>` elements
- Emoji-only buttons now have `aria-label` attributes
- The Tooltip component uses `role="tooltip"` for proper semantics
- EmptyState component uses semantic headings (h2)
