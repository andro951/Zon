"use strict";

const Collision = {}

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

Collision.movingCircleHitsPointT = (x0, y0, dx, dy, pX, pY, r) => {
    // r = ((x0 + dx * t - pX)^2 + (y0 + dy * t - pY)^2)^0.5
    // r^2 = (dx * t + x0 - pX)^2 + (dy * t + y0 - pY)^2
    // r^2 = (dx * t + (x0 - pX))^2 + (dy * t + (y0 - pY))^2
    // r^2 = dx^2 * t^2 + 2 * dx * t * (x0 - pX) + (x0 - pX)^2 + dy^2 * t^2 + dy * t * (y0 - pY) + (y0 - pY)^2
    // 0 = (dx^2 + dy^2) * t^2 + (2 * (dx * (x0 - pX) + dy * (y0 - pY))) * t + (x0 - pX)^2 + (y0 - pY)^2 - r^2
    // a = (dx^2 + dy^2)
    // b = 2 * (dx * (x0 - pX) + dy * (y0 - pY))
    // c = (x0 - pX)^2 + (y0 - pY)^2 - r^2
    // t = (-b +/- (b^2 - 4 * a * c)^0.5)/(2 * a)
    const a = dx * dx + dy * dy;
    if (a === 0)
        return null;//Not moving

    const invDenom = 1 / a;
    const cX = x0 - pX;
    const cY = y0 - pY;
    const b = dx * cX + dy * cY;
    const c = cX * cX + cY * cY - r * r;
    const discriminant = b * b - a * c;
    if (discriminant < 0)
        return null;//No real roots, does not hit

    //Correct, but adds an extra branch for 99.99% of cases
    //Can be accounted for by just calculating both roots
    // if (discriminant === 0) {
    //     // One real root
    //     thisT = -b / denom;//(-b +/- 0) / (2 * a)
    // }

    const sqrtDisc = Math.sqrt(discriminant);
    //sqrtDisc is always positive, so root1 is always a smaller positive or negative
    //If it is >= 0, it is the smaller root.
    const root1 = (-b - sqrtDisc) * invDenom;//(-b - sqrt(b^2 - 4ac)) / (2 * a)
    if (root1 >= 0)
        return root1;

    const root2 = (-b + sqrtDisc) * invDenom;//(-b + sqrt(b^2 - 4ac)) / (2 * a)
    if (root2 >= 0)
        return root2;

    return null;
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
    // let directionOfHitX = 0;
    // let directionOfHitY = 0;
    let normalX = 0;
    let normalY = 0;
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

    if (tileX < 0 || tileX >= tileCountX || tileY < 0 || tileY >= tileCountY) {
        const error = `Invalid tile coordinates: (${tileX}, ${tileY})`;
        if (zonDebug) {
            throw new Error(error);
        }

        console.error(error);
        return null;
    }

    const xTileStartWorld = xDirIsRight ? gridLeft + xTileStartInc * tileWidth : gridLeft + (xTileStartInc + 1) * tileWidth;
    let xT = Collision.getCrossTime(lineStartX, lineEndX, xTileStartWorld) ?? Infinity;

    const yTileStartWorld = yDirIsDown ? gridTop + yTileStartInc * tileHeight : gridTop + (yTileStartInc + 1) * tileHeight;
    let yT = Collision.getCrossTime(lineStartY, lineEndY, yTileStartWorld) ?? Infinity;

    // if (xT < 0 || yT < 0) {
    //     const error = `xT or yT was < 0; xT: ${xT}, yT: ${yT}`;
    //     if (zonDebug) {
    //         throw new Error(error);
    //     }

    //     console.error(error);
    //     return null;
    // }
    
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
            // let newDirectionOfHitX;
            // let newDirectionOfHitY;
            let newNormalX;
            let newNormalY;
            let newShortestCornerX = null;//Debug
            let newShortestCornerY = null;//Debug
            if (xT >= 0 && isSolidTile(tileX, directHitTileY)) {
                newT = xT;
                newShortestTileY = directHitTileY;
                // newDirectionOfHitX = xDir;
                // newDirectionOfHitY = 0;
                newNormalX = -xDir;
                newNormalY = 0;
                if (zonDebug) {
                    newShortestCornerX = null;
                    newShortestCornerY = null;
                }
            }
            else {
                const cornerX = xDirIsRight ? gridLeft + tileX * tileWidth : gridLeft + (tileX + 1) * tileWidth;
                const tCenterPassedWall = Math.min(xT + tDeltaXCenterToCrossWall, 1);
                const ballCenterX = x0 + tCenterPassedWall * dx;
                if (zonDebug) {
                    // if (ballCenterX !== cornerX)
                    //     console.error(`ballCenterX !== cornerX; ballCenterX: ${ballCenterX}, cornerX: ${cornerX}`);
                }

                const ballCenterY = y0 + tCenterPassedWall * dy;
                const ballTopY = yDirIsDown ? directHitY - r : ballCenterY - r;
                const ballBottomY = yDirIsDown ? ballCenterY + r : directHitY + r;
                let ballTopTileY = Math.max(Math.min(Math.floor((ballTopY - gridTop) * invTileHeight), directHitTileY), 0);
                let ballBottomTileY = Math.min(Math.max(Math.floor((ballBottomY - gridTop) * invTileHeight), directHitTileY), tileCountY - 1);
                if (zonDebug) {
                    //console.log(`tileX: ${tileX}, directHitTileY: ${directHitTileY}, Checking tiles: bottoms - [${directHitTileY - 1}, ${ballTopTileY}] (-1) and tops - [${directHitTileY + 1}, ${ballBottomTileY}] (+1)`);

                    // const prevBottomTileY = ballBottomTileY - 1;
                    // if (prevBottomTileY >= 0) {
                    //     if (prevBottomTileY >= tileCountY)
                    //         throw new Error(`prevBottomTileY is out of bounds: ${prevBottomTileY}`);

                    //     //Don't solid check here.  Just checking if the bounds excluded some tiles
                    //     const prevBottomY = gridTop + (prevBottomTileY + 1) * tileHeight;
                    //     const prevBottomT = Collision.movingCircleHitsPointT(x0, y0, dx, dy, cornerX, prevBottomY, r);
                    //     if (prevBottomT !== null)
                    //         console.error(`Excluded a tile due to incorrect bounds calculation.  prevBottomT is not null: ${prevBottomT}`);
                    // }

                    // const nextTopTileY = ballTopTileY + 1;
                    // if (nextTopTileY <= tileCountY - 1) {
                    //     if (nextTopTileY < 0)
                    //         throw new Error(`nextTopTileY is out of bounds: ${nextTopTileY}`);

                    //     //Don't solid check here.  Just checking if the bounds excluded some tiles
                    //     const nextTopY = gridTop + nextTopTileY * tileHeight;
                    //     const nextTopT = Collision.movingCircleHitsPointT(x0, y0, dx, dy, cornerX, nextTopY, r);
                    //     if (nextTopT !== null)
                    //         console.error(`Excluded a tile due to incorrect bounds calculation.  nextTopT is not null: ${nextTopT}`);
                    // }
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
                    const thisT = Collision.movingCircleHitsPointT(x0, y0, dx, dy, cornerX, cornerY, r);
                    if (thisT !== null && thisT > 0) {
                        if ((newT === null || thisT < newT) && thisT < shortestT && thisT <= 1) {
                            newT = thisT;
                            newShortestTileY = y;
                            const newBallCenterY = y0 + newT * dy;
                            const newBallCenterX = x0 + newT * dx;
                            // newDirectionOfHitX = cornerX - newBallCenterX;
                            // newDirectionOfHitY = cornerY - newBallCenterY;
                            newNormalX = newBallCenterX - cornerX;
                            newNormalY = newBallCenterY - cornerY;
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
                    const thisT = Collision.movingCircleHitsPointT(x0, y0, dx, dy, cornerX, cornerY, r);
                    if (thisT !== null && thisT > 0) {
                        if ((newT === null || thisT < newT) && thisT < shortestT && thisT <= 1) {
                            newT = thisT;
                            newShortestTileY = y;
                            const newBallCenterY = y0 + newT * dy;
                            const newBallCenterX = x0 + newT * dx;
                            // newDirectionOfHitX = cornerX - newBallCenterX;
                            // newDirectionOfHitY = cornerY - newBallCenterY;
                            newNormalX = newBallCenterX - cornerX;
                            newNormalY = newBallCenterY - cornerY;
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
                    // directionOfHitX = newDirectionOfHitX;
                    // directionOfHitY = newDirectionOfHitY;
                    normalX = newNormalX;
                    normalY = newNormalY;
                    if (zonDebug) {
                        shortestCornerX = newShortestCornerX;
                        shortestCornerY = newShortestCornerY;
                        //console.log(`X Hit found: ${tileX}, ${newShortestTileY}, t: ${shortestT}, hitX: ${x0 + shortestT * dx}, hitY: ${y0 + shortestT * dy}, normal: (${normalX}, ${normalY})`);
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
                //xT += tDeltaX;
                const nextTileX = xDirIsRight ? gridLeft + tileX * tileWidth : gridLeft + (tileX + 1) * tileWidth;
                //const xT2 = Collision.getCrossTime(lineStartX, lineEndX, nextTileX) ?? Infinity;
                xT = Collision.getCrossTime(lineStartX, lineEndX, nextTileX) ?? Infinity;
                //console.log(`tileX: ${tileX}, xT: ${xT}, xT2: ${xT2}, nextTileX: ${nextTileX}`);
            }
        } else {
            if (yT > 1 || shortestT < yT)
                break;

            t = yT;
            
            const directHitX = x0 + yT * dx;
            const directHitTileX = Math.floor((directHitX - gridLeft) * invTileWidth);
            let newT = null;
            let newShortestTileX = null;
            // let newDirectionOfHitX;
            // let newDirectionOfHitY;
            let newNormalX;
            let newNormalY;
            let newShortestCornerX = null;//Debug
            let newShortestCornerY = null;//Debug
            if (yT >= 0 && isSolidTile(directHitTileX, tileY)) {
                newT = yT;
                newShortestTileX = directHitTileX;
                // newDirectionOfHitX = 0;
                // newDirectionOfHitY = yDir;
                newNormalX = 0;
                newNormalY = -yDir;
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
                    const thisT = Collision.movingCircleHitsPointT(x0, y0, dx, dy, cornerX, cornerY, r);
                    if (thisT !== null && thisT >= 0) {
                        if ((newT === null || thisT < newT) && thisT < shortestT && thisT <= 1) {
                            newT = thisT;
                            newShortestTileX = x;
                            const newBallCenterY = y0 + newT * dy;
                            const newBallCenterX = x0 + newT * dx;
                            // newDirectionOfHitX = cornerX - newBallCenterX;
                            // newDirectionOfHitY = cornerY - newBallCenterY;
                            newNormalX = newBallCenterX - cornerX;
                            newNormalY = newBallCenterY - cornerY;
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
                    const thisT = Collision.movingCircleHitsPointT(x0, y0, dx, dy, cornerX, cornerY, r);
                    if (thisT !== null && thisT >= 0) {
                        if ((newT === null || thisT < newT) && thisT < shortestT && thisT <= 1) {
                            newT = thisT;
                            newShortestTileX = x;
                            const newBallCenterY = y0 + newT * dy;
                            const newBallCenterX = x0 + newT * dx;
                            // newDirectionOfHitX = cornerX - newBallCenterX;
                            // newDirectionOfHitY = cornerY - newBallCenterY;
                            newNormalX = newBallCenterX - cornerX;
                            newNormalY = newBallCenterY - cornerY;
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
                        // directionOfHitX = newDirectionOfHitX;
                        // directionOfHitY = newDirectionOfHitY;
                        normalX = newNormalX;
                        normalY = newNormalY;
                        if (zonDebug) {
                            shortestCornerX = newShortestCornerX;
                            shortestCornerY = newShortestCornerY;
                            //console.log(`Y Hit found: ${newShortestTileX}, ${tileY}, t: ${shortestT}, hitX: ${x0 + shortestT * dx}, hitY: ${y0 + shortestT * dy}, normal: (${normalX}, ${normalY})`);
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
                //yT += tDeltaY;
                const nextTileY = yDirIsDown ? gridTop + tileY * tileHeight : gridTop + (tileY + 1) * tileHeight;
                //const yT2 = Collision.getCrossTime(lineStartY, lineEndY, nextTileY) ?? Infinity;
                yT = Collision.getCrossTime(lineStartY, lineEndY, nextTileY) ?? Infinity;
                //console.log(`tileY: ${tileY}, yT: ${yT}, yT2: ${yT2}, nextTileY: ${nextTileY}`);
                // //xT += tDeltaX;
                // const nextTileX = xDirIsRight ? gridLeft + tileX * tileWidth : gridLeft + (tileX + 1) * tileWidth;
                // //const xT2 = Collision.getCrossTime(lineStartX, lineEndX, nextTileX) ?? Infinity;
                // xT = Collision.getCrossTime(lineStartX, lineEndX, nextTileX) ?? Infinity;
                // //console.log(`tileX: ${tileX}, xT: ${xT}, xT2: ${xT2}, nextTileX: ${nextTileX}`);
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
                        const cornerT = Collision.movingCircleHitsPointT(x0, y0, dx, dy, blockWorldX, blockWorldY, r);
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
            //console.log(`Final Hit: ${shortestTileX}, ${shortestTileY}, t: ${shortestT}, hitX: ${x0 + shortestT * dx}, hitY: ${y0 + shortestT * dy}, lineHitX: ${lineStartX + shortestT * (lineEndX - lineStartX)}, lineHitY: ${lineStartY + shortestT * (lineEndY - lineStartY)}, normal: (${normalX}, ${normalY})`);
        }

        if (normalX === 0 && normalY === 0) {
            const error = `Normal is zero: (${normalX}, ${normalY})`;
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

        const normalLength = Math.hypot(normalX, normalY);
        if (normalLength === 0)
            throw new Error(`Normal length is zero: (${normalX}, ${normalY})`);

        normalX /= normalLength;
        normalY /= normalLength;

        return {
            tileX: shortestTileX,
            tileY: shortestTileY,
            t: shortestT,
            hitX: x0 + shortestT * dx,
            hitY: y0 + shortestT * dy,
            normal: new Vectors.Vector(normalX, normalY),
        }
    }
}

Collision.movingCircleIntersectsSquare = (x0, y0, dx, dy, radius, squareLeft, squareTop, squareRight, squareBottom) => {
    const expandedLeft = squareLeft - radius;
    const expandedTop = squareTop - radius;
    const expandedRight = squareRight + radius;
    const expandedBottom = squareBottom + radius;

    if (dx === 0 && dy === 0)
        return null;

    if (dx === 0 && (x0 < expandedLeft || x0 > expandedRight))
        return null;

    if (dy === 0 && (y0 < expandedTop || y0 > expandedBottom))
        return null;

    let txMin, txMax;
    if (dx === 0) {
        txMin = -Infinity;
        txMax = Infinity;
    } else {
        const tx1 = (expandedLeft - x0) / dx;
        const tx2 = (expandedRight - x0) / dx;
        txMin = Math.min(tx1, tx2);
        txMax = Math.max(tx1, tx2);
    }
    
    let tyMin, tyMax;
    if (dy === 0) {
        tyMin = -Infinity;
        tyMax = Infinity;
    }
    else {
        const ty1 = (expandedTop - y0) / dy;
        const ty2 = (expandedBottom - y0) / dy;
        tyMin = Math.min(ty1, ty2);
        tyMax = Math.max(ty1, ty2);
    }
    
    let tEntry = Math.max(txMin, tyMin);
    const tExit = Math.min(txMax, tyMax);

    //console.log(`tEntry: ${tEntry}, tExit: ${tExit}, txMin: ${txMin}, tyMin: ${tyMin}`);

    // if (tEntry < 0 || tEntry > 1 || tEntry > tExit)
    //     return null;
    const EPSILON = 1e-12;
    if (tEntry < -EPSILON || tEntry > 1 + EPSILON || tEntry > tExit)
        return null;

    // Clamp so the hit position is exactly on the segment
    tEntry = Math.max(0, Math.min(1, tEntry));

    let hitX = x0 + dx * tEntry;
    let hitY = y0 + dy * tEntry;

    const isCornerX = hitX < squareLeft || hitX > squareRight;
    const isCornerY = hitY < squareTop || hitY > squareBottom;

    let normalX;
    let normalY;
    if (isCornerX && isCornerY) {
        const cornerX = hitX < squareLeft ? squareLeft : squareRight;
        const cornerY = hitY < squareTop ? squareTop : squareBottom;
        tEntry = Collision.movingCircleHitsPointT(x0, y0, dx, dy, cornerX, cornerY, radius);
        if (tEntry === null || tEntry < -EPSILON || tEntry > 1 + EPSILON || tEntry > tExit)
            return null;

        hitX = x0 + dx * tEntry;
        hitY = y0 + dy * tEntry;

        tEntry = Math.max(0, Math.min(1, tEntry));

        const vecX = hitX - cornerX;
        const vecY = hitY - cornerY;
        //Can't be zero unless the center of the circle is on top of the corner.
        //No need to check if === 0.
        const invLen = 1 / Math.hypot(vecX, vecY);
        normalX = vecX * invLen;
        normalY = vecY * invLen;
    }
    else {
        if (isCornerX) {
            normalX = hitX < squareLeft ? -1 : 1;
            normalY = 0;
        }
        else {
            normalX = 0;
            normalY = hitY < squareTop ? -1 : 1;
        }
    }

    return {
        tEntry,
        hitX,
        hitY,
        normal: new Vectors.Vector(normalX, normalY),
    };
}

//p0 has .x and .y
//circle has .x, .y and .radius
//isSolidTile(x, y) returns true if the tile at (x, y) is solid
//gridRect has .left, .top, .right and .bottom representing world coordinates
//tilesCount has .x and .y, representing how many tiles there are in each direction
Collision.traverseGridWithCircleBruteForce = (p0, circle, isSolidTile, gridRect, tilesCount) => {
    const squareHeight = gridRect.height / tilesCount.y;
    const squareWidth = gridRect.width / tilesCount.x;
    let squareTop = gridRect.top;
    let squareBottom = squareTop + squareHeight;
    let squareLeft;
    let squareRight;
    let shortestCollision = null;
    const x0 = p0.x;
    const y0 = p0.y;
    const dx = circle.x - x0;
    const dy = circle.y - y0;
    const r = circle.radius;
    for (let tileY = 0; tileY < tilesCount.y; tileY += 1) {
        squareLeft = gridRect.left;
        squareRight = squareLeft + squareWidth;
        for (let tileX = 0; tileX < tilesCount.x; tileX += 1) {
            if (isSolidTile(tileX, tileY)) {
                const collision = Collision.movingCircleIntersectsSquare(x0, y0, dx, dy, r, squareLeft, squareTop, squareRight, squareBottom);
                if (collision && (shortestCollision === null || collision.tEntry < shortestCollision.tEntry)) {
                    shortestCollision = collision;
                    shortestCollision.tileX = tileX;
                    shortestCollision.tileY = tileY;
                }
            }

            squareLeft = squareRight;
            squareRight += squareWidth;
        }

        squareTop = squareBottom;
        squareBottom += squareHeight;
    }

    return shortestCollision;
}

//p0 has .x and .y
//circle has .x, .y and .radius
//isSolidTile(x, y) returns true if the tile at (x, y) is solid
//gridRect has .left, .top, .right and .bottom representing world coordinates
//tilesCount has .x and .y, representing how many tiles there are in each direction
Collision.traverseGridWithCircleDDA = (p0, circle, isSolidTile, gridRect, tilesCount) => {
    const squareHeight = gridRect.height / tilesCount.y;
    const squareWidth = gridRect.width / tilesCount.x;
    const x0 = p0.x;
    const y0 = p0.y;
    const x1 = circle.x;
    const y1 = circle.y;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const r = circle.radius;

    let startTileX = Math.floor((x0 - gridRect.left) / squareWidth);
    let startTileY = Math.floor((y0 - gridRect.top) / squareHeight);

    let endTileX = Math.floor((x1 - gridRect.left) / squareWidth);
    let endTileY = Math.floor((y1 - gridRect.top) / squareHeight);

    startTileX = Math.max(0, Math.min(startTileX, tilesCount.x-1));
    startTileY = Math.max(0, Math.min(startTileY, tilesCount.y-1));
    endTileX   = Math.max(0, Math.min(endTileX, tilesCount.x-1));
    endTileY   = Math.max(0, Math.min(endTileY, tilesCount.y-1));

    let stepX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
    let stepY = dy > 0 ? 1 : dy < 0 ? -1 : 0;

    // How far along the ray until next tile boundary
    let tMaxX = stepX !== 0 ? ((stepX > 0 ? (startTileX + 1) * squareWidth + gridRect.left : startTileX * squareWidth + gridRect.left) - x0) / dx : Infinity;
    let tMaxY = stepY !== 0 ? ((stepY > 0 ? (startTileY + 1) * squareHeight + gridRect.top : startTileY * squareHeight + gridRect.top) - y0) / dy : Infinity;

    // How far we must move to cross one whole tile in x/y
    let tDeltaX = stepX !== 0 ? squareWidth / Math.abs(dx) : Infinity;
    let tDeltaY = stepY !== 0 ? squareHeight / Math.abs(dy) : Infinity;

    let tileX = startTileX;
    let tileY = startTileY;

    let shortestT = Infinity;

    while (tileX !== endTileX || tileY !== endTileY) {
        // Test the current tile if solid
        if (isSolidTile(tileX, tileY)) {
            // Compute exact collision with square
            const squareLeft = gridRect.left + tileX * squareWidth;
            const squareRight = squareLeft + squareWidth;
            const squareTop = gridRect.top + tileY * squareHeight;
            const squareBottom = squareTop + squareHeight;

            const t = Collision.movingCircleIntersectsSquare(x0, y0, dx, dy, r, squareLeft, squareTop, squareRight, squareBottom);
            if (t !== null && t < shortestT)
                shortestT = t;
        }

        // Step to next tile
        if (tMaxX < tMaxY) {
            tMaxX += tDeltaX;
            tileX += stepX;
        } else {
            tMaxY += tDeltaY;
            tileY += stepY;
        }

        // Stop if we've gone past t=1
        if (Math.min(tMaxX, tMaxY) > 1)
            break;
    }

    if (shortestT === Infinity)
        return null;

    return {
        t: shortestT,
        collisionX: x0 + dx * shortestT,
        collisionY: y0 + dy * shortestT
    };
}

//Alternative method:
//Calculate 2 lines representing the left and right edges of the ball.
//Extend the top of the rectangle made out to the edge of the ball so that you gather more than needed.
//Make an enumerable that traverses the grid and pulls the closest tile first and checks for collision.
//Return when a collision is found.