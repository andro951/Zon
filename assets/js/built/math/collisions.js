"use strict";

const Collision = {}

Collision.liangBarskyClip = function(p, q, t) {
    if (p === 0)
        return q >= 0;

    const r = q / p;
    if (p < 0) {
        if (r > t[1])
            return false;

        if (r > t[0])
            t[0] = r;
    }
    else {
        if (r < t[0])
            return false;

        if (r < t[1])
            t[1] = r;
    }

    return true;
}

Collision.lineIntersectsRect = function(x1, y1, x2, y2, rect) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const t = [0, 1];

    if (!Collision.liangBarskyClip(-dx, x1 - rect.x, t)) {
        /*
        if (p === 0)//If no change in x of circle
            return q >= 0;//Is the starting x of the circle to the right of the left side of the rectangle?

        const r = q / p;//(x1 - rect.x) / dx;  distance from x1 to left side of rectangle over change in circle x.
        if (p < 0) {
            if (r > t[1])
                return false;

            if (r > t[0])
                t[0] = r;
        }
        else {
            if (r < t[0])
                return false;

            if (r < t[1])
                t[1] = r;
        }

        return true;
        */
        return null;
    }

    if (!Collision.liangBarskyClip(dx, rect.x + rect.width - x1, t)) {
        /*
        if (p === 0)//If no change in x of circle
            return q >= 0;//Is the starting x of the circle to the right of the left side of the rectangle?

        const r = q / p;
        if (p < 0) {
            if (r > t[1])
                return false;

            if (r > t[0])
                t[0] = r;
        }
        else {
            if (r < t[0])
                return false;

            if (r < t[1])
                t[1] = r;
        }

        return true;
        */
        return null;
    }

    if (!Collision.liangBarskyClip(-dy, y1 - rect.y, t)) {
        /*
        if (p === 0)//If no change in x of circle
            return q >= 0;//Is the starting x of the circle to the right of the left side of the rectangle?

        const r = q / p;
        if (p < 0) {
            if (r > t[1])
                return false;

            if (r > t[0])
                t[0] = r;
        }
        else {
            if (r < t[0])
                return false;

            if (r < t[1])
                t[1] = r;
        }

        return true;
        */
        return null;
    }

    if (!Collision.liangBarskyClip(dy, rect.y + rect.height - y1, t)) {
        /*
        if (p === 0)//If no change in x of circle
            return q >= 0;//Is the starting x of the circle to the right of the left side of the rectangle?

        const r = q / p;
        if (p < 0) {
            if (r > t[1])
                return false;

            if (r > t[0])
                t[0] = r;
        }
        else {
            if (r < t[0])
                return false;

            if (r < t[1])
                t[1] = r;
        }

        return true;
        */
        return null;
    }

    return {
        xStart: x1 + t[0] * dx,
        yStart: y1 + t[0] * dy,
        xEnd: x1 + t[1] * dx,
        yEnd: y1 + t[1] * dy,
    }
}

Collision._movingCircleIntersectsRectangle = function(x1, y1, circle, rectangle) {
    const expandedRectangle = new Struct.Rectangle(
        rectangle.x - circle.radius,
        rectangle.y - circle.radius,
        rectangle.width + circle.radius * 2,
        rectangle.height + circle.radius * 2
    );

    return Collision.lineIntersectsRect(x1, y1, circle.x, circle.y, expandedRectangle);
}

Collision.traverseGridWithCircle = function(x0, y0, circle, isSolidTile) {
    const x1 = circle.x;
    const y1 = circle.y;
    const r = circle.radius;

    const dx = x1 - x0;
    const dy = y1 - y0;

    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return null;

    // Normalize direction
    const dirX = dx / len;
    const dirY = dy / len;

    // Track t value from 0 to 1
    let t = 0;
    let px = x0;
    let py = y0;

    // Current tile position
    let tileX = Math.floor(px);
    let tileY = Math.floor(py);

    // Step direction
    const stepX = dirX > 0 ? 1 : -1;
    const stepY = dirY > 0 ? 1 : -1;

    // Next boundary crossing
    let tMaxX = ((tileX + (stepX > 0 ? 1 : 0)) - px) / dirX;
    let tMaxY = ((tileY + (stepY > 0 ? 1 : 0)) - py) / dirY;

    if (!isFinite(tMaxX)) tMaxX = Infinity;
    if (!isFinite(tMaxY)) tMaxY = Infinity;

    const tDeltaX = Math.abs(1 / dirX);
    const tDeltaY = Math.abs(1 / dirY);

    while (t <= 1) {
        // Expanded tile bounds
        const rect = {
            x: tileX - r,
            y: tileY - r,
            width: 1 + r * 2,
            height: 1 + r * 2
        };

        // Check collision with expanded tile
        const clipT = [0, 1];
        const localDx = x1 - x0;
        const localDy = y1 - y0;

        if (isSolidTile(tileX, tileY) &&
            Collision.liangBarskyClip(-localDx, x0 - rect.x, clipT) &&
            Collision.liangBarskyClip(localDx, rect.x + rect.width - x0, clipT) &&
            Collision.liangBarskyClip(-localDy, y0 - rect.y, clipT) &&
            Collision.liangBarskyClip(localDy, rect.y + rect.height - y0, clipT)) {

            const impactT = clipT[0];
            const hitX = x0 + localDx * impactT;
            const hitY = y0 + localDy * impactT;

            // Determine collision normal
            let normalX = 0;
            let normalY = 0;
            const epsilon = 1e-6;

            const left   = rect.x;
            const right  = rect.x + rect.width;
            const top    = rect.y;
            const bottom = rect.y + rect.height;

            if (Math.abs(hitX - left) < epsilon) normalX = -1;
            else if (Math.abs(hitX - right) < epsilon) normalX = 1;
            else if (Math.abs(hitY - top) < epsilon) normalY = -1;
            else if (Math.abs(hitY - bottom) < epsilon) normalY = 1;

            return {
                tileX,
                tileY,
                t: impactT,
                hitX,
                hitY,
                normalX,
                normalY
            };
        }

        // Advance to next grid boundary
        if (tMaxX < tMaxY) {
            t = tMaxX;
            tMaxX += tDeltaX;
            tileX += stepX;
        } else {
            t = tMaxY;
            tMaxY += tDeltaY;
            tileY += stepY;
        }
    }

    return null; // No collision
};