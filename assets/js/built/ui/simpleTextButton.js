"use strict";

Zon.UI.SimpleTextButton = class SimpleTextButton extends Zon.UI.UIElementDiv {
    constructor(buttonName, onClick, buttonText, parent, {
        leftFunc,
        topFunc,
        widthFunc,
        heightFunc,
        textColor = 0xFFFFFFFF,
        backgroundColorUint = 0x040404FF,
        hoverColorUint = 0x101010FF,
        borderWidth = 2,
        borderStyle = 'solid',
        borderColor = '#AAA',
        borderRadius = 8,
        fontWeight = 'bold',
        isChild = false
    } = {}) {
        super(buttonName, Zon.UI.UIElementZID.MAIN_UI, parent);
        this.element.style.cursor = 'pointer';
        this.element.style.color = Struct.Color.fromUInt(textColor).cssString;
        this.element.style.backgroundColor = Struct.Color.fromUInt(backgroundColorUint).cssString;
        this.setHoverColor(hoverColorUint);
        this.element.style.borderWidth = `${borderWidth}px`;
        this.element.style.borderStyle = borderStyle;
        this.element.style.borderColor = borderColor;
        this.element.style.borderRadius = `${borderRadius}px`;
        this.element.style.fontWeight = fontWeight;
        this.validateSizeFunctions(leftFunc, topFunc, widthFunc, heightFunc);
            
        this._options = {
            leftFunc,
            topFunc,
            widthFunc,
            heightFunc,
        }

        this.element.textContent = buttonText;
        this.element.style.display = 'flex';
        this.element.style.justifyContent = 'center';
        this.element.style.alignItems = 'center';
        this.element.style.whiteSpace = 'nowrap';
        this.element.style.lineHeight = '1';
        this.element.addOnClick(onClick);

        if (isChild)
            this.isChild = true;
    }

    setup() {
        super.setup();
        
        this.applySizeFunctions(this._options);

        this._options = undefined;
    }
};