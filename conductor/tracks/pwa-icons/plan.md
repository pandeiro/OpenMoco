# Implementation Plan: PWA Icons

## Track ID
`pwa-icons`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 1

## Priority
P0 (Critical) | Effort: Small (~15 min)

---

## Phase 1: Icon Generation

### Task 1: Verify Prerequisites
- [ ] Task: Verify ImageMagick is available and logo.png exists
    - [ ] Check that `convert` command is available
    - [ ] Verify `logo.png` exists in project root
    - [ ] Check current dimensions of logo.png

### Task 2: Generate Icon Files
- [ ] Task: Generate PWA icons using ImageMagick
    - [ ] Create `icon-192.png` (192x192)
    - [ ] Create `icon-512.png` (512x512)
    - [ ] Create `favicon.ico` (32x32)
    - [ ] Place all files in `init/public/icons/`

### Task 3: Verify Output
- [ ] Task: Verify generated icons
    - [ ] Confirm icon-192.png dimensions are correct
    - [ ] Confirm icon-512.png dimensions are correct
    - [ ] Confirm favicon.ico exists
    - [ ] Visual check that icons look correct

---

## Phase 2: Integration

### Task 4: Update HTML
- [ ] Task: Verify favicon link in index.html
    - [ ] Check if favicon link exists in `init/index.html`
    - [ ] Add or update favicon link if missing/incorrect

### Task 5: Manual Verification
- [ ] Task: Manual verification
    - [ ] PWA install prompt appears on mobile
    - [ ] Icons display correctly on home screen
    - [ ] Favicon shows in browser tab

---

## Commands

```bash
convert logo.png -resize 192x192 init/public/icons/icon-192.png
convert logo.png -resize 512x512 init/public/icons/icon-512.png
convert logo.png -resize 32x32 init/public/icons/favicon.ico
```
