"use strict";

const Vectors = {};

Vectors.Vector = class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static fromPolar(radius, angle) {
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        return new Vectors.Vector(x, y);
    }

    toPolar() {
        const radius = this.magnitude();
        const angle = this.angle();
        return new Vectors.Polar(radius, angle);
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

    distance(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    dot(vect) {
        return this.x * vect.x + this.y * vect.y;
    }
    get dotSelf() {
        return this.x * this.x + this.y * this.y;
    }
    reflect(axis) {
        //Expects axis to be a surface vector being reflected off of, NOT A NORMAL!!!

        //Need to break appart this vector into a parallel (P) and perpendicular component (T) relative to the axis (A)
        //The reflection is then P - T
        //R = P - T
        //P and A are parallel, so P = k * A where k is some scalar
        //P = k * A
        //T = V - P
        //Perpendicular vectors are orthogonal, so T ⋅ A = 0
        //T ⋅ A = 0
        //T = V - P
        //(V - P) ⋅ A = 0
        //V ⋅ A - P ⋅ A = 0
        //P ⋅ A = V ⋅ A
        //k * A ⋅ A = V ⋅ A
        //k = V ⋅ A / A ⋅ A

        //R = P - T
        //T = V - P
        //R = P - (V - P)
        //R = 2 * P - V
        //P = k * A
        //R = 2 * k * A - V
        //R = 2 * (V ⋅ A / A ⋅ A) * A - V

        //The direction of axis doesn't matter (between the 2 options)
        //R = 2 * (Vx * Ax + Vy * Ay) / (Ax * Ax + Ay * Ay) * A - V
        //k = 2 * (Vx * Ax + Vy * Ay) / (Ax * Ax + Ay * Ay)
        //x = k * Ax - Vx
        //y = k * Ay - Vy

        //x = 2 * (Vx * Ax + Vy * Ay) / (Ax * Ax + Ay * Ay) * Ax - Vx
        //y = 2 * (Vx * Ax + Vy * Ay) / (Ax * Ax + Ay * Ay) * Ay - Vy

        //axis = (a, b)
        //x = 2 * (Vx * a + Vy * b) / (a^2 + b^2) * a - Vx
        //y = 2 * (Vx * a + Vy * b) / (a^2 + b^2) * b - Vy

        //axis = (-a, -b)
        //x = 2 * (Vx * -a + Vy * -b) / ((-a)^2 + (-b)^2) * -a - Vx => 2 * (Vx * a + Vy * b) / (a^2 + b^2) * a - Vx
        //y = 2 * (Vx * -a + Vy * -b) / ((-a)^2 + (-b)^2) * -b - Vy => 2 * (Vx * a + Vy * b) / (a^2 + b^2) * b - Vx

        //How to get the axis of an object?
        //Rectangle: (left, top, width, height)
        //For any edge, the axis is one point - the other point of the edge.
        //Left edge axis:
        //topLeft - bottomLeft = (l, t) - (l, t + h) = (0, -h)
        //OR
        //bottomLeft - topLeft = (l, t + h) - (l, t) = (0, h)
        //Either is fine.  They will give the same result.

        const div = axis.x * axis.x + axis.y * axis.y;
        if (div === 0)
            throw new Error("Cannot reflect a vector with a zero length axis.");

        const k = 2 * ((this.x * axis.x + this.y * axis.y) / div);
        const x = k * axis.x - this.x;
        const y = k * axis.y - this.y;
        return new Vectors.Vector(x, y);
    }
    get perpendicular() {
        return new Vectors.Vector(-this.y, this.x);
    }

    static read(reader) {
        const x = reader.readNumber();
        const y = reader.readNumber();
        return new Vectors.Vector(x, y);
    }

    write(writer) {
        writer.writeNumber(this.x);
        writer.writeNumber(this.y);
    }
}

Vectors.Polar = class Polar {
    constructor(radius, angle) {
        this.radius = radius;
        this.angle = angle;
    }

    toVector() {
        const x = this.radius * Math.cos(this.angle);
        const y = this.radius * Math.sin(this.angle);
        return new Vectors.Vector(x, y);
    }
}