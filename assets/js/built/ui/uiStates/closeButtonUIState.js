"use strict";

Zon.UI.CloseButtonUIState = class extends Zon.UI.UIElementDiv {
    constructor() {
        super('closeButton', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x101010FF).cssString;
    }
    static heightScale = 0.2;
    static create(...args) {
        const closeButtonUIState = new this(...args);
        closeButtonUIState.bindAll();
        closeButtonUIState.postConstructor();
        return closeButtonUIState;
    }
    postConstructor() {
        super.postConstructor();
    }

    setup() {
        this.replaceLeft(() => 0);
        this.replaceTop(() => Zon.device.height * (1 - Zon.UI.CloseButtonUIState.heightScale));
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Zon.device.height * Zon.UI.CloseButtonUIState.heightScale);

        this.element.addOnClick(this.hide);
        this.addEmptyIcon();
        this.icon.setBackgroundImage(Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.ICONS, 'CloseIcon'));

        super.setup();
    }

    hide() {
        super.hide();
        if (this.linkedUIState) {
            this.linkedUIState.onHideActions.remove(this._onLinkedUIStateHide);
            if (this.linkedUIState.shown.value)
                this.linkedUIState.hide();
                
            this.linkedUIState = undefined;
        }
    }

    setLinkedUIState(uiState) {
        if (this.linkedUIState) {
            this.linkedUIState.onHideActions.remove(this._onLinkedUIStateHide);
            this.linkedUIState.hide();
        }
        else {
            this.show();
        }

        this.linkedUIState = uiState;
        this.linkedUIState.onHideActions.add(this._onLinkedUIStateHide);
        Zon.UI.sideBar.hide();
    }
    _onLinkedUIStateHide = () => {
        this.hide();
    }
}

Zon.closeButtonUIState = Zon.UI.CloseButtonUIState.create();