"use strict";

Zon.Ball = class extends Struct.Circle {
    constructor(x, y, velocity) {
        super(x, y, 30);
        this.canvas = document.getElementById('combatAreaCanvas');
        this.ctx = this.canvas.getContext('2d');
        if (velocity instanceof Vectors.Vector) {
            this.velocity = velocity;
            this.speed = velocity.magnitude();
        }
        else {
            this.velocity = velocity.toVector();
            this.speed = velocity.radius;
        }
        
        this.color = 'white';
    }

    correctVelocity = () => {
        this.velocity.magnitude = this.speed;
    }

    // update = () => {
    //     this.x += this.velocity.x;
    //     this.y += this.velocity.y;

    //     const leftDx = this.x - this.radius;
    //     if (leftDx <= 0) {
    //         this.x = this.radius - leftDx;
    //         this.velocity.x = -this.velocity.x;
    //         this.onCollision(true);
    //     }
    //     else {
    //         const rightDx = this.canvas.width - this.x - this.radius;
    //         if (rightDx <= 0) {
    //             this.x = this.canvas.width - this.radius + rightDx;
    //             this.velocity.x = -this.velocity.x;
    //             this.onCollision(true);
    //         }
    //     }

    //     const topDy = this.y - this.radius;
    //     if (topDy <= 0) {
    //         this.y = this.radius - topDy;
    //         this.velocity.y = -this.velocity.y;
    //         this.onCollision(false);
    //     }
    //     else {
    //         const bottomDy = this.canvas.height - this.y - this.radius;
    //         if (bottomDy <= 0) {
    //             this.y = this.canvas.height - this.radius + bottomDy;
    //             this.velocity.y = -this.velocity.y;
    //             this.onCollision(false);
    //         }
    //     }
    // }

    update = () => {
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
                    t,
                    hitX,
                    hitY,
                    normalX,
                    normalY
                } = gridCollision;

                lastPos.x = hitX;
                lastPos.y = hitY;

                this.x = 2 * hitX - this.x;
                this.y = 2 * hitY - this.y;
                if (normalX !== 0) {
                    this.velocity.x = -this.velocity.x;
                }
                else {
                    this.velocity.y = -this.velocity.y;
                }

                // //const remaining = 1 - t;

                // // Move the ball to the exact collision point
                // this.x = hitX;
                // this.y = hitY;

                // // // Reflect velocity vector against collision normal
                // const dot = this.velocity.x * normalX + this.velocity.y * normalY;
                // this.velocity.x = this.velocity.x - 2 * dot * normalX;
                // this.velocity.y = this.velocity.y - 2 * dot * normalY;

                // // Move ball for the remaining fraction of the tick after collision
                // this.x += this.velocity.x * remaining;
                // this.y += this.velocity.y * remaining;
                this.varyReflectionAngle(normalX, normalY);
            }

            if (!collided)
                collided ||= this.checkWallCollision(lastPos);

            if (Zon.debug) {
                if (collided && count > 1) {
                    const dx = this.x - lastPos.x;
                    const dy = this.y - lastPos.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len < epsilon) {
                        collided = false;
                    }
                    else {
                        console.log(`len: ${len}, dx: ${dx}, dy: ${dy}, lastPos: ${lastPos.x}, ${lastPos.y}, x: ${this.x}, y: ${this.y}`);
                    }
                }

                count++;
                if (count >= 100) {
                    console.warn('Potential infinite loop detected');
                    break;
                }
            }
        } while (collided);
    }

    checkWallCollision = (lastPos) => {
        const leftDx = this.x - this.radius;
        if (leftDx <= 0) {
            const dx = this.x - lastPos.x;
            if (dx !== 0) {
                lastPos.y += Math.abs((this.radius - lastPos.x) / dx) * (this.y - lastPos.y);
            }

            lastPos.x = this.radius;
            this.x = this.radius - leftDx;
            this.velocity.x = -this.velocity.x;
            this.varyReflectionAngle(-1, 0);
            return true;
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
                this.velocity.x = -this.velocity.x;
                this.varyReflectionAngle(1, 0);
                return true;
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
            this.velocity.y = -this.velocity.y;
            this.varyReflectionAngle(0, 1);
            return true;
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
                this.velocity.y = -this.velocity.y;
                this.varyReflectionAngle(0, -1);
                return true;
            }
        }

        return false;
    }

    //static standardBounceValue = Trig.degToRad(5);
    static standardBounceSin = Math.sin(Trig.degToRad(5));
    //static standardBounceCos = Math.cos(Zon.Ball.standardBounceValue);
    //static pi2 = Math.PI / 2;
    varyReflectionAngle = (wallNormX, wallNormY) => {
        //Old version with trig
        // const angle = this.velocity.angle;
        // const angleToWall = Math.abs(Math.abs(wallNormX !== 0 ? angle : Math.abs(angle) - Zon.Ball.pi2) - Zon.Ball.pi2);
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
        if (wallNormX !== 0) {
            if (wallNormX === -1) {
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
            if (wallNormY === 1) {
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

        if (Zon.debug) {
            if (wallNormX === -1 && this.velocity.x < 0)
                console.warn(`Ball reversed back into left wall: (${this.x}, ${this.y}), (${this.velocity.x}, ${this.velocity.y})`);

            if (wallNormX === 1 && this.velocity.x > 0)
                console.warn(`Ball reversed back into right wall: (${this.x}, ${this.y}), (${this.velocity.x}, ${this.velocity.y})`);

            if (wallNormY === 1 && this.velocity.y < 0)
                console.warn(`Ball reversed back into top wall: (${this.x}, ${this.y}), (${this.velocity.x}, ${this.velocity.y})`);

            if (wallNormY === -1 && this.velocity.y > 0)
                console.warn(`Ball reversed back into bottom wall: (${this.x}, ${this.y}), (${this.velocity.x}, ${this.velocity.y})`);
        }
    }

    
    // onCollision = (wallNormX, wallNormY) => {
    //     const angle = this.velocity.angle;
    //     const angleToWall = Math.abs(Math.abs(wallNormX !== 0 ? angle : Math.abs(angle) - Zon.Ball.pi2) - Zon.Ball.pi2);
    //     const maxAngleChange = Math.min(angleToWall * 0.8, Zon.Ball.standardBounceValue);
    //     const angleChange = (Math.random() * 2 - 1) * maxAngleChange;
    //     const x = this.velocity.x;
    //     const y = this.velocity.y;
    //     const cos = Math.cos(angleChange);
    //     const sin = Math.sin(angleChange);
    //     this.velocity.x = x * cos - y * sin;
    //     this.velocity.y = x * sin + y * cos;
    //     // console.log('theta', theta, 'maxAngle', maxAngle, 'angle', angle, 'cos', cos, 'sin', sin, 'x', x, 'y', y);
    // }

    draw = () => {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
    }
}