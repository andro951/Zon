"use strict";

Struct.Color = class {
    constructor() {
        this._uint8Array = new Uint8Array(4);
        this._uint32Array = new Uint32Array(this._uint8Array.buffer);
    }
    static fromInt(colorInt) {
        const color = new Struct.Color();
        color._uint32Array[0] = colorInt;
        return color;
    }
    static fromRGBA(r, g, b, a) {
        const color = new Struct.Color();
        color._uint8Array[0] = r;
        color._uint8Array[1] = g;
        color._uint8Array[2] = b;
        color._uint8Array[3] = a;
        return color;
    }
    get r() {
        return this._uint8Array[0];
    }
    set r(value) {
        this._uint8Array[0] = value;
    }
    get g() {
        return this._uint8Array[1];
    }
    set g(value) {
        this._uint8Array[1] = value;
    }
    get b() {
        return this._uint8Array[2];
    }
    set b(value) {
        this._uint8Array[2] = value;
    }
    get a() {
        return this._uint8Array[3];
    }
    set a(value) {
        this._uint8Array[3] = value;
    }
    get uint() {
        return this._uint32Array[0];
    }
    set uint(value) {
        this._uint32Array[0] = value;
    }
    get cssString() {
        return Struct.Color.cssString(this);
    }
    static cssString(color) {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
    }
    static blend(color, otherColor, ratio) {
        const blendedColor = new Struct.Color();
        const inverseRatio = 1 - ratio;
        blendedColor.r = Math.round(color.r * inverseRatio + otherColor.r * ratio);
        blendedColor.g = Math.round(color.g * inverseRatio + otherColor.g * ratio);
        blendedColor.b = Math.round(color.b * inverseRatio + otherColor.b * ratio);
        blendedColor.a = Math.round(color.a * inverseRatio + otherColor.a * ratio);
        return blendedColor;
    }
    blend(otherColor, ratio) {
        return Struct.Color.blend(this, otherColor, ratio);
    }
}