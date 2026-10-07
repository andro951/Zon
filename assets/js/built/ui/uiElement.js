"use strict";

Zon.UI.UIElementBase = class UIElementBase {

    //#region Constructors

    constructor(element, zIndex, parent = Zon.device, { inheritShown = null, dependentRect = true } = {}) {
        if (new.target === Zon.UI.UIElementBase)
            throw new TypeError("Cannot construct UIElementBase instances directly");

        if (zIndex === undefined || zIndex === null)
            throw new Error(`UIElementBase constructor: zIndex can't be undefined or null.`);

        if (parent == window.document.body && element.id !== 'device')
            throw new Error(`UIElementBase constructor: parent can't be the document body.  Use Zon.device instead.`);

        if (inheritShown === null && element.id !== 'device') {
            if (!Zon.device)
                throw new Error(`UIElementBase constructor: Zon.device is not defined yet.  Pass inheritShown as false or wait to construct this element until after Zon.device is defined.`);

            inheritShown = parent !== Zon.device;
        }
        
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
        //shown

        Variable.Base.pause(this);

        //this.isChild should be set on all elements in a row/column.  It is undefined otherwise.

        this.parent = parent;
        this.inheritShown = inheritShown;
        this.element = element;
        this.element.style.zIndex = zIndex.toString();
        this.element.style.display = "none";
        this.element.style.position = "absolute";
        this.element.style.userSelect = 'none';
        this.element.style.boxSizing = 'border-box';
        if (dependentRect) {
            this.rect = Struct.DynamicRectangle.dependentEmpty(this.element.id, this, { linkDependentActions: false });
            this._leftOffset = new Variable.Value(0, `${this.element.id}LeftOffset`);
            this._topOffset = new Variable.Value(0, `${this.element.id}TopOffset`);
            this._leftEquationVar = Variable.Dependent.empty(`${this.element.id}LeftDependency`, this , { linkDependentActions: false });
            this._topEquationVar = Variable.Dependent.empty(`${this.element.id}TopDependency`, this, { linkDependentActions: false });
            this.rect._left.replaceEquation(() => {
                return this._leftEquationVar.value + this._leftOffset.value;
            });
            this.rect._left.linkDependentActions();
            this.rect._top.replaceEquation(() => {
                return this._topEquationVar.value + this._topOffset.value;
            });
            this.rect._top.linkDependentActions();
            this.dependentVariables = [
                this._leftEquationVar,
                this._topEquationVar,
            ];
        }
        else {
            this.rect = Struct.DynamicRectangle.zero(this.element.id, this);
            this.dependentVariables = [];
        }

        this.innerRect = Struct.DynamicRectangle.dependentEmpty(`${this.element.id}Inner`, this);

        this.onHideActions = new Actions.Action(`${this.constructor.name} ${this.element.id} onHideActions`);
        this.onShowActions = new Actions.Action(`${this.constructor.name} ${this.element.id} onShowActions`);
        this.postConstructorActions = new Actions.Action(`${this.constructor.name} ${this.element.id} postConstructorActions`);
        
        (parent instanceof Zon.UI.UIElementBase ? parent.element : parent).appendChild(this.element);
    }
    static create(...args) {
        return new this(...args).callAllPostConstructorMethods();
    }
    callAllPostConstructorMethods() {
        this.bindAll();

        const shownName = `${this.element.id}Shown`;
        if (this.inheritShown && this.parent !== window.document.body) {
            this.shown = new Variable.Dependent(() => this.parent.shown.value, shownName, { this: this }, { defaultValue: false, linkDependentActions: false });
            //All panels start off hidden.  Manually setting false here prevent's _updateShown being 
            // called when it would change from undefined to false.
        }
        else {
            this.shown = new Variable.Value(false, shownName);
        }
        this.shown.onChangedAction.add(this._updateShown);
        if (zonDebug) {
            //this.shown.onChangedAction.add(() => console.log(`UIElementBase shown changed: ${this.element.id} - ${this.shown.value}`));
        }

        this.postConstructor();
        
        //setup
        if (Zon.Setup.linkAndFinalizeUISetupActions) {
            Zon.Setup.linkAndFinalizeUISetupActions.add(this.setup);
        }
        else {
            this.setup();
        }

        //postSetup
        if (Zon.Setup.postLinkAndFinalizeUiSetupActions) {
            Zon.Setup.postLinkAndFinalizeUiSetupActions.add(this.postSetup);
            Zon.Setup.postLinkAndFinalizeUiSetupActions.add(() => Variable.Base.resume(this));
        }
        else {
            this.postSetup();
            Variable.Base.resume(this);
        }

        // if (zonDebug) {
        //     Variable.Dependent.resumeGetWhenNotLinkedWarning(this);
        // }

        return this;
    }
    postConstructor() {
        //Order - super first

        //Usage:
        //Declare and link element variables
        //Pass 'this' functions to actions
        //Replace shown equation if needed

        //Ready:
        //'this' functions
        //element.properties
        //shown

        //Not ready:
        //element variables
        //rect (left, top, width, height)
        //text setter
        //fontSize setter

        //'this.dependentVariables.length > 0' indicates dependentRect was true in the constructor.
        //If other dependentVariables are added, just save dependentRect as a bool instead.
        if (this.dependentVariables.length > 0) {
            if (this.isChild) {
                if (this.parent.isColumn) {
                    this._heightEquationVar = Variable.Dependent.empty(`${this.element.id}HeightDependency`, this , { linkDependentActions: false });
                    this.rect._height.replaceEquation(() => {
                        return this.shown.value ? this._heightEquationVar.value : 0;
                    });
                    this.rect._height.linkDependentActions();
                }
                else {
                    this._widthEquationVar = Variable.Dependent.empty(`${this.element.id}WidthDependency`, this , { linkDependentActions: false });
                    this.rect._width.replaceEquation(() => {
                        return this.shown.value ? this._widthEquationVar.value : 0;
                    });
                    this.rect._width.linkDependentActions();
                }
            }

            if (this._widthEquationVar) {
                this.dependentVariables.push(this._widthEquationVar);
            }
            else {
                this.dependentVariables.push(this.rect._width);
            }

            if (this._heightEquationVar) {
                this.dependentVariables.push(this._heightEquationVar);
            }
            else {
                this.dependentVariables.push(this.rect._height);
            }
        }

        this._computedStyle = getComputedStyle(this.element);

        if (this._display !== undefined)
            throw new Error(`_display should not be assigne before this opint.  Assign this.element.style.display instead.`);

        this._display = this.element.style.display !== "none" ? this.element.style.display : "block";
        this.element.style.display = "none";

        this.position = new Variable.Value(this.element.style.position, `${this.element.id}Position`);
        this.position.onChangedAction.add(() => this.element.style.position = this.position.value);

        this.backgroundColor = new Variable.ColorVar(this._computedStyle.backgroundColor, `${this.element.id}BackGroundColor`);
        this.backgroundColor.onChangedAction.add(() => this.element.style.backgroundColor = this.backgroundColor.value.cssString);
        if (!this.element.style.backgroundColor)
            this.backgroundColor.onChangedAction.call();

        if (this.element.style.border)
            throw new Error(`Don't use style.border directly.  Use borderWidth, borderColor, and borderStyle instead.`);

        // this.border = new Variable.Value(this.element.style.border, `${this.element.id}Border`);
        // this.border.onChangedAction.add(() => {
            //Would need to dynamically find all 3 then update them.  Not worth it to me right now.
        //     this.element.style.border = this.border.value;
        // });

        this.borderWidth = new Variable.Value(this.getElementParameterNumber(this.element.style.borderWidth), `${this.element.id}BorderWidth`);
        this.borderWidth.onChangedAction.add(() => this.element.style.borderWidth = `${this.borderWidth.value}px`);

        if (this.children) {
            this.innerRect._left.replaceEquation(() => this.left + this.borderWidth.value + this.childrenPadding.value);
            this.innerRect._top.replaceEquation(() => this.top + this.borderWidth.value + this.childrenPadding.value);
            this.innerRect._width.replaceEquation(() => this.width - this.borderWidth.value * 2 - this.childrenPadding.value * 2 - Zon.UI.UIElementBase.expectedScrollBarWidth);
            this.innerRect._height.replaceEquation(() => this.height - this.borderWidth.value * 2 - this.childrenPadding.value * 2);
        }
        else {
            this.innerRect._left.replaceEquation(() => this.left + this.borderWidth.value);
            this.innerRect._top.replaceEquation(() => this.top + this.borderWidth.value);
            this.innerRect._width.replaceEquation(() => this.width - this.borderWidth.value * 2);
            this.innerRect._height.replaceEquation(() => this.height - this.borderWidth.value * 2);
        }

        this.borderColor = new Variable.ColorVar(this._computedStyle.borderColor, `${this.element.id}BorderColor`);
        this.borderColor.onChangedAction.add(() => this.element.style.borderColor = this.borderColor.value.cssString);

        this.borderStyle = new Variable.Value(this.element.style.borderStyle, `${this.element.id}BorderStyle`);
        this.borderStyle.onChangedAction.add(() => this.element.style.borderStyle = this.borderStyle.value);

        this.borderRadius = new Variable.Value(this.getElementParameterNumber(this.element.style.borderRadius), `${this.element.id}BorderRadius`);
        this.borderRadius.onChangedAction.add(() => this.element.style.borderRadius = `${this.borderRadius.value}px`);

        this.rect._left.onChangedAction.add(this._updateLeft);
        this.rect._top.onChangedAction.add(this._updateTop);
        this.rect._width.onChangedAction.add(this._updateWidth);
        this.rect._height.onChangedAction.add(this._updateHeight);

        if (this.children)
            this.createSpacer();

        if (this.newShownEquation) {
            this.shown.replaceEquation(this.newShownEquation);
            delete this.newShownEquation;
        }

        if (this.shown instanceof Variable.Dependent)
            this.shown.linkDependentActions();//Allows the shown equation to be replaced inside of constructor.

        this.postConstructorActions.call();
        delete this.postConstructorActions;
    }
    getElementParameterNumber(string) {
        let value = parseFloat(string);
        if (isNaN(value) || !value)
            return 0;

        return value;
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
        //shown

        if (this.isChild) {
            if (!this.parent.children)
                throw new Error(`UIElementBase setup: this.parent.children is undefined.  Call makeScrollableColumn() or makeScrollableRow() on the parent first.`);

            //Allow the request for top to fall through to the next child if not shown.
            const lastChild = this.parent.children.at(-1);
            if (lastChild === this)
                throw new Error(`UIElementBase setup: lastChild is this.  This shouldn't happen.`);

            if (this.parent.isColumn) {
                //Column
                const topFunc = lastChild ? new Variable.DependentFunction(() => lastChild.bottom + this.parent.childrenPadding.value, { this: this, lastChild }) : new Variable.DependentFunction(() => this.parent.childrenPadding.value, { this: this });
                this.replaceTop(topFunc);
                this.rect._top.replaceEquation(() => {
                    return this.shown.value ? this._topEquationVar.value + this._topOffset.value : lastChild ? lastChild.bottom : 0;
                }, { this: this, lastChild });
            } else {
                //Row
                const leftFunc = lastChild ? new Variable.DependentFunction(() => lastChild.right + this.parent.childrenPadding.value, { this: this, lastChild }) : new Variable.DependentFunction(() => this.parent.childrenPadding.value, { this: this });
                this.replaceLeft(leftFunc);
                this.rect._left.replaceEquation(() => {
                    return this.shown.value ? this._leftEquationVar.value + this._leftOffset.value : lastChild ? lastChild.right : 0;
                }, { this: this, lastChild });
            }
        }
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
        //shown

        //Not ready:
        //(none)

        delete this._computedStyle;
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
    get innerLeft() {
        return this.innerRect.left;
    }
    get innerTop() {
        return this.innerRect.top;
    }
    get innerWidth() {
        return this.innerRect.width;
    }
    get innerHeight() {
        return this.innerRect.height;
    }
    get innerRight() {
        return this.innerRect.right;
    }
    get innerBottom() {
        return this.innerRect.bottom;
    }
    get _innerLeft() {
        return this.innerRect._left;
    }
    get _innerTop() {
        return this.innerRect._top;
    }
    get _innerWidth() {
        return this.innerRect._width;
    }
    get _innerHeight() {
        return this.innerRect._height;
    }
    get _innerRight() {
        return this.innerRect._right;
    }
    get _innerBottom() {
        return this.innerRect._bottom;
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
    replaceTop(func, references = {}) {
        this._topEquationVar.replaceEquation(func, references);
    }
    replaceLeft(func, references = {}) {
        this._leftEquationVar.replaceEquation(func, references);
    }
    replaceWidth(func, references = {}) {
        if (this._widthEquationVar) {
            this._widthEquationVar.replaceEquation(func, references);
        }
        else {
            this.rect._width.replaceEquation(func, references);
        }
    }
    replaceHeight(func, references = {}) {
        if (this._heightEquationVar) {
            this._heightEquationVar.replaceEquation(func, references);
        }
        else {
            this.rect._height.replaceEquation(func, references);
        }
    }

    //#endregion Rect





    //#region Shown

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
    _linkDependentVariables() {
        const paused = Variable.Base.tryPause(this);
        for (const dependentVariable of this.dependentVariables) {
            dependentVariable.linkDependentActions();
        }

        if (paused)
            Variable.Base.resume(this);
    }
    _unlinkDependentVariables() {
        for (const dependentVariable of this.dependentVariables) {
            dependentVariable.unlinkDependentActions();
        }
    }
    _tryCaptureStyleDisplay() {
        if (this.element.style.display && this.element.style.display !== "none")
            this._display = this.element.style.display;

        this.element.style.display = "none";
    }
    _updateShown() {
        if (this.shown.value) {
            this._linkDependentVariables();
            if (this.animation)
                this.animation.postLinkDependentVariables();

            if (this.element.style.display !== "none")
                throw new Error(`UIElementBase _updateShown: this.element.style.display is not "none".  Set this._display instead.`);
                
            this.element.style.display = this._display;
            this.onShowActions.call();
        } else {
            this._unlinkDependentVariables();
            this._tryCaptureStyleDisplay();
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





    //#region Text
    
    _tryCreateTextComponent() {
        if ((this.element.tagName === 'INPUT' || this.element.tagName === 'DIV' && this.element.textContent) || this.element.fontSize || this.element.style.color || this.element.style.fontWeight) {
            this.createTextComponent();
        }
    }
    static getValueFromElementProperty(elementProperty) {
        if (elementProperty.endsWith("px")) {
            elementProperty = elementProperty.slice(0, -2);
        }

        if (!elementProperty)
            return 0;

        const value = parseFloat(elementProperty);
        if (isNaN(value))
            throw new Error(`Unable to parse number from element property.  Value: ${elementProperty}, parsed value: ${value}`);

        return value;
    }
    createTextComponent() {
        if (this.text !== undefined)
            return;//Already created

        const isInput = this.element.tagName === 'INPUT';
        this._getText = isInput ? () => this.element.value : () => this.element.textContent;
        this._textElement = this.textElement ?? this.element;

        if (this._textElement.style.whiteSpace !== 'nowrap')
            this._textElement.style.whiteSpace = 'pre-wrap';

        this._textElement.style.overflowWrap = "break-word";
        
        this._setText = isInput ? (text) => this.element.value = text : (text) => this._textElement.textContent = text;
        const text = this._getText();
        this.text = new Variable.Dependent(() => text, `${this.element.id}Text`, {}, { linkDependentActions: false });
        this.dependentVariables.push(this.text);

        const fontSizeName = `${this.element.id}FontSize`;
        if (this.element.style.fontSize) {
            let fontSize = Zon.UI.UIElementBase.getValueFromElementProperty(this.element.style.fontSize);
            this.maxFontSize = new Variable.Value(fontSize, `${this.element.id}MaxFontSize`);
        }
        
        this.textHeightPadding = new Variable.Value(0.1, `${this.element.id}TextHeightPadding`);
        this.textWidthPadding = new Variable.Value(0.02, `${this.element.id}TextWidthPadding`);

        if (this.maxFontSize) {
            this.fontSize = new Variable.Dependent(() => Math.min(this.height * (1 - this.textHeightPadding.value * 2), this.maxFontSize.value), fontSizeName, { this: this});
        }
        else {
            this.fontSize = new Variable.Dependent(() => this.height * (1 - this.textHeightPadding.value * 2), fontSizeName, { this: this});
        }
        
        this.fontSize.onChangedAction.add(this._fitText);
        this._width.onChangedAction.add(this._fitText);

        this.text.onChangedAction.add(() => {
            if (zonDebug) {
                if (this.element.children.length > 0) {
                    if (!this.textElement)
                        throw new Error(`Setting textElement on a div deletes all children.`);
                }
            }
            
            this._setText(this.text.value);
            this._fitText();
        });

        this.textColor = new Variable.ColorVar(this._computedStyle.color, `${this.element.id}TextColor`);
        this.textColor.onChangedAction.add(() => this.element.style.color = this.textColor.value.cssString);
        if (!this.element.style.color)
            this.textColor.onChangedAction.call();

        this.fontWeight = new Variable.Value(this.element.style.fontWeight, `${this.element.id}FontWeight`);
        this.fontWeight.onChangedAction.add(() => this.element.style.fontWeight = this.fontWeight.value);
    }

    _getTextWidth(text, elementStyle) {
        if (!text)
            return 0;

        const div = Zon.UI.UIElementDiv;
        if (!div._textMeasuringSpan) {
            div._textMeasuringSpan = document.createElement("span");
            const textMeasuringSpan = div._textMeasuringSpan;
            textMeasuringSpan.id = "textMeasuringSpan";
            const style = textMeasuringSpan.style;
            style.position = "absolute";
            style.visibility = "hidden";
            style.pointerEvents = "none";
            style.userSelect = "none";
            style.whiteSpace = "nowrap";
            document.body.appendChild(textMeasuringSpan);
        }

        const spanStyle = div._textMeasuringSpan.style;

        spanStyle.fontFamily = elementStyle.fontFamily;
        spanStyle.fontStyle = elementStyle.fontStyle;
        spanStyle.fontWeight = elementStyle.fontWeight;
        spanStyle.fontSize = elementStyle.fontSize;
        spanStyle.letterSpacing = elementStyle.letterSpacing;
        spanStyle.textTransform = elementStyle.textTransform;
        spanStyle.textIndent = elementStyle.textIndent;
        div._textMeasuringSpan.textContent = text;

        return div._textMeasuringSpan.offsetWidth;
    }

    _getWrappedTextHeight(text, elementStyle, width) {
        if (!text)
            return 0;

        const div = Zon.UI.UIElementDiv;
        if (!div._textMeasuringSpanWrapped) {
            div._textMeasuringSpanWrapped = document.createElement("span");
            const textMeasuringSpan = div._textMeasuringSpanWrapped;
            textMeasuringSpan.id = "textMeasuringSpanWrapped";
            const style = textMeasuringSpan.style;
            style.position = "absolute";
            style.visibility = "hidden";
            style.pointerEvents = "none";
            style.userSelect = "none";
            document.body.appendChild(textMeasuringSpan);
        }

        const spanStyle = div._textMeasuringSpanWrapped.style;

        spanStyle.fontFamily = elementStyle.fontFamily;
        spanStyle.fontStyle = elementStyle.fontStyle;
        spanStyle.fontWeight = elementStyle.fontWeight;
        spanStyle.fontSize = elementStyle.fontSize;
        spanStyle.letterSpacing = elementStyle.letterSpacing;
        spanStyle.textTransform = elementStyle.textTransform;
        spanStyle.textIndent = elementStyle.textIndent;
        spanStyle.whiteSpace = elementStyle.whiteSpace;
        spanStyle.overflowWrap = elementStyle.overflowWrap;

        div._textMeasuringSpanWrapped.style.width = `${width}px`;

        div._textMeasuringSpanWrapped.textContent = text;

        return div._textMeasuringSpanWrapped.offsetHeight;
    }

    _getWrappedTextHeightAgain(textSize) {
        const div = Zon.UI.UIElementDiv;
        div._textMeasuringSpanWrapped.style.fontSize = `${textSize}px`;
        return div._textMeasuringSpanWrapped.offsetHeight;
    }

    //Used for testing only
    static async testingLineSpacing() {
        await document.fonts.ready;

        const textElement = Zon.topUI.levelBar._textElement;
        const elementStyle = window.getComputedStyle(textElement);

        const div = Zon.UI.UIElementDiv;
        if (!div._textMeasuringSpanTesting) {
            div._textMeasuringSpanTesting = document.createElement("span");
            const textMeasuringSpan = div._textMeasuringSpanTesting;
            textMeasuringSpan.id = "textMeasuringSpan";
            const style = textMeasuringSpan.style;
            style.position = "absolute";
            style.visibility = "hidden";
            style.pointerEvents = "none";
            style.userSelect = "none";
            style.display = 'inline-block'
            //style.whiteSpace = "nowrap";
            style.whiteSpace = 'pre-wrap';
            document.body.appendChild(textMeasuringSpan);
        }

        const spanStyle = div._textMeasuringSpanTesting.style;

        spanStyle.fontFamily = elementStyle.fontFamily;
        spanStyle.fontStyle = elementStyle.fontStyle;
        spanStyle.fontWeight = elementStyle.fontWeight;
        spanStyle.letterSpacing = elementStyle.letterSpacing;
        spanStyle.textTransform = elementStyle.textTransform;
        spanStyle.textIndent = elementStyle.textIndent;

        const testString = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
        
        console.log(`Testing line spacing with font: ${spanStyle.fontStyle} ${spanStyle.fontWeight} ${spanStyle.fontSize} ${spanStyle.fontFamily}, letterSpacing: ${spanStyle.letterSpacing}, textTransform: ${spanStyle.textTransform}, textIndent: ${spanStyle.textIndent}`);
        for (let i = 1; i < 10; i++) {
            const textSize = i * 10;
            spanStyle.fontSize = `${textSize}px`;

            const text1 = testString;
            div._textMeasuringSpanTesting.textContent = text1;
            const height1 = div._textMeasuringSpanTesting.offsetHeight;

            const text2 = testString + "\n" + testString;
            div._textMeasuringSpanTesting.textContent = text2;
            const height2 = div._textMeasuringSpanTesting.offsetHeight;

            const text3 = testString + "\n" + testString + "\n" + testString;
            div._textMeasuringSpanTesting.textContent = text3;
            const height3 = div._textMeasuringSpanTesting.offsetHeight;

            const lineSpacing1 = height2 - height1 * 2;
            const lineSpacingFrac1 = (lineSpacing1 + height1) / height1;
            const lineSpacing2 = (height3 - height1 * 3) / 2;
            const lineSpacingFrac2 = (lineSpacing2 + height1) / height1;

            console.log(`Font size: ${textSize}px, height1: ${height1}px, height2: ${height2}px, height3: ${height3}px, line spacing: ${lineSpacing1}, ${lineSpacing2}px, line spacing frac: ${lineSpacingFrac1}, ${lineSpacingFrac2}`);
        }
    }

    async _fitText() {
        await document.fonts.ready;

        if (this._textElement.style.whiteSpace === 'nowrap') {
            this._textElement.style.fontSize = `${this.fontSize.value}px`;
            const elementStyle = window.getComputedStyle(this._textElement);
            const textWidth = this._getTextWidth(this._getText(), elementStyle);
            if (zonDebug) {
                //console.log(`Fitting text: ${this._textElement.id} - ${textWidth} - ${this._textElement.scrollWidth} - ${this._textElement.clientWidth} - ${this._textElement.getBoundingClientRect().width}, shown: ${this.shown.value}, text: ${this.text.value}, fontSize: ${this.fontSize.value}, width: ${this.width}, height: ${this.height}`);
            }
            
            if (textWidth <= 0)
                return;

            const leftElementPadding = Zon.UI.UIElementBase.getValueFromElementProperty(elementStyle.paddingLeft);
            const rightElementPadding = Zon.UI.UIElementBase.getValueFromElementProperty(elementStyle.paddingRight);
            const maxWidth = this.innerWidth * (1 - this.textWidthPadding.value * 2) - leftElementPadding - rightElementPadding;
            const scale = Math.min(1, maxWidth / textWidth);
            this._textElement.style.fontSize = `${this.fontSize.value * scale}px`;
        }
        else {
            //Wrapping text
            const div = Zon.UI.UIElementDiv;
            this._textElement.style.fontSize = `${this.fontSize.value}px`;
            let elementStyle = window.getComputedStyle(this._textElement);
            const text = this._getText();
            if (!text)
                return;

            const textWidth = this._getTextWidth(text, elementStyle);
            const oneLineHeight = div._textMeasuringSpan.offsetHeight;

            //guess the number of lines and height
            const leftElementPadding = Zon.UI.UIElementBase.getValueFromElementProperty(elementStyle.paddingLeft);
            const rightElementPadding = Zon.UI.UIElementBase.getValueFromElementProperty(elementStyle.paddingRight);
            const maxWidth = this.innerWidth * (1 - this.textWidthPadding.value * 2) - leftElementPadding - rightElementPadding;
            const lines = Math.ceil(textWidth / maxWidth);
            if (zonDebug) {
                if (lines === 1)
                    console.error(`This text should probably have nowrap because it fits on one line.  element: ${this.element.id}, text:\n${text}`);
            }
            
            const estimatedHeight = lines * oneLineHeight;
            const maxHeight = this.innerHeight;// * (1 - this.textHeightPadding.value * 2);
            const unclippedEstimatedTextSize = Math.ceil(this.fontSize.value * Math.sqrt(maxHeight / estimatedHeight));
            const estimatedTextSize = Math.max(1, Math.min(this.fontSize.value, unclippedEstimatedTextSize));
            this._textElement.style.fontSize = `${estimatedTextSize}px`;

            if (zonDebug) {
                // console.log(`Fitting wrapped text;`);
                // console.log(`original text size: ${this.fontSize.value}px}`);
                // console.log(`oneLineWidth: ${textWidth}px`);
                // console.log(`oneLineHeight: ${oneLineHeight}px`);
                // console.log(`estimated lines: ${lines}`);
                // console.log(`estimated height: ${estimatedHeight}px`);
                // console.log(`maxWidth: ${maxWidth}px, maxHeight: ${maxHeight}px`);
                // console.log(`maxHeight: ${maxHeight}px`);
                // console.log(`unclippedEstimatedTextSize: ${unclippedEstimatedTextSize}px`);
                // console.log(`estimated text size: ${estimatedTextSize}px`);
            }

            const firstHeight = this._getWrappedTextHeight(text, elementStyle, maxWidth);
            if (firstHeight > maxHeight) {
                let textSize = estimatedTextSize;
                for (;;) {
                    if (textSize > 1) {
                        textSize--;
                    }
                    else {
                        textSize *= 0.95;
                        if (zonDebug) {
                            console.error(`Text size is very small.  This probably means the text can't fit in the element even at a size of 1px.  Text: "${text}", element id: ${this.element.id}, estimated text size: ${estimatedTextSize}px, maxHeight: ${maxHeight}px.`);
                        }
                    }
                    
                    this._textElement.style.fontSize = `${textSize}px`;

                    const textHeight = this._getWrappedTextHeightAgain(textSize);
                    if (textHeight <= 0)
                        return;

                    if (textHeight <= maxHeight)
                        break;

                    if (zonDebug) {
                        // console.log(`measured text height: ${textHeight}px`);
                        // console.log(`final text size: ${textSize}px`);
                        // console.log(``);
                    }
                }
            }


        }
    }

    //#endregion Text





    //#region Other

    static expectedScrollBarWidth = 19 / 1.25;
    static defaultButtonBorderRadius = 8;
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
    createSpacer() {
        if (!this.children)
            throw new Error(`UIElementBase.createSpacer: this.children is undefined.  Call makeScrollableColumn() or makeScrollableRow() first.`);

        if (this._spacer)
            throw new Error(`UIElementBase.createSpacer: Spacer already exists.`);

        //this.element.style.zIndex
        this._spacer = Zon.UI.UIElementDiv2.create(`${this.element.id}Spacer`, this.element.style.zIndex, this, {
            constructorFunc: (d) => {
                d.element.style.visibility = 'hidden';
                d.element.style.pointerEvents = 'none';
                //d.element.style.backgroundColor = Struct.Color.fromUInt(0xFF0000FF).cssString;
            },
            setupFunc: (d) => {
                if (d.parent.isColumn) {
                    d.replaceLeft(() => 
                        d.parent.childrenPadding.value, { d });
                    d.replaceWidth(() => 
                        d.parent.innerWidth, { d });
                    d.replaceHeight(() => 
                        d.parent.childrenPadding.value, { d });
                    const updateTopFunc = () => {
                        const lastChild = d.parent.lastChild;
                        if (lastChild) {
                            d.replaceTop(() => 
                                lastChild.bottom, { lastChild });
                        }
                        else {
                            d.replaceTop(() => 
                                0, { lastChild });
                        }
                    }

                    d.parent.children.onChangedAction.add(updateTopFunc);
                    updateTopFunc();
                }
                else {
                    d.replaceTop(() => 
                        d.parent.childrenPadding.value, { d });
                    d.replaceHeight(() => 
                        d.parent.innerHeight, { d });
                    d.replaceWidth(() => 
                        d.parent.childrenPadding.value, { d });
                    const updateLeftFunc = () => {
                        const lastChild = d.parent.lastChild;
                        if (lastChild) {
                            d.replaceLeft(() => 
                                lastChild.right, { lastChild });
                        }
                        else {
                            d.replaceLeft(() => 
                                0, { lastChild });
                        }
                    }

                    d.parent.children.onChangedAction.add(updateLeftFunc);
                    updateLeftFunc();
                }
            }
        });
    }
    makeScrollableColumn(alwaysShowScrollBar = true) {
        this.element.setScrollableColumnStyle(alwaysShowScrollBar);

        this.childrenPadding = new Variable.Value(4, `${this.element.id}ChildrenPadding`);

        this.children = Variable.createArray();
        this.isColumn = true;//!isColumn means isRow.
    }
    makeScrollableRow(alwaysShowScrollBar = true) {
        this.element.setScrollableRowStyle(alwaysShowScrollBar);

        this.childrenPadding = new Variable.Value(4, `${this.element.id}ChildrenPadding`);
        this.children = Variable.createArray();
        this.isColumn = false;//!isColumn means isRow.
    }
    addChild(child) {
        if (!this.children)
            throw new Error(`UIElementBase.addChild: this.children is undefined.  Call makeScrollableColumn() or makeScrollableRow() first.`);

        if (!child.isChild)
            throw new Error(`UIElementBase.addChild: child.isChild is not true.  Make sure to set child.isChild = true in the child element's constructor.`);

        if (Zon.Setup.linkAndFinalizeUISetupActions) {
            Zon.Setup.linkAndFinalizeUISetupActions.add(() => {
                this.children.push(child);
            });
        }
        else {
            this.children.push(child);
        }
        
        return child;
    }
    get lastChild() {
        if (!this.children)
            throw new Error(`UIElementBase.lastChild: this.children is undefined.  Call makeScrollableColumn() or makeScrollableRow() first.`);

        return this.children.at(-1);
    }
    addIconButton(buttonName, onClick, iconName, options = {}) {
        options.isChild = true;
        const iconPath = Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.ICONS, iconName);
        const button = Zon.UI.SimpleIconButton.create(buttonName, onClick, iconPath, this, options);
        return this.addChild(button);
    }
    addTextButton(buttonName, onClick, buttonText, options = {}) {
        options.isChild = true;
        const button = Zon.UI.SimpleTextButton.create(buttonName, onClick, buttonText, this, options);
        return this.addChild(button);
    }
    addChildByClass(childClass, ...args) {
        const lastChild = this.children.at(-1);
        const child = childClass.create(this, lastChild, this.childrenPadding, ...args);
        if (!child || !child.element)
            throw new Error(`UIElementBase.addChild: childFunc did not return a valid child.  Make sure to return the child from the childFunc.`);

        return this.addChild(child);
    }
    validateSizeFunctions(leftFunc, topFunc, widthFunc, heightFunc) {
        if (this.parent && this.parent.children) {
            if (this.parent.isColumn) {
                if (!leftFunc)
                    throw new Error("leftFunc must be provided for column parent");

                if (topFunc)
                    throw new Error("topFunc should not be provided for column parent");
            }
            else {
                if (!topFunc)
                    throw new Error("topFunc must be provided for row parent");

                if (leftFunc)
                    throw new Error("leftFunc should not be provided for row parent");
            }

            if (!widthFunc || !heightFunc)
                throw new Error("Width and height functions must be provided.");
        }
        else {
            if (!leftFunc || !topFunc || !widthFunc || !heightFunc)
                throw new Error("All position and size functions must be provided.");
        }
    }
    applySizeFunctions(functions) {
        if (functions.leftFunc)
            this.replaceLeft(functions.leftFunc);

        if (functions.topFunc)
            this.replaceTop(functions.topFunc);

        this.replaceWidth(functions.widthFunc);
        this.replaceHeight(functions.heightFunc);
    }
    removeAllChildren() {
        if (!this.children)
            throw new Error(`UIElementBase.clearAllChildren: this.children is undefined.  Call makeScrollableColumn() first.`);

        for (const child of this.children) {
            this.element.removeChild(child.element);
        }

        this.children.clear();
    }
    addOnClick(onClick) {
        this.element.addOnClick(onClick);
    }

    //#endregion Other
}

Zon.UI.UIElementCanvas = class UIElementCanvas extends Zon.UI.UIElementBase {
    constructor(canvasId, width = 300, height = 150, zIndex = 0, parent = Zon.device, { inheritShown = true, dependentRect = true } = {}) {
        const newCanvas = document.createElement("canvas");
        newCanvas.id = canvasId;
        super(newCanvas, zIndex, parent, { inheritShown, dependentRect });
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
    constructor(divId, zIndex = 0, parent = Zon.device, { inheritShown = null, dependentRect = true } = {}) {
        if (divId === undefined) {
            //throw new Error(`divId is required for UIElementDiv.`);
            console.warn(`divId is recommended for UIElementDiv to prevent id conflicts.  Proceeding without divId.`);
        }
        else if (document.getElementById(divId)) {
            throw new Error(`Element with id ${divId} already exists.  Please choose a different id for this element.`);
        }

        const newDiv = document.createElement("div");
        newDiv.id = divId;
        super(newDiv, zIndex, parent, { inheritShown, dependentRect });
    }
    postConstructor() {
        super.postConstructor();

        this._tryCreateTextComponent();
    }
}

Zon.UI.UIElementDiv2 = class UIElementDiv2 extends Zon.UI.UIElementDiv {
    constructor(divId, zIndex = 0, parent = Zon.device, { constructorFunc, postConstructorFunc, setupFunc, postSetupFunc, onClick, inheritShown = null, dependentRect = true } = {}) {
        super(divId, zIndex, parent, { inheritShown, dependentRect });
        constructorFunc?.(this);
        if (onClick) {
            this.addOnClick(onClick);
        }
        
        this.funcs = {
            postConstructorFunc,
            setupFunc,
            postSetupFunc
        };
    }
    postConstructor() {
        super.postConstructor();
        this.funcs.postConstructorFunc?.(this);
    }
    setup() {
        super.setup();
        this.funcs.setupFunc?.(this);
    }
    postSetup() {
        super.postSetup();
        this.funcs.postSetupFunc?.(this);
        delete this.funcs;
    }
}

Zon.UI.UIInputElement = class UIInputElement extends Zon.UI.UIElementBase {
    constructor(inputId, zIndex, parent = Zon.device, { constructorFunc, postConstructorFunc, setupFunc, postSetupFunc, changeFunc, inheritShown = true, dependentRect = true } = {}) {
        const inputElement = document.createElement("input");
        inputElement.id = inputId;
        super(inputElement, zIndex, parent, { inheritShown, dependentRect });
        if (changeFunc)
            this.element.addEventListener('change', (e) => changeFunc(this, e));

        constructorFunc?.(this);
        this.funcs = {
            postConstructorFunc,
            setupFunc,
            postSetupFunc
        };
    }
    postConstructor() {
        super.postConstructor();
        this._tryCreateTextComponent();
        this.funcs.postConstructorFunc?.(this);
    }
    setup() {
        super.setup();
        this.funcs.setupFunc?.(this);
    }
    postSetup() {
        super.postSetup();
        this.funcs.postSetupFunc?.(this);
        delete this.funcs;
    }
}

Zon.UI.UIElementZID = {
    COMBAT_UI: 0,
    MAIN_UI: 1,
    MENU: 2,
    BOTTOM_BUTTONS: 3,
    SIDE_BAR: 4,
    CLOSE_BUTTON_MENU: 5,
    CBM_SUB_MENU: 6,
    CLOSE_BUTTON: 7,
    POPUP: 8,
};
Zon.UI.UIElementZIDNames = [];
Enum.createEnum(Zon.UI.UIElementZID, Zon.UI.UIElementZIDNames, false);