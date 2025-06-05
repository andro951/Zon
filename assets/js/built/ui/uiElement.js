"use strict";

Zon.UI.UIElementBase = class UIElementBase {
    constructor(element, zIndex, parent = Zon.device, inheritShown = true) {
        if (new.target === Zon.UI.UIElementBase)
            throw new TypeError("Cannot construct UIElementBase instances directly");
        
        this.parent = parent;
        this.element = element;
        this.element.style.zIndex = zIndex.toString();
        this.element.style.position = "absolute";
        this.position = new Variable.Value(this.element.style.position);
        this.position.onChangedAction.add(() => this.element.style.position = this.position.value);
        this.element.style.display = "none";
        this.rect = Struct.DynamicRectangle.dependent(this);
        this._leftOffset = new Variable.Value(0);
        this._topOffset = new Variable.Value(0);
        this._leftEquationVar = Variable.Dependent.empty(this, true);
        this._topEquationVar = Variable.Dependent.empty(this, true);
        this.rect._left.replaceEquation(() => {
            return this._leftEquationVar.value + this._leftOffset.value;
        });
        this.rect._left.linkDependentActions();
        this.rect._top.replaceEquation(() => {
            return this._topEquationVar.value + this._topOffset.value;
        });
        this.rect._top.linkDependentActions();
        if (this.parent && inheritShown && this.parent !== Zon.device && this.parent !== window.document.body) {
            this.shown = new Variable.Dependent(() => this.parent.shown.value, this);
        }
        else {
            this.shown = new Variable.Value(false);
        }
        
        this.backGroundColor = new Variable.ColorVar();
        this.backGroundColor.onChangedAction.add(() => this.element.style.backgroundColor = this.backGroundColor.value.cssString);
        this.border = new Variable.Value(this.element.style.border);
        this.border.onChangedAction.add(() => this.element.style.border = this.border.value);
        (parent instanceof Zon.UI.UIElementBase ? parent.element : parent).appendChild(this.element);
        this.dependentVariables = [
            this._leftEquationVar,
            this._topEquationVar,
            this.rect._width,
            this.rect._height,
        ];
    }
    static create(...args) {
        const uiElement = new this(...args);
        uiElement.bindAll();
        uiElement.postConstructor();
        return uiElement;
    }
    postConstructor() {
        Zon.Setup.linkAndFinalizeUISetupActions.add(this.setup);

        this.rect._left.onChangedAction.add(this._updateLeft);
        this.rect._top.onChangedAction.add(this._updateTop);
        this.rect._width.onChangedAction.add(this._updateWidth);
        this.rect._height.onChangedAction.add(this._updateHeight);

        this.shown.onChangedAction.add(this._updateShown);
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
    get topOffset() {
        return this._topOffset.value;
    }
    set topOffset(newValue) {
        this._topOffset.value = newValue;
    }
    get left() {
        return this.rect.left;
    }
    get leftOffset() {
        return this._leftOffset.value;
    }
    set leftOffset(newValue) {
        this._leftOffset.value = newValue;
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
    _updateTop() {
        this.element.style.top = `${this.top}px`;
    }
    _updateLeft() {
        this.element.style.left = `${this.left}px`;
    }
    _updateWidth() {
        this.element.style.width = `${this.width}px`;
    }
    _updateHeight() {
        this.element.style.height = `${this.height}px`;
    }
    _updateAllValues() {
        this._updateWidth();
        this._updateHeight();
        this._updateLeft();
        this._updateTop();
    }
    replaceTop(func) {
        this._topEquationVar.replaceEquation(func);
    }
    replaceLeft(func) {
        this._leftEquationVar.replaceEquation(func);
    }
    replaceWidth(func) {
        this.rect._width.replaceEquation(func);
    }
    replaceHeight(func) {
        this.rect._height.replaceEquation(func);
    }

    updateUIContent() {
        if (!this.shown.value)
            return;

        this.updateUIActions.call();
    }
    updateUIActions = new Actions.Action();
    onHideActions = new Actions.Action();
    onShowActions = new Actions.Action();
    show() {
        if (this.shown.value)
            return;

        if (this.animation) {
            this.animation.show();
            return;
        }

        this.forceShow();
    }
    hide() {
        if (!this.shown.value)
            return;

        if (this.animation) {
            this.animation.hide();
            return;
        }

        this.forceHide();
    }
    forceShow() {
        this.shown.value = true;
    }
    forceHide() {
        this.shown.value = false;
    }
    _updateShown() {
        console.log(`UIElementBase; shown: ${this.shown.value}, left: ${this.left}, top: ${this.top}, width: ${this.width}, height: ${this.height}, id: ${this.element.id}`);
        if (Zon.device !== undefined)
            console.log(`device; left: ${Zon.device.left}, top: ${Zon.device.top}, width: ${Zon.device.width}, height: ${Zon.device.height}`);
        
        if (this.shown.value) {
            for (const dependentVariable of this.dependentVariables) {
                dependentVariable.linkDependentActions();
            }
            
            this.element.style.display = this._display ?? "block";
            console.log(`UIElementBase: _updateShown (true), left: ${this.left}, top: ${this.top}, width: ${this.width}, height: ${this.height}, id: ${this.element.id}`);
            this._updateAllValues();
            this.onShowActions.call();
            this.updateUIContent();
        } else {
            console.log(`UIElementBase: _updateShown (false), left: ${this.left}, top: ${this.top}, width: ${this.width}, height: ${this.height}, id: ${this.element.id}`);
            for (const dependentVariable of this.dependentVariables) {
                dependentVariable.unlinkDependentActions();
            }

            if (this.element.style.display !== "none")
                this._display = this.element.style.display;

            this.element.style.display = "none";
            this.onHideActions.call();
        }
    }
    toggle() {
        if (this.shown.value) {
            this.hide();
        } else {
            this.show();
        }
    }
}

Zon.UI.UIElementCanvas = class UIElementCanvas extends Zon.UI.UIElementBase {
    constructor(canvasId, width = 300, height = 150, zIndex = 0, parent = Zon.device) {
        const newCanvas = document.createElement("canvas");
        newCanvas.id = canvasId;
        super(newCanvas, zIndex, parent);
        this.element.width = width;
        this.element.height = height;
        this.canvasWidth = new Variable.Value(newCanvas.width);
        this.canvasHeight = new Variable.Value(newCanvas.height);
        this.ctx = this.element.getContext('2d');
    }
    static create(...args) {
        const uiCanvas = new this(...args);
        uiCanvas.bindAll();
        uiCanvas.postConstructor();
        return uiCanvas;
    }
    postConstructor() {
        super.postConstructor();
        this.canvasWidth.onChangedAction.add(this._updateCanvasWidth);
        this.canvasHeight.onChangedAction.add(this._updateCanvasHeight);
    }
    _updateCanvasWidth() {
        this.element.width = this.canvasWidth.value;
    }
    _updateCanvasHeight() {
        this.element.height = this.canvasHeight.value;
    }
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    }
}

Zon.UI.UIElementDiv = class UIElementDiv extends Zon.UI.UIElementBase {
    constructor(divId, zIndex = 0, parent = Zon.device) {
        const newDiv = document.createElement("div");
        newDiv.id = divId;
        super(newDiv, zIndex, parent);
        this.fontSize = new Variable.Dependent(() => this.height * 0.8, this);
        this.fontSize.onChangedAction.add(() => this.element.style.fontSize = `${this.fontSize.value}px`);
    }
    static create(...args) {
        const uiDiv = new this(...args);
        uiDiv.bindAll();
        uiDiv.postConstructor();
        return uiDiv;
    }
    postConstructor() {
        super.postConstructor();
    }
    setup() {
        Zon.Setup.postLinkAndFinalizeUiSetupActions.add(this.postSetup);
    }

    postSetup() {
        this.fontSize.onChangedAction.call();
    }
}

Zon.UI.UIElementZID = {
    COMBAT_UI: 0,
    MAIN_UI: 1,
    MENU: 2,
    SIDE_BAR: 3,
    CLOSE_BUTTON_MENU: 4,
};
Zon.UI.UIElementZIDNames = [];
Enum.createEnum(Zon.UI.UIElementZID, Zon.UI.UIElementZIDNames, false);