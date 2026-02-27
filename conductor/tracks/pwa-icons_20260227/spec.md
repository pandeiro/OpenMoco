# Specification: Generate PWA Icons

## Track ID
`pwa-icons_20260227`

## Problem Statement

The `init/public/icons/` directory is empty but `manifest.json` references `icon-192.png` and `icon-512.png`. Without these icons, PWA installation fails on mobile devices.

## Objective

Generate the required PWA icon files from the existing `logo.png` source image to enable:
- PWA install prompt on mobile devices
- Correct home screen icon display
- Browser tab favicon

## Scope

### In Scope
- Generate `icon-192.png` (192x192 pixels)
- Generate `icon-512.png` (512x512 pixels)
- Generate `favicon.ico` (32x32 pixels)
- Update `init/index.html` favicon link if needed

### Out of Scope
- Logo redesign
- Additional icon sizes
- manifest.json modifications (already configured)

## Acceptance Criteria

1. `init/public/icons/icon-192.png` exists and is 192x192 pixels
2. `init/public/icons/icon-512.png` exists and is 512x512 pixels
3. `init/public/icons/favicon.ico` exists
4. PWA install prompt appears on mobile devices
5. Icons display correctly when installed to home screen
6. Favicon shows in browser tab

## Dependencies

- ImageMagick CLI (`convert` command)
- Source image: `logo.png` (exists in project root)

## Effort Estimate

~15 minutes

## Priority

P0 (Critical) - Blocks PWA functionality
