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
Collision.lineIntersectsRectPoints = function(x1, y1, x2, y2, rx1, ry1, rx2, ry2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const t = [0, 1];

    if (!Collision.liangBarskyClip(-dx, x1 - rx1, t))
        return null;

    if (!Collision.liangBarskyClip(dx, rx2 - x1, t))
        return null;

    if (!Collision.liangBarskyClip(-dy, y1 - ry1, t))
        return null;

    if (!Collision.liangBarskyClip(dy, ry2 - y1, t))
        return null;

    return t;
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
        t
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

Collision.traverseGridWithCircleOld = function(x0, y0, circle, isSolidTile) {
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

Collision.crossesX = function(line, x) {
    const dx = line.endX - line.startX;
    if (dx === 0) 
        return line.startX === x ? 0 : null;

    const t = (x - line.startX) / dx;
    if (t >= 0 && t <= 1)
        return t;

    return null;
}
Collision.crossesY = function(line, y) {
    const dy = line.endY - line.startY;
    if (dy === 0) 
        return line.startY === y ? 0 : null;

    const t = (y - line.startY) / dy;
    if (t >= 0 && t <= 1)
        return t;

    return null;
}

Collision.traverseGridWithCircle = function(p0, circle, isSolidTile, gridRect, tilesCount) {
    const x0 = p0.x;
    const y0 = p0.y;
    const x1 = circle.x;
    const y1 = circle.y;
    const r = circle.radius;

    const dx = x1 - x0;
    const dy = y1 - y0;
    const dLength = Math.sqrt(dx * dx + dy * dy);
    if (dx === 0 && dy === 0)
        return null;

    const tileWidth = gridRect.width / tilesCount.x;
    const tileHeight = gridRect.height / tilesCount.y;
    
    const xDir = dx < 0 ? -1 : dx > 0 ? 1 : 0;
    const yDir = dy < 0 ? -1 : dy > 0 ? 1 : 0;
    const xTileStep = xDir === 0 ? 1 : xDir;
    const yTileStep = yDir === 0 ? 1 : yDir;
    //Not correct.  r is the hypotenuse of the triangle, not the x or y distance.
    //Use similar triangles to determine the start and end points of the line.

    const hRatio = r / dLength;
    const rX = dx * hRatio;
    const rY = dy * hRatio;
    const line = {
        startX: x0 + rX,
        endX: x1 + rX,
        startY: y0 - rY,
        endY: y1 + rY
    };

    const xTileStartInc = Math.floor((line.startX - gridRect.left) / tileWidth) + (xTileStep === -1 ? 1 : 0);
    const xTileEndNonInc = Math.floor((line.endX - gridRect.left) / tileWidth) + (xTileStep === 1 ? 2 : 1);
    const yTileStartInc = Math.floor((line.startY - gridRect.top) / tileHeight) + (yTileStep === -1 ? 1 : 0);
    const yTileEndNonInc = Math.floor((line.endY - gridRect.top) / tileHeight) + (yTileStep === 1 ? 2 : 1);

    /*
    Checking line: 153.05919732322522, 464.07538180559607 -> 176.1794985488792, 496.411450204164, (x0: 125.31483585244042, y0: 475.48811182862005), (x1: 148.4351370780944, y1: 484.99872018114), (rX: 27.744361470784792, rY: 11.412730023023961), (dx: 23.12030122565399, dy: 9.510608352519967), (xTileStartInc: 0, xTileEndNonInc: 2), (yTileStartInc: 3, yTileEndNonInc: 5)
    collisions.js:348 Checking line: 176.1794985488792, 473.58599015811603 -> 199.2997997745332, 505.92205855668396, (x0: 148.4351370780944, y0: 484.99872018114), (x1: 171.55543830374842, y1: 494.50932853366), (rX: 27.744361470784792, rY: 11.412730023023956), (dx: 23.120301225654003, dy: 9.510608352519967), (xTileStartInc: 0, xTileEndNonInc: 2), (yTileStartInc: 3, yTileEndNonInc: 6)
    collisions.js:387 Y Hit found: 6, 4, t: 0.8168590416221957, hitX: 167.32116417929862, hitY: 492.7675466052235, directionOfHit: (0, 1)
    collisions.js:395 Final Hit: 6, 4, t: 0.8168590416221957, hitX: 167.32116417929862, hitY: 492.7675466052235, lineHitX: 195.0655256500834, lineHitY: 500, directionOfHit: (0, 1)
    collisions.js:348 Checking line: 245.67798406759195, 518.3538546773657 -> 268.26329329357, 481.90816891279286, (x0: 218.57561299641839, y0: 505.49067146634), (x1: 241.16092222239638, y1: 494.7713521238186), (rX: 27.102371071173575, rY: -12.863183211025708), (dx: 22.585309225977994, dy: -10.71931934252143), (xTileStartInc: 1, xTileEndNonInc: 3), (yTileStartInc: 5, yTileEndNonInc: 4)
    collisions.js:348 Checking line: 268.26329329357, 507.6345353348443 -> 290.84860251954797, 471.18884957027143, (x0: 241.16092222239638, y0: 494.7713521238186), (x1: 263.7462314483744, y1: 484.05203278129716), (rX: 27.102371071173575, rY: -12.863183211025708), (dx: 22.585309225977994, dy: -10.71931934252143), (xTileStartInc: 1, xTileEndNonInc: 3), (yTileStartInc: 5, yTileEndNonInc: 4)
    collisions.js:348 Checking line: 290.84860251954797, 496.9152159923229 -> 313.43391174552596, 460.46953022775, (x0: 263.7462314483744, y0: 484.05203278129716), (x1: 286.33154067435237, y1: 473.3327134387757), (rX: 27.102371071173575, rY: -12.863183211025708), (dx: 22.585309225977994, dy: -10.71931934252143), (xTileStartInc: 1, xTileEndNonInc: 4), (yTileStartInc: 4, yTileEndNonInc: 4)
    */

    //Checking line: 290.84860251954797, 496.9152159923229 -> 313.43391174552596, 460.46953022775, 
    // (x0: 263.7462314483744, y0: 484.05203278129716), (x1: 286.33154067435237, y1: 473.3327134387757), 
    // (rX: 27.102371071173575, rY: -12.863183211025708), (dx: 22.585309225977994, dy: -10.71931934252143), 
    // (xTileStartInc: 1, xTileEndNonInc: 4), (yTileStartInc: 4, yTileEndNonInc: 4)
    //X Hit found: 2, 6, t: 0.4051924810454198, hitX: 272.8976289288264, hitY: 479.70864518178274, 
    // directionOfHit: (1, 0)
    //Final Hit: 2, 6, t: 0.4051924810454198, hitX: 272.8976289288264, hitY: 479.70864518178274, 
    // lineHitX: 300, lineHitY: 482.14769815397386, directionOfHit: (1, 0)

    console.log(`Checking line: ${line.startX}, ${line.startY} -> ${line.endX}, ${line.endY}, (x0: ${x0}, y0: ${y0}), (x1: ${x1}, y1: ${y1}), (rX: ${rX}, rY: ${rY}), (dx: ${dx}, dy: ${dy}), (xTileStartInc: ${xTileStartInc}, xTileEndNonInc: ${xTileEndNonInc}), (yTileStartInc: ${yTileStartInc}, yTileEndNonInc: ${yTileEndNonInc})`);

    //Currently does: If circle passes an x or y wall, check if any tile in that wall is solid, and reflect off the wall.
    let shortestTileX = -1;
    let shortestTileY = -1;
    let t = Infinity;
    let directionOfHitX = 0;
    let directionOfHitY = 0;
    for (let x = xTileStartInc; x !== xTileEndNonInc; x += xTileStep) {
        for (let y = 0; y < tilesCount.y; y += 1) {
            if (isSolidTile(x, y)) {
                const tileWorldX = gridRect.left + x * tileWidth;
                const newT = Collision.crossesX(line, tileWorldX);
                if (newT !== null) {
                    if (newT < t) {
                        t = newT;
                        shortestTileX = x;
                        shortestTileY = y;
                        directionOfHitX = xDir;
                        directionOfHitY = 0;
                        console.log(`X Hit found: ${x}, ${y}, t: ${t}, hitX: ${x0 + t * dx}, hitY: ${y0 + t * dy}, directionOfHit: (${directionOfHitX}, ${directionOfHitY})`);
                    }
                }
            }
        }
    }

    for (let y = yTileStartInc; y !== yTileEndNonInc; y += yTileStep) {
        for (let x = 0; x < tilesCount.x; x += 1) {
            if (isSolidTile(x, y)) {
                const tileWorldY = gridRect.top + y * tileHeight;
                const newT = Collision.crossesY(line, tileWorldY);
                if (newT !== null) {
                    if (newT < t) {
                        t = newT;
                        shortestTileX = x;
                        shortestTileY = y;
                        directionOfHitX = 0;
                        directionOfHitY = yDir;
                        console.log(`Y Hit found: ${x}, ${y}, t: ${t}, hitX: ${x0 + t * dx}, hitY: ${y0 + t * dy}, directionOfHit: (${directionOfHitX}, ${directionOfHitY})`);
                    }
                }
            }
        }
    }

    if (t !== Infinity) {
        console.log(`Final Hit: ${shortestTileX}, ${shortestTileY}, t: ${t}, hitX: ${x0 + t * dx}, hitY: ${y0 + t * dy}, lineHitX: ${line.startX + t * (line.endX - line.startX)}, lineHitY: ${line.startY + t * (line.endY - line.startY)}, directionOfHit: (${directionOfHitX}, ${directionOfHitY})`);
        return {
            tileX: shortestTileX,
            tileY: shortestTileY,
            t,
            hitX: line.startX + t * (line.endX - line.startX),
            hitY: line.startY + t * (line.endY - line.startY),
            directionOfHit: new Vectors.Vector(directionOfHitX, directionOfHitY),
        }
    }
}

Collision.traverseGridWithCircleOld2 = function(p0, circle, isSolidTile, gridRect, tilesCount) {
    const x0 = p0.x;
    const y0 = p0.y;
    const x1 = circle.x;
    const y1 = circle.y;
    const r = circle.radius;

    const dx = x1 - x0;
    const dy = y1 - y0;
    if (dx === 0 && dy === 0)
        return null;

    const epsilon = 1e-6;
    let xDir;
    let yDir;
    let xDirIsRight;
    let yDirIsDown;

    const tileWidth = gridRect.width / tilesCount.x;
    const tileHeight = gridRect.height / tilesCount.y;

    let worldStartX;
    let worldEndX;
    let worldStartY;
    let worldEndY;

    if (dx < 0) {
        //left
        xDir = -1;
        xDirIsRight = false;
        worldStartX = x1 - r;
        worldEndX = x0 + r;// - epsilon;
    }
    else if (dx > 0) {
        //right
        xDir = 1;
        xDirIsRight = true;
        worldStartX = x0 - r;// + epsilon;
        worldEndX = x1 + r;
    }
    else {
        //No horizontal movement
        xDir = 0;
        xDirIsRight = true;
        worldStartX = x0 - r;
        worldEndX = x1 + r;
    }

    // if (worldStartX < gridRect.left || worldStartX > gridRect.right)
    //     return null;

    if (dy < 0) {
        //up
        yDir = -1;
        yDirIsDown = false;
        worldStartY = y1 - r;
        worldEndY = y0 + r;// - epsilon;
    }
    else if (dy > 0) {
        //down
        yDir = 1;
        yDirIsDown = true;
        worldStartY = y0 - r;// + epsilon;
        worldEndY = y1 + r;
    }
    else {
        //No vertical movement
        yDir = 0;
        yDirIsDown = true;
        worldStartY = y0 - r;
        worldEndY = y1 + r;
    }

    // if (worldStartY < gridRect.top || worldStartY > gridRect.bottom)
    //     return null;

    // const tileMinX = Math.max(0, Math.floor((worldStartX - gridRect.left) / tileWidth));
    // const tileMaxX = Math.min(tilesCount.x - 1, Math.floor((worldEndX - gridRect.left) / tileWidth) + 1);
    // const tileMinY = Math.max(0, Math.floor((worldStartY - gridRect.top) / tileHeight));
    // const tileMaxY = Math.min(tilesCount.y - 1, Math.floor((worldEndY - gridRect.top) / tileHeight) + 1);
    const tileMinX = 0;
    const tileMaxX = tilesCount.x - 1;
    const tileMinY = 0;
    const tileMaxY = tilesCount.y - 1;
    // let tileXStart;
    // let tileXEnd;
    // let tileYStart;
    // let tileYEnd;
    // let xStep;
    // let yStep;
    // if (xDirIsRight) {
    //     tileXStart = tileMinX;
    //     tileXEnd = tileMaxX;
    //     xStep = 1;
    // }
    // else {
    //     tileXStart = tileMaxX;
    //     tileXEnd = tileMinX;
    //     xStep = -1;
    // }

    // if (yDirIsDown) {
    //     tileYStart = tileMinY;
    //     tileYEnd = tileMaxY;
    //     yStep = 1;
    // }
    // else {
    //     tileYStart = tileMaxY;
    //     tileYEnd = tileMinY;
    //     yStep = -1;
    // }

    // let tileX = tileXStart;
    // let tileY = tileYStart;

    //Imagine breaking through walls.
    //Neet to track the curent xTile and yTile, determine if the next x or y 'wall' will be crossed first, then
    // iterate across that wall from [Start, other).
    //
    let t = Infinity;//t is the % of total distance traveled
    let shortestX = -1;
    let shortestY = -1;
    let directionOfHitX = 0;
    let directionOfHitY = 0;

    let xOutOfBounds = false;
    let yOutOfBounds = false;

    //collision is being missed:
    //Ball hit block 1, 13: current: (217.1619818305315, 1429.5762118839514), old: (218.03098465142045, 1429.4676111824897), oldVelocity: (24.807033518048055, -3.100175484458968), newVelocity: (-24.73996059207623, -3.5964357220052174), count: 0, hadBlockCollision: false
    //Ball is inside block 1, 13: current: (192.42202123845527, 1425.9797761619461), old: (217.1619818305315, 1429.5762118839514), (200, 1400), oldDistance: 34.194823142631975, distance: 27.062419173740672, radius: 30, velocity: (-24.73996059207623, -3.5964357220052174), oldVelocity: (-24.73996059207623, -3.5964357220052174), count: 1, hadBlockCollision: false
    //Is it an edge or corner miss?
    for (let x = tileMinX; x <= tileMaxX; x += 1) {
        for (let y = tileMinY; y <= tileMaxY; y += 1) {
            if (isSolidTile(x, y)) {
                let shouldHit = false;
                for (let cX = 0; cX <= 1; cX++) {
                    for (let cY = 0; cY <= 1; cY++) {
                        const blockWorldX = (x + cX) * tileWidth + gridRect.left;
                        const blockWorldY = (y + cY) * tileHeight + gridRect.top;
                        const previousDistance = Math.sqrt((x0 - blockWorldX) ** 2 + (y0 - blockWorldY) ** 2);
                        const distance = Math.sqrt((x1 - blockWorldX) ** 2 + (y1 - blockWorldY) ** 2);
                        if (previousDistance < this.radius) {
                            console.error(`Ball was already inside block ${x}, ${y}: current: (${x1}, ${y1}), old: (${x0}, ${y0}), (${blockWorldX}, ${blockWorldY}), oldDistance: ${previousDistance}, distance: ${distance}, radius: ${this.radius}, velocity: (${dx}, ${dy})`);
                        }

                        if (distance < this.radius) {
                            shouldHit = true;
                            console.log(`Should hit block ${x}, ${y}: current: (${x1}, ${y1}), old: (${x0}, ${y0}), (${blockWorldX}, ${blockWorldY}), oldDistance: ${previousDistance}, distance: ${distance}, radius: ${r}, velocity: (${dx}, ${dy})`);
                        }
                    }
                }

                if (xDir !== 0) {
                    const tAtNextTileX = dx !== 0 ? xDirIsRight ? (gridRect.left + x * tileWidth - worldStartX) / dx : (gridRect.left + (x + 1) * tileWidth - worldStartX) / dx : Infinity;
                    const yAtWallT = y0 + dy * tAtNextTileX;
                    const thisRealTileTop = gridRect.top + y * tileHeight;
                    const thisRealTileBottom = gridRect.top + (y + 1) * tileHeight;
                    if (thisRealTileTop <= yAtWallT && thisRealTileBottom >= yAtWallT) {
                        if (tAtNextTileX >= 0 && tAtNextTileX <= 1 && tAtNextTileX < t) {
                            t = tAtNextTileX;
                            shortestX = x;
                            shortestY = y;
                            directionOfHitX = xDir;
                            directionOfHitY = 0;
                        }
                    }
                    else {
                        let shouldHit = false;
                        // if (thisRealTileTop - r <= yAtWallT && thisRealTileBottom + r >= yAtWallT) {
                        //     shouldHit = true;
                        // }
                        const tileRect = new Struct.Rectangle(gridRect.left + x * tileWidth, gridRect.top + y * tileHeight, tileWidth, tileHeight);
                        const movingCircleIntercents = Collision._movingCircleIntersectsRectangle(x0, y0, circle, tileRect);
                        // if (movingCircleIntercents) {
                        //     shouldHit = true;
                        // }

                        const thisRealTileY = thisRealTileBottom < yAtWallT ? thisRealTileBottom : thisRealTileTop;
                        const thisRealTileX = xDirIsRight ? gridRect.left + x * tileWidth : gridRect.left + (x + 1) * tileWidth;
                        // r = ((t0 + dx * t - cornerX)^2 + (y0 + dy * t - cornerY)^2)^0.5
                        // r^2 = (dx * t + x0 - cornerX)^2 + (dy * t + y0 - cornerY)^2
                        // r^2 = (dx * t + (x0 - cornerX))^2 + (dy * t + (y0 - cornerY))^2
                        // r^2 = dx^2 * t^2 + 2 * dx * t * (x0 - cornerX) + (x0 - cornerX)^2 + dy^2 * t^2 + dy * t * (y0 - cornerY) + (y0 - cornerY)^2
                        // 0 = (dx^2 + dy^2) * t^2 + (2 * (dx * (x0 - cornerX) + dy * (y0 - cornerY))) * t + (x0 - cornerX)^2 + (y0 - cornerY)^2 - r^2
                        // a = (dx^2 + dy^2)
                        // b = 2 * (dx * (x0 - cornerX) + dy * (y0 - cornerY))
                        // c = (x0 - cornerX)^2 + (y0 - cornerY)^2 - r^2
                        // t = (-b +/- (b^2 - 4 * a * c)^0.5)/(2 * a)
                        const a = dx * dx + dy * dy;
                        const b = 2 * (dx * (x0 - thisRealTileX) + dy * (y0 - thisRealTileY));
                        const c = (x0 - thisRealTileX)**2 + (y0 - thisRealTileY)**2 - r**2;
                        const discriminant = b * b - 4 * a * c;
                        
                        let thisT;
                        if (discriminant < 0) {
                            // No real roots
                        } else if (discriminant === 0) {
                            // One real root
                            thisT = -b / (2 * a);
                        } else {
                            const sqrtDisc = Math.sqrt(discriminant);
                            const root1 = (-b + sqrtDisc) / (2 * a);
                            const root2 = (-b - sqrtDisc) / (2 * a);
                            if (root1 < 0) {
                                if (root2 < 0) {
                                    //Both roots are negative
                                }
                                else {
                                    //Only the second root is positive
                                    thisT = root2;
                                }
                            }
                            else if (root2 < 0) {
                                //Only the first root is positive
                                thisT = root1;
                            }
                            else {
                                //Both roots are positive, take the smaller one.
                                if (root1 < root2) {
                                    thisT = root1;
                                }
                                else {
                                    thisT = root2;
                                }
                            }
                        }
                        
                        if (thisT) {
                            if (thisT >= 0 && thisT <= 1 && thisT < t) {
                                t = thisT;
                                shortestX = x;
                                shortestY = y;
                                const newCircleX = x0 + dx * thisT;
                                const newCircleY = y0 + dy * thisT;
                                directionOfHitX = thisRealTileX - newCircleX;
                                directionOfHitY = thisRealTileY - newCircleY;
                            }
                        }
                        else {
                            if (shouldHit)
                                console.warn(`Potential corner miss; Tile: ${x}, ${y}, corner: ${thisRealTileX}, ${thisRealTileY}, circle: ${x0}, ${y0} -> ${x1}, ${y1}, (${r}), v: ${dx}, ${dy}, ${movingCircleIntercents.t}`);
                        }
                    }
                }

                if (yDir !== 0) {
                    const tAtNextTileY = dy !== 0 ? yDirIsDown ? (gridRect.top + y * tileHeight - worldStartY) / dy : (gridRect.top + (y + 1) * tileHeight - worldStartY) / dy : Infinity;
                    const xAtWallT = x0 + dx * tAtNextTileY;
                    const thisRealTileLeft = gridRect.left + x * tileWidth;
                    const thisRealTileRight = gridRect.left + (x + 1) * tileWidth;
                    if (thisRealTileLeft <= xAtWallT && thisRealTileRight >= xAtWallT) {
                        if (tAtNextTileY >= 0 && tAtNextTileY <= 1 && tAtNextTileY < t) {
                            t = tAtNextTileY;
                            shortestX = x;
                            shortestY = y;
                            directionOfHitX = 0;
                            directionOfHitY = yDir;
                        }
                    }
                    else {
                        let shouldHit = false;
                        // if (thisRealTileLeft - r <= xAtWallT && thisRealTileRight + r >= xAtWallT) {
                        //     shouldHit = true;
                        // }

                        const tileRect = new Struct.Rectangle(gridRect.left + x * tileWidth, gridRect.top + y * tileHeight, tileWidth, tileHeight);
                        const movingCircleIntercents = Collision._movingCircleIntersectsRectangle(x0, y0, circle, tileRect);
                        // if (movingCircleIntercents) {
                        //     shouldHit = true;
                        // }

                        const thisRealTileY = yDirIsDown ? gridRect.top + y * tileHeight : gridRect.top + (y + 1) * tileHeight;
                        const thisRealTileX = thisRealTileRight < xAtWallT ? thisRealTileRight : thisRealTileLeft;
                        const a = dx * dx + dy * dy;
                        const b = 2 * (dx * (x0 - thisRealTileX) + dy * (y0 - thisRealTileY));
                        const c = (x0 - thisRealTileX)**2 + (y0 - thisRealTileY)**2 - r**2;
                        const discriminant = b * b - 4 * a * c;

                        let thisT;
                        if (discriminant < 0) {
                            // No real roots
                        } else if (discriminant === 0) {
                            // One real root
                            thisT = -b / (2 * a);
                        } else {
                            const sqrtDisc = Math.sqrt(discriminant);
                            const root1 = (-b + sqrtDisc) / (2 * a);
                            const root2 = (-b - sqrtDisc) / (2 * a);
                            if (root1 < 0) {
                                if (root2 < 0) {
                                    //Both roots are negative
                                }
                                else {
                                    //Only the second root is positive
                                    thisT = root2;
                                }
                            }
                            else if (root2 < 0) {
                                //Only the first root is positive
                                thisT = root1;
                            }
                            else {
                                //Both roots are positive, take the smaller one.
                                if (root1 < root2) {
                                    thisT = root1;
                                }
                                else {
                                    thisT = root2;
                                }
                            }
                        }

                        if (thisT) {
                            if (thisT >= 0 && thisT <= 1 && thisT < t) {
                                t = thisT;
                                shortestX = x;
                                shortestY = y;
                                const newCircleX = x0 + dx * thisT;
                                const newCircleY = y0 + dy * thisT;
                                directionOfHitX = thisRealTileX - newCircleX;
                                directionOfHitY = thisRealTileY - newCircleY;
                            }
                        }
                        else {
                            if (shouldHit)
                                console.warn(`Potential corner miss; Tile: ${x}, ${y}, corner: ${thisRealTileX}, ${thisRealTileY}, circle: ${x0}, ${y0} -> ${x1}, ${y1}, (${r}), v: ${dx}, ${dy}, ${movingCircleIntercents.t}.`);
                        }
                    }
                }
            }
        }
    }

    while (false && true) {
        const nextTileX = tileX + xStep;
        const nextTileY = tileY + yStep;

        const tAtNextTileX = dx !== 0 ? (gridRect.left + tileX * tileWidth - worldStartX) / dx : Infinity;
        const tAtNextTileY = dy !== 0 ? (gridRect.top + tileY * tileHeight - worldStartY) / dy : Infinity;

        if (!xOutOfBounds) {
            if (xDir === 1 && tAtNextTileX <= tAtNextTileY) {
                if (tAtNextTileX < 0)
                    console.warn(`tAtNextTileX < 0.  tAtNextTileX: ${tAtNextTileX}, t: ${t}`);

                //Check all y tiles between start tileY and nextTileY
                let newT = Infinity;
                let newShortestX = -1;
                let newShortestY = -1;
                let newDirectionOfHitX = 0;
                let newDirectionOfHitY = 0;
                for (let i = tileMinY; i < tileMaxY; i += 1) {//for (let i = tileYStart; i !== nextTileY; i += yStep) {
                    if (isSolidTile(tileX, i)) {
                        const yAtWallT = y0 + dy * tAtNextTileX;
                        const thisRealTileTop = gridRect.top + i * tileHeight;
                        const thisRealTileBottom = gridRect.top + (i + 1) * tileHeight;
                        const thisRealTileX = xDirIsRight ? gridRect.left + tileX * tileWidth : gridRect.left + (tileX + 1) * tileWidth;
                        if (thisRealTileTop <= yAtWallT && thisRealTileBottom >= yAtWallT) {
                            if (tAtNextTileX < 0 || tAtNextTileX > 1 || tAtNextTileX > t)
                                continue;
                            
                            newT = tAtNextTileX;
                            newShortestX = tileX;
                            newShortestY = i;
                            newDirectionOfHitX = xDir;
                            
                            // const prevTileXEnd = tileXEnd;//Troubleshooing only 
                            // const prevTileYEnd = tileYEnd;//Troubleshooing only
                            // tileXEnd = xDirIsRight ? Math.min(tilesCount.x - 1, Math.floor((x0 + dx * tAtNextTileX - gridRect.left) / tileWidth)) : Math.max(0, Math.floor((x0 + dx * tAtNextTileX - gridRect.left) / tileWidth));
                            // tileYEnd = yDirIsDown ? Math.min(tilesCount.y - 1, Math.floor((y0 + dy * tAtNextTileX - gridRect.top) / tileHeight)) : Math.max(0, Math.floor((y0 + dy * tAtNextTileX - gridRect.top) / tileHeight));
                            // if (xDirIsRight) {
                            //     if (tileXEnd > prevTileXEnd)
                            //         console.warn(`tileXEnd when up.  tileXEnd: ${tileXEnd}, prevTileXEnd: ${prevTileXEnd}`);
                            // }
                            // else {
                            //     if (tileXEnd < prevTileXEnd)
                            //         console.warn(`tileXEnd when down.  tileXEnd: ${tileXEnd}, prevTileXEnd: ${prevTileXEnd}`);
                            // }
                            
                            // if (yDirIsDown) {
                            //     if (tileYEnd > prevTileYEnd)
                            //         console.warn(`tileYEnd when up.  tileYEnd: ${tileYEnd}, prevTileYEnd: ${prevTileYEnd}`);
                            // }
                            // else {
                            //     if (tileYEnd < prevTileYEnd)
                            //         console.warn(`tileYEnd when down.  tileYEnd: ${tileYEnd}, prevTileYEnd: ${prevTileYEnd}`);
                            // }
                        }
                        else {
                            continue;
                            const thisTileY = thisRealTileBottom > yAtWallT ? thisRealTileBottom : thisRealTileTop;
                            // r = ((t0 + dx * t - cornerX)^2 + (y0 + dy * t - cornerY)^2)^0.5
                            // r^2 = (dx * t + x0 - cornerX)^2 + (dy * t + y0 - cornerY)^2
                            // r^2 = (dx * t + (x0 - cornerX))^2 + (dy * t + (y0 - cornerY))^2
                            // r^2 = dx^2 * t^2 + 2 * dx * t * (x0 - cornerX) + (x0 - cornerX)^2 + dy^2 * t^2 + dy * t * (y0 - cornerY) + (y0 - cornerY)^2
                            // 0 = (dx^2 + dy^2) * t^2 + (2 * (dx * (x0 - cornerX) + dy * (y0 - cornerY))) * t + (x0 - cornerX)^2 + (y0 - cornerY)^2 - r^2
                            // a = (dx^2 + dy^2)
                            // b = 2 * (dx * (x0 - cornerX) + dy * (y0 - cornerY))
                            // c = (x0 - cornerX)^2 + (y0 - cornerY)^2 - r^2
                            // t = (-b +/- (b^2 - 4 * a * c)^0.5)/(2 * a)
                            const a = dx * dx + dy * dy;
                            const b = 2 * (dx * (x0 - thisRealTileX) + dy * (y0 - thisTileY));
                            const c = (x0 - thisRealTileX)**2 + (y0 - thisTileY)**2 - r**2;
                            const discriminant = b * b - 4 * a * c;
                            
                            let thisT;
                            if (discriminant < 0) {
                                // No real roots
                                continue;
                            } else if (discriminant === 0) {
                                // One real root
                                thisT = -b / (2 * a);
                            } else {
                                const sqrtDisc = Math.sqrt(discriminant);
                                const root1 = (-b + sqrtDisc) / (2 * a);
                                const root2 = (-b - sqrtDisc) / (2 * a);
                                if (root1 < 0) {
                                    if (root2 < 0) {
                                        //Both roots are negative
                                        continue;
                                    }
                                    else {
                                        //Only the second root is positive
                                        thisT = root2;
                                    }
                                }
                                else if (root2 < 0) {
                                    //Only the first root is positive
                                    thisT = root1;
                                }
                                else {
                                    //Both roots are positive, take the smaller one.
                                    if (root1 < root2) {
                                        thisT = root1;
                                    }
                                    else {
                                        thisT = root2;
                                    }
                                }
                            }
                            
                            if (thisT) {
                                if (thisT < 0 || thisT > 1 || thisT >= t)
                                    continue;

                                newShortestX = tileX;
                                newShortestY = i;
                                const newCircleX = x0 + dx * thisT;
                                const newCircleY = y0 + dy * thisT;
                                newDirectionOfHitX = thisRealTileX - newCircleX;
                                newDirectionOfHitY = thisTileY - newCircleY;
                                
                                // const prevTileXEnd = tileXEnd;//Troubleshooing only
                                // const prevTileYEnd = tileYEnd;//Troubleshooing only
                                // tileXEnd = xDirIsRight ? Math.min(tilesCount.x - 1, Math.floor((x0 + dx * tAtNextTileX - gridRect.left) / tileWidth)) : Math.max(0, Math.floor((x0 + dx * tAtNextTileX - gridRect.left) / tileWidth));
                                // tileYEnd = yDirIsDown ? Math.min(tilesCount.y - 1, Math.floor((y0 + dy * tAtNextTileX - gridRect.top) / tileHeight)) : Math.max(0, Math.floor((y0 + dy * tAtNextTileX - gridRect.top) / tileHeight));
                                // if (xDirIsRight) {
                                //     if (tileXEnd > prevTileXEnd)
                                //         console.warn(`tileXEnd when up.  tileXEnd: ${tileXEnd}, prevTileXEnd: ${prevTileXEnd}`);
                                // }
                                // else {
                                //     if (tileXEnd < prevTileXEnd)
                                //         console.warn(`tileXEnd when down.  tileXEnd: ${tileXEnd}, prevTileXEnd: ${prevTileXEnd}`);
                                // }
                                
                                // if (yDirIsDown) {
                                //     if (tileYEnd > prevTileYEnd)
                                //         console.warn(`tileYEnd when up.  tileYEnd: ${tileYEnd}, prevTileYEnd: ${prevTileYEnd}`);
                                // }
                                // else {
                                //     if (tileYEnd < prevTileYEnd)
                                //         console.warn(`tileYEnd when down.  tileYEnd: ${tileYEnd}, prevTileYEnd: ${prevTileYEnd}`);
                                // }
                            }
                        }
                    }
                }

                if (newT < 1 && newT < t) {
                    if (newT < 0)
                        throw new Error(`newT < 0.  newT: ${newT}, t: ${t}`);

                    t = newT;
                    shortestX = newShortestX;
                    shortestY = newShortestY;
                    directionOfHitX = newDirectionOfHitX;
                    directionOfHitY = newDirectionOfHitY;
                }
            }

            tileX = nextTileX;
        }

        if (!yOutOfBounds) {
            if (false && tAtNextTileY <= tAtNextTileX) {
                if (tAtNextTileY < 0)
                    console.warn(`tAtNextTileY < 0.  tAtNextTileY: ${tAtNextTileY}, t: ${t}`);

                //Check all x tiles between start tileX and nextTileX
                let newT = Infinity;
                let newShortestX = -1;
                let newShortestY = -1;
                let newDirectionOfHitX = 0;
                let newDirectionOfHitY = 0;
                for (let i = tileXStart; i !== nextTileX; i += xStep) {
                    if (isSolidTile(i, tileY)) {
                        const xAtWallT = x0 + dx * tAtNextTileY;
                        const thisRealTileLeft = gridRect.left + i * tileWidth;
                        const thisRealTileRight = gridRect.left + (i + 1) * tileWidth;
                        const thisRealTileY = yDirIsDown ? gridRect.top + tileY * tileHeight : gridRect.top + (tileY + 1) * tileHeight;
                        if (thisRealTileLeft <= xAtWallT && thisRealTileRight >= xAtWallT) {
                            if (tAtNextTileY < 0 || tAtNextTileY > 1 || tAtNextTileY >= t)
                                continue;
                                
                            newT = tAtNextTileY;
                            newShortestX = i;
                            newShortestY = tileY;
                            newDirectionOfHitY = yDir;
                            
                            // const prevTileXEnd = tileXEnd;//Troubleshooing only 
                            // const prevTileYEnd = tileYEnd;//Troubleshooing only
                            // tileXEnd = xDirIsRight ? Math.min(tilesCount.x - 1, Math.floor((x0 + dx * tAtNextTileY - gridRect.left) / tileWidth)) : Math.max(0, Math.floor((x0 + dx * tAtNextTileY - gridRect.left) / tileWidth));
                            // tileYEnd = yDirIsDown ? Math.min(tilesCount.y - 1, Math.floor((y0 + dy * tAtNextTileY - gridRect.top) / tileHeight)) : Math.max(0, Math.floor((y0 + dy * tAtNextTileY - gridRect.top) / tileHeight));
                            // if (xDirIsRight) {
                            //     if (tileXEnd > prevTileXEnd)
                            //         console.warn(`tileXEnd when up.  tileXEnd: ${tileXEnd}, prevTileXEnd: ${prevTileXEnd}`);
                            // }
                            // else {
                            //     if (tileXEnd < prevTileXEnd)
                            //         console.warn(`tileXEnd when down.  tileXEnd: ${tileXEnd}, prevTileXEnd: ${prevTileXEnd}`);
                            // }
                            
                            // if (yDirIsDown) {
                            //     if (tileYEnd > prevTileYEnd)
                            //         console.warn(`tileYEnd when up.  tileYEnd: ${tileYEnd}, prevTileYEnd: ${prevTileYEnd}`);
                            // }
                            // else {
                            //     if (tileYEnd < prevTileYEnd)
                            //         console.warn(`tileYEnd when down.  tileYEnd: ${tileYEnd}, prevTileYEnd: ${prevTileYEnd}`);
                            // }
                        }
                        else {
                            continue;
                            const thisTileX = thisRealTileRight > xAtWallT ? thisRealTileRight : thisRealTileLeft;
                            const a = dx * dx + dy * dy;
                            const b = 2 * (dx * (x0 - thisTileX) + dy * (y0 - thisRealTileY));
                            const c = (x0 - thisTileX)**2 + (y0 - thisRealTileY)**2 - r**2;
                            const discriminant = b * b - 4 * a * c;

                            let thisT;
                            if (discriminant < 0) {
                                // No real roots
                                continue;
                            } else if (discriminant === 0) {
                                // One real root
                                thisT = -b / (2 * a);
                            } else {
                                const sqrtDisc = Math.sqrt(discriminant);
                                const root1 = (-b + sqrtDisc) / (2 * a);
                                const root2 = (-b - sqrtDisc) / (2 * a);
                                if (root1 < 0) {
                                    if (root2 < 0) {
                                        //Both roots are negative
                                        continue;
                                    }
                                    else {
                                        //Only the second root is positive
                                        thisT = root2;
                                    }
                                }
                                else if (root2 < 0) {
                                    //Only the first root is positive
                                    thisT = root1;
                                }
                                else {
                                    //Both roots are positive, take the smaller one.
                                    if (root1 < root2) {
                                        thisT = root1;
                                    }
                                    else {
                                        thisT = root2;
                                    }
                                }
                            }

                            if (thisT) {
                                if (thisT < 0 || thisT > 1 || thisT >= t)
                                    continue;
                                
                                newShortestX = i;
                                newShortestY = tileY;
                                const newCircleX = x0 + dx * thisT;
                                const newCircleY = y0 + dy * thisT;
                                newDirectionOfHitX = thisTileX - newCircleX;
                                newDirectionOfHitY = thisRealTileY - newCircleY;

                                // const prevTileXEnd = tileXEnd;//Troubleshooing only
                                // const prevTileYEnd = tileYEnd;//Troubleshooing only
                                // tileXEnd = xDirIsRight ? Math.min(tilesCount.x - 1, Math.floor((x0 + dx * tAtNextTileY - gridRect.left) / tileWidth)) : Math.max(0, Math.floor((x0 + dx * tAtNextTileY - gridRect.left) / tileWidth));
                                // tileYEnd = yDirIsDown ? Math.min(tilesCount.y - 1, Math.floor((y0 + dy * tAtNextTileY - gridRect.top) / tileHeight)) : Math.max(0, Math.floor((y0 + dy * tAtNextTileY - gridRect.top) / tileHeight));
                                // if (xDirIsRight) {
                                //     if (tileXEnd > prevTileXEnd)
                                //         console.warn(`tileXEnd when up.  tileXEnd: ${tileXEnd}, prevTileXEnd: ${prevTileXEnd}`);
                                // }
                                // else {
                                //     if (tileXEnd < prevTileXEnd)
                                //         console.warn(`tileXEnd when down.  tileXEnd: ${tileXEnd}, prevTileXEnd: ${prevTileXEnd}`);
                                // }

                                // if (yDirIsDown) {
                                //     if (tileYEnd > prevTileYEnd)
                                //         console.warn(`tileYEnd when up.  tileYEnd: ${tileYEnd}, prevTileYEnd: ${prevTileYEnd}`);
                                // }
                                // else {
                                //     if (tileYEnd < prevTileYEnd)
                                //         console.warn(`tileYEnd when down.  tileYEnd: ${tileYEnd}, prevTileYEnd: ${prevTileYEnd}`);
                                // }
                            }
                        }
                    }
                }

                if (newT < 1 && newT < t) {
                    if (newT < 0)
                        throw new Error(`newT < 0.  newT: ${newT}, t: ${t}`);

                    t = newT;
                    shortestX = newShortestX;
                    shortestY = newShortestY;
                    directionOfHitX = newDirectionOfHitX;
                    directionOfHitY = newDirectionOfHitY;
                }
            }

            tileY = nextTileY;
        }

        xOutOfBounds = nextTileX < tileMinX || nextTileX > tileMaxX;
        yOutOfBounds = nextTileY < tileMinY || nextTileY > tileMaxY;
        if (xOutOfBounds && yOutOfBounds)
            break;
    }

    if (t < 0)
        throw new Error(`t < 0.  t: ${t}`);

    if (t > 1) {
        //No collision
        return null;
    }

    //Collision detected
    const hitX = x0 + dx * t;
    const hitY = y0 + dy * t;
    return {
        tileX: shortestX,
        tileY: shortestY,
        hitX,
        hitY,
        directionOfHit: new Vectors.Vector(directionOfHitX, directionOfHitY),
    }
}

Collision.traverseGridWithCircleOld = function(p0, circle, isSolidTile, gridRect, tilesCount) {
    const x0 = p0.x;
    const y0 = p0.y;
    const x1 = circle.x;
    const y1 = circle.y;
    const r = circle.radius;

    const dx = x1 - x0;
    const dy = y1 - y0;

    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0)
        return null;

    const dirX = dx / len;
    const dirY = dy / len;

    // Calculate tile size
    const tileWidth  = gridRect.width  / tilesCount.x;
    const tileHeight = gridRect.height / tilesCount.y;

    // Convert world space to tile-space
    const tileX = (x0 - gridRect.left) / tileWidth;
    const tileY = (y0 - gridRect.top) / tileHeight;

    let tileXInt = Math.floor(tileX);
    let tileYInt = Math.floor(tileY);

    const stepX = dirX > 0 ? 1 : -1;
    const stepY = dirY > 0 ? 1 : -1;

    // Convert radius to tile space
    const radiusX = r / tileWidth;
    const radiusY = r / tileHeight;

    let nextTileBoundaryX = tileXInt + (stepX > 0 ? 1 - radiusX : radiusX);
    let nextTileBoundaryY = tileYInt + (stepY > 0 ? 1 - radiusY : radiusY);

    let tMaxX = (nextTileBoundaryX - tileX) / dirX;
    let tMaxY = (nextTileBoundaryY - tileY) / dirY;

    if (!isFinite(tMaxX))
        tMaxX = Infinity;

    if (!isFinite(tMaxY))
        tMaxY = Infinity;

    const tDeltaX = Math.abs(1 / dirX);
    const tDeltaY = Math.abs(1 / dirY);

    let t = 0;

    while (t <= 1) {
        if (tileXInt >= 0 && tileXInt < tilesCount.x && tileYInt >= 0 && tileYInt < tilesCount.y && isSolidTile(tileXInt, tileYInt)) {
            const rect = {
                x: gridRect.left + tileXInt * tileWidth - r,
                y: gridRect.top + tileYInt * tileHeight - r,
                width: tileWidth + r * 2,
                height: tileHeight + r * 2
            };

            const clipT = [0, 1];

            if (
                Collision.liangBarskyClip(-dx, x0 - rect.x, clipT) &&
                Collision.liangBarskyClip(dx, rect.x + rect.width - x0, clipT) &&
                Collision.liangBarskyClip(-dy, y0 - rect.y, clipT) &&
                Collision.liangBarskyClip(dy, rect.y + rect.height - y0, clipT)
            ) {
                const impactT = clipT[0];
                const hitX = x0 + dx * impactT;
                const hitY = y0 + dy * impactT;

                let normalX = 0;
                let normalY = 0;
                // const epsilon = 1e-6;

                // const left   = rect.x;
                // const right  = rect.x + rect.width;
                // const top    = rect.y;
                // const bottom = rect.y + rect.height;

                // if (Math.abs(hitX - left) < epsilon) normalX = -1;
                // else if (Math.abs(hitX - right) < epsilon) normalX = 1;
                // else if (Math.abs(hitY - top) < epsilon) normalY = -1;
                // else if (Math.abs(hitY - bottom) < epsilon) normalY = 1;

                const centerX = rect.x + rect.width / 2;
                const centerY = rect.y + rect.height / 2;
                const dx = hitX - centerX;
                const dy = hitY - centerY;

                if (Math.abs(dx) > Math.abs(dy)) {
                    normalX = dx > 0 ? 1 : -1;
                    normalY = 0;
                } else {
                    normalX = 0;
                    normalY = dy > 0 ? 1 : -1;
                }

                return {
                    tileX: tileXInt,
                    tileY: tileYInt,
                    t: impactT,
                    hitX,
                    hitY,
                    normalX,
                    normalY
                };
            }
        }

        if (tMaxX < tMaxY) {
            t = tMaxX;
            tMaxX += tDeltaX;
            tileXInt += stepX;
        } else {
            t = tMaxY;
            tMaxY += tDeltaY;
            tileYInt += stepY;
        }
    }

    return null;
};