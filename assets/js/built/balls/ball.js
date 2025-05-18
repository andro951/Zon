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
        const lastPos = [this.x, this.y];
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        let collided = false;
        const epsilon = 1e-6;
        let count = 0;
        do {
            collided = false;
            const gridCollision = Collision.traverseGridWithCircle(lastPos[0], lastPos[1], this, Zon.blocksManager.tileHasBlock);
            if (false || gridCollision) {
                collided = true;
                const {
                    t,
                    hitX,
                    hitY,
                    normalX,
                    normalY
                } = gridCollision;

                lastPos[0] = hitX;
                lastPos[1] = hitY;

                const remaining = 1 - t;

                // Move the ball to the exact collision point
                this.x = hitX;
                this.y = hitY;

                // Reflect velocity vector against collision normal
                const dot = this.velocity.x * normalX + this.velocity.y * normalY;
                this.velocity.x = this.velocity.x - 2 * dot * normalX;
                this.velocity.y = this.velocity.y - 2 * dot * normalY;

                // Apply slight random angle offset on bounce (similar to wall bounce)
                this.onCollision(Math.abs(normalX) > Math.abs(normalY));

                // Move ball for the remaining fraction of the tick after collision
                this.x += this.velocity.x * remaining;
                this.y += this.velocity.y * remaining;
            }

            if (!collided)
                collided ||= this.checkWallCollision(lastPos);

            if (collided && count > 0) {
                const dx = this.x - lastPos[0];
                const dy = this.y - lastPos[1];
                const len = Math.sqrt(dx * dx + dy * dy);
                if (len < epsilon) {
                    collided = false;
                }
                else {
                    console.log(`len: ${len}, dx: ${dx}, dy: ${dy}, lastPos: ${lastPos[0]}, ${lastPos[1]}, x: ${this.x}, y: ${this.y}`);
                }
            }

            count++;
            if (count >= 100) {
                console.warn('Potential infinite loop detected');
                break;
            }
        } while (collided);
    }

    checkWallCollision = (lastPos) => {
        const leftDx = this.x - this.radius;
        if (leftDx <= 0) {
            const dx = this.x - lastPos[0];
            if (dx !== 0) {
                lastPos[1] += Math.abs((this.radius - lastPos[0]) / dx) * (this.y - lastPos[1]);
            }
            
            lastPos[0] = this.radius;
            this.x = this.radius - leftDx;
            this.velocity.x = -this.velocity.x;
            this.onCollision(true);
            return true;
        }
        else {
            const rightDx = this.canvas.width - this.x - this.radius;
            if (rightDx <= 0) {
                const dx = this.x - lastPos[0];
                if (dx !== 0) {
                    lastPos[1] += Math.abs((this.canvas.width - this.radius - lastPos[0]) / dx) * (this.y - lastPos[1]);
                }
                
                lastPos[0] = this.canvas.width - this.radius;
                this.x = this.canvas.width - this.radius + rightDx;
                this.velocity.x = -this.velocity.x;
                this.onCollision(true);
                return true;
            }
        }

        const topDy = this.y - this.radius;
        if (topDy <= 0) {
            const dy = this.y - lastPos[1];
            if (dy !== 0) {
                const xAdd = Math.abs((this.radius - lastPos[1]) / dy) * (this.x - lastPos[0]);
                lastPos[0] += xAdd;
            }

            lastPos[1] = this.radius;
            this.y = this.radius - topDy;
            this.velocity.y = -this.velocity.y;
            this.onCollision(false);
            return true;
        }
        else {
            const bottomDy = this.canvas.height - this.y - this.radius;
            if (bottomDy <= 0) {
                const dy = this.y - lastPos[1];
                if (dy !== 0) {
                    lastPos[0] += Math.abs((this.canvas.height - this.radius - lastPos[1]) / dy) * (this.x - lastPos[0]);
                }

                lastPos[1] = this.canvas.height - this.radius;
                this.y = this.canvas.height - this.radius + bottomDy;
                this.velocity.y = -this.velocity.y;
                this.onCollision(false);
                return true;
            }
        }

        return false;
    }

    static standardBounceValue = Trig.degToRad(5);
    static pi2 = Math.PI / 2;
    onCollision = (xCollision) => {
        const angle = this.velocity.angle;
        const angleToWall = Math.abs(Math.abs(xCollision ? angle : Math.abs(angle) - Zon.Ball.pi2) - Zon.Ball.pi2);
        const maxAngleChange = Math.min(angleToWall * 0.8, Zon.Ball.standardBounceValue);
        const angleChange = (Math.random() * 2 - 1) * maxAngleChange;
        const x = this.velocity.x;
        const y = this.velocity.y;
        const cos = Math.cos(angleChange);
        const sin = Math.sin(angleChange);
        this.velocity.x = x * cos - y * sin;
        this.velocity.y = x * sin + y * cos;
        // console.log('theta', theta, 'maxAngle', maxAngle, 'angle', angle, 'cos', cos, 'sin', sin, 'x', x, 'y', y);
    }

    draw = () => {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
    }
}