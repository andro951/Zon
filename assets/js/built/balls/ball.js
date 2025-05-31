"use strict";

Zon.Ball = class extends Struct.Circle {
    constructor(x, y, speed = 12, angle) {
        super(x, y, 16);
        this.canvas = document.getElementById('combatAreaCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.velocity = Vectors.Vector.fromPolar(speed, angle);
        this.speed = speed;
        this.lastPosition = new Vectors.Vector(0, 0);//Only updated when updateBallLastPosition() is called
        this.color = 'white';
        //this.color = 'red';
    }

    get damage() {
        return Numbers.Triple.create(10n, 0n);
    }

    correctVelocity = () => {
        this.velocity.magnitude = this.speed;
    }

    update = () => {
        const oldX = this.x;
        const oldY = this.y;
        //const originalVelocityX = this.velocity.x;
        //const originalVelocityY = this.velocity.y;
        let hadBlockCollision = false;
        const lastPos = new Vectors.Vector(this.x, this.y);
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        let collided = false;
        const epsilon = 1e-6;
        let count = 0;
        do {
            collided = false;
            const gridCollision = Collision.traverseGridWithCircle(lastPos, this, Zon.blocksManager.tileHasBlock, Zon.blocksManager.blockArea, Zon.blocksManager.tileCount);
            if (gridCollision) {
                collided = true;
                const {
                    tileX,
                    tileY,
                    hitX,
                    hitY,
                    directionOfHit,
                } = gridCollision;
                
                lastPos.x = hitX;
                lastPos.y = hitY;

                this.x = 2 * hitX - this.x;
                this.y = 2 * hitY - this.y;
                const oldVelocity = this.velocity;
                this.velocity = this.velocity.reflect(directionOfHit.perpendicular);
                this.varyReflectionAngle(directionOfHit);
                if (zonDebug) {
                    //console.log(`Ball hit block ${tileX}, ${tileY}: current: (${this.x}, ${this.y}), old: (${oldX}, ${oldY}), oldVelocity: (${oldVelocity.x}, ${oldVelocity.y}), newVelocity: (${this.velocity.x}, ${this.velocity.y}), count: ${count}, hadBlockCollision: ${hadBlockCollision}`);
                }
                
                if (oldVelocity.x === this.velocity.x && oldVelocity.y === this.velocity.y)
                    throw new Error(`Ball velocity did not change after collision with block ${tileX}, ${tileY}: current: (${this.x}, ${this.y}), old: (${oldX}, ${oldY}), oldVelocity: (${oldVelocity.x}, ${oldVelocity.y}), newVelocity: (${this.velocity.x}, ${this.velocity.y}), count: ${count}, hadBlockCollision: ${hadBlockCollision}`);
                
                if (zonDebug) {
                    if (directionOfHit.x !== 0 && directionOfHit.y !== 0) {
                        if (directionOfHit.x === -1 && this.velocity.x < 0)
                            console.warn(`Ball reversed back into left wall: (${this.x}, ${this.y}), old: (${oldVelocity.x}, ${oldVelocity.y}), new: (${this.velocity.x}, ${this.velocity.y})`);

                        if (directionOfHit.x === 1 && this.velocity.x > 0)
                            console.warn(`Ball reversed back into right wall: (${this.x}, ${this.y}), old: (${oldVelocity.x}, ${oldVelocity.y}), new: (${this.velocity.x}, ${this.velocity.y})`);

                        if (directionOfHit.y === -1 && this.velocity.y < 0)
                            console.warn(`Ball reversed back into top wall: (${this.x}, ${this.y}), old: (${oldVelocity.x}, ${oldVelocity.y}), new: (${this.velocity.x}, ${this.velocity.y})`);

                        if (directionOfHit.y === 1 && this.velocity.y > 0)
                            console.warn(`Ball reversed back into bottom wall: (${this.x}, ${this.y}), old: (${oldVelocity.x}, ${oldVelocity.y}), new: (${this.velocity.x}, ${this.velocity.y})`);
                    }
                }

                this.hitBlock(tileX, tileY);
                hadBlockCollision = true;

                //If ball killed the last block, it will trigger the ballManager to move them to the starting location
                if (Zon.BallManager.ballsInStartingLocation)
                    return;
            }

            if (!collided) {
                const hitWall = this.checkWallCollision(lastPos);
                collided ||= hitWall;
                if (hitWall) {
                    Zon.BallManager.onBallCollisionWithNonHealthObject(this);
                }
            }

            if (zonDebug) {
                if (collided && count > 1) {
                    const dx = this.x - lastPos.x;
                    const dy = this.y - lastPos.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len < epsilon) {
                        collided = false;
                    }
                    else {
                        if (zonDebug) {
                            console.log(`len: ${len}, dx: ${dx}, dy: ${dy}, lastPos: ${lastPos.x}, ${lastPos.y}, x: ${this.x}, y: ${this.y}`);
                        }
                    }
                }

                count++;
                if (count >= 100) {
                    console.warn('Potential infinite loop detected');
                    break;
                }
            }
        } while (collided);

        // const tileWidth = Zon.blocksManager.blockArea.width / Zon.blocksManager.tileCount.x;
        // const tileHeight = Zon.blocksManager.blockArea.height / Zon.blocksManager.tileCount.y;
        // for (let tX = 0; tX < Zon.blocksManager.tileCount.x; tX++) {
        //     for (let tY = 0; tY < Zon.blocksManager.tileCount.y; tY++) {
        //         if (!Zon.blocksManager.tileHasBlock(tX, tY))
        //             continue;

        //         for (let x = 0; x <= 1; x++) {
        //             for (let y = 0; y <= 1; y++) {
        //                 const blockWorldX = (tX + x) * tileWidth + Zon.blocksManager.blockArea.left;
        //                 const blockWorldY = (tY + y) * tileHeight + Zon.blocksManager.blockArea.top;
        //                 const previousDistance = Math.sqrt((oldX - blockWorldX) ** 2 + (oldY - blockWorldY) ** 2);
        //                 const distance = Math.sqrt((this.x - blockWorldX) ** 2 + (this.y - blockWorldY) ** 2);
        //                 if (previousDistance < this.radius) {
        //                     console.error(`Ball was already inside block ${tX}, ${tY}: current: (${this.x}, ${this.y}), old: (${oldX}, ${oldY}), (${blockWorldX}, ${blockWorldY}), oldDistance: ${previousDistance}, distance: ${distance}, radius: ${this.radius}, velocity: (${this.velocity.x}, ${this.velocity.y}), oldVelocity: (${originalVelocityX}, ${originalVelocityY}), count: ${count}, hadBlockCollision: ${hadBlockCollision}`);
        //                 }

        //                 if (distance < this.radius) {
        //                     console.error(`Ball is inside block ${tX}, ${tY}: current: (${this.x}, ${this.y}), old: (${oldX}, ${oldY}), (${blockWorldX}, ${blockWorldY}), oldDistance: ${previousDistance}, distance: ${distance}, radius: ${this.radius}, velocity: (${this.velocity.x}, ${this.velocity.y}), oldVelocity: (${originalVelocityX}, ${originalVelocityY}), count: ${count}, hadBlockCollision: ${hadBlockCollision}`);
        //                 }
        //             }
        //         }
        //     }
        // }
    }

    checkWallCollision = (lastPos) => {
        let xDir = null;
        let yDir = null;
        const leftDx = this.x - this.radius;
        if (leftDx <= 0) {
            const dx = this.x - lastPos.x;
            if (dx !== 0) {
                lastPos.y += Math.abs((this.radius - lastPos.x) / dx) * (this.y - lastPos.y);
            }

            lastPos.x = this.radius;
            this.x = this.radius - leftDx;
            xDir = -1;
        }
        else {
            const rightDx = this.canvas.width - this.x - this.radius;
            if (rightDx <= 0) {
                const dx = this.x - lastPos.x;
                if (dx !== 0) {
                    lastPos.y += Math.abs((this.canvas.width - this.radius - lastPos.x) / dx) * (this.y - lastPos.y);
                }

                lastPos.x = this.canvas.width - this.radius;
                this.x = this.canvas.width - this.radius + rightDx;
                xDir = 1;
            }
        }

        const topDy = this.y - this.radius;
        if (topDy <= 0) {
            const dy = this.y - lastPos.y;
            if (dy !== 0) {
                const xAdd = Math.abs((this.radius - lastPos.y) / dy) * (this.x - lastPos.x);
                lastPos.x += xAdd;
            }

            lastPos.y = this.radius;
            this.y = this.radius - topDy;
            yDir = -1;
        }
        else {
            const bottomDy = this.canvas.height - this.y - this.radius;
            if (bottomDy <= 0) {
                const dy = this.y - lastPos.y;
                if (dy !== 0) {
                    lastPos.x += Math.abs((this.canvas.height - this.radius - lastPos.y) / dy) * (this.x - lastPos.x);
                }

                lastPos.y = this.canvas.height - this.radius;
                this.y = this.canvas.height - this.radius + bottomDy;
                yDir = 1;
            }
        }

        if (xDir || yDir) {
            const direction = new Vectors.Vector(xDir ?? 0, yDir ?? 0);
            const oldVelocity = this.velocity;
            this.velocity = this.velocity.reflect(direction.perpendicular);
            if (zonDebug && direction.x !== 0 && direction.y !== 0) {
                if (direction.x === -1 && this.velocity.x < 0)
                    console.warn(`Ball reversed back into left wall: (${this.x}, ${this.y}), old: (${oldVelocity.x}, ${oldVelocity.y}), new: (${this.velocity.x}, ${this.velocity.y})`);

                if (direction.x === 1 && this.velocity.x > 0)
                    console.warn(`Ball reversed back into right wall: (${this.x}, ${this.y}), old: (${oldVelocity.x}, ${oldVelocity.y}), new: (${this.velocity.x}, ${this.velocity.y})`);

                if (direction.y === -1 && this.velocity.y < 0)
                    console.warn(`Ball reversed back into top wall: (${this.x}, ${this.y}), old: (${oldVelocity.x}, ${oldVelocity.y}), new: (${this.velocity.x}, ${this.velocity.y})`);

                if (direction.y === 1 && this.velocity.y > 0)
                    console.warn(`Ball reversed back into bottom wall: (${this.x}, ${this.y}), old: (${oldVelocity.x}, ${oldVelocity.y}), new: (${this.velocity.x}, ${this.velocity.y})`);
            }

            this.varyReflectionAngle(direction);
            return true;
        }

        return false;
    }

    //static standardBounceValue = Trig.degToRad(5);
    static standardBounceSin = Math.sin(Trig.degToRad(5));
    //static standardBounceCos = Math.cos(Zon.Ball.standardBounceValue);
    //static pi2 = Math.PI / 2;
    varyReflectionAngle = (ballDirection) => {
        //Old version with trig
        // const angle = this.velocity.angle;
        // const angleToWall = Math.abs(Math.abs(wallNorm.x !== 0 ? angle : Math.abs(angle) - Zon.Ball.pi2) - Zon.Ball.pi2);
        // const maxAngleChange = Math.min(angleToWall * 0.8, Zon.Ball.standardBounceValue);
        // const angleChange = (Math.random() * 2 - 1) * maxAngleChange;
        // const vx = this.velocity.x;
        // const vy = this.velocity.y;
        // const cos = Math.cos(angleChange);
        // const sin = Math.sin(angleChange);
        // this.velocity.x = vx * cos - vy * sin;
        // this.velocity.y = vx * sin + vy * cos;

        //New version with approximated trig
        const rand = (Math.random() * 2 - 1);
        const approxAngleChange = Zon.Ball.standardBounceSin * rand;
        const sin = approxAngleChange;
        const cos = 1 - (approxAngleChange * approxAngleChange) / 2;
        const vx = this.velocity.x;
        const vy = this.velocity.y;
        this.velocity.x = vx * cos - vy * sin;
        this.velocity.y = vx * sin + vy * cos;

        //If random angle reflected the ball back into the wall, keep original exact reflection with no random angle
        if (ballDirection.x !== 0) {
            if (ballDirection.x === -1) {
                if (this.velocity.x < 0) {
                    this.velocity.x = vx;
                }
            }
            else {
                if (this.velocity.x > 0) {
                    this.velocity.x = vx;
                }
            }
        }
        else {
            if (ballDirection.y === -1) {
                if (this.velocity.y < 0) {
                    this.velocity.y = vy;
                }
            }
            else {
                if (this.velocity.y > 0) {
                    this.velocity.y = vy;
                }
            }
        }

        this.correctVelocity();

        // console.log('theta', theta, 'maxAngle', maxAngle, 'angle', angle, 'cos', cos, 'sin', sin, 'x', x, 'y', y);

        if (zonDebug) {
            if (ballDirection.x === -1 && this.velocity.x < 0)
                console.warn(`Ball reversed back into left wall: (${this.x}, ${this.y}), (${this.velocity.x}, ${this.velocity.y})`);

            if (ballDirection.x === 1 && this.velocity.x > 0)
                console.warn(`Ball reversed back into right wall: (${this.x}, ${this.y}), (${this.velocity.x}, ${this.velocity.y})`);

            if (ballDirection.y === -1 && this.velocity.y < 0)
                console.warn(`Ball reversed back into top wall: (${this.x}, ${this.y}), (${this.velocity.x}, ${this.velocity.y})`);

            if (ballDirection.y === 1 && this.velocity.y > 0)
                console.warn(`Ball reversed back into bottom wall: (${this.x}, ${this.y}), (${this.velocity.x}, ${this.velocity.y})`);
        }
    }

    draw = () => {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    hitBlock = (tileX, tileY) => {
        const block = Zon.blocksManager.getBlock(tileX, tileY);
        if (zonDebug) {
            if (!block) {
                console.error(`Hit block on a null block: ${block}, tileX: ${tileX}, tileY: ${tileY}`);
            }
        }
        
        const damage = block.hit(this.damage, this);
    }

    updateBallLastPosition = () => {
        this.lastPosition.x = this.x;
        this.lastPosition.y = this.y;
    }
}