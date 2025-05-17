"use strict";

Struct.DynamicRectangle = class {
    constructor(left, top, width, height) {
        this._top = top;
        this._left = left;
        this._width = width;
        this._height = height;
        this._right = new Variable.Dependent(() => this.left + this.width, this);
        this._bottom = new Variable.Dependent(() => this.top + this.height, this);
    }

    static empty() {
        return new Struct.DynamicRectangle(new Variable.Value(0), new Variable.Value(0), new Variable.Value(0), new Variable.Value(0));
    }

    static base() {
        return new Struct.DynamicRectangle(new Variable.Base(), new Variable.Base(), new Variable.Base(), new Variable.Base());
    }

    get top() {
        return this._top.value;
    }
    get left() {
        return this._left.value;
    }
    get width() {
        return this._width.value;
    }
    get height() {
        return this._height.value;
    }
    get right() {
        return this._right.value;
    }
    get bottom() {
        return this._bottom.value;
    }
}