"use strict";

Zon.UI.StageUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('stageSelectUI', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }
    postConstructor() {
        super.postConstructor();

        this.label = Zon.UI.UIElementDiv2.create('stageSelectLabel', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, this, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.border = `2px solid #AAA`;
                d.element.style.borderRadius = `$8px`;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Select Stage`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
                d.element.style.pointerEvents = 'none';
                d.element.style.userSelect = 'none';
            },
            setupFunc: (d) => {
                d.replaceLeft(() => Zon.UI.stageUIState.width * 0.1);
                d.replaceTop(() => Zon.UI.stageUIState.height * 0.02);
                d.replaceWidth(() => Zon.UI.stageUIState.width - d.left * 2, { d });
                d.replaceHeight(() => Zon.UI.stageUIState.height * 0.05);
            }
        });
    }
    postLoadSetup() {
        
    }

    setup() {
        super.setup();
        
        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Zon.device.height * (1 - Zon.UI.CloseButtonUIState.heightScale));
    }
}

Zon.UI.stageUIState = Zon.UI.StageUIState.create();