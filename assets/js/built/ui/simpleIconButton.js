"use strict";

Zon.UI.SimpleIconButton = class SimpleIconButton extends Zon.UI.UIElementDiv {
    constructor(buttonName, onClick, iconPath, parent, leftFunct, topFunct, { 
        backgroundPath = Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.UI_PANELS, 'buttonSquare_grey_pressed_NoRips'),
        widthFunct = () => Zon.device.width * 0.1,
        heightFunct = () => Zon.topUI.height * 0.25
    } = {}) {
        super(buttonName, Zon.UI.UIElementZID.MAIN_UI, parent);
        this.element.style.cursor = 'pointer';
        this.iconPath = iconPath;
        this.backgroundPath = backgroundPath;
        this.onClick = onClick;
        this.rectFunctions = {
            left: leftFunct,
            top: topFunct,
            width: widthFunct,
            height: heightFunct
        }
    }
    postConstructor() {
        super.postConstructor();

        this.element.addOnClick(this.onClick);
    }
    setup() {
        super.setup();
        
        this.replaceLeft(this.rectFunctions.left);
        this.replaceTop(this.rectFunctions.top);
        this.replaceWidth(this.rectFunctions.width);
        this.replaceHeight(this.rectFunctions.height);
        this.rectFunctions = undefined;

        this.addEmptyIcon();

        this.element.setBackgroundImage(this.backgroundPath);
        this.icon.setBackgroundImage(this.iconPath);
    }
}