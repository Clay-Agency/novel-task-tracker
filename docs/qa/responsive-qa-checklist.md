# Responsive UX QA Checklist (Issue #9)

Quick manual checks for mobile + desktop layouts.

## Test Setup
- App running via `npm run dev`.
- Browser devtools responsive mode available.

## Viewports to Verify
- Mobile: **320×568** (iPhone SE-ish)
- Mobile large: **390×844**
- Tablet/Desktop transition: **768×1024**
- Desktop: **1280×800**

## Checklist
- [ ] Page content is fully usable at each viewport size (no blocked sections).
- [ ] “Now queue”, “Add task”, and “Tasks” sections remain readable and navigable.
- [ ] Core actions are accessible on small widths:
  - [ ] Add task
  - [ ] Edit task
  - [ ] Mark completed / Reopen
  - [ ] Delete
  - [ ] Search / filter / sort
- [ ] Task action buttons remain clickable without horizontal panning.
- [ ] No critical horizontal overflow in task cards, metadata, status chips, or controls.
- [ ] Long titles/descriptions wrap without layout breakage.
- [ ] Desktop layout uses available width effectively (two-column top sections + full-width task list).

## Notes
Capture any viewport-specific issues with screenshot + reproduction steps.
