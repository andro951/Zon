"use strict";

Zon.UI.StageUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('stageSelectUI', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }
    postConstructor() {
        super.postConstructor();

        const stageSelectBorder = 2;
        //Page label
        this.label = Zon.UI.UIElementDiv2.create('stageSelectLabel', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, this, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.border = `${stageSelectBorder}px solid #AAA`;
                d.element.style.borderRadius = `$8px`;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Stage Select`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
                d.element.style.pointerEvents = 'none';
                d.element.style.userSelect = 'none';
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.width * 0.1, { d });
                d.replaceTop(() => d.parent.height * 0.02, { d });
                d.replaceWidth(() => d.parent.width - d.left * 2, { d });
                d.replaceHeight(() => d.parent.height * 0.05, { d });
            }
        });

        //Aether bonus and settings
        this.aetherBonusAndSettingsContianer = Zon.UI.UIElementDiv2.create('aetherBonusAndSettingsContainer', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, this, {
            // constructorFunc: (d) => {

            // },
            postConstructorFunc: (d) => {
                const xPaddingMult = 0.005;
                this.aetherBonus = Zon.UI.UIElementDiv2.create('aetherStageBonus', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x00FF00FF).cssString;
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => 0, { d });
                        d.replaceTop(() => 0, { d });
                        d.replaceWidth(() => d.parent.width * (0.5 - xPaddingMult), { d });
                        d.replaceHeight(() => d.parent.height, { d });
                    }
                });
                this.stageSettings = Zon.UI.UIElementDiv2.create('stageSettings', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x0000FFFF).cssString;
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.width * (0.5 + xPaddingMult), { d });
                        d.replaceTop(() => 0, { d });
                        d.replaceWidth(() => d.parent.width * (0.5 - xPaddingMult), { d });
                        d.replaceHeight(() => d.parent.height, { d });
                    }
                });
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.width * 0.1, { d });
                d.replaceTop(() => Zon.UI.stageUIState.label.bottom + Zon.UI.stageUIState.height * 0.01);
                d.replaceWidth(() => d.parent.width - (d.left - stageSelectBorder) * 2, { d });
                d.replaceHeight(() => d.parent.height * 0.05, { d });
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