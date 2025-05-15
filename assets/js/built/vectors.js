"use strict";

const Trig = {};

Trig.degToRad = function(degrees) {
    return degrees * Math.PI / 180;
}

const Vectors = {};

Vectors.Vector = class {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toPolar() {
        const r = this.magnitude();
        const theta = this.angle();
        return new Vectors.Polar(r, theta);
    }

    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
    }

    addTo(vect) {
        this.x += vect.x;
        this.y += vect.y;
    }

    multiplyBy(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    normalize() {
        const mag = Math.sqrt(this.x * this.x + this.y * this.y);
        if (mag === 0)
            return;
        
        const invMag = 1 / mag;
        this.x *= invMag;
        this.y *= invMag;
    }

    get angle() {
        return Math.atan2(this.y, this.x);
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    set magnitude(magnitude) {
        const mag = Math.sqrt(this.x * this.x + this.y * this.y);
        if (mag === 0)
            return;

        const scale = magnitude / mag;
        this.x *= scale;
        this.y *= scale;
    }
}

Vectors.Polar = class {
    constructor(r, theta) {
        this.r = r;
        this.theta = theta;
    }

    toVector() {
        const x = this.r * Math.cos(this.theta);
        const y = this.r * Math.sin(this.theta);
        return new Vectors.Vector(x, y);
    }
}