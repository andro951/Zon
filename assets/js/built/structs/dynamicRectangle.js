"use strict";

Struct.DynamicRectangle = class {
    constructor(left, top, width, height) {
        this._top = top;
        this._left = left;
        this._width = width;
        this._height = height;
        this._right = new Variable.Dependent(() => this._left + this._width, this._left, this._width);
        this._bottom = new Variable.Dependent(() => this._top + this._height, this._top, this._height);
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