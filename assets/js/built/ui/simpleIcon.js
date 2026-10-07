"use strict";

Zon.UI.SimpleIcon = class SimpleIcon extends Zon.UI.UIElementDiv {
    constructor(name, iconPath, parent, {
            leftFunc,
            topFunc,
            widthFunc,
            heightFunc,
            backgroundPath = () => Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.UI_PANELS, 'buttonSquare_grey_pressed_NoRips'),
            refs = {},
        } = {}) {
        if (typeof iconPath !== 'function')
            throw new Error("iconPath must be a function.");

        if (typeof backgroundPath !== 'function')
            throw new Error("backgroundPath must be a function.");

        super(name, Zon.UI.UIElementZID.MAIN_UI, parent);
        //this.element.style.cursor = 'pointer';
        this.validateSizeFunctions(leftFunc, topFunc, widthFunc, heightFunc);
        
        this._options = {
            iconPath,
            leftFunc,
            topFunc,
            widthFunc,
            heightFunc,
            backgroundPath,
            refs,
        };
    }
    postConstructor() {
        super.postConstructor();
    }
    setup() {
        super.setup();

        this.applySizeFunctions(this._options);

        this.addEmptyIcon();

        this.element.setBackgroundImage(this._options.backgroundPath());
        this.icon.setBackgroundImage(this._options.iconPath());
        
        this._options = undefined;
    }
}