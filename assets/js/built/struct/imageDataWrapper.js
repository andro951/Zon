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

        return Struct.Color.fromUInt(this.pixelUint32Array[index]);
    }
    setColor = (index, color) => {
        if (index >= this.pixelUint32Array.length)
            throw new Error("Index out of bounds");

        this.pixelUint32Array[index] = color.uint;
    }
}
Struct.PixelWrapper = class PixelWrapper extends Struct.ColorBase {
    constructor(colorArrayWrapper, index) {
        super();
        this.colorArrayWrapper = colorArrayWrapper;
        this.index = index << 2;
    }

    get r() {
        return this.colorArrayWrapper.pixelUint8Array[this.index + 3];
    }
    set r(value) {
        this.colorArrayWrapper.pixelUint8Array[this.index + 3] = value;
    }
    get g() {
        return this.colorArrayWrapper.pixelUint8Array[this.index + 2];
    }
    set g(value) {
        this.colorArrayWrapper.pixelUint8Array[this.index + 2] = value;
    }
    get b() {
        return this.colorArrayWrapper.pixelUint8Array[this.index + 1];
    }
    set b(value) {
        this.colorArrayWrapper.pixelUint8Array[this.index + 1] = value;
    }
    get a() {
        return this.colorArrayWrapper.pixelUint8Array[this.index + 0];
    }
    set a(value) {
        this.colorArrayWrapper.pixelUint8Array[this.index + 0] = value;
    }
    get uint() {
        return this.colorArrayWrapper.pixelUint32Array[this.index >>> 2];
    }
    set uint(value) {
        this.colorArrayWrapper.pixelUint32Array[this.index >>> 2] = value;
    }
}