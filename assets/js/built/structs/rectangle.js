"use strict";

Struct.Rectangle = class {
    constructor(x, y, width, height) {
        this.topLeft = new Vectors.Vector(x, y);
        this.size = new Vectors.Vector(width, height);
    }

    get width() {
        return this.size.x;
    }

    get height() {
        return this.size.y;
    }
    
    get left() {
        return this.topLeft.x;
    }

    get right() {
        return this.topLeft.x + this.width;
    }

    get top() {
        return this.topLeft.y;
    }

    get bottom() {
        return this.topLeft.y + this.height;
    }
};