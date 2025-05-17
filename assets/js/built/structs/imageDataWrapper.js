"use strict";

Struct.ImageDataWrapper = class {
    constructor(img) {
        this._img = img;
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        this.colorArrayWrapper = Struct.ColorArrayWrapper.fromImageData(ctx.getImageData(0, 0, img.width, img.height));
        this.forwardMethodsFrom(this.colorArrayWrapper);
    }

    img = () => this._img;
    width = () => this._img.width;
    height = () => this._img.height;
    imgName = () => this._img.src.split('/').pop();
}
Struct.ColorArrayWrapper = class {
    constructor(pixelUint8Array) {
        this.pixelUint8Array = pixelUint8Array;
        this.pixelUint32Array = new Uint32Array(pixelUint8Array.buffer);
    }
    static fromBuffer(arrayBuffer) {
        return new Struct.ColorArrayWrapper(new Uint8Array(arrayBuffer));
    }
    static fromImageData(imageData) {
        return new Struct.ColorArrayWrapper(imageData.data);
    }

    pixels = (index) => {
        if (index >= this.pixelUint32Array.length)
            throw new Error("Index out of bounds");

        return new Struct.PixelWrapper(this, index);
    }
    color = (index) => {
        if (index >= this.pixelUint32Array.length)
            throw new Error("Index out of bounds");

        return Struct.Color.fromInt(this.pixelUint32Array[index]);
    }
    setColor = (index, color) => {
        if (index >= this.pixelUint32Array.length)
            throw new Error("Index out of bounds");

        this.pixelUint32Array[index] = color.uint;
    }
}
Struct.PixelWrapper = class {
    constructor(colorArrayWrapper, index) {
        this.colorArrayWrapper = colorArrayWrapper;
        this.index = index << 2;
    }

    get r() {
        return this.colorArrayWrapper.pixelUint8Array[this.index];
    }
    set r(value) {
        this.colorArrayWrapper.pixelUint8Array[this.index] = value;
    }
    get g() {
        return this.colorArrayWrapper.pixelUint8Array[this.index + 1];
    }
    set g(value) {
        this.colorArrayWrapper.pixelUint8Array[this.index + 1] = value;
    }
    get b() {
        return this.colorArrayWrapper.pixelUint8Array[this.index + 2];
    }
    set b(value) {
        this.colorArrayWrapper.pixelUint8Array[this.index + 2] = value;
    }
    get a() {
        return this.colorArrayWrapper.pixelUint8Array[this.index + 3];
    }
    set a(value) {
        this.colorArrayWrapper.pixelUint8Array[this.index + 3] = value;
    }
    get colorInt() {
        return this.colorArrayWrapper.pixelUint32Array[this.index >>> 2];
    }
    set colorInt(value) {
        this.colorArrayWrapper.pixelUint32Array[this.index >>> 2] = value;
    }
    get cssString() {
        return Struct.Color.cssString(this);
    }
}
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
}