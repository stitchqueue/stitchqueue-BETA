# Mobile Testing Checklist — StitchQueue v4.0

## iOS Safari (Critical)

- [ ] Login / signup flow works
- [ ] Board loads and displays correctly
- [ ] Board drag-and-drop works (touch events)
- [ ] Board view switching (Kanban / List / Calendar)
- [ ] Calculator inputs responsive and usable
- [ ] Calculator estimate summary readable
- [ ] Photo upload works (camera + gallery)
- [ ] Photo gallery displays correctly
- [ ] Settings page — all sections open/close
- [ ] Settings saves correctly
- [ ] BOC form displays properly
- [ ] BOC results card readable
- [ ] Intake form mobile-friendly (public page)
- [ ] Onboarding flow works on first login
- [ ] Header navigation (all buttons reachable)
- [ ] Toast notifications visible and dismissable
- [ ] Archive page — search works
- [ ] Project detail page — all fields accessible

## Android Chrome

- [ ] Login / signup flow works
- [ ] Board loads and displays correctly
- [ ] Board drag-and-drop works (touch events)
- [ ] Calculator inputs responsive and usable
- [ ] Photo upload works
- [ ] Settings saves correctly
- [ ] BOC form displays properly
- [ ] Intake form mobile-friendly
- [ ] Header navigation works

## Tablet (iPad / Android)

- [ ] Board columns display side-by-side
- [ ] Calculator layout uses full width
- [ ] Settings layout comfortable
- [ ] BOC two-column grid works

## Common Issues to Watch For

- Keyboard covers input fields (especially on iOS)
- Scroll position jumps after input focus
- Drag-and-drop conflicts with page scrolling
- Date picker differences between browsers
- Number input spinners (especially on iOS)
- Viewport meta tag preventing zoom

## Test Results

| Device | Browser | Tester | Date | Pass/Fail | Notes |
|--------|---------|--------|------|-----------|-------|
| | | | | | |

## Notes

- Test on real devices when possible (simulators miss touch issues)
- Test with slow network (3G throttle in DevTools)
- Test with keyboard showing (especially forms)
