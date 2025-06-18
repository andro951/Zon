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
        fontWeight = 'bold'
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
        if (!leftFunc || !topFunc || !widthFunc || !heightFunc)
            throw new Error("All position and size functions must be provided.");
            
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
    }

    setup() {
        super.setup();
        
        this.replaceLeft(this._options.leftFunc);
        this.replaceTop(this._options.topFunc);
        this.replaceWidth(this._options.widthFunc);
        this.replaceHeight(this._options.heightFunc);

        this._options = undefined;
    }
};