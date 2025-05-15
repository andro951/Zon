"use strict";

Zon.UIPanel = class {
    constructor(element) {
        this.element = element;
        this.element.style.position = "absolute";
        this.element.style.display = "none";
        this.visible = false;
        this.top = new DataTypes.VariableBase();
        this.left = new DataTypes.VariableBase();
        this.width = new DataTypes.VariableBase();
        this.height = new DataTypes.VariableBase();
        this.right = new DataTypes.DependentVariable(() => this.left + this.width, this.left, this.width);
        this.bottom = new DataTypes.DependentVariable(() => this.top + this.height, this.top, this.height);
    }

    updateTop() {
        this.element.style.top = `${this.top.value}px`;
    }
    updateLeft() {
        this.element.style.left = `${this.left.value}px`;
    }
    updateWidth() {
        this.element.style.width = `${this.width.value}px`;
    }
    updateHeight() {
        this.element.style.height = `${this.height.value}px`;
    }
    updateAllValues() {
        this.updateWidth();
        this.updateHeight();
        this.updateLeft();
        this.updateTop();
    }
    removeTopListener() {
        this.top.onChangedAction.remove(this);
    }
    removeLeftListener() {
        this.left.onChangedAction.remove(this);
    }
    removeWidthListener() {
        this.width.onChangedAction.remove(this);
    }
    removeHeightListener() {
        this.height.onChangedAction.remove(this);
    }
    removeListeners() {
        this.removeTopListener();
        this.removeLeftListener();
        this.removeWidthListener();
        this.removeHeightListener();
    }
    addTopListener() {
        this.top.onChangedAction.add(this, () => this.updateTop());
    }
    addLeftListener() {
        this.left.onChangedAction.add(this, () => this.updateLeft());
    }
    addWidthListener() {
        this.width.onChangedAction.add(this, () => this.updateWidth());
    }
    addHeightListener() {
        this.height.onChangedAction.add(this, () => this.updateHeight());
    }
    addListeners() {
        this.addTopListener();
        this.addLeftListener();
        this.addWidthListener();
        this.addHeightListener();
    }
    show() {
        if (this.visible)
            return;
        
        this.addListeners();
        this.updateAllValues();
        this.element.style.display = 'block';
        this.visible = true;
    }
    hide() {
        if (!this.visible)
            return;
        
        this.removeListeners();
        this.element.style.display = 'none';
        this.visible = false;
    }
}