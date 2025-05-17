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

    update = () => {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        const leftDx = this.x - this.radius;
        if (leftDx <= 0) {
            this.x = this.radius - leftDx;
            this.velocity.x = -this.velocity.x;
            this.onCollision(true);
        }
        else {
            const rightDx = this.canvas.width - this.x - this.radius;
            if (rightDx <= 0) {
                this.x = this.canvas.width - this.radius + rightDx;
                this.velocity.x = -this.velocity.x;
                this.onCollision(true);
            }
        }

        const topDy = this.y - this.radius;
        if (topDy <= 0) {
            this.y = this.radius - topDy;
            this.velocity.y = -this.velocity.y;
            this.onCollision(false);
        }
        else {
            const bottomDy = this.canvas.height - this.y - this.radius;
            if (bottomDy <= 0) {
                this.y = this.canvas.height - this.radius + bottomDy;
                this.velocity.y = -this.velocity.y;
                this.onCollision(false);
            }
        }
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