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
        return null;
    }

    if (!Collision.liangBarskyClip(dx, rect.x + rect.width - x1, t)) {
        return null;
    }

    if (!Collision.liangBarskyClip(-dy, y1 - rect.y, t)) {
        return null;
    }

    if (!Collision.liangBarskyClip(dy, rect.y + rect.height - y1, t)) {
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

//Returns t [0, 1] if the line crosses the point, null if it does not cross.
Collision.crosses = function(start, end, crossPoint) {
    const diff = end - start;
    if (diff === 0)
        return start === crossPoint ? 0 : null;

    const t = (crossPoint - start) / diff;
    if (t >= 0 && t <= 1)
        return t;

    return null;
}

//Returns a value from [0, inf).  Returns null for <= 0.
Collision.getCrossTimePos = function (start, end, crossPoint) {
    const diff = end - start;
    if (diff === 0)
        return start === crossPoint ? 0 : null;

    const t = (crossPoint - start) / diff;
    if (t >= 0)
        return t;

    return null;
}

Collision.getCrossTime = function (start, end, crossPoint) {
    const diff = end - start;
    if (diff === 0)
        return start === crossPoint ? 0 : null;

    return (crossPoint - start) / diff;
}
//TODO: add a check for does colide first
//Use dot product of normalized dx/dy vector on the vector from circle center to the point on the dx/dy vector that is perpendicualr to the corner
//Then solve for the distance between the circle center at that point and the corner.
//Then can eliminate the need for negative checks.
// Collision.distanceToLine = (lx0, ly0, lx1, ly1, x, y) => {
//     //
// }

Collision.solveCornerT = (x0, y0, dx, dy, cornerX, cornerY, r) => {
    // r = ((x0 + dx * t - cornerX)^2 + (y0 + dy * t - cornerY)^2)^0.5
    // r^2 = (dx * t + x0 - cornerX)^2 + (dy * t + y0 - cornerY)^2
    // r^2 = (dx * t + (x0 - cornerX))^2 + (dy * t + (y0 - cornerY))^2
    // r^2 = dx^2 * t^2 + 2 * dx * t * (x0 - cornerX) + (x0 - cornerX)^2 + dy^2 * t^2 + dy * t * (y0 - cornerY) + (y0 - cornerY)^2
    // 0 = (dx^2 + dy^2) * t^2 + (2 * (dx * (x0 - cornerX) + dy * (y0 - cornerY))) * t + (x0 - cornerX)^2 + (y0 - cornerY)^2 - r^2
    // a = (dx^2 + dy^2)
    // b = 2 * (dx * (x0 - cornerX) + dy * (y0 - cornerY))
    // c = (x0 - cornerX)^2 + (y0 - cornerY)^2 - r^2
    // t = (-b +/- (b^2 - 4 * a * c)^0.5)/(2 * a)
    //const a = dx * dx + dy * dy;
    const denom = 2 * (dx * dx + dy * dy);
    const cX = x0 - cornerX;
    const cY = y0 - cornerY;
    const b = 2 * (dx * cX + dy * cY);
    const c = cX * cX + cY * cY - r * r;
    const discriminant = b * b - 2 * denom * c;//b^2 - 4 * a * c
    let thisT = null;
    if (discriminant < 0) {
        // No real roots
    }
    else if (discriminant === 0) {
        // One real root
        thisT = -b / denom;//(-b +/- 0) / (2 * a)
    }
    else {
        const sqrtDisc = Math.sqrt(discriminant);
        const root1 = (-b + sqrtDisc) / denom;//(-b + sqrt(b^2 - 4ac)) / (2 * a)
        const root2 = (-b - sqrtDisc) / denom;//(-b - sqrt(b^2 - 4ac)) / (2 * a)
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

    return thisT;
}

Collision.cornersMap = new Map();//Should never be used outside of Collision.traverseGridWithCircle().

Collision.traverseGridWithCircle = function(p0, circle, isSolidTile, gridRect, tilesCount) {
    //cornerID: 1 - top-left, 2 - top-right, 4 - bottom-left, 8 - bottom-right
    //cornerID = 1 << (isBottomCorner << 1 | isRightCorner);
    //tileIndex = tileX + tileY * tileCountX
    //cornersArr[tileIndex >> 1] |= (cornerID << (tileIndex & 0x1));
    let cornersArr;
    if (zonDebug) {
        const arrSize = (tilesCount.x * tilesCount.y + 1) >>> 1;//Divide by 2, round up
        cornersArr = Collision.cornersMap.get(arrSize);
        if (cornersArr) {
            cornersArr.fill(0);
        }
        else {
            cornersArr = new Uint8Array(arrSize);
            cornersArr.fill(0);
            Collision.cornersMap.set(arrSize, cornersArr);
        }
    }
    
    const x0 = p0.x;
    const y0 = p0.y;
    const x1 = circle.x;
    const y1 = circle.y;
    const r = circle.radius;
    const gridLeft = gridRect.left;
    const gridTop = gridRect.top;
    const gridRight = gridRect.right;
    const gridBottom = gridRect.bottom;
    const tileCountX = tilesCount.x;
    const tileCountY = tilesCount.y;

    const dx = x1 - x0;
    const dy = y1 - y0;
    if (dx === 0 && dy === 0)
        return null;

    const tileWidth = gridRect.width / tileCountX;
    const tileHeight = gridRect.height / tileCountY;

    const xDir = dx < 0 ? -1 : dx > 0 ? 1 : 0;
    const yDir = dy < 0 ? -1 : dy > 0 ? 1 : 0;
    const xDirIsRight = xDir !== -1;
    const yDirIsDown = yDir !== -1;

    const lineStartX = x0 + r * xDir;
    const lineStartY = y0 + r * yDir;
    const lineEndX = x1 + r * xDir;
    const lineEndY = y1 + r * yDir;

    const startBoundsX = x0 - r * xDir;
    const startBoundsY = y0 - r * yDir;

    if (xDirIsRight ? lineStartX < gridLeft && lineEndX < gridLeft : startBoundsX < gridLeft + tileWidth && lineEndX < gridLeft + tileWidth)
        return null;

    if (xDirIsRight ? startBoundsX > gridRight - tileWidth && lineEndX > gridRight - tileWidth : lineStartX > gridRight && lineEndX > gridRight)
        return null;

    if (yDirIsDown ? lineStartY < gridTop && lineEndY < gridTop : startBoundsY < gridTop + tileHeight && lineEndY < gridTop + tileHeight)
        return null;

    if (yDirIsDown ? startBoundsY > gridBottom - tileHeight && lineEndY > gridBottom - tileHeight : lineStartY > gridBottom && lineEndY > gridBottom)
        return null;

    const invTileWidth = 1 / tileWidth;
    const invTileHeight = 1 / tileHeight;

    //start needs to be inclusive.
    //end needs to be exclusive (1 more in the direction)

    //Right:
    //start: 200;  (200 - 100) / 100 = 1, needs to be 1.  floor OR ceil
    //end 350;  (350 - 100) / 100 = 2.5, needs to be 3.  floor + 1 OR ceil

    //start: 220;  (220 - 100) / 100 = 1.2, needs to be 1.  floor OR ceil - 1
    //end 370;  (370 - 100) / 100 = 2.7, needs to be 3.  floor + 1 OR ceil

    //start: 250;  (250 - 100) / 100 = 1.5, needs to be 1.  floor OR ceil - 1
    //end 400;  (400 - 100) / 100 = 3, needs to be 4.  floor + 1 OR ceil + 1

    //Right conclusion:
    //start should be floor
    //end should be floor + 1

    //Left:
    //start: 400;  (400 - 100) / 100 = 3, needs to be 2.  floor - 1 OR ceil - 1
    //end: 250;  (250 - 100) / 100 = 1.5, needs to be 0.  floor - 1 or ceil - 2

    //start: 370;  (370 - 100) / 100 = 2.7, needs to be 2.  floor OR ceil - 1
    //end: 230;  (230 - 100) / 100 = 1.3, needs to be 0.  floor - 1 or ceil - 2

    //start: 350;  (350 - 100) / 100 = 2.5, needs to be 2.  floor OR ceil - 1
    //end: 200;  (200 - 100) / 100 = 1, needs to be -1.  floor - 2 or ceil - 2

    //Left conclusion:
    //start should be ceil - 1
    //end should be ceil - 2

    //Uses startBoundsX and startBoundsY instead of lineStartX and lineStartY because we need to allow for edge hits that would be missed because they are past 1 t on previous checks.
    let xTileStartInc = xDirIsRight ? Math.floor((startBoundsX - gridLeft) * invTileWidth) : Math.ceil((startBoundsX - gridLeft) * invTileWidth) - 1;
    let xTileEndNonInc = xDirIsRight ? Math.floor((lineEndX - gridLeft) * invTileWidth) + 1 : Math.ceil((lineEndX - gridLeft) * invTileWidth) - 2;
    let yTileStartInc = yDirIsDown ? Math.floor((startBoundsY - gridTop) * invTileHeight) : Math.ceil((startBoundsY - gridTop) * invTileHeight) - 1;
    let yTileEndNonInc = yDirIsDown ? Math.floor((lineEndY - gridTop) * invTileHeight) + 1 : Math.ceil((lineEndY - gridTop) * invTileHeight) - 2;

    xTileStartInc = Math.min(Math.max(xTileStartInc, 0), tileCountX - 1);
    xTileEndNonInc = Math.min(Math.max(xTileEndNonInc, -1), tileCountX);
    yTileStartInc = Math.min(Math.max(yTileStartInc, 0), tileCountY - 1);
    yTileEndNonInc = Math.min(Math.max(yTileEndNonInc, -1), tileCountY);

    if (zonDebug) {
        //console.log(`Checking line: ${lineStartX}, ${lineStartY} -> ${lineEndX}, ${lineEndY}, (x0: ${x0}, y0: ${y0}), (x1: ${x1}, y1: ${y1}), (dx: ${dx}, dy: ${dy}), (xTileStartInc: ${xTileStartInc}, xTileEndNonInc: ${xTileEndNonInc}), (yTileStartInc: ${yTileStartInc}, yTileEndNonInc: ${yTileEndNonInc})`);
    }

    let shortestTileX = -1;
    let shortestTileY = -1;
    let shortestT = Infinity;
    let directionOfHitX = 0;
    let directionOfHitY = 0;
    let shortestCornerX = null;//Debug
    let shortestCornerY = null;//Debug

    //tDeltaX is what portion of t it takes to cross 1 full tile in the x direction.
    const tDeltaX = dx === 0 ? Infinity : tileWidth / dx * xDir;
    const tDeltaXCenterToCrossWall = tDeltaX * (r * 2) * invTileWidth;
    if (tDeltaX < 0) {
        const error = `tDeltaX is negative: ${tDeltaX}`;
        if (zonDebug) {
            throw new Error(error);
        }

        console.error(error);
        return null;
    }

    //tDeltaY is what portion of t it takes to cross 1 full tile in the y direction.
    const tDeltaY = dy === 0 ? Infinity : tileHeight / dy * yDir;
    const tDeltaYCenterToCrossWall = tDeltaY * (r * 2) * invTileHeight;
    if (tDeltaY < 0) {
        const error = `tDeltaY is negative: ${tDeltaY}`;
        if (zonDebug) {
            throw new Error(error);
        }

        console.error(error);
        return null;
    }
    
    let tileX = xTileStartInc;
    let tileY = yTileStartInc;

    const xTileStartWorld = xDirIsRight ? gridLeft + xTileStartInc * tileWidth : gridLeft + (xTileStartInc + 1) * tileWidth;
    let xT = Collision.getCrossTime(lineStartX, lineEndX, xTileStartWorld) ?? Infinity;

    const yTileStartWorld = yDirIsDown ? gridTop + yTileStartInc * tileHeight : gridTop + (yTileStartInc + 1) * tileHeight;
    let yT = Collision.getCrossTime(lineStartY, lineEndY, yTileStartWorld) ?? Infinity;

    if (tileX < 0 || tileX >= tileCountX || tileY < 0 || tileY >= tileCountY) {
        const error = `Invalid tile coordinates: (${tileX}, ${tileY})`;
        if (zonDebug) {
            throw new Error(error);
        }

        console.error(error);
        return null;
    }
    
    let t = 0;
    while (t <= 1) {
        if (xT < yT) {
            if (xT > 1 || shortestT < xT)
                break;

            t = xT;

            const directHitY = y0 + xT * dy;
            const directHitTileY = Math.floor((directHitY - gridTop) * invTileHeight);
            let newT = null;
            let newShortestTileY = null;
            let newDirectionOfHitX;
            let newDirectionOfHitY;
            let newShortestCornerX = null;//Debug
            let newShortestCornerY = null;//Debug
            if (xT >= 0 && isSolidTile(tileX, directHitTileY)) {
                newT = xT;
                newShortestTileY = directHitTileY;
                newDirectionOfHitX = xDir;
                newDirectionOfHitY = 0;
                if (zonDebug) {
                    newShortestCornerX = null;
                    newShortestCornerY = null;
                }
            }
            else {
                const cornerX = xDirIsRight ? gridLeft + tileX * tileWidth : gridLeft + (tileX + 1) * tileWidth;
                const tCenterPassedWall = Math.min(xT + tDeltaXCenterToCrossWall, 1);
                const ballCenterY = y0 + tCenterPassedWall * dy;
                const ballTopY = yDirIsDown ? directHitY - r : ballCenterY - r;
                const ballBottomY = yDirIsDown ? ballCenterY + r : directHitY + r;
                let ballTopTileY = Math.max(Math.min(Math.floor((ballTopY - gridTop) * invTileHeight), directHitTileY), 0);
                let ballBottomTileY = Math.min(Math.max(Math.floor((ballBottomY - gridTop) * invTileHeight), directHitTileY), tileCountY - 1);
                if (zonDebug) {
                    //console.log(`tileX: ${tileX}, directHitTileY: ${directHitTileY}, Checking tiles: bottoms - [${directHitTileY - 1}, ${ballTopTileY}] (-1) and tops - [${directHitTileY + 1}, ${ballBottomTileY}] (+1)`);
                }
                
                for (let y = Math.min(directHitTileY - 1, tileCountY - 1); y >= ballTopTileY; y -= 1) {
                    //Bottom corners
                    if (zonDebug) {
                        //cornerID: 1 - top-left, 2 - top-right, 4 - bottom-left, 8 - bottom-right
                        //cornerID = 1 << (isBottomCorner << 1 | isRightCorner);
                        //tileIndex = tileX + tileY * tileCountX
                        //cornersArr[tileIndex >> 1] |= (cornerID << (tileIndex & 0x1));
                        const tileIndex = tileX + y * tileCountX;
                        const cornerID = 1 << (2 | xDirIsRight);
                        const arrIndex = tileIndex >> 1;
                        const cornerBit = cornerID << ((tileIndex & 0x1) << 2);
                        if (zonDebug) {
                            //console.log(`Checking bottom corner: ${tileIndex}, ${cornerBit}, ${cornerX}, ${gridTop + (y + 1) * tileHeight}, (${tileX}, ${y})`);
                        }
                        
                        const byte = cornersArr[arrIndex];
                        if ((byte & cornerBit) !== 0) {
                            if (zonDebug) {
                                const msg = `Corner already checked: ${tileIndex}, ${cornerID}`;
                                console.error(msg);
                                //throw new Error(msg);
                            }
                            
                            continue;
                        }
                        else {
                            cornersArr[arrIndex] = byte | cornerBit;
                        }
                    }

                    if (!isSolidTile(tileX, y))
                        continue;

                    const cornerY = gridTop + (y + 1) * tileHeight;
                    const thisT = Collision.solveCornerT(x0, y0, dx, dy, cornerX, cornerY, r);
                    if (thisT !== null && thisT > 0) {
                        if ((newT === null || thisT < newT) && thisT < shortestT && thisT <= 1) {
                            newT = thisT;
                            newShortestTileY = y;
                            const newBallCenterY = y0 + newT * dy;
                            const newBallCenterX = x0 + newT * dx;
                            newDirectionOfHitX = cornerX - newBallCenterX;
                            newDirectionOfHitY = cornerY - newBallCenterY;
                            if (zonDebug) {
                                newShortestCornerX = cornerX;
                                newShortestCornerY = cornerY;
                            }
                        }
                        
                        break;
                    }
                }

                for (let y = Math.max(directHitTileY + 1, 0); y <= ballBottomTileY; y += 1) {
                    //Top corners
                    if (zonDebug) {
                        //cornerID: 1 - top-left, 2 - top-right, 4 - bottom-left, 8 - bottom-right
                        //cornerID = 1 << (isBottomCorner << 1 | isRightCorner);
                        //tileIndex = tileX + tileY * tileCountX
                        //cornersArr[tileIndex >> 1] |= (cornerID << (tileIndex & 0x1));
                        const tileIndex = tileX + y * tileCountX;
                        const cornerID = 1 << xDirIsRight;
                        const arrIndex = tileIndex >> 1;
                        const cornerBit = cornerID << ((tileIndex & 0x1) << 2);
                        if (zonDebug) {
                            //console.log(`Checking top corner: ${tileIndex}, ${cornerBit}, ${cornerX}, ${gridTop + y * tileHeight}, (${tileX}, ${y})`);
                        }
                        
                        const byte = cornersArr[arrIndex];
                        if ((byte & cornerBit) !== 0) {
                            if (zonDebug) {
                                const msg = `Corner already checked: ${tileIndex}, ${cornerID}`;
                                console.error(msg);
                                //throw new Error(msg);
                            }
                            
                            continue;
                        }
                        else {
                            cornersArr[arrIndex] = byte | cornerBit;
                        }
                    }

                    if (!isSolidTile(tileX, y))
                        continue;

                    const cornerY = gridTop + y * tileHeight;
                    const thisT = Collision.solveCornerT(x0, y0, dx, dy, cornerX, cornerY, r);
                    if (thisT !== null && thisT > 0) {
                        if ((newT === null || thisT < newT) && thisT < shortestT && thisT <= 1) {
                            newT = thisT;
                            newShortestTileY = y;
                            const newBallCenterY = y0 + newT * dy;
                            const newBallCenterX = x0 + newT * dx;
                            newDirectionOfHitX = cornerX - newBallCenterX;
                            newDirectionOfHitY = cornerY - newBallCenterY;
                            if (zonDebug) {
                                newShortestCornerX = cornerX;
                                newShortestCornerY = cornerY;
                            }
                        }

                        break;
                    }
                }
            }

            if (newT !== null) {
                if (newT < shortestT) {
                    shortestT = newT;
                    shortestTileX = tileX;
                    shortestTileY = newShortestTileY;
                    directionOfHitX = newDirectionOfHitX;
                    directionOfHitY = newDirectionOfHitY;
                    if (zonDebug) {
                        shortestCornerX = newShortestCornerX;
                        shortestCornerY = newShortestCornerY;
                        //console.log(`X Hit found: ${tileX}, ${newShortestTileY}, t: ${shortestT}, hitX: ${x0 + shortestT * dx}, hitY: ${y0 + shortestT * dy}, directionOfHit: (${directionOfHitX}, ${directionOfHitY})`);
                    }
                }
            }

            tileX += xDir;
            if (tileX < 0) {
                tileX = 0;
                xT = Infinity;
            }
            else if (tileX >= tileCountX) {
                tileX = tileCountX - 1;
                xT = Infinity;
            }
            else {
                xT += tDeltaX;
            }
        } else {
            if (yT > 1 || shortestT < yT)
                break;

            t = yT;
            
            const directHitX = x0 + yT * dx;
            const directHitTileX = Math.floor((directHitX - gridLeft) * invTileWidth);
            let newT = null;
            let newShortestTileX = null;
            let newDirectionOfHitX;
            let newDirectionOfHitY;
            let newShortestCornerX = null;//Debug
            let newShortestCornerY = null;//Debug
            if (yT >= 0 && isSolidTile(directHitTileX, tileY)) {
                newT = yT;
                newShortestTileX = directHitTileX;
                newDirectionOfHitX = 0;
                newDirectionOfHitY = yDir;
                if (zonDebug) {
                    newShortestCornerX = null;
                    newShortestCornerY = null;
                }
            }
            else {
                const cornerY = yDirIsDown ? gridTop + tileY * tileHeight : gridTop + (tileY + 1) * tileHeight;
                const tCenterPassedYWall = Math.min(yT + tDeltaYCenterToCrossWall, 1);
                const ballCenterX = x0 + tCenterPassedYWall * dx;
                const ballLeftX = xDirIsRight ? directHitX - r : ballCenterX - r;
                const ballRightX = xDirIsRight ? ballCenterX + r : directHitX + r;
                let ballLeftTileX = Math.max(Math.min(Math.floor((ballLeftX - gridLeft) * invTileWidth), directHitTileX), 0);
                let ballRightTileX = Math.min(Math.max(Math.floor((ballRightX - gridLeft) * invTileWidth), directHitTileX), tileCountX - 1);
                if (zonDebug) {
                    //console.log(`directHitTileX: ${directHitTileX}, tileY: ${tileY};  Checking tiles: lefts - [${directHitTileX - 1}, ${ballLeftTileX}] (-1) and rights - [${directHitTileX + 1}, ${ballRightTileX}] (+1)`);
                }
                
                for (let x = Math.min(directHitTileX - 1, tileCountX - 1); x >= ballLeftTileX; x -= 1) {
                    //Right corners
                    if (zonDebug) {
                        //cornerID: 1 - top-left, 2 - top-right, 4 - bottom-left, 8 - bottom-right
                        //cornerID = 1 << (isBottomCorner << 1 | isRightCorner);
                        //tileIndex = tileX + tileY * tileCountX
                        //cornersArr[tileIndex >> 1] |= (cornerID << (tileIndex & 0x1));
                        const tileIndex = x + tileY * tileCountX;
                        const cornerID = 1 << (yDirIsDown << 1 | 1);
                        const arrIndex = tileIndex >> 1;
                        const cornerBit = cornerID << ((tileIndex & 0x1) << 2);
                        if (zonDebug) {
                            //console.log(`Checking right corner: ${tileIndex}, ${cornerBit}, ${gridLeft + (x + 1) * tileWidth}, ${cornerY}, (${x}, ${tileY})`);
                        }
                        
                        const byte = cornersArr[arrIndex];
                        if ((byte & cornerBit) !== 0) {
                            if (zonDebug) {
                                const msg = `Corner already checked: ${tileIndex}, ${cornerID}`;
                                console.error(msg);
                                //throw new Error(msg);
                            }
                            
                            continue;
                        }
                        else {
                            cornersArr[arrIndex] = byte | cornerBit;
                        }
                    }

                    if (!isSolidTile(x, tileY))
                        continue;

                    const cornerX = gridLeft + (x + 1) * tileWidth;
                    const thisT = Collision.solveCornerT(x0, y0, dx, dy, cornerX, cornerY, r);
                    if (thisT !== null && thisT >= 0) {
                        if ((newT === null || thisT < newT) && thisT < shortestT && thisT <= 1) {
                            newT = thisT;
                            newShortestTileX = x;
                            const newBallCenterY = y0 + newT * dy;
                            const newBallCenterX = x0 + newT * dx;
                            newDirectionOfHitX = cornerX - newBallCenterX;
                            newDirectionOfHitY = cornerY - newBallCenterY;
                            if (zonDebug) {
                                newShortestCornerX = cornerX;
                                newShortestCornerY = cornerY;
                            }
                        }

                        break;
                    }
                }

                for (let x = Math.max(directHitTileX + 1, 0); x <= ballRightTileX; x += 1) {
                    //Left corners
                    if (zonDebug) {
                        //cornerID: 1 - top-left, 2 - top-right, 4 - bottom-left, 8 - bottom-right
                        //cornerID = 1 << (isBottomCorner << 1 | isRightCorner);
                        //tileIndex = tileX + tileY * tileCountX
                        //cornersArr[tileIndex >> 1] |= (cornerID << (tileIndex & 0x1));
                        const tileIndex = x + tileY * tileCountX;
                        const cornerID = 1 << (yDirIsDown << 1);
                        const arrIndex = tileIndex >> 1;
                        const cornerBit = cornerID << ((tileIndex & 0x1) << 2);
                        if (zonDebug) {
                            //console.log(`Checking left corner: ${tileIndex}, ${cornerBit}, ${gridLeft + x * tileWidth}, ${cornerY}, (${x}, ${tileY})`);
                        }
                        
                        const byte = cornersArr[arrIndex];
                        if ((byte & cornerBit) !== 0) {
                            if (zonDebug) {
                                const msg = `Corner already checked: ${tileIndex}, ${cornerID}`;
                                console.error(msg);
                                //throw new Error(msg);
                            }
                            
                            continue;
                        }
                        else {
                            cornersArr[arrIndex] = byte | cornerBit;
                        }
                    }

                    if (!isSolidTile(x, tileY))
                        continue;

                    const cornerX = gridLeft + x * tileWidth;
                    const thisT = Collision.solveCornerT(x0, y0, dx, dy, cornerX, cornerY, r);
                    if (thisT !== null && thisT >= 0) {
                        if ((newT === null || thisT < newT) && thisT < shortestT && thisT <= 1) {
                            newT = thisT;
                            newShortestTileX = x;
                            const newBallCenterY = y0 + newT * dy;
                            const newBallCenterX = x0 + newT * dx;
                            newDirectionOfHitX = cornerX - newBallCenterX;
                            newDirectionOfHitY = cornerY - newBallCenterY;
                            if (zonDebug) {
                                newShortestCornerX = cornerX;
                                newShortestCornerY = cornerY;
                            }
                        }

                        break;
                    }
                }
            }

            if (newT !== null) {
                if (newT < shortestT) {
                    if (newT >= 0) {
                        shortestT = newT;
                        shortestTileX = newShortestTileX;
                        shortestTileY = tileY;
                        directionOfHitX = newDirectionOfHitX;
                        directionOfHitY = newDirectionOfHitY;
                        if (zonDebug) {
                            shortestCornerX = newShortestCornerX;
                            shortestCornerY = newShortestCornerY;
                            //console.log(`Y Hit found: ${newShortestTileX}, ${tileY}, t: ${shortestT}, hitX: ${x0 + shortestT * dx}, hitY: ${y0 + shortestT * dy}, directionOfHit: (${directionOfHitX}, ${directionOfHitY})`);
                        }
                    }
                    else {
                        const error = `newT is negative: ${newT}`;
                        if (zonDebug) {
                            throw new Error(error);
                        }

                        console.error(error);
                        return null;
                    }
                }
            }

            tileY += yDir;
            if (tileY < 0) {
                tileY = 0;
                yT = Infinity;
            }
            else if (tileY >= tileCountY) {
                tileY = tileCountY - 1;
                yT = Infinity;
            }
            else {
                yT += tDeltaY;
            }
        }
    }

    if (zonDebug) {
        let expectedT = Infinity;
        let expectedXTile;
        let expectedYTile;
        let expectedCornerX;
        let expectedCornerY;
        for (let tX = 0; tX < tileCountX; tX++) {
            for (let tY = 0; tY < tileCountY; tY++) {
                if (!isSolidTile(tX, tY))
                    continue;
                
                //edges
                let thisT = Infinity;
                const blockLeftX = gridLeft + tX * tileWidth;
                const blockRightX = gridLeft + (tX + 1) * tileWidth;
                const blockWorldEdgeX = xDirIsRight ? blockLeftX : blockRightX;
                const blockTopY = gridTop + tY * tileHeight;
                const blockBottomY = gridTop + (tY + 1) * tileHeight;
                const blockWorldEdgeY = yDirIsDown ? blockTopY : blockBottomY;
                const xWallT = Collision.getCrossTimePos(lineStartX, lineEndX, blockWorldEdgeX) ?? Infinity;
                if (xWallT !== null && xWallT >= 0 && xWallT < thisT && xWallT <= 1) {
                    const ballCenterY = y0 + xWallT * dy;
                    if (ballCenterY >= blockTopY && ballCenterY <= blockBottomY) {
                        if (xWallT === undefined)
                            throw new Error(`xWallT is undefined: ${xWallT}`);

                        thisT = xWallT;
                        expectedCornerX = null;
                        expectedCornerY = null;
                    }
                }

                const yWallT = Collision.getCrossTimePos(lineStartY, lineEndY, blockWorldEdgeY) ?? Infinity;
                if (yWallT !== null && yWallT > 0 && yWallT < thisT && yWallT <= 1) {
                    const ballCenterX = x0 + yWallT * dx;
                    if (ballCenterX >= blockLeftX && ballCenterX <= blockRightX) {
                        if (yWallT === undefined)
                            throw new Error(`yWallT is undefined: ${yWallT}`);

                        thisT = yWallT;
                        expectedCornerX = null;
                        expectedCornerY = null;
                    }
                }

                //corners
                for (let x = 0; x <= 1; x += 1) {
                    for (let y = 0; y <= 1; y += 1) {
                        const blockWorldX = gridLeft + (tX + x) * tileWidth;
                        const blockWorldY = gridTop + (tY + y) * tileHeight;
                        const cornerT = Collision.solveCornerT(x0, y0, dx, dy, blockWorldX, blockWorldY, r);
                        if (cornerT !== null && cornerT > 0 && cornerT < thisT && cornerT <= 1) {
                            if (cornerT === undefined)
                                throw new Error(`cornerT is undefined: ${cornerT}`);
                            
                            thisT = cornerT;
                            expectedCornerX = blockWorldX;
                            expectedCornerY = blockWorldY;
                        }
                    }
                }

                //const thisT = Collision.lineIntersectsRectPoints(x0, y0, x1, y1, blockWorldX - r, blockWorldY - r, blockWorldX + tileWidth + r, blockWorldY + tileHeight + r);
                if (thisT !== null) {
                    if (thisT >= 0 && thisT <= 1 && thisT < expectedT) {
                        if (thisT === undefined)
                            throw new Error(`thisT is undefined: ${thisT}`);

                        expectedT = thisT;
                        expectedXTile = tX;
                        expectedYTile = tY;
                    }
                }
            }
        }

        if (expectedT !== Infinity) {
            const epsilon = 0.000001;
            if (Math.abs(expectedT - shortestT) > epsilon && Math.abs(expectedT) > epsilon) {
                const msg = `Expected T is less than shortestT: ${expectedT} < ${shortestT}.\n\n
                    expectedTile: (${expectedXTile}, ${expectedYTile}),\n
                    shortestTile: (${shortestTileX}, ${shortestTileY}),\n\n
                    x0: ${x0}, y0: ${y0},\n
                    x1: ${x1}, y1: ${y1},\n\n
                    dx: ${dx}, dy: ${dy},\n\n
                    lineStartX: ${lineStartX}, lineStartY: ${lineStartY},\n
                    lineEndX: ${lineEndX}, lineEndY: ${lineEndY},\n\n
                    expectedCornerX: ${expectedCornerX}, expectedCornerY: ${expectedCornerY}\n
                    shortestCornerX: ${shortestCornerX}, shortestCornerY: ${shortestCornerY}\n`;
                console.error(msg);
                //throw new Error(msg);
            }
        }
    }

    if (shortestT !== Infinity) {
        if (zonDebug) {
            //console.log(`Final Hit: ${shortestTileX}, ${shortestTileY}, t: ${shortestT}, hitX: ${x0 + shortestT * dx}, hitY: ${y0 + shortestT * dy}, lineHitX: ${lineStartX + shortestT * (lineEndX - lineStartX)}, lineHitY: ${lineStartY + shortestT * (lineEndY - lineStartY)}, directionOfHit: (${directionOfHitX}, ${directionOfHitY})`);
        }

        if (directionOfHitX === 0 && directionOfHitY === 0) {
            const error = `Direction of hit is zero: (${directionOfHitX}, ${directionOfHitY})`;
            if (zonDebug) {
                throw new Error(error);
            }

            console.error(error);
            return null;
        }

        if (shortestT < 0 || shortestT > 1) {
            const error = `Shortest T is out of bounds: ${shortestT}`;
            if (zonDebug) {
                throw new Error(error);
            }

            console.error(error);
            return null;
        }

        return {
            tileX: shortestTileX,
            tileY: shortestTileY,
            t: shortestT,
            hitX: x0 + shortestT * dx,
            hitY: y0 + shortestT * dy,
            directionOfHit: new Vectors.Vector(directionOfHitX, directionOfHitY),
        }
    }
}

Collision.traverseGridWithCircleAlt = function(p0, circle, isSolidTile, gridRect, tilesCount) {
    const x0 = p0.x;
    const y0 = p0.y;
    const x1 = circle.x;
    const y1 = circle.y;
    const r = circle.radius;
    const gridLeft = gridRect.left;
    const gridTop = gridRect.top;
    const gridRight = gridRect.right;
    const gridBottom = gridRect.bottom;
    const tileCountX = tilesCount.x;
    const tileCountY = tilesCount.y;

    const dx = x1 - x0;
    const dy = y1 - y0;
    if (dx === 0 && dy === 0)
        return null;

    const tileWidth = gridRect.width / tileCountX;
    const tileHeight = gridRect.height / tileCountY;

    const xDir = dx < 0 ? -1 : dx > 0 ? 1 : 0;
    const yDir = dy < 0 ? -1 : dy > 0 ? 1 : 0;
    const xDirIsRight = xDir !== -1;
    const yDirIsDown = yDir !== -1;

    const lineStartX = x0 + r * xDir;
    const lineStartY = y0 + r * yDir;
    const lineEndX = x1 + r * xDir;
    const lineEndY = y1 + r * yDir;

    if (xDirIsRight ? lineStartX < gridLeft && lineEndX < gridLeft : lineStartX < gridLeft + tileWidth && lineEndX < gridLeft + tileWidth)
        return null;

    if (xDirIsRight ? lineStartX > gridRight - tileWidth && lineEndX > gridRight - tileWidth : lineStartX > gridRight && lineEndX > gridRight)
        return null;

    if (yDirIsDown ? lineStartY < gridTop && lineEndY < gridTop : lineStartY < gridTop + tileHeight && lineEndY < gridTop + tileHeight)
        return null;

    if (yDirIsDown ? lineStartY > gridBottom - tileHeight && lineEndY > gridBottom - tileHeight : lineStartY > gridBottom && lineEndY > gridBottom)
        return null;

    const invTileWidth = 1 / tileWidth;
    const invTileHeight = 1 / tileHeight;

    //start needs to be inclusive.
    //end needs to be exclusive (1 more in the direction)

    //Right:
    //start: 200;  (200 - 100) / 100 = 1, needs to be 1.  floor OR ceil
    //end 350;  (350 - 100) / 100 = 2.5, needs to be 3.  floor + 1 OR ceil

    //start: 220;  (220 - 100) / 100 = 1.2, needs to be 2.  floor + 1 OR ceil
    //end 370;  (370 - 100) / 100 = 2.7, needs to be 3.  floor + 1 OR ceil

    //start: 250;  (250 - 100) / 100 = 1.5, needs to be 2.  floor + 1 OR ceil
    //end 400;  (400 - 100) / 100 = 3, needs to be 4.  floor + 1 OR ceil + 1

    //Right conclusion:
    //start should be ceil
    //end should be floor + 1

    //Left:
    //start: 500;  (500 - 100) / 100 = 4, needs to be 3.  floor - 1 OR ceil - 1
    //end: 350;  (350 - 100) / 100 = 2.5, needs to be 1.  floor - 1 or ceil - 2

    //start: 480;  (480 - 100) / 100 = 3.8, needs to be 2.  floor - 1 OR ceil - 2
    //end: 330;  (330 - 100) / 100 = 2.3, needs to be 1.  floor - 1 or ceil - 2

    //start: 450;  (450 - 100) / 100 = 3.5, needs to be 2.  floor - 1 OR ceil - 2
    //end: 300;  (300 - 100) / 100 = 2, needs to be 0.  floor - 2 or ceil - 2

    //Left conclusion:
    //start should be floor - 1
    //end should be ceil - 2


    let xTileStartInc = xDirIsRight ? Math.ceil((lineStartX - gridLeft) * invTileWidth) : Math.floor((lineStartX - gridLeft) * invTileWidth) - 1;
    let xTileEndNonInc = xDirIsRight ? Math.floor((lineEndX - gridLeft) * invTileWidth) + 1 : Math.ceil((lineEndX - gridLeft) * invTileWidth) - 2;
    let yTileStartInc = yDirIsDown ? Math.ceil((lineStartY - gridTop) * invTileHeight) : Math.floor((lineStartY - gridTop) * invTileHeight) - 1;
    let yTileEndNonInc = yDirIsDown ? Math.floor((lineEndY - gridTop) * invTileHeight) + 1 : Math.ceil((lineEndY - gridTop) * invTileHeight) - 2;

    xTileStartInc = Math.min(Math.max(xTileStartInc, 0), tileCountX - 1);
    xTileEndNonInc = Math.min(Math.max(xTileEndNonInc, -1), tileCountX);
    yTileStartInc = Math.min(Math.max(yTileStartInc, 0), tileCountY - 1);
    yTileEndNonInc = Math.min(Math.max(yTileEndNonInc, -1), tileCountY);

    //console.log(`Checking line: ${lineStartX}, ${lineStartY} -> ${lineEndX}, ${lineEndY}, (x0: ${x0}, y0: ${y0}), (x1: ${x1}, y1: ${y1}), (dx: ${dx}, dy: ${dy}), (xTileStartInc: ${xTileStartInc}, xTileEndNonInc: ${xTileEndNonInc}), (yTileStartInc: ${yTileStartInc}, yTileEndNonInc: ${yTileEndNonInc})`);

    //Currently does: If circle passes an x or y wall, check if any tile in that wall is solid, and reflect off the wall.
    let shortestTileX = -1;
    let shortestTileY = -1;
    let shortestT = Infinity;
    let directionOfHitX = 0;
    let directionOfHitY = 0;

    const tDeltaX = dx === 0 ? Infinity : Math.abs(tileWidth / dx);//Can probably replace with tileWidth / dx * xDir;
    if (tDeltaX < 0)
        throw new Error(`tDeltaX is negative: ${tDeltaX}`);

    const tDeltaY = dy === 0 ? Infinity : Math.abs(tileHeight / dy);//Can probably replace with tileHeight / dy * yDir;
    if (tDeltaY < 0)
        throw new Error(`tDeltaY is negative: ${tDeltaY}`);

    // let tileX = Math.floor((lineStartX - gridLeft) / tileWidth);
    // let tileY = Math.floor((lineStartY - gridTop) / tileHeight);
    let tileX = xTileStartInc;
    let tileY = yTileStartInc;

    const xTileStartWorld = xDirIsRight ? gridLeft + xTileStartInc * tileWidth : gridLeft + (xTileStartInc + 1) * tileWidth;
    let xT = Collision.getCrossTimePos(lineStartX, lineEndX, xTileStartWorld) ?? Infinity;
    if (xT < 0)
        throw new Error(`tX is negative: ${xT}`);

    const yTileStartWorld = yDirIsDown ? gridTop + yTileStartInc * tileHeight : gridTop + (yTileStartInc + 1) * tileHeight;
    let yT = Collision.getCrossTimePos(lineStartY, lineEndY, yTileStartWorld) ?? Infinity;
    if (yT < 0)
        throw new Error(`tY is negative: ${yT}`);

    if (tileX < 0 || tileX >= tileCountX || tileY < 0 || tileY >= tileCountY)
        throw new Error(`Invalid tile coordinates: (${tileX}, ${tileY})`);

    let t = 0;
    while (t <= 1) {
        if (xT < yT) {
            if (xT > 1)
                break;

            t = xT;
            if (xT < 0)
                throw new Error(`xT is negative: ${xT}`);

            const ballCenterY = y0 + xT * dy;
            const ballTopY = ballCenterY - r;
            const ballBottomY = ballCenterY + r;
            const ballTopTileY = Math.max(Math.floor((ballTopY - gridTop) * invTileHeight), 0);
            const ballBottomTileY = Math.min(Math.floor((ballBottomY - gridTop) * invTileHeight), tileCountY - 1);
            for (let y = ballTopTileY; y <= ballBottomTileY; y += 1) {
                if (tileX < 0 || tileX >= tileCountX || y < 0 || y >= tileCountY)
                    throw new Error(`Invalid tile coordinates: (${tileX}, ${y})`);

                if (isSolidTile(tileX, y)) {
                    if (xT < shortestT) {
                        shortestT = xT;
                        shortestTileX = tileX;
                        shortestTileY = y;
                        directionOfHitX = xDir;
                        directionOfHitY = 0;
                        //console.log(`X Hit found: ${tileX}, ${y}, t: ${shortestT}, hitX: ${x0 + shortestT * dx}, hitY: ${y0 + shortestT * dy}, directionOfHit: (${directionOfHitX}, ${directionOfHitY})`);
                    }
                    
                    break;
                }
            }

            tileX += xDir;
            xT += tDeltaX;
        } else {
            if (yT > 1)
                break;

            t = yT;
            if (yT < 0)
                throw new Error(`yT is negative: ${yT}`);
            
            const ballCenterX = x0 + yT * dx;
            const ballLeftX = ballCenterX - r;
            const ballRightX = ballCenterX + r;
            const ballLeftTileX = Math.max(Math.floor((ballLeftX - gridLeft) * invTileWidth), 0);
            const ballRightTileX = Math.min(Math.floor((ballRightX - gridLeft) * invTileWidth), tileCountX - 1);
            for (let x = ballLeftTileX; x <= ballRightTileX; x += 1) {
                if (x < 0 || x >= tileCountX || tileY < 0 || tileY >= tileCountY)
                    throw new Error(`Invalid tile coordinates: (${x}, ${tileY})`);

                if (isSolidTile(x, tileY)) {
                    if (yT < shortestT) {
                        shortestT = yT;
                        shortestTileX = x;
                        shortestTileY = tileY;
                        directionOfHitX = 0;
                        directionOfHitY = yDir;
                        //console.log(`Y Hit found: ${x}, ${tileY}, t: ${shortestT}, hitX: ${x0 + shortestT * dx}, hitY: ${y0 + shortestT * dy}, directionOfHit: (${directionOfHitX}, ${directionOfHitY})`);
                    }

                    break;
                }
            }

            tileY += yDir;
            yT += tDeltaY;
        }
    }

    if (shortestT !== Infinity) {
        //console.log(`Final Hit: ${shortestTileX}, ${shortestTileY}, t: ${shortestT}, hitX: ${x0 + shortestT * dx}, hitY: ${y0 + shortestT * dy}, lineHitX: ${lineStartX + shortestT * (lineEndX - lineStartX)}, lineHitY: ${lineStartY + shortestT * (lineEndY - lineStartY)}, directionOfHit: (${directionOfHitX}, ${directionOfHitY})`);
        if (directionOfHitX === 0 && directionOfHitY === 0)
            throw new Error(`Direction of hit is zero: (${directionOfHitX}, ${directionOfHitY})`);

        if (shortestT < 0 || shortestT > 1)
            throw new Error(`t is out of bounds: ${shortestT}`);

        return {
            tileX: shortestTileX,
            tileY: shortestTileY,
            t: shortestT,
            hitX: x0 + shortestT * dx,
            hitY: y0 + shortestT * dy,
            directionOfHit: new Vectors.Vector(directionOfHitX, directionOfHitY),
        }
    }
}