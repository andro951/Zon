"use strict";

Zon.UIPanel = class {
    constructor(element) {
        this.element = element;
        this.element.style.position = "absolute";
        this.element.style.display = "none";
        this.visible = false;
        this.rect = Struct.DynamicRectangle.base();
    }
    get _top() {
        return this.rect._top;
    }
    get _left() {
        return this.rect._left;
    }
    get _width() {
        return this.rect._width;
    }
    get _height() {
        return this.rect._height;
    }
    get _right() {
        return this.rect._right;
    }
    get _bottom() {
        return this.rect._bottom;
    }
    get top() {
        return this.rect.top;
    }
    get left() {
        return this.rect.left;
    }
    get width() {
        return this.rect.width;
    }
    get height() {
        return this.rect.height;
    }
    get right() {
        return this.rect.right;
    }
    get bottom() {
        return this.rect.bottom;
    }
    updateTop = () => {
        this.element.style.top = `${this.top}px`;
    }
    updateLeft = () => {
        this.element.style.left = `${this.left}px`;
    }
    updateWidth = () => {
        this.element.style.width = `${this.width}px`;
    }
    updateHeight = () => {
        this.element.style.height = `${this.height}px`;
    }
    updateAllValues = () => {
        this.updateWidth();
        this.updateHeight();
        this.updateLeft();
        this.updateTop();
    }
    removeTopListener = () => {
        this.rect._top.onChangedAction.remove(this.updateTop);
    }
    removeLeftListener = () => {
        this.rect._left.onChangedAction.remove(this.updateLeft);
    }
    removeWidthListener = () => {
        this.rect._width.onChangedAction.remove(this.updateWidth);
    }
    removeHeightListener = () => {
        this.rect._height.onChangedAction.remove(this.updateHeight);
    }
    removeListeners = () => {
        this.removeTopListener();
        this.removeLeftListener();
        this.removeWidthListener();
        this.removeHeightListener();
    }
    addTopListener = () => {
        this.rect._top.onChangedAction.add(this.updateTop);
    }
    addLeftListener = () => {
        this.rect._left.onChangedAction.add(this.updateLeft);
    }
    addWidthListener = () => {
        this.rect._width.onChangedAction.add(this.updateWidth);
    }
    addHeightListener = () => {
        this.rect._height.onChangedAction.add(this.updateHeight);
    }
    addListeners = () => {
        this.addTopListener();
        this.addLeftListener();
        this.addWidthListener();
        this.addHeightListener();
    }
    replaceTop = (func, ...variables) => {
        if (this.visible)
            this.removeTopListener();

        this.rect._top = this.rect._top.copyData(new Variable.Dependent(func, ...variables));

        if (this.visible)
            this.addTopListener();
    }
    replaceLeft = (func, ...variables) => {
        if (this.visible)
            this.removeLeftListener();

        this.rect._left = this.rect._left.copyData(new Variable.Dependent(func, ...variables));

        if (this.visible)
            this.addLeftListener();
    }
    replaceWidth = (func, ...variables) => {
        if (this.visible)
            this.removeWidthListener();

        this.rect._width = this.rect._width.copyData(new Variable.Dependent(func, ...variables));

        if (this.visible)
            this.addWidthListener();
    }
    replaceHeight = (func, ...variables) => {
        if (this.visible)
            this.removeHeightListener();

        this.rect._height = this.rect._height.copyData(new Variable.Dependent(func, ...variables));

        if (this.visible)
            this.addHeightListener();
    }
    leftIsDefault = () => {
        return this.rect._left.constructor === Variable.Base;
    }
    widthIsDefault = () => {
        return this.rect._width.constructor === Variable.Base;
    }
    heightIsDefault = () => {
        return this.rect._height.constructor === Variable.Base;
    }
    topIsDefault = () => {
        return this.rect._top.constructor === Variable.Base;
    }
    show = () => {
        if (this.visible)
            return;
        
        this.addListeners();
        this.updateAllValues();
        this.element.style.display = 'block';
        this.visible = true;
    }
    hide = () => {
        if (!this.visible)
            return;
        
        this.removeListeners();
        this.element.style.display = 'none';
        this.visible = false;
    }
}