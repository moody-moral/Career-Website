# Moody Moral portfolio

Static HTML, CSS and JavaScript portfolio with locally bundled Three.js and video assets.

## Publish

In Settings → Pages, select Deploy from a branch, main, and /(root). No build step is required.

## Preview

Run `python3 -m http.server 4173` in this directory and visit http://localhost:4173.

## Edit

- `index.html`: content and sections
- `styles.css`, `perspectives.css`: layout and brand styling
- `script.js`: navigation and company ticker
- `neutron.js`, `vision-video.js`: animated hero and video transitions
- `vision.js`, `vision-scene.js`: interactive 3D section
- Media and vendored Three.js files are stored beside the page for straightforward browser uploads. The Three.js MIT license is included as `LICENSE`.

Some case studies and experiments are marked as coming soon. The hero video is a placeholder pending the final work reel.
