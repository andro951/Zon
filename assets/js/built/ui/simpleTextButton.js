"use strict";

Zon.UI.SimpleTextButton = class SimpleTextButton extends Zon.UI.UIElementDiv {
    constructor(buttonName, onClick, buttonText, parent, leftFunct, topFunct, widthFunct, heightFunct, {
        textColor = 0xFFFFFFFF,
        backgroundColorUint = 0x040404FF,
        hoverColorUint = 0x101010FF,
        border = `2px solid #AAA`,
        borderRadius = 8,
        fontWeight = 'bold'
    } = {}) {
        super(buttonName, Zon.UI.UIElementZID.MAIN_UI, parent);
        this.element.style.cursor = 'pointer';
        this.onClick = onClick;
        this.element.style.color = Struct.Color.fromUInt(textColor).cssString;
        this.element.style.backgroundColor = Struct.Color.fromUInt(backgroundColorUint).cssString;
        this.setHoverColor(hoverColorUint);
        this.element.style.border = border;
        this.element.style.borderRadius = `${borderRadius}px`;
        this.element.style.fontWeight = fontWeight;
        this.element.textContent = buttonText;
        this.rectFunctions = {
            left: leftFunct,
            top: topFunct,
            width: widthFunct,
            height: heightFunct
        }

        // // Add text node
        // //this.element.style.overflow = 'hidden';
        // //this.textElement.style.verticalAlign = 'middle';
        // //this.textElement.style.display = 'inline-block';
        //this.textElement.style.justifyContent = 'center';
        //this.textElement.style.alignItems = 'center';
        // //this.textElement.style.width = 'auto';
        // //this.textElement.style.height = '100%';
        // //this.element.style.userSelect = 'none';
        // //this.textElement.style.pointerEvents = 'none';
        // this.element.style.transition = 'background-color 0.15s';
        // this.textElement = document.createElement('div');
        // this.textElement.textContent = this.buttonText;
        // this.textElement.style.textAlign = 'center';
        // this.textElement.style.position = "relative";
        // this.textElement.style.whiteSpace = 'nowrap';
        // this.element.appendChild(this.textElement);

        //this.element.textContent = this.buttonText;
        //this.element.style.textAlign = 'center';
        //this.element.style.position = "relative";
        this.element.style.whiteSpace = 'nowrap';

        //this.element.textContent = this.buttonText;
        this.element.style.verticalAlign = 'middle';
        //this.element.style.textAlign = 'center';
        this.element.style.display = 'flex';
        //this.element.style.whiteSpace = 'nowrap';
        this.element.style.justifyContent = 'center';
        this.element.style.alignItems = 'center';
        //this.element.style.padding = `0`;
        this.element.style.overflow = 'hidden';
        //this.element.style.lineHeight = '1';
        this.element.addOnClick(this.onClick);
    }

    setup() {
        super.setup();
        
        this.replaceLeft(this.rectFunctions.left);
        this.replaceTop(this.rectFunctions.top);
        this.replaceWidth(this.rectFunctions.width);
        this.replaceHeight(this.rectFunctions.height);

        this.rectFunctions = undefined;
        this.element.setBackgroundImage(this.backgroundPath);
        this.backgroundPath = undefined;
    }
};