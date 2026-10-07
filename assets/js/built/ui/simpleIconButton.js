"use strict";

Zon.UI.SimpleIconButton = class SimpleIconButton extends Zon.UI.UIElementDiv {
    constructor(buttonName, onClick, iconPath, parent, {
            leftFunc,
            topFunc,
            widthFunc,
            heightFunc,
            isChild = false,
            backgroundPath = Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.UI_PANELS, 'buttonSquare_grey_pressed_NoRips'),
        } = {}) {
        super(buttonName, Zon.UI.UIElementZID.MAIN_UI, parent);
        this.element.style.cursor = 'pointer';
        this.validateSizeFunctions(leftFunc, topFunc, widthFunc, heightFunc);
        
        this._options = {
            iconPath,
            leftFunc,
            topFunc,
            widthFunc,
            heightFunc,
            backgroundPath
        };

        this.element.addOnClick(onClick);

        if (isChild)
            this.isChild = true;
    }
    postConstructor() {
        super.postConstructor();
    }
    setup() {
        super.setup();

        this.applySizeFunctions(this._options);

        this.addEmptyIcon();

        this.element.setBackgroundImage(this._options.backgroundPath);
        this.icon.setBackgroundImage(this._options.iconPath);
        
        this._options = undefined;
    }
}