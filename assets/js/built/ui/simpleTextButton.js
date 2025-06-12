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
        this.buttonText = buttonText;
        this.onClick = onClick;
        this.textColor.uint = textColor;
        this.backgroundColor.uint = backgroundColorUint;
        this.setHoverColor(hoverColorUint);
        this.border.value = border;
        this.borderRadius.value = borderRadius;
        this.fontWeight.value = fontWeight;
        this.rectFunctions = {
            left: leftFunct,
            top: topFunct,
            width: widthFunct,
            height: heightFunct
        }
    }

    static create(...args) {
        const button = new this(...args);
        button.bindAll();
        button.postConstructor();
        return button;
    }

    postConstructor() {
        super.postConstructor();

        // Add text node
        this.textNode = document.createElement('div');
        this.textNode.innerText = this.buttonText;
        this.textNode.style.textAlign = 'center';
        this.textNode.style.verticalAlign = 'middle';
        this.textNode.style.display = 'flex';
        this.textNode.style.justifyContent = 'center';
        this.textNode.style.alignItems = 'center';
        this.textNode.style.width = '100%';
        this.textNode.style.height = '100%';
        this.element.style.userSelect = 'none';
        this.textNode.style.pointerEvents = 'none';
        this.element.style.transition = 'background-color 0.15s';
        this.element.appendChild(this.textNode);

        this.element.addOnClick(this.onClick);

        
    }

    setup() {
        this.replaceLeft(this.rectFunctions.left);
        this.replaceTop(this.rectFunctions.top);
        this.replaceWidth(this.rectFunctions.width);
        this.replaceHeight(this.rectFunctions.height);
        this.rectFunctions = undefined;

        this.element.setBackgroundImage(this.backgroundPath);
        super.setup();
    }
};