"use strict";

Zon.UI.drawNineSliceImage = (ctx, image, x, y, width, height, borderSize, borderScale = 1) => {
    const iw = image.width;
    const ih = image.height;
    const b = borderSize;

    // Source rects (fixed, from the image)
    const src = {
        topLeft:     [0, 0, b, b],
        top:         [b, 0, iw - 2 * b, b],
        topRight:    [iw - b, 0, b, b],
        left:        [0, b, b, ih - 2 * b],
        center:      [b, b, iw - 2 * b, ih - 2 * b],
        right:       [iw - b, b, b, ih - 2 * b],
        bottomLeft:  [0, ih - b, b, b],
        bottom:      [b, ih - b, iw - 2 * b, b],
        bottomRight: [iw - b, ih - b, b, b],
    };

    // Destination rects scaled by `scale`
    const sb = b * borderScale; // scaled border size
    const sw = width;
    const sh = height;

    const dest = {
        topLeft:     [x, y, sb, sb],
        top:         [x + sb, y, sw - 2 * sb, sb],
        topRight:    [x + sw - sb, y, sb, sb],
        left:        [x, y + sb, sb, sh - 2 * sb],
        center:      [x + sb, y + sb, sw - 2 * sb, sh - 2 * sb],
        right:       [x + sw - sb, y + sb, sb, sh - 2 * sb],
        bottomLeft:  [x, y + sh - sb, sb, sb],
        bottom:      [x + sb, y + sh - sb, sw - 2 * sb, sb],
        bottomRight: [x + sw - sb, y + sh - sb, sb, sb],
    };

    for (const key in src) {
        ctx.drawImage(image, ...src[key], ...dest[key]);
    }
}