"use strict";

Zon.MainDisplayUIState = class MainDisplayUIState extends Zon.UI.UIElementDiv {
    constructor(divId, args = {}) {
        super(divId, Zon.UI.UIElementZID.MENU, Zon.device);
        this.outerBorderWidth = new Variable.Value(8, `${divId}OuterBorderWidth`);
        this._args = args;
        this.animation = new Zon.UI.SlideAnimationVertical(this, false);
    }
    postConstructor() {
        super.postConstructor();
        this._args.setupFunc = this._usableSpaceSetup;
        this.useableSpace = Zon.UI.UIElementDiv2.create(`${this.element.id}UsableSpace`, this.element.style.zIndex, this, this._args);
        delete this._args;
    }
    _heightFunc = () => Zon.device.height * (1 - Zon.bottomUI.bottomUIPercentOfHeight * Zon.UI.BottomBar.heightScale);
    _usableSpaceSetup = (d) => {
        d.replaceLeft(() => 0);
        d.replaceTop(() => 0);
        d.replaceWidth(() => Zon.device.width);
        d.replaceHeight(this._heightFunc);
    }
    setup() {
        super.setup();

        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(this._heightFunc);
    }

    static displayedUI = null;
    static queedUI = null;
    show() {
        if (MainDisplayUIState.displayedUI === null) {
            MainDisplayUIState.displayedUI = this;
            super.show();
        }
        else {
            if (MainDisplayUIState.queedUI === this) {
                MainDisplayUIState.queedUI = null;
                return;
            }
            else {
                MainDisplayUIState.queedUI = this;
                MainDisplayUIState.displayedUI.hide();
            }
        }
    }
    forceHide() {
        if (MainDisplayUIState.displayedUI === this) {
            MainDisplayUIState.displayedUI = null;
        }
        else {
            throw new Error("Tried to hide a MainDisplayUIState that wasn't the one being displayed.");
        }

        super.forceHide();
        if (MainDisplayUIState.queedUI) {
            const ui = MainDisplayUIState.queedUI;
            MainDisplayUIState.queedUI = null;
            ui.show();
        }
    }
}