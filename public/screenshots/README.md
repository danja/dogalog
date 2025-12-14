# PWA Screenshots

This directory contains screenshot images used for the PWA (Progressive Web App) installation preview.

## Required Screenshots

The manifest expects the following screenshot files:

### Desktop/Wide Screenshots (form_factor: 'wide')
- **desktop-1.png**: 1280x720 pixels - Main view showing code editor and live controls
- **desktop-2.png**: 1280x720 pixels - View showing REPL and instrument panel

### Mobile/Narrow Screenshots (form_factor: 'narrow')
- **mobile-1.png**: 750x1334 pixels - Mobile layout view

## How to Create Screenshots

1. **Desktop screenshots (1280x720)**:
   - Run the app locally: `npm run dev`
   - Open browser at full desktop width (at least 1280px wide)
   - Use browser DevTools screenshot feature or OS screenshot tool
   - Capture the app showing different features:
     - desktop-1.png: Show the code editor with example code and controls
     - desktop-2.png: Show the REPL with queries and the instruments panel
   - Resize/crop images to exactly 1280x720 pixels

2. **Mobile screenshot (750x1334)**:
   - Open DevTools responsive mode
   - Set viewport to 750x1334 (iPhone 8 Plus size)
   - Capture screenshot showing mobile layout
   - Save as mobile-1.png

## Image Format

- Format: PNG
- Color mode: RGB
- Compression: Optimize for web (use tools like ImageOptim, TinyPNG)
- Keep file size reasonable (under 500KB per screenshot)

## Testing

After adding screenshots, test the PWA manifest:
1. Build: `npm run build`
2. Preview: `npm run preview`
3. Open DevTools > Application > Manifest
4. Verify screenshots appear correctly with proper form_factor values
