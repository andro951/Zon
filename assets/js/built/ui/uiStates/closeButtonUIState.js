"use strict";

Zon.UI.CloseButtonUIState = class extends Zon.UI.UIElementDiv {
    constructor() {
        super('closeButton', Zon.UI.UIElementZID.CLOSE_BUTTON);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x101010FF).cssString;
        this.element.style.display = 'flex';
        this.element.style.justifyContent = 'center';
        this.element.style.alignItems = 'center';
        this.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
        this.element.style.borderWidth = `2px`;
        this.element.style.borderStyle = 'solid';
        this.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
        this.openUIs = [];
    }
    static heightScale = 0.08;

    setup() {
        super.setup();
        
        this.replaceLeft(() => 0);
        this.replaceTop(() => this.parent.height * (1 - Zon.UI.CloseButtonUIState.heightScale));
        this.replaceWidth(() => this.parent.width);
        this.replaceHeight(() => this.parent.height * Zon.UI.CloseButtonUIState.heightScale);

        this.element.addOnClick(this.hide);
        this.addEmptyIcon();
        this.icon.setBackgroundImage(Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.ICONS, 'CloseIcon'), false);
    }

    hide() {
        if (this.linkedUIState) {
            this.linkedUIState.onHideActions.remove(this._onLinkedUIStateHide);
            if (this.linkedUIState.shown.value)
                this.linkedUIState.hide();
            
            this.linkedUIState = undefined;
            if (this.openUIs.length > 0) {
                this.openUIs.pop().show();
                return;
            }
        }

        super.hide();
    }

    setLinkedUIState(uiState) {
        if (this.linkedUIState) {
            this.openUIs.push(this.linkedUIState);
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