"use strict";

Collision.Tests = {};

Collision.Tests.runTests = () => {
    //Collision.Tests.runAllTests();
    //Collision.Tests.runAllTests(2);
    //Collision.Tests.runTest(29, 1);
    //Collision.Tests.runTest(30, 1);
    //Collision.Tests.runTest(31, 1);
    //Collision.Tests.runTest(32, 1);
    //Collision.Tests.runTest(46, 1);
}

Collision.Tests.Collision = class Collision {
    constructor(hitX, hitY, tileX, tileY, normalX, normalY) {
        this.hit = new Vectors.Vector(hitX, hitY);
        this.tile = new Vectors.Vector(tileX, tileY);
        this.normal = new Vectors.Vector(normalX, normalY);
    }
    static fromCollisionObj(collisionObj) {
        if (!collisionObj)
            return null;

        return new Collision(
            collisionObj.hitX, collisionObj.hitY,
            collisionObj.tileX, collisionObj.tileY,
            collisionObj.normal.x, collisionObj.normal.y
        );
    }
    equals(otherCollision) {
        if (!otherCollision)
            return false;
        
        const EPSILON = 1e-8;
        const hitMatch = this.hit.distance(otherCollision.hit) < EPSILON;
        const tileMatch = this.tile.distance(otherCollision.tile) < EPSILON;
        const normalMatch = this.normal.distance(otherCollision.normal) < EPSILON;
        return hitMatch && tileMatch && normalMatch;
    }
    toString() {
        return `hit: ${this.hit}, tile: ${this.tile}, normal: ${this.normal}`;
    }
}

Collision.Tests.Test = class CollisionTest {
    constructor(num, p0X, p0Y, p1X, p1Y, r, gridArr, gridRectLeft, gridRectTop, gridRectWidth, gridRectHeight, tilesCountX, tilesCountY, expectedCollisions, { ignore = false } = {}) {
        this.num = num;
        this.p0 = new Vectors.Vector(p0X, p0Y);
        this.circle = new Struct.Circle(p1X, p1Y, r);
        this.gridArr = gridArr;
        this.gridRect = new Struct.Rectangle(gridRectLeft, gridRectTop, gridRectWidth, gridRectHeight);
        this.tilesCount = new Vectors.Vector(tilesCountX, tilesCountY);
        this.expectedCollisions = expectedCollisions;
        this.ignore = ignore;
    }
}

Collision.Tests.makeTests = () => {
    const ba = Zon.blocksManager.blockArea;
    const tc = Zon.blocksManager.tileCount;
    const w = ba.width / tc.x;
    const h = ba.height / tc.y;
    const w2 = w * 0.5;
    const h2 = h * 0.5;

    const blockLeft = (blockX) => ba.left + blockX * w;
    const blockTop = (blockY) => ba.top + blockY * h;
    const blockRight = (blockX) => ba.left + blockX * w + w;
    const blockBottom = (blockY) => ba.top + blockY * h + h;
    const blockXMiddle = (blockX) => ba.left + blockX * w + w2;
    const blockYMiddle = (blockY) => ba.top + blockY * h + h2;
    const r = 16;

    //Balls move at 12 units per frame, so I'm doing 1000 times slower.
    //const frameDistance = 0.01;
    const frameDistance = 1000;//May be pushing the ball outside of the game area?
    const halfFrameDistance = frameDistance / 2;

    Collision.Tests.Tests = [
        //#region Edges 1-4
        new Collision.Tests.Test(1,//left edge
            blockXMiddle(4), blockYMiddle(7),//p0 x, y
            blockXMiddle(10), blockYMiddle(7),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - w2 - r, blockYMiddle(7),//hitPos x, y
                    7, 7,//hitTile x, y
                    -1, 0//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(2,//right edge
            blockXMiddle(10), blockYMiddle(7),//p0 x, y
            blockXMiddle(4), blockYMiddle(7),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + w2 + r, blockYMiddle(7),//hitPos x, y
                    7, 7,//hitTile x, y
                    1, 0//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(3,//top edge
            blockXMiddle(7), blockYMiddle(4),//p0 x, y
            blockXMiddle(7), blockYMiddle(10),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7), blockYMiddle(7) - w2 - r,//hitPos x, y
                    7, 7,//hitTile x, y
                    0, -1//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(4,//bottom edge
            blockXMiddle(7), blockYMiddle(10),//p0 x, y
            blockXMiddle(7), blockYMiddle(4),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7), blockYMiddle(7) + h2 + r,//hitPos x, y
                    7, 7,//hitTile x, y
                    0, 1//normal x, y
                ),
            ]
        ),
        //#endregion
        
        
        

        
        //#region Edges (end touching edge) 5-8
        new Collision.Tests.Test(5,//left edge end touching edge
            blockXMiddle(4), blockYMiddle(7),//p0 x, y
            blockXMiddle(7) - w2 - r, blockYMiddle(7),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - w2 - r, blockYMiddle(7),//hitPos x, y
                    7, 7,//hitTile x, y
                    -1, 0//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(6,//right edge end touching edge
            blockXMiddle(10), blockYMiddle(7),//p0 x, y
            blockXMiddle(7) + w2 + r, blockYMiddle(7),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + w2 + r, blockYMiddle(7),//hitPos x, y
                    7, 7,//hitTile x, y
                    1, 0//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(7,//top edge end touching edge
            blockXMiddle(7), blockYMiddle(4),//p0 x, y
            blockXMiddle(7), blockYMiddle(7) - w2 - r,//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7), blockYMiddle(7) - w2 - r,//hitPos x, y
                    7, 7,//hitTile x, y
                    0, -1//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(8,//bottom edge end touching edge
            blockXMiddle(7), blockYMiddle(10),//p0 x, y
            blockXMiddle(7), blockYMiddle(7) + h2 + r,//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7), blockYMiddle(7) + h2 + r,//hitPos x, y
                    7, 7,//hitTile x, y
                    0, 1//normal x, y
                ),
            ]
        ),
        //#endregion





        //#region Edges (end touching edge, miss) 9-12
        new Collision.Tests.Test(9,//left edge end touching edge (miss)
            blockXMiddle(4), blockYMiddle(7),//p0 x, y
            blockXMiddle(7) - w2 - r - 5e-9, blockYMiddle(7),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                //none
            ]
        ),
        new Collision.Tests.Test(10,//right edge end touching edge (miss)
            blockXMiddle(10), blockYMiddle(7),//p0 x, y
            blockXMiddle(7) + w2 + r + 5e-9, blockYMiddle(7),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                //none
            ]
        ),
        new Collision.Tests.Test(11,//top edge end touching edge (miss)
            blockXMiddle(7), blockYMiddle(4),//p0 x, y
            blockXMiddle(7), blockYMiddle(7) - w2 - r - 5e-9,//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                //none
            ]
        ),
        new Collision.Tests.Test(12,//bottom edge end touching edge (miss)
            blockXMiddle(7), blockYMiddle(10),//p0 x, y
            blockXMiddle(7), blockYMiddle(7) + h2 + r + 5e-9,//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                //none
            ]
        ),
        //#endregion





        //#region corners 45 degree 13-16
        new Collision.Tests.Test(13,//top left corner 45 degree
            blockXMiddle(5), blockYMiddle(5),//p0 x, y
            blockXMiddle(8), blockYMiddle(8),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - (r * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) - (r * Math.sin(Math.PI / 4) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    -1/Math.sqrt(2), -1/Math.sqrt(2)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(14,//top right corner 45 degree
            blockXMiddle(9), blockYMiddle(5),//p0 x, y
            blockXMiddle(6), blockYMiddle(8),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + (r * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) - (r * Math.sin(Math.PI / 4) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    1/Math.sqrt(2), -1/Math.sqrt(2)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(15,//bottom right corner 45 degree
            blockXMiddle(9), blockYMiddle(9),//p0 x, y
            blockXMiddle(6), blockYMiddle(6),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + (r * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) + (r * Math.sin(Math.PI / 4) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    1/Math.sqrt(2), 1/Math.sqrt(2)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(16,//bottom left corner 45 degree
            blockXMiddle(5), blockYMiddle(9),//p0 x, y
            blockXMiddle(8), blockYMiddle(6),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - (r * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) + (r * Math.sin(Math.PI / 4) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    -1/Math.sqrt(2), 1/Math.sqrt(2)//normal x, y
                ),
            ]
        ),
        //#endregion





        //#region corners along axis 17-20
        new Collision.Tests.Test(17,//top left corner along x
            blockXMiddle(5), blockYMiddle(7) - (h2 + 7/8 * r),//p0 x, y
            blockXMiddle(8), blockYMiddle(7) - (h2 + 7/8 * r),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - (Math.sqrt(r * r - (7/8 * r) ** 2) + w2), blockYMiddle(7) - (h2 + 7/8 * r),//hitPos x, y
                    7, 7,//hitTile x, y
                    -Math.sqrt(1 - (7/8) ** 2), -7/8//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(18,//top right corner along y
            blockXMiddle(7) + (w2 + 7/8 * r), blockYMiddle(5),//p0 x, y
            blockXMiddle(7) + (w2 + 7/8 * r), blockYMiddle(8),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + (w2 + 7/8 * r), blockYMiddle(7) - (Math.sqrt(r * r - (7/8 * r) ** 2) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    7/8, -Math.sqrt(1 - (7/8) ** 2)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(19,//bottom right corner along -x
            blockXMiddle(9), blockYMiddle(7) + (h2 + 7/8 * r),//p0 x, y
            blockXMiddle(6), blockYMiddle(7) + (h2 + 7/8 * r),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + (Math.sqrt(r * r - (7/8 * r) ** 2) + w2), blockYMiddle(7) + (h2 + 7/8 * r),//hitPos x, y
                    7, 7,//hitTile x, y
                    Math.sqrt(1 - (7/8) ** 2), 7/8//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(20,//bottom left corner along -y
            blockXMiddle(7) - (w2 + 7/8 * r), blockYMiddle(9),//p0 x, y
            blockXMiddle(7) - (w2 + 7/8 * r), blockYMiddle(6),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - (w2 + 7/8 * r), blockYMiddle(7) + (Math.sqrt(r * r - (7/8 * r) ** 2) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    -7/8, Math.sqrt(1 - (7/8) ** 2)//normal x, y
                ),
            ]
        ),
        //#endregion





        //#region corners 30 degree 21-24
        new Collision.Tests.Test(21,//top left corner 30 degree
            blockLeft(7) - (Math.cos(Math.PI / 6) * 2 * w), blockTop(7) - (Math.sin(Math.PI / 6) * 2 * h),//p0 x, y
            blockLeft(7) + (Math.cos(Math.PI / 6) * 2 * w), blockTop(7) + (Math.sin(Math.PI / 6) * 2 * h),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - (r * Math.cos(Math.PI / 6) + w2), blockYMiddle(7) - (r * Math.sin(Math.PI / 6) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    -Math.cos(Math.PI / 6), -Math.sin(Math.PI / 6)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(22,//top right corner 30 degree
            blockRight(7) + (Math.sin(Math.PI / 6) * 2 * w), blockTop(7) - (Math.cos(Math.PI / 6) * 2 * h),//p0 x, y
            blockRight(7) - (Math.sin(Math.PI / 6) * 2 * w), blockTop(7) + (Math.cos(Math.PI / 6) * 2 * h),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + (r * Math.sin(Math.PI / 6) + w2), blockYMiddle(7) - (r * Math.cos(Math.PI / 6) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    Math.sin(Math.PI / 6), -Math.cos(Math.PI / 6)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(23,//bottom right corner 30 degree
            blockRight(7) + (Math.cos(Math.PI / 6) * 2 * w), blockBottom(7) + (Math.sin(Math.PI / 6) * 2 * h),//p0 x, y
            blockRight(7) - (Math.cos(Math.PI / 6) * 2 * w), blockBottom(7) - (Math.sin(Math.PI / 6) * 2 * h),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + (r * Math.cos(Math.PI / 6) + w2), blockYMiddle(7) + (r * Math.sin(Math.PI / 6) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    Math.cos(Math.PI / 6), Math.sin(Math.PI / 6)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(24,//bottom left corner 30 degree
            blockLeft(7) - (Math.sin(Math.PI / 6) * 2 * w), blockBottom(7) + (Math.cos(Math.PI / 6) * 2 * h),//p0 x, y
            blockLeft(7) + (Math.sin(Math.PI / 6) * 2 * w), blockBottom(7) - (Math.cos(Math.PI / 6) * 2 * h),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - (r * Math.sin(Math.PI / 6) + w2), blockYMiddle(7) + (r * Math.cos(Math.PI / 6) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    -Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)//normal x, y
                ),
            ]
        ),
        //#endregion





        //#region edges (small) 25-28
        new Collision.Tests.Test(25,//left edge small
            blockXMiddle(7) - (r + w2) - halfFrameDistance, blockYMiddle(7),//p0 x, y
            blockXMiddle(7) - (r + w2) + halfFrameDistance, blockYMiddle(7),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - w2 - r, blockYMiddle(7),//hitPos x, y
                    7, 7,//hitTile x, y
                    -1, 0//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(26,//right edge small
            blockXMiddle(7) + (r + w2) + halfFrameDistance, blockYMiddle(7),//p0 x, y
            blockXMiddle(7) + (r + w2) - halfFrameDistance, blockYMiddle(7),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + w2 + r, blockYMiddle(7),//hitPos x, y
                    7, 7,//hitTile x, y
                    1, 0//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(27,//top edge small
            blockXMiddle(7), blockYMiddle(7) - (r + h2) - halfFrameDistance,//p0 x, y
            blockXMiddle(7), blockYMiddle(7) - (r + h2) + halfFrameDistance,//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7), blockYMiddle(7) - w2 - r,//hitPos x, y
                    7, 7,//hitTile x, y
                    0, -1//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(28,//bottom edge small
            blockXMiddle(7), blockYMiddle(7) + (r + h2) + halfFrameDistance,//p0 x, y
            blockXMiddle(7), blockYMiddle(7) + (r + h2) - halfFrameDistance,//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7), blockYMiddle(7) + h2 + r,//hitPos x, y
                    7, 7,//hitTile x, y
                    0, 1//normal x, y
                ),
            ]
        ),
        //#endregion





        //#region edges (small, end touching edge) 29-32
        new Collision.Tests.Test(29,//left edge end touching edge small
            blockXMiddle(7) - w2 - r - frameDistance, blockYMiddle(7),//p0 x, y
            blockXMiddle(7) - w2 - r, blockYMiddle(7),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - w2 - r, blockYMiddle(7),//hitPos x, y
                    7, 7,//hitTile x, y
                    -1, 0//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(30,//right edge end touching edge small
            blockXMiddle(7) + w2 + r + frameDistance, blockYMiddle(7),//p0 x, y
            blockXMiddle(7) + w2 + r, blockYMiddle(7),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + w2 + r, blockYMiddle(7),//hitPos x, y
                    7, 7,//hitTile x, y
                    1, 0//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(31,//top edge end touching edge small
            blockXMiddle(7), blockYMiddle(7) - w2 - r - frameDistance,//p0 x, y
            blockXMiddle(7), blockYMiddle(7) - w2 - r,//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7), blockYMiddle(7) - w2 - r,//hitPos x, y
                    7, 7,//hitTile x, y
                    0, -1//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(32,//bottom edge end touching edge small
            blockXMiddle(7), blockYMiddle(7) + h2 + r + frameDistance,//p0 x, y
            blockXMiddle(7), blockYMiddle(7) + h2 + r,//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7), blockYMiddle(7) + h2 + r,//hitPos x, y
                    7, 7,//hitTile x, y
                    0, 1//normal x, y
                ),
            ]
        ),
        //#endregion





        //#region edges end touching edge (miss) small 33-36
        new Collision.Tests.Test(33,//left edge end touching edge (miss) small
            blockXMiddle(7) - w2 - r - 5e-9 - frameDistance, blockYMiddle(7),//p0 x, y
            blockXMiddle(7) - w2 - r - 5e-9, blockYMiddle(7),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                //none
            ]
        ),
        new Collision.Tests.Test(34,//right edge end touching edge (miss) small
            blockXMiddle(7) + w2 + r + 5e-9 + frameDistance, blockYMiddle(7),//p0 x, y
            blockXMiddle(7) + w2 + r + 5e-9, blockYMiddle(7),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                //none
            ]
        ),
        new Collision.Tests.Test(35,//top edge end touching edge (miss)
            blockXMiddle(7), blockYMiddle(7) - w2 - r - 5e-9 - frameDistance,//p0 x, y
            blockXMiddle(7), blockYMiddle(7) - w2 - r - 5e-9,//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                //none
            ]
        ),
        new Collision.Tests.Test(36,//bottom edge end touching edge (miss)
            blockXMiddle(7), blockYMiddle(7) + h2 + r + 5e-9 + frameDistance,//p0 x, y
            blockXMiddle(7), blockYMiddle(7) + h2 + r + 5e-9,//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                //none
            ]
        ),
        //#endregion





        //#region corners 45 degree small 37-40
        new Collision.Tests.Test(37,//top left corner 45 degree small
            blockXMiddle(7) - ((r + halfFrameDistance) * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) - ((r + halfFrameDistance) * Math.sin(Math.PI / 4) + h2),//p0 x, y
            blockXMiddle(7) - ((r - halfFrameDistance) * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) - ((r - halfFrameDistance) * Math.sin(Math.PI / 4) + h2),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - (r * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) - (r * Math.sin(Math.PI / 4) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    -1/Math.sqrt(2), -1/Math.sqrt(2)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(38,//top right corner 45 degree small
            blockXMiddle(7) + ((r + halfFrameDistance) * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) - ((r + halfFrameDistance) * Math.sin(Math.PI / 4) + h2),//p0 x, y
            blockXMiddle(7) + ((r - halfFrameDistance) * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) - ((r - halfFrameDistance) * Math.sin(Math.PI / 4) + h2),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + (r * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) - (r * Math.sin(Math.PI / 4) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    1/Math.sqrt(2), -1/Math.sqrt(2)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(39,//bottom right corner 45 degree
            blockXMiddle(7) + ((r + halfFrameDistance) * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) + ((r + halfFrameDistance) * Math.sin(Math.PI / 4) + h2),//p0 x, y
            blockXMiddle(7) + ((r - halfFrameDistance) * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) + ((r - halfFrameDistance) * Math.sin(Math.PI / 4) + h2),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + (r * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) + (r * Math.sin(Math.PI / 4) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    1/Math.sqrt(2), 1/Math.sqrt(2)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(40,//bottom left corner 45 degree
            blockXMiddle(7) - ((r + halfFrameDistance) * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) + ((r + halfFrameDistance) * Math.sin(Math.PI / 4) + h2),//p0 x, y
            blockXMiddle(7) - ((r - halfFrameDistance) * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) + ((r - halfFrameDistance) * Math.sin(Math.PI / 4) + h2),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - (r * Math.cos(Math.PI / 4) + w2), blockYMiddle(7) + (r * Math.sin(Math.PI / 4) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    -1/Math.sqrt(2), 1/Math.sqrt(2)//normal x, y
                ),
            ]
        ),
        //#endregion





        //#region corners allong axis small 41-44
        new Collision.Tests.Test(41,//top left corner along x small
            blockXMiddle(7) - (Math.sqrt(r ** 2 - (7/8 * r) ** 2) + w2 + halfFrameDistance), blockYMiddle(7) - (h2 + 7/8 * r),//p0 x, y
            blockXMiddle(7) - (Math.sqrt(r ** 2 - (7/8 * r) ** 2) + w2 - halfFrameDistance), blockYMiddle(7) - (h2 + 7/8 * r),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - (Math.sqrt(r * r - (7/8 * r) ** 2) + w2), blockYMiddle(7) - (h2 + 7/8 * r),//hitPos x, y
                    7, 7,//hitTile x, y
                    -Math.sqrt(1 - (7/8) ** 2), -7/8//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(42,//top right corner along y small
            blockXMiddle(7) + (w2 + 7/8 * r), blockYMiddle(7) - (Math.sqrt(r * r - (7/8 * r) ** 2) + h2 + halfFrameDistance),//p0 x, y
            blockXMiddle(7) + (w2 + 7/8 * r), blockYMiddle(7) - (Math.sqrt(r * r - (7/8 * r) ** 2) + h2 - halfFrameDistance),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + (w2 + 7/8 * r), blockYMiddle(7) - (Math.sqrt(r * r - (7/8 * r) ** 2) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    7/8, -Math.sqrt(1 - (7/8) ** 2)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(43,//bottom right corner along -x small
            blockXMiddle(7) + (Math.sqrt(r * r - (7/8 * r) ** 2) + w2 + halfFrameDistance), blockYMiddle(7) + (h2 + 7/8 * r),//p0 x, y
            blockXMiddle(7) + (Math.sqrt(r * r - (7/8 * r) ** 2) + w2 - halfFrameDistance), blockYMiddle(7) + (h2 + 7/8 * r),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + (Math.sqrt(r * r - (7/8 * r) ** 2) + w2), blockYMiddle(7) + (h2 + 7/8 * r),//hitPos x, y
                    7, 7,//hitTile x, y
                    Math.sqrt(1 - (7/8) ** 2), 7/8//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(44,//bottom left corner along -y small
            blockXMiddle(7) - (w2 + 7/8 * r), blockYMiddle(7) + (Math.sqrt(r * r - (7/8 * r) ** 2) + h2 + halfFrameDistance),//p0 x, y
            blockXMiddle(7) - (w2 + 7/8 * r), blockYMiddle(7) + (Math.sqrt(r * r - (7/8 * r) ** 2) + h2 - halfFrameDistance),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - (w2 + 7/8 * r), blockYMiddle(7) + (Math.sqrt(r * r - (7/8 * r) ** 2) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    -7/8, Math.sqrt(1 - (7/8) ** 2)//normal x, y
                ),
            ]
        ),
        //#endregion





        //#region corners 30 degree small 45-48
        new Collision.Tests.Test(45,//top left corner 30 degree
            blockXMiddle(7) - ((r + halfFrameDistance) * Math.cos(Math.PI / 6) + w2), blockYMiddle(7) - ((r + halfFrameDistance) * Math.sin(Math.PI / 6) + h2),//p0 x, y
            blockXMiddle(7) - ((r - halfFrameDistance) * Math.cos(Math.PI / 6) + w2), blockYMiddle(7) - ((r - halfFrameDistance) * Math.sin(Math.PI / 6) + h2),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - (r * Math.cos(Math.PI / 6) + w2), blockYMiddle(7) - (r * Math.sin(Math.PI / 6) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    -Math.cos(Math.PI / 6), -Math.sin(Math.PI / 6)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(46,//top right corner 30 degree
            blockXMiddle(7) + ((r - halfFrameDistance) * Math.sin(Math.PI / 6) + w2), blockYMiddle(7) - ((r + halfFrameDistance) * Math.cos(Math.PI / 6) + h2),//p0 x, y
            blockXMiddle(7) + ((r + halfFrameDistance) * Math.sin(Math.PI / 6) + w2), blockYMiddle(7) - ((r - halfFrameDistance) * Math.cos(Math.PI / 6) + h2),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + (r * Math.sin(Math.PI / 6) + w2), blockYMiddle(7) - (r * Math.cos(Math.PI / 6) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    Math.sin(Math.PI / 6), -Math.cos(Math.PI / 6)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(23,//bottom right corner 30 degree
            blockRight(7) + (Math.cos(Math.PI / 6) * 2 * w), blockBottom(7) + (Math.sin(Math.PI / 6) * 2 * h),//p0 x, y
            blockRight(7) - (Math.cos(Math.PI / 6) * 2 * w), blockBottom(7) - (Math.sin(Math.PI / 6) * 2 * h),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) + (r * Math.cos(Math.PI / 6) + w2), blockYMiddle(7) + (r * Math.sin(Math.PI / 6) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    Math.cos(Math.PI / 6), Math.sin(Math.PI / 6)//normal x, y
                ),
            ]
        ),
        new Collision.Tests.Test(24,//bottom left corner 30 degree
            blockLeft(7) - (Math.sin(Math.PI / 6) * 2 * w), blockBottom(7) + (Math.cos(Math.PI / 6) * 2 * h),//p0 x, y
            blockLeft(7) + (Math.sin(Math.PI / 6) * 2 * w), blockBottom(7) - (Math.cos(Math.PI / 6) * 2 * h),//p1 x, y
            r,//r
            [
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                ".......#........",//7, 7
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................",
                "................" 
            ],//gridArr
            ba.left, ba.top, ba.width, ba.height,//gridRect left, top, width, height
            tc.x, tc.y,//tilesCount x, y
            [
                new Collision.Tests.Collision(
                    blockXMiddle(7) - (r * Math.sin(Math.PI / 6) + w2), blockYMiddle(7) + (r * Math.cos(Math.PI / 6) + h2),//hitPos x, y
                    7, 7,//hitTile x, y
                    -Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)//normal x, y
                ),
            ]
        ),
        //#endregion





        //
    ];
}

Collision.Tests._runTest = (collisionTest, testFunctionNum = null) => {
    const compaireCollisions = (collision, expectedCollision) => {
        collision = Collision.Tests.Collision.fromCollisionObj(collision);
        if (!collision && !expectedCollision)
            return `Pass`;

        if (!collision)
            return `Fail. Expected collision but got none.  Expected: ${expectedCollision}`;

        if (!expectedCollision)
            return `Fail. Expected no collision but got ${collision}`;

        const match = collision.equals(expectedCollision);
        if (match)
            return `Pass`;

        return `Fail. Expected:\n${expectedCollision}, got:\n${collision}`;
    }

    const isSolidTile = (tileX, tileY) => {
        if (tileY < 0 || tileY >= collisionTest.gridArr.length)
            throw new Error(`Tile coordinates out of bounds: (${tileX}, ${tileY})`);

        const row = collisionTest.gridArr[tileY];
        if (tileX < 0 || tileX >= row.length)
            throw new Error(`Tile coordinates out of bounds: (${tileX}, ${tileY})`);

        return row[tileX] === '#';
    }
    const expectedCollision = collisionTest.expectedCollisions[0];

    const tileSize = new Vectors.Vector(collisionTest.gridRect.width / collisionTest.tilesCount.x, collisionTest.gridRect.height / collisionTest.tilesCount.y);

    console.log(`Test ${collisionTest.num}:`);
    if (!testFunctionNum || testFunctionNum === 1) {
        const traverseGridWithCircleCollision = Collision.traverseGridWithCircle(collisionTest.p0, collisionTest.circle, isSolidTile, collisionTest.gridRect, collisionTest.tilesCount);
        const traverseGridWithCircleResult = compaireCollisions(traverseGridWithCircleCollision, expectedCollision);

        if (traverseGridWithCircleResult === 'Pass') {
            console.log(`traverseGridWithCircle: ${traverseGridWithCircleResult}`);
        }
        else {
            console.error(`traverseGridWithCircle: ${traverseGridWithCircleResult}`);
        }
    }
    
    if (!testFunctionNum || testFunctionNum === 2) {
        const traverseGridWithCircleBruteForceCollision = Collision.traverseGridWithCircleBruteForce(collisionTest.p0, collisionTest.circle, isSolidTile, collisionTest.gridRect, collisionTest.tilesCount);
        const traverseGridWithCircleBruteForceResult = compaireCollisions(traverseGridWithCircleBruteForceCollision, expectedCollision);
        
        if (traverseGridWithCircleBruteForceResult === 'Pass') {
            console.log(`traverseGridWithCircleBruteForce: ${traverseGridWithCircleBruteForceResult}`);
        }
        else {
            console.error(`traverseGridWithCircleBruteForce: ${traverseGridWithCircleBruteForceResult}`);
        }
    }

    if (!testFunctionNum || testFunctionNum === 3) {
        const traverseGridWithCircleCollision2 = Collision.traverseGridWithCircle2(collisionTest.p0, collisionTest.circle, isSolidTile, collisionTest.gridRect, collisionTest.tilesCount, tileSize);
        const traverseGridWithCircleCollision2Result = compaireCollisions(traverseGridWithCircleCollision2, expectedCollision);
        
        if (traverseGridWithCircleCollision2Result === 'Pass') {
            console.log(`traverseGridWithCircle2: ${traverseGridWithCircleCollision2Result}`);
        }
        else {
            console.error(`traverseGridWithCircle2: ${traverseGridWithCircleCollision2Result}`);
        }
    }

    console.log('-----------------------------------------------------------------------');
}

Collision.Tests.runAllTests = (testFunctionNum = null) => {
    if (!Collision.Tests.Tests)
        Collision.Tests.makeTests();

    console.log(`\nRunning collision tests...`);
    for (let i = 0; i < Collision.Tests.Tests.length; i++) {
        const collisionTest = Collision.Tests.Tests[i];
        if (collisionTest.ignore)
            continue;
        
        Collision.Tests._runTest(collisionTest, testFunctionNum);
    }

    console.log(`Completed collision tests.\n`);
}

Collision.Tests.runTest = (num, testFunctionNum = null) => {
    if (!Collision.Tests.Tests)
        Collision.Tests.makeTests();

    const collisionTestByIndex = Collision.Tests.Tests[num];
    if (collisionTestByIndex && collisionTestByIndex.num === num) {
        Collision.Tests._runTest(collisionTestByIndex, testFunctionNum);
        return;
    }

    const collisionTest = Collision.Tests.Tests.find(test => test.num === num);
    if (collisionTest) {
        Collision.Tests._runTest(collisionTest, testFunctionNum);
        return;
    } else {
        console.error(`Test ${num} not found.`);
        return;
    }
}

// Collision.solveY = (p0, x, mY) => {
//     //y = (x - x0)(y1 - y0)/(x1 - x0) + y0
//     return mY * (x - p0.x) + p0.y;
// }

// Collision.getLeftLineYIndex = (leftP0, xIndex, mY, gridTopLeft, tileSize) => {
//     //const x = gridTopLeft.x + tileSize.x * (xIndex + mYGreaterEqualZero);
//     const x = gridTopLeft.x + tileSize.x * (xIndex + 1);

//     //Direction must be positive y
//     //The left line is the top bound for y indices
//     //x needs to the right edge of the block, or the right-most x in bounds.

//     //When mY >= 0, checking bottom right corner
//     //When mY < 0,  checking bottom left corner

//     //Inclusive, do for (y = start; y <= end; y++) where this is the start

//     //top: 56
//     //invTileHeight: 1/53
//     //y = 108:
//     //yIndex = (108 - 56) * 1/53 = 52 * 1/53 = 0.98, needs to be 0
//     //Math.floor(0.98) = 0, good

//     //y = 109
//     //yIndex = (109 - 56) * 1/53 = 53 * 1/53 = 1, needs to be 1 (not inclusive of corner to line hits)
//     //Math.floor(1) = 1, good

//     //y = 110
//     //yIndex = (110 - 56) * 1/53 = 54 * 1/53 = 1.02, needs to be 1
//     //Math.floor(1.02) = 1, good

//     const y = mY * (x - leftP0.x) + leftP0.y;
//     const yIndex = Math.floor((y - gridTopLeft.y) / tileSize.y);
//     return yIndex;
// }

// Collision.getRightLineYIndex = (rightP0, xIndex, mY, gridTopLeft, tileSize) => {
//     //const x = gridTopLeft.x + tileSize.x * (xIndex + 1 - mYGreaterEqualZero);
//     const x = gridTopLeft.x + tileSize.x * xIndex;

//     //Direction must be negative y
//     //The right line is the bottom bound for y indices
//     //x needs to the left edge of the block, or the left-most x in bounds.

//     //When mY >= 0, checking top left corner
//     //When mY < 0,  checking top right corner

//     //Inclusive, do for (y = start; y <= end; y++) where this is the end

//     //top: 56
//     //invTileHeight: 1/53
//     //y = 108:
//     //yIndex = (108 - 56) * 1/53 = 52 * 1/53 = 0.98, needs to be 0
//     //Math.ceil(0.98) - 1 = 0, good

//     //y = 109:
//     //yIndex = (109 - 56) * 1/53 = 53 * 1/53 = 1, needs to be 0 (not inclusive of corner to line hits)
//     //Math.ceil(1) - 1 = 0, good

//     //y = 110:
//     //yIndex = (110 - 56) * 1/53 = 54 * 1/53 = 1.02, needs to be 1
//     //Math.ceil(1.02) - 1 = 1, good

//     const y = mY * (x - rightP0.x) + rightP0.y;
//     const yIndex = Math.ceil((y - gridTopLeft.y) / tileSize.y) - 1;
//     return yIndex;
// }

// Collision.getTriangleStartXIndex = (leftP0, gridLeft, tileWidth) => {
//     //Not inclusive of the block leftP0 is in.  Not inclusinve of either block if on a line.

//     const x = leftP0.x;
//     //x: 108
//     //xIndex = (108 - 56) / 53 = 52/53 = 0.98, needs to be 1
//     //Math.floor(0.98) + 1 = 1

//     //x: 109
//     //xIndex = (109 - 56) / 53 = 1, needs to be 2
//     //Math.floor(1) + 1 = 2

//     //x: 110
//     //xIndex = (110 - 56) / 53 = 1.02, needs to be 2
//     //Math.floor(1.02) + 1 = 2

//     const xIndex = Math.floor((x - gridLeft.x) / tileWidth.x) + 1;
//     return xIndex;
// }

// Collision.getTriangleEndXIndex = (rightP0, gridLeft, tileWidth) => {
//     //Inclusive.  
//     //The next piece is non-inclusive, assuming the triangular section already covered the line between the triangle right 
//     // and the main area's left edge.

//     const x = rightP0.x;
//     //x: 108
//     //xIndex = (108 - 56) / 53 = 52/53 = 0.98, needs to be 0
//     //Math.floor(0.98) = 0, good
    
//     //x: 109
//     //xIndex = (109 - 56) / 53 = 1, needs to be 1
//     //Math.floor(1) = 1, good

//     //x: 110
//     //xIndex = (110 - 56) / 53 = 1.02, needs to be 1
//     //Math.floor(1.02) = 1, good

//     const xIndex = Math.floor((x - gridLeft.x) / tileWidth.x);
//     return xIndex;
// }

// Collision.getStartXIndex = (rightP0, gridLeft, tileWidth) => {
//     //Non-inclusive
//     //The lower part of the left edge is the non-included rectangle that is fully inside the circle.
//     //The top part of the left edge should be handled by the triangular section

//     //x: 108
//     //xIndex = (108 - 56) / 53 = 52/53 = 0.98, needs to be 1
//     //Math.floor(0.98) + 1 = 1, good

//     //x: 109
//     //xIndex = (109 - 56) / 53 = 1, needs to be 2
//     //Math.floor(1) + 1 = 2, good

//     //x: 110
//     //xIndex = (110 - 56) / 53 = 1.02, needs to be 2
//     //Math.floor(1.02) + 1 = 2, good

//     const xIndex = Math.floor((rightP0.x - gridLeft.x) / tileWidth.x) + 1;
//     return xIndex;
// }

// Collision.getEndXIndex = (p1, r, gridLeft, tileWidth) => {
//     //Inclusive
//     //With the end index from this function, you need to subtract 1 when using the left and right lines for bounds.
//     //The very last block is bound by the top (bottom) of the circle at p1 and the right (left) line when t == 1 instead of the lines.

//     const x = p1.x + r;

//     //x: 108
//     //xIndex = (108 - 56) / 53 = 52/53 = 0.98, needs to be 0
//     //Math.floor(0.98) = 0, good

//     //x: 109
//     //xIndex = (109 - 56) / 53 = 1, needs to be 1
//     //Math.floor(1) = 1, good

//     //x: 110
//     //xIndex = (110 - 56) / 53 = 1.02, needs to be 1
//     //Math.floor(1.02) = 1, good

//     const xIndex = Math.floor((x - gridLeft.x) / tileWidth.x);
//     return xIndex;
// }

// Collision.getTriangleStartYIndex = (leftP0, gridTop, tileHeight) => {
//     //Even though in an ideal world, the previous tick should have caught if a ball was exactly touching a block.
//     //The current check should also check for this.
//     //For instance, if you start a ball touching a block and moving towards it, it would pass through without this check.
//     //Changes needed to acomplish this:
//     //  The top of the excluded area actually needs to not be excluded because of the top left point being exactly on the circle.
//     //  All other points on the circle between the left and right lines are already included, so no other changes should be needed.


// }

// //Will never be used because input is rotated to make x the independent variable
// // Collision.solveX = (p0, y, mX) => {
// //     //x = (y - y0)(x1 - x0)/(y1 - y0) + x0
// //     return mX * (y - p0.y) + p0.x;
// // }

// Collision.positionToTileXIndex = (x, gridLeft, tileWidth) => {
//     //Assumes direction is positive x
//     return Math.floor((x - gridLeft) / tileWidth);
// }

// Collision.positionToTileYIndex = (y, gridTop, tileHeight) => {
//     //Assumes direction is positive y
//     return Math.floor((y - gridTop) / tileHeight);
// }

// Collision.traverseGridWithCircleLinesInner = (p0, p1, r, isSolidTile, gridRect, tilesCount, tileSize) => {
//     //Math will be done as if between 0 and +45 degrees with the independent variable being x.
//     //Inputs and outputs will be rotated

//     const p1 = new Vectors.Vector(circle.x, circle.y);
//     const r = circle.r;

//     // Calculate the lines:
//     const d = p1.subtract(p0);
//     const dNorm = normalize(d);

//     // dRight = perpRight(d) * r
//     // dLeft = perpLeft(d) * r
//     const dRight = dNorm.perpRight.multiplyI(r);
//     const dLeft = dNorm.perpLeft.multiplyI(r);

//     // rightP0 = p0 + dRight
//     // rightP1 = p1 + dRight
//     const rightP0 = p0.add(dRight);
//     const rightP1 = p1.add(dRight);

//     // leftP0 = p0 + dLeft
//     // leftP1 = p1 + dLeft
//     const leftP0 = p0.add(dLeft);
//     const leftP1 = p1.add(dLeft);

//     // Equations:
//     // Use x to get y
//     // y = (x - x0)(y1 - y0)/(x1 - x0) + y0//For these you only need 1 point, so don't need to calculate rightP1 or leftP1 unless using them elsewhere.
//     const mY = d.y / d.x;

//     if (mY <= 0 || d.x > d.y)
//         throw new Error(`traverseGridWithCircleLinesInner() only supports angles between 0 and 45 degrees.  mY: ${mY}.  Must rotate/fold the input.`);

//     //Will never be used because input is rotated to make x the independent variable
//     // // Use y to get x
//     // // x = (y - y0)(x1 - x0)/(y1 - y0) + x0
//     // const mX = d.x / d.y;
    
//     // There is a rectangular region that can be ignored because it is inside the ball -> ignoring it won't cause a miss.
//     // 'below' leftP0.x and 'left' of rightP0.y

//     //Handle the triangle
//     //The triangle is a right triangle that has the tip on the left, and the edge on the right.
//     //The left tip is leftP0, the right bottom corner is (rightP0.x, leftP0.y)
//     //The x bounds are between leftP0.x and rightP0.x, the y bounds are between leftP0.y (below) and the left line (above) which is y = mY * (x - leftP0.x) + leftP0.y
//     //The left tip X is the starting x index
//     //triangleStartX should not include the block it is in including if it is touching a line.
//     const triangleStartX = Collision.positionToTileXIndex(leftP0.x, gridRect.left, tileSize.x);
//     //Don't need to include end on this one.  It's taken care of by the main check
//     const triangleEndX = Collision.positionToTileXIndex(rightP0.x, gridRect.left, tileSize.x);

//     //Do not include exact hits on the lines.
//     //If a corner above/left is touching the left line or corner below/right is touching the right line, do not count as a hit.
//     //This is because traveling strait when the line touches a bottom edge will also not be considered a collision,
//     // so it should be consistent.

//     // //For instance, if choosing x and iterating y, You would start with the lowest x in bounds, 
//     // // then go from lowest to highest y checking them for collisions, using the 2 line equations to get the top and bottom y indexes.

//     // The very first chunck should be done seperately as a tryangle 'above' or to the 'right' of the ignored zone.  It is the same as the rest
//     // except that it's bound by the ignored zone on the bottom (left) instead of the lines.

//     // For the remainder, get the next x (y) index.  Calculate the start and end y (x) index and check them for collisions.  
//     // If the next x (y) index requires a t higher than the current shortest, stop.

//     // The end is bound by t == 1, aka, (p1.x + r, p1.y + r).  










//     // Notes:
//     // Nice part about the 2 lines method is that if a line crosses a block, it is a collision, so you know the exact blocks that will be collisions if they are solid, just need to calculate the t.
//     // Maybe a check order that will garuntee you check the closest one first so you can break instead of checking the rest of the row/column?
//     // I would need to make a 'segment intercects cube/rectangle' function.

//     // For direct corner hits on a boundary such as 109 (hits both block 0 and 1), I expect the direct hit to be on the one in the direction of travel or default to top if dy == 0.
// }

// Collision.traverseGridWithCircleLines = (p0, circle, isSolidTile, gridRect, tilesCount, tileSize) => {
//     //Need to fold the input an extra time.  Instead of feeding in -45 degree to 45 degree, need to feed in 0 to 45 degree

//     const p1 = new Vectors.Vector(circle.x, circle.y);
//     const r = circle.r;
//     // Calculate the lines:

//     const d = p1.subtract(p0);
//     const dNorm = normalize(d);

//     // dRight = perpRight(d) * r
//     // dLeft = perpLeft(d) * r
//     const dRight = dNorm.perpRight.multiplyI(r);
//     const dLeft = dNorm.perpLeft.multiplyI(r);

//     // rightP0 = p0 + dRight
//     // rightP1 = p1 + dRight
//     const rightP0 = p0.add(dRight);
//     const rightP1 = p1.add(dRight);

//     // leftP0 = p0 + dLeft
//     // leftP1 = p1 + dLeft
//     const leftP0 = p0.add(dLeft);
//     const leftP1 = p1.add(dLeft);

//     // Equations:
//     // Use x to get y
//     // y = (x - x0)(y1 - y0)/(x1 - x0) + y0//For these you only need 1 point, so don't need to calculate rightP1 or leftP1 unless using them elsewhere.
//     const mY = d.y / d.x;

//     // Use y to get x
//     // x = (y - y0)(x1 - x0)/(y1 - y0) + x0
//     const mX = d.x / d.y;

//     // Pick if doing x or y indexes:
//     // You want to be picking rows/columns with the lower number of blocks
//     // |\----/|
//     // ||\--/||
//     // |||\/|||
//     // |||/\|||
//     // ||/--\||
//     // |/----\|
//     // if (abs(dx) >= abs(dy)) {
//     //     //Choose x and iterate y
//     // }
//     // else {
//     //     //Choose y and iterate x
//     // }

//     const independentAxisIsX = Math.abs(d.x) >= Math.abs(d.y);

//     //Math will be done as if between +45 and -45 degrees with the independent variable being x.
//     //Inputs and outputs will be rotated

//     //90 degree rotations:
//     //0: (x, y)         ID: 0
//     //90: (-y, x)       ID: 1
//     //180: (-x, -y)     ID: 2
//     //270: (y, -x)      ID: 3

//     //After rotating, need to reflect if dy is negative to make it between 0 and 45 degrees.

//     const positiveXDirection = d.x >= 0;
//     const positiveYDirection = d.y >= 0;
//     const rotationID = (positiveXDirection << 1) | positiveYDirection;
//     let rotP0;
//     let rotP1;
//     let rotD;
//     let rotIsSolidTile;
//     //let rotGridTopLeft;
//     let rotTilesCount;
//     let rotTileSize;
//     let dyIsNegative;
//     switch (rotationID) {
//         case 0:
//             dyIsNegative = d.y < 0;
//             if (dyIsNegative) {
//                 //Do nothing
//                 rotP0 = p0.negateY;
//                 rotP1 = p1.negateY;
//                 rotIsSolidTile = (tileX, tileY) => isSolidTile(tileX, tilesCount.y - tileY);
//                 //rotGridTopLeft = new Vectors.Vector(gridRect.left, -gridRect.top);//I don't think this is right
//                 rotTilesCount = tilesCount;
//                 rotTileSize = tileSize;
//             }
//             else {
//                 //Do nothing
//                 rotP0 = p0;
//                 rotP1 = p1;
//                 rotIsSolidTile = isSolidTile;
//                 //rotGridTopLeft = new Vectors.Vector(gridRect.left, gridRect.top);
//                 rotTilesCount = tilesCount;
//                 rotTileSize = tileSize;
//             }

//             break;
//         case 1:
//             //TODO: rotate inputs 90 degrees (y, -x)
//             //perpLeft, (-y, x)
//             dyIsNegative = d.x < 0;
//             if (dyIsNegative) {
//                 //rotate, perpLeft, (-y, x)
//                 //And invert new y, (-y, -x), negateSwap
//                 rotP0 = p0.negateSwap;//Probably not correct.  Need to rotate around the grid center?  Probably just change the whole reference frame
//                 //So that it's doing tile indexes from -8 to 8 and points are using the grid center as the zero point?
//                 rotP1 = p1.negateSwap;
//                 rotIsSolidTile = (tileX, tileY) => isSolidTile(tilesCount.y - tileY, tilesCount.x - tileX);
//                 rotTilesCount = tilesCount.swap;
//                 rotTileSize = tileSize.swap;
//             }
//             else {
//                 //Just rotate
//                 //perpLeft, (-y, x)
//                 rotP0 = p0.perpLeft;
//                 rotP1 = p1.perpLeft;
//                 rotIsSolidTile = (tileX, tileY) => isSolidTile(tilesCount.y - tileY, tileX);
//                 rotTilesCount = tilesCount.swap;
//                 rotTileSize = tileSize.swap;
//             }

//             break;
//         case 2:
//             //TODO: rotate inputs 180 degrees (-x, -y)
//             //negate, (-x, -y)
//             dyIsNegative = rotD.y < 0;
//             if (dyIsNegative) {

//             }

//             break;
//         case 3:
//             //TODO: rotate inputs 270 degrees (-y, x)
//             //perpRight, (y, -x)
//             dyIsNegative = rotD.y < 0;
//             if (dyIsNegative) {

//             }

//             break;
//         default:
//             throw new Error(`Invalid rotation ID: ${rotationID}`);
//     }

    

//     //TODO: rotate the inputs
//     const rotatedCollision = Collision.traverseGridWithCircleInner(p0, p1, r, isSolidTile, gridRect, tilesCount, tileSize);

//     //TODO: de-rotate the result

//     return rotatedCollision;
// }