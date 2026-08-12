# Hero portrait images

Drop image files in this folder and they appear as choices in the admin panel
under **Hero → Portrait**, alongside anything uploaded through the panel itself
(uploads land here too).

    public/uploaded/my-new-portrait.png   ->   /uploaded/my-new-portrait.png

Accepted: PNG, JPEG, WebP, AVIF. Everything else is ignored by the picker.

## What makes a good hero portrait

The hero layout is built around a **cut-out subject on a transparent
background**, not a rectangular photo:

- **Transparent PNG or WebP.** The figure is composited over the giant yellow
  wordmark, so a rectangular photo will show as an opaque slab covering it.
- **Aspect ratio near 0.88 (w/h).** The bundled asset is 1688x1917. The panel
  accepts any ratio and adapts the layout to it, but it warns past +/-25%
  because the card cluster and the wordmark are positioned around this shape.
- **Subject opaque to the bottom edge.** The image is seated flush on the
  hero's bottom edge, so the last pixel row should be the figure. Empty space
  there reads as the portrait floating.
- **At least 1140px wide**, ideally ~1700px, for retina screens.

Files here are served as-is: there is no server-side resizing, so export at a
sensible size. Anything over 8 MB is rejected.
