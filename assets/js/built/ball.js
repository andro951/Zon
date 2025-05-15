"use strict";

Zon.Ball = class {
    constructor(center, velocity) {
        this.canvas = document.getElementById('combatAreaCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.center = center instanceof Vectors.Vector ? center : center.toVector();
        this.radius = 20;
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

    update() {
        this.center.addTo(this.velocity);

        const leftDx = this.center.x - this.radius;
        if (leftDx <= 0) {
            this.center.x = this.radius - leftDx;
            this.velocity.x = -this.velocity.x;
            this.onCollision(true);
        }
        else {
            const rightDx = this.canvas.width - this.center.x - this.radius;
            if (rightDx <= 0) {
                this.center.x = this.canvas.width - this.radius + rightDx;
                this.velocity.x = -this.velocity.x;
                this.onCollision(true);
            }
        }

        const topDy = this.center.y - this.radius;
        if (topDy <= 0) {
            this.center.y = this.radius - topDy;
            this.velocity.y = -this.velocity.y;
            this.onCollision(false);
        }
        else {
            const bottomDy = this.canvas.height - this.center.y - this.radius;
            if (bottomDy <= 0) {
                this.center.y = this.canvas.height - this.radius + bottomDy;
                this.velocity.y = -this.velocity.y;
                this.onCollision(false);
            }
        }
    }

    static standardBounceValue = Trig.degToRad(5);
    static pi2 = Math.PI / 2;
    onCollision(xCollision) {
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

    onCollision2(xCollision) {
        const angle = this.velocity.angle();
        const angleToWall = Math.abs(Math.abs(xCollision ? angle : Math.abs(angle) - Zon.Ball.pi2) - Zon.Ball.pi2);
        const maxAngleChange = Math.min(angleToWall * 0.8, Zon.Ball.standardBounceValue);
        const angleChange = (Math.random() * 2 - 1) * maxAngleChange;
        const x = this.velocity.x;
        const y = this.velocity.y;
        this.velocity.x = x - y * angleChange;//Works reasonably well
        this.velocity.y = x * angleChange + y;
        // console.log('theta', theta, 'maxAngle', maxAngle, 'angle', angle, 'cos', cos, 'sin', sin, 'x', x, 'y', y);
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
    }
}

Zon.balls = [];
for (let i = 0; i < 10; i++) {
    Zon.balls.push(new Zon.Ball(new Vectors.Vector((i + 1) * 50, Zon.combatUI.element.height - 50), new Vectors.Polar(25, (Math.random() * 2 + 1) * Math.PI / 4)));//1 PI / 4 to 3 PI / 4
}