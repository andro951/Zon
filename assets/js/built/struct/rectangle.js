"use strict";

Struct.Rectangle = class {
    constructor(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }

    get right() {
        return this.left + this.width;
    }

    get bottom() {
        return this.top + this.height;
    }

    get centerX() {
        if (this._center === undefined)
            this.createCenter();

        return this._center.x;
    }
    get centerY() {
        if (this._center === undefined)
            this.createCenter();

        return this._center.y;
    }
    get center() {
        if (this._center === undefined)
            this.createCenter();

        return this._center;
    }
    createCenter() {
        this._center = new Vectors.Vector(this.left + this.width / 2, this.top + this.height / 2);
    }
};