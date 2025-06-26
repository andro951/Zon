"use strict";

Zon.UI.CloseButtonLinkedUIState = class extends Zon.UI.UIElementDiv {
    constructor(divId, zIndex = 0, parent = Zon.device, args = {}) {
        super(divId, zIndex, parent);
        this.outerBorderWidth = new Variable.Value(8, `${divId}OuterBorderWidth`);
        this._args = args;
    }
    postConstructor() {
        super.postConstructor();
        this._args.setupFunc = this._usableSpaceSetup;
        this.useableSpace = Zon.UI.UIElementDiv2.create(`${this.element.id}UsableSpace`, this.element.style.zIndex, this, this._args);
        delete this._args;
    }
    _usableSpaceSetup = (d) => {
        d.replaceLeft(() => 0);
        d.replaceTop(() => 0);
        d.replaceWidth(() => Zon.device.width);
        d.replaceHeight(() => Zon.device.height * (1 - Zon.UI.CloseButtonUIState.heightScale));
    }
    setup() {
        super.setup();

        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Zon.device.height);
    }

    show() {
        super.show();
        Zon.closeButtonUIState.setLinkedUIState(this);
    }
}