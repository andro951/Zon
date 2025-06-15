"use strict";

Zon.UI.SimpleIconButton = class SimpleIconButton extends Zon.UI.UIElementDiv {
    constructor(buttonName, onClick, iconPath, parent, {
            leftFunc,
            topFunc,
            widthFunc,
            heightFunc,
            backgroundPath = Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.UI_PANELS, 'buttonSquare_grey_pressed_NoRips'),
        } = {}) {
        super(buttonName, Zon.UI.UIElementZID.MAIN_UI, parent);
        this.element.style.cursor = 'pointer';
        if (!leftFunc || !topFunc || !widthFunc || !heightFunc)
            throw new Error("All position and size functions must be provided.");
        
        this._options = {
            iconPath,
            leftFunc,
            topFunc,
            widthFunc,
            heightFunc,
            backgroundPath
        };

        this.element.addOnClick(onClick);
    }
    postConstructor() {
        super.postConstructor();
    }
    setup() {
        super.setup();

        this.replaceLeft(this._options.leftFunc);
        this.replaceTop(this._options.topFunc);
        this.replaceWidth(this._options.widthFunc);
        this.replaceHeight(this._options.heightFunc);

        this.addEmptyIcon();

        this.element.setBackgroundImage(this._options.backgroundPath);
        this.icon.setBackgroundImage(this._options.iconPath);
        
        this._options = undefined;
    }
}