"use strict";

Struct.DynamicRectangle = class {
    constructor(left, top, width, height, name) {
        if (name === undefined || name === null)
            throw new Error("Name cannot be null or undefined for Struct.DynamicRectangle");

        this._left = left;
        this._top = top;
        this._width = width;
        this._height = height;
        this._right = new Variable.Dependent(() => this.left + this.width, `${name}Right`, { this: this });
        this._bottom = new Variable.Dependent(() => this.top + this.height, `${name}Bottom`, { this: this });
    }

    static empty(name) {
        if (name === undefined || name === null)
            throw new Error("Name cannot be null or undefined for Struct.DynamicRectangle.empty");

        return new Struct.DynamicRectangle(new Variable.Value(0, `${name}Left`), new Variable.Value(0, `${name}Top`), new Variable.Value(0, `${name}Width`), new Variable.Value(0, `${name}Height`), name);
    }

    static dependent(name, thisObj = undefined, linkDependentActions = false) {
        if (name === undefined || name === null)
            throw new Error("Name cannot be null or undefined for Struct.DynamicRectangle.dependent");

        return new Struct.DynamicRectangle(
            Variable.Dependent.empty(`${name}Left`, { this: thisObj }, linkDependentActions),
            Variable.Dependent.empty(`${name}Top`, { this: thisObj }, linkDependentActions),
            Variable.Dependent.empty(`${name}Width`, { this: thisObj }, linkDependentActions),
            Variable.Dependent.empty(`${name}Height`, { this: thisObj }, linkDependentActions),
            name
        );
    }

    static base(name) {
        if (name === undefined || name === null)
            throw new Error("Name cannot be null or undefined for Struct.DynamicRectangle.base");

        return new Struct.DynamicRectangle(new Variable.Base(`${name}Left`), new Variable.Base(`${name}Top`), new Variable.Base(`${name}Width`), new Variable.Base(`${name}Height`), name);
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