"use strict";

Zon.UI.StageUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('stageSelectUI', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }
    static create(...args) {
        const stageUIState = new this(...args);
        stageUIState.bindAll();
        stageUIState.postConstructor();
        return stageUIState;
    }
    postConstructor() {
        super.postConstructor();
    }
    postLoadSetup() {
        
    }

    setup = () => {
        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Zon.device.height * (1 - Zon.UI.CloseButtonUIState.heightScale));

        super.setup();
    }
}

Zon.UI.stageUIState = Zon.UI.StageUIState.create();