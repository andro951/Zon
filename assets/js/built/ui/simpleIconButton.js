"use strict";

Zon.UI.SimpleIconButton = class SimpleIconButton extends Zon.UI.UIElementDiv {
    constructor(buttonName, iconName, onClick, parent, leftFunct, topFunct, widthFunct = () => Zon.device.width * 0.1, heightFunct = () => Zon.topUI.height * 0.25) {
        super(buttonName, Zon.UI.UIElementZID.MAIN_UI, parent);
        this.element.style.cursor = 'pointer';
        this.iconName = iconName;
        this.onClick = onClick;
        this.rectFunctions = {
            left: leftFunct,
            top: topFunct,
            width: widthFunct,
            height: heightFunct
        }
    }
    static create(...args) {
        const simpleIconButton = new this(...args);
        simpleIconButton.bindAll();
        simpleIconButton.postConstructor();
        return simpleIconButton;
    }
    postConstructor() {
        super.postConstructor();
        this.element.addOnClick(this.onClick);
    }
    setup() {
        this.replaceLeft(this.rectFunctions.left);
        this.replaceTop(this.rectFunctions.top);
        this.replaceWidth(this.rectFunctions.width);
        this.replaceHeight(this.rectFunctions.height);
        this.rectFunctions = undefined;

        const icon = document.createElement('div');
        this.icon = icon;
        this.icon.style.position = 'absolute';
        icon.style.top = '50%';
        icon.style.left = '50%';
        icon.style.transform = 'translate(-50%, -50%)';
        icon.style.width = '50%';
        icon.style.height = '50%';
        icon.style.pointerEvents = 'none';

        this.element.appendChild(icon);

        this.element.setBackgroundImage('buttonSquare_grey_pressed_NoRips');
        this.icon.setBackgroundImage(this.iconName);

        super.setup();
    }
}