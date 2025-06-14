"use strict";

Zon.UI.UIElementBase = class UIElementBase {

    //#region Constructors

    constructor(element, zIndex, parent = Zon.device, inheritShown = true) {
        if (new.target === Zon.UI.UIElementBase)
            throw new TypeError("Cannot construct UIElementBase instances directly");
        
        //Order - super first

        //Usage:
        //Set element.property values

        //Not ready:
        //'this' functions
        //element.properties
        //element variables
        //rect (left, top, width, height)
        //text setter
        //fontSize setter

        if (zonDebug) {
            Variable.Dependent.pauseGetWhenNotLinkedWarning(this);
        }

        this.parent = parent;
        this.inheritShown = inheritShown;
        this.element = element;
        this.element.style.zIndex = zIndex.toString();
        this.element.style.display = "none";
        this.element.style.position = "absolute";
        this.rect = Struct.DynamicRectangle.dependent(this.element.id, this);
        this._leftOffset = new Variable.Value(0, `${this.element.id}LeftOffset`);
        this._topOffset = new Variable.Value(0, `${this.element.id}TopOffset`);
        this._leftEquationVar = Variable.Dependent.empty(`${this.element.id}LeftDependency`, this, true);
        this._topEquationVar = Variable.Dependent.empty(`${this.element.id}TopDependency`, this, true);
        this.rect._left.replaceEquation(() => {
            return this._leftEquationVar.value + this._leftOffset.value;
        });
        this.rect._left.linkDependentActions();
        this.rect._top.replaceEquation(() => {
            return this._topEquationVar.value + this._topOffset.value;
        });
        this.rect._top.linkDependentActions();

        (parent instanceof Zon.UI.UIElementBase ? parent.element : parent).appendChild(this.element);
        this.dependentVariables = [
            this._leftEquationVar,
            this._topEquationVar,
            this.rect._width,
            this.rect._height,
        ];
    }
    static create(...args) {
        return new this(...args).callAllPostConstructorMethods();
    }
    callAllPostConstructorMethods() {
        this.bindAll();
        this.postConstructor();
        
        //setup
        if (Zon.Setup.linkAndFinalizeUISetupActions) {
            Zon.Setup.linkAndFinalizeUISetupActions.add(this.setup);
        }
        else {
            this.setup();
            if (this.shown.value)
                this._updateShown();//TODO: try to remove this
        }

        //postSetup
        if (Zon.Setup.postLinkAndFinalizeUiSetupActions) {
            Zon.Setup.postLinkAndFinalizeUiSetupActions.add(this.postSetup);
        }
        else {
            this.postSetup();
        }

        if (zonDebug) {
            Variable.Dependent.resumeGetWhenNotLinkedWarning(this);
        }

        return this;
    }
    postConstructor() {
        //Order - super first

        //Usage:
        //Declare and link element variables
        //Pass 'this' functions to actions

        //Ready:
        //'this' functions
        //element.properties

        //Not ready:
        //element variables
        //rect (left, top, width, height)
        //text setter
        //fontSize setter

        this._computedStyle = getComputedStyle(this.element);

        if (this._display !== undefined)
            throw new Error(`_display should not be assigne before this opint.  Assign this.element.style.display instead.`);

        this._display = this.element.style.display !== "none" ? this.element.style.display : "block";
        this.element.style.display = "none";
        const shownName = `${this.element.id}Shown`;
        if (this.parent && this.inheritShown && this.parent !== Zon.device && this.parent !== window.document.body) {
            this.shown = new Variable.Dependent(() => this.parent.shown.value, shownName, this);
        }
        else {
            this.shown = new Variable.Value(false, shownName);
        }
        this.shown.onChangedAction.add(this._updateShown);
        this.shown.onChangedAction.add(() => console.log(`UIElementBase shown changed: ${this.element.id} - ${this.shown.value}`));

        this.position = new Variable.Value(this.element.style.position, `${this.element.id}Position`);
        this.position.onChangedAction.add(() => this.element.style.position = this.position.value);

        this.backgroundColor = new Variable.ColorVar(`${this.element.id}BackGroundColor`, this._computedStyle.backgroundColor);
        this.backgroundColor.onChangedAction.add(() => this.element.style.backgroundColor = this.backgroundColor.value.cssString);
        if (!this.element.style.backgroundColor)
            this.backgroundColor.onChangedAction.call();

        this.border = new Variable.Value(this.element.style.border, `${this.element.id}Border`);
        this.border.onChangedAction.add(() => this.element.style.border = this.border.value);

        this.borderRadius = new Variable.Value(parseFloat(this.element.style.borderRadius), `${this.element.id}BorderRadius`);
        this.borderRadius.onChangedAction.add(() => this.element.style.borderRadius = `${this.borderRadius.value}px`);

        this.rect._left.onChangedAction.add(this._updateLeft);
        this.rect._top.onChangedAction.add(this._updateTop);
        this.rect._width.onChangedAction.add(this._updateWidth);
        this.rect._height.onChangedAction.add(this._updateHeight);
    }
    setup() {
        //Here to make sure super.setup() is always a valid call in children setup() methods.

        //Order - super first

        //Usage:
        //replace rect functions (left, top, width, height)

        //Ready:
        //element variables
        //'this' functions
        //element.properties

        //Not ready:
        //rect (left, top, width, height)
        //text setter
        //fontSize setter
    }
    postSetup() {

        //Order - super first

        //Usage:
        //Final setup that requires rect values (left, top, width, height)
        //Set text and fontSize

        //Ready:
        //rect (left, top, width, height)
        //text setter
        //fontSize setter
        //element variables
        //'this' functions
        //element.properties

        //Not ready:
        //(none)

        this._computedStyle = undefined;
        this._updateAllValues();
    }

    //#endregion Constructors





    //#region Rect

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
        console.log(`UIElementBase _updateAllValues: ${this.element.id} - left: ${this.left}, top: ${this.top}, width: ${this.width}, height: ${this.height}`);
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

    //#endregion Rect





    //#region Shown

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
        if (this.shown.value) {
            Variable.Base.pause();//Prevent onChangedActions until all are linked.
            for (const dependentVariable of this.dependentVariables) {
                dependentVariable.linkDependentActions();
            }

            Variable.Base.resume();
            
            console.log(`UIElementBase _updateShown s: ${this.element.id}, display: ${this.element.style.display}, _display: ${this._display}`);
            if (this.element.style.display !== "none")
                throw new Error(`UIElementBase _updateShown: this.element.style.display is not "none".  Set this._display instead.`);
                
            this.element.style.display = this._display;

            console.log(`-UIElementBase _updateShown s: ${this.element.id}, display: ${this.element.style.display}, _display: ${this._display}`);
            this._updateAllValues();
            this.onShowActions.call();
            this.updateUIContent();
        } else {
            for (const dependentVariable of this.dependentVariables) {
                dependentVariable.unlinkDependentActions();
            }

            console.log(`UIElementBase _updateShown h: ${this.element.id}, display: ${this.element.style.display}, _display: ${this._display}`);
            if (this.element.style.display && this.element.style.display !== "none")
                this._display = this.element.style.display;

            this.element.style.display = "none";
            console.log(`-UIElementBase _updateShown h: ${this.element.id}, display: ${this.element.style.display}, _display: ${this._display}`);
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

    //#endregion Shown





    //#region Other

    updateUIContent() {//Not used?
        if (!this.shown.value)
            return;

        this.updateUIActions.call();
    }
    setHoverColor(colorUint) {
        //Make sure to call this after this.element.style.backgroundColor is set.
        if (colorUint === undefined || colorUint === null)
            return;

        this._hoverColor = colorUint;
        this._backgroundColor = this.backgroundColor?.uint ?? Struct.Color.parse(this.element.style.backgroundColor)?.uint;
        if (!this._backgroundColor)
            throw new Error(`UIElementBase.setHoverColor: this._backgroundColor is undefined.  Set this.element.style.backgroundColor before calling this method.`);
        
        this.element.addEventListener('mouseenter', () => {
            if (this._hoverColor) {
                this.backgroundColor.uint = this._hoverColor;
            }
        });
        this.element.addEventListener('mouseleave', () => {
            if (this._backgroundColor) {
                this.backgroundColor.uint = this._backgroundColor;
            }
        });
    }

    //#endregion Other
}

Zon.UI.UIElementCanvas = class UIElementCanvas extends Zon.UI.UIElementBase {
    constructor(canvasId, width = 300, height = 150, zIndex = 0, parent = Zon.device) {
        const newCanvas = document.createElement("canvas");
        newCanvas.id = canvasId;
        super(newCanvas, zIndex, parent);
        this.element.width = width;
        this.element.height = height;
        this.ctx = this.element.getContext('2d');
    }
    postConstructor() {
        super.postConstructor();

        this.canvasWidth = new Variable.Value(this.element.width, `${this.element.id}CanvasWidth`);
        this.canvasWidth.onChangedAction.add(() => this.element.width = this.canvasWidth.value);

        this.canvasHeight = new Variable.Value(this.element.height, `${this.element.id}CanvasHeight`);
        this.canvasHeight.onChangedAction.add(() => this.element.height = this.canvasHeight.value);
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
    }
    postConstructor() {
        super.postConstructor();

        this._tryCreateTextComponent();
    }
    _tryCreateTextComponent() {
        if (this.element.innerText || this.element.fontSize || this.element.style.color || this.element.style.fontWeight) {
            this.createTextComponent();
        }
    }
    createTextComponent() {
        if (this.text !== undefined) {
            console.warn(`UIElementDiv.createTextComponent: Text component already exists for ${this.element.id}.`);
            return;
        }

        this.text = new Variable.Value(this.innerText, `${this.element.id}Text`);

        const fontSizeName = `${this.element.id}FontSize`;
        if (this.element.style.fontSize) {
            //I don't plan to ever have static font sizes, but this is here just in case.
            this.fontSize = new Variable.Value(this.element.style.fontSize, fontSizeName);
            this.fontSize.onChangedAction.add(() => {
                const value = this.fontSize.value;
                this.element.style.fontSize = typeof value === 'number' ? `${value}px` : value;
            });

            this.text.onChangedAction.add(() => {
                (this.textElement ?? this.element).innerText = this.text.value;
            });
        }
        else {
            //Use this.fontSize.replaceEuquation() with Variable.DependentFunction
            this.fontSize = new Variable.Dependent(() => this.height * 0.8, fontSizeName, this);
            this.fontSize.onChangedAction.add(this._fitText);

            this.text.onChangedAction.add(() => {
                (this.textElement ?? this.element).innerText = this.text.value;
                this._fitText();
            });

            
            this.parent?.shown?.onChangedAction.add(this._fitText);//TODO: remove this?
            this.shown?.onChangedAction.add(this._fitText);
        }

        this.textColor = new Variable.ColorVar(`${this.element.id}TextColor`, this._computedStyle.color);
        this.textColor.onChangedAction.add(() => this.element.style.color = this.textColor.value.cssString);
        if (!this.element.style.color)
            this.textColor.onChangedAction.call();

        this.fontWeight = new Variable.Value(this.element.style.fontWeight, `${this.element.id}FontWeight`);
        this.fontWeight.onChangedAction.add(() => this.element.style.fontWeight = this.fontWeight.value);
    }
    postSetup() {
        super.postSetup();

        this.fontSize?.onChangedAction.call();
        
        if (this.text?.value)
            this.text.onChangedAction.call();
        
        console.log(`UIElementDiv postSetup: ${this.element.id}`);
    }

    static _getTextMeasuringSpan(element) {
        if (!this._textMeasuringSpan) {
            this._textMeasuringSpan = document.createElement("span");
            this._textMeasuringSpan.id = "textMeasuringSpan";
            this._textMeasuringSpan.style.position = "absolute";
            this._textMeasuringSpan.style.visibility = "hidden";
            this._textMeasuringSpan.style.pointerEvents = "none";
            this._textMeasuringSpan.style.userSelect = "none";
            document.body.appendChild(this._textMeasuringSpan);
        }

        const spanStyle = this._textMeasuringSpan.style;
        const elementStyle = element.style;

        spanStyle.fontFamily = elementStyle.fontFamily;
        spanStyle.fontStyle = elementStyle.fontStyle;
        spanStyle.fontWeight = elementStyle.fontWeight;
        spanStyle.fontSize = elementStyle.fontSize;
        spanStyle.letterSpacing = elementStyle.letterSpacing;
        spanStyle.textTransform = elementStyle.textTransform;
        spanStyle.textIndent = elementStyle.textIndent;
        spanStyle.whiteSpace = elementStyle.whiteSpace;

        return this._textMeasuringSpan;
    }

    _fitText() {
        //this._updateAllValues();
        let fontSize = this.fontSize.value;
        const textElement = this.textElement ?? this.element;
        textElement.style.fontSize = `${this.fontSize.value}px`;
        if (!textElement.id)
            throw new Error(`Text element does not have an id: ${textElement}`);

        console.log(`Fitting text: ${textElement.id} - ${textElement.scrollWidth} - ${textElement.clientWidth} - ${this.element.getBoundingClientRect().width} - ${textElement.getBoundingClientRect().width}, shown: ${this.shown.value}, text: ${this.text.value}, fontSize: ${this.fontSize.value}, height: ${this.height}`);
        if (!this.text.value)
            return;

        //let lastScrollWidth = textElement.scrollWidth;
        // if (lastScrollWidth <= textElement.clientWidth)
        //     return;

        let lastScrollWidth = this.element.scrollWidth;
        if (lastScrollWidth <= this.element.clientWidth)
            return;

        // let lastScrollWidth = this.element.getBoundingClientRect().width;
        // if (lastScrollWidth <= this.element.clientWidth)
        //     return;

        while (lastScrollWidth > textElement.clientWidth) {
        //while (lastScrollWidth > this.element.clientWidth) {
            if (fontSize > 1) {
                fontSize -= 1;
            }
            else {
                fontSize *= 0.9;
            }
            
            textElement.style.fontSize = `${fontSize}px`;
            //if (this.element.getBoundingClientRect().width === lastScrollWidth) {
            if (this.element.scrollWidth === lastScrollWidth) { 
            //if (textElement.scrollWidth === lastScrollWidth) {
                console.warn(`Text node scroll width did not change: ${textElement.id} - ${textElement.scrollWidth}`);
                textElement.style.fontSize = `${this.fontSize.value}px`;
                return;
            }

            //lastScrollWidth = this.element.getBoundingClientRect().width;
            lastScrollWidth = this.element.scrollWidth;
            //lastScrollWidth = textElement.scrollWidth;
        }

        this.fontSize._value = fontSize * 0.9;
        textElement.style.fontSize = `${this.fontSize.value}px`;
        console.log(textElement.getBoundingClientRect());
        console.log(this.element.getBoundingClientRect());

        console.log(`Fitted text: ${textElement.id} - ${this.fontSize.value};  lineHeight: ${textElement.style.lineHeight};  height: ${textElement.style.height} heightVar: ${this.height}, padding: ${textElement.style.padding}`);
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