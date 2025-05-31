

Zon.UI.UIElementBase = class UIElementBase {
    constructor(element, parent = null) {
        if (new.target === Zon.UI.UIElementBase)
            throw new TypeError("Cannot construct UIElementBase instances directly");

        this.element = element;
        this.element.style.position = "absolute";
        this.position = new Variable.Value(this.element.style.position);
        this.position.onChangedAction.add(() => this.element.style.position = this.position.value);
        this.element.style.display = "none";
        this.rect = Struct.DynamicRectangle.dependent(this);
        this.rect._left.onChangedAction.add(this._updateLeft);
        this.rect._top.onChangedAction.add(this._updateTop);
        this.rect._width.onChangedAction.add(this._updateWidth);
        this.rect._height.onChangedAction.add(this._updateHeight);
        this.shown = new Variable.Value(false);
        this.shown.onChangedAction.add(this._updateShown);
        this.backGroundColor = new Variable.ColorVar();
        this.backGroundColor.onChangedAction.add(() => this.element.style.backgroundColor = this.backGroundColor.value.cssString);
        this.border = new Variable.Value(this.element.style.border);
        this.border.onChangedAction.add(() => this.element.style.border = this.border.value);
        Zon.Setup.postConstructors.add(this.postConstructor);
        (parent ?? window.document.body).appendChild(this.element);
        this.dependentVariables = [
            this.rect._left,
            this.rect._top,
            this.rect._width,
            this.rect._height,
        ];
    }
    postConstructor = () => {
        Zon.Setup.linkAndFinalizeUISetupActions.add(this.setup);
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
    _updateTop = () => {
        this.element.style.top = `${this.top}px`;
    }
    _updateLeft = () => {
        this.element.style.left = `${this.left}px`;
    }
    _updateWidth = () => {
        this.element.style.width = `${this.width}px`;
    }
    _updateHeight = () => {
        this.element.style.height = `${this.height}px`;
    }
    _updateAllValues = () => {
        this._updateWidth();
        this._updateHeight();
        this._updateLeft();
        this._updateTop();
    }
    replaceTop = (func) => {
        this.rect._top.replaceEquation(func);
        //this.rect._top = this.rect._top.transferDataToNewVariable(new Variable.Dependent(func, this));
    }
    replaceLeft = (func) => {
        this.rect._left.replaceEquation(func);
        //this.rect._left = this.rect._left.transferDataToNewVariable(new Variable.Dependent(func, this));
    }
    replaceWidth = (func) => {
        this.rect._width.replaceEquation(func);
        //this.rect._width = this.rect._width.transferDataToNewVariable(new Variable.Dependent(func, this));
    }
    replaceHeight = (func) => {
        this.rect._height.replaceEquation(func);
        //this.rect._height = this.rect._height.transferDataToNewVariable(new Variable.Dependent(func, this));
    }

    updateUIContent = () => {
        if (!this.shown.value)
            return;

        this.updateUIActions.call();
    }
    updateUIActions = new Actions.Action();
    show = () => {
        this.shown.value = true;
    }
    onHideActions = new Actions.Action();
    onShowActions = new Actions.Action();
    hide = () => {
        this.shown.value = false;
    }
    _updateShown = () => {
        if (this.shown.value) {
            for (const dependentVariable of this.dependentVariables) {
                dependentVariable.linkDependentActions();
            }
            
            this.element.style.display = "block";
            this._updateAllValues();
            this.onShowActions.call();
            this.updateUIContent();
        } else {
            for (const dependentVariable of this.dependentVariables) {
                dependentVariable.unlinkDependentActions();
            }

            this.element.style.display = "none";
            this.onHideActions.call();
        }
    }
    toggle = () => {
        if (this.shown.value) {
            this.hide();
        } else {
            this.show();
        }
    }
}

Zon.UI.UIElementCanvas = class UIElementCanvas extends Zon.UI.UIElementBase {
    constructor(canvasId, width = 300, height = 150) {
        const newCanvas = document.createElement("canvas");
        newCanvas.id = canvasId;
        super(newCanvas);
        this.element.width = width;
        this.element.height = height;
        this.canvasWidth = new Variable.Value(newCanvas.width);
        this.canvasWidth.onChangedAction.add(this._updateCanvasWidth);
        this.canvasHeight = new Variable.Value(newCanvas.height);
        this.canvasHeight.onChangedAction.add(this._updateCanvasHeight);
        this.ctx = this.element.getContext('2d');
    }

    _updateCanvasWidth() {
        this.element.width = this.canvasWidth.value;
    }
    _updateCanvasHeight() {
        this.element.height = this.canvasHeight.value;
    }
    clearCanvas = () => {
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    }
}

Zon.UI.UIElementDiv = class UIElementDiv extends Zon.UI.UIElementBase {
    constructor(divId) {
        const newDiv = document.createElement("div");
        newDiv.id = divId;
        super(newDiv);
    }
}