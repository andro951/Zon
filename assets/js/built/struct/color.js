"use strict";

Struct.ColorBase = class ColorBase {
    constructor() {
        if (new.target === ColorBase) {
            throw new TypeError("Cannot construct ColorBase instances directly");
        }
    }
    get cssString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a / 255})`;
    }
    blend(otherColor, ratio) {
        const blendedColor = new Struct.Color();
        const inverseRatio = 1 - ratio;
        blendedColor.r = Math.round(this.r * inverseRatio + otherColor.r * ratio);
        blendedColor.g = Math.round(this.g * inverseRatio + otherColor.g * ratio);
        blendedColor.b = Math.round(this.b * inverseRatio + otherColor.b * ratio);
        blendedColor.a = Math.round(this.a * inverseRatio + otherColor.a * ratio);
        return blendedColor;
    }
    changeAlpha(newAlpha) {
        const newColor = new Struct.Color();
        newColor.r = this.r;
        newColor.g = this.g;
        newColor.b = this.b;
        newColor.a = newAlpha;
        return newColor;
    }
    desaturate(amount = 0.5) {
        const newColor = new Struct.Color();
        const gray = 0.299 * this.r + 0.587 * this.g + 0.114 * this.b;
        newColor.r = this.r + (gray - this.r) * amount;
        newColor.g = this.g + (gray - this.g) * amount;
        newColor.b = this.b + (gray - this.b) * amount;
        newColor.a = this.a;
        return newColor;
    }
    dim(amount = 0.5) {
        const newColor = new Struct.Color();
        newColor.r = this.r * (1 - amount);
        newColor.g = this.g * (1 - amount);
        newColor.b = this.b * (1 - amount);
        newColor.a = this.a;
        return newColor;
    }
}

Struct.Color = class Color extends Struct.ColorBase {
    constructor() {
        super();
        this._uint32Array = new Uint32Array(1);
        this._uint8Array = new Uint8Array(this._uint32Array.buffer);
    }
    static fromUInt(colorInt) {
        const color = new Struct.Color();
        color._uint32Array[0] = colorInt;
        return color;
    }
    static fromRGBA(r, g, b, a) {
        const color = new Struct.Color();
        color._uint8Array[3] = r;
        color._uint8Array[2] = g;
        color._uint8Array[1] = b;
        color._uint8Array[0] = a;
        return color;
    }
    get r() {
        return this._uint8Array[3];
    }
    set r(value) {
        this._uint8Array[3] = value;
    }
    get g() {
        return this._uint8Array[2];
    }
    set g(value) {
        this._uint8Array[2] = value;
    }
    get b() {
        return this._uint8Array[1];
    }
    set b(value) {
        this._uint8Array[1] = value;
    }
    get a() {
        return this._uint8Array[0];
    }
    set a(value) {
        this._uint8Array[0] = value;
    }
    get uint() {
        return this._uint32Array[0];
    }
    set uint(value) {
        this._uint32Array[0] = value;
    }
}