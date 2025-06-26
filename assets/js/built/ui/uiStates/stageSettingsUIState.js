"use strict";

Zon.UI.StageSettingsUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('stageSelectSettingsUI', Zon.UI.UIElementZID.CBM_SUB_MENU, Zon.device, {
            postConstructorFunc: Zon.UI.StageSettingsUIState._postConstructorFunc,
        });
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
        this._stageSettingIDs = [
            Zon.GameSettingsID.AutomaticallyGoToNextStage,
            Zon.GameSettingsID.AutomaticallyReturnToStage1,
            Zon.GameSettingsID.StageToReturnToStage1,
            Zon.GameSettingsID.SmartReturnToStage1,
        ];
    }
    static _postConstructorFunc(d) {
        //Page label
        const borderWidth = 2;
        d.label = Zon.UI.UIElementDiv2.create('stageSelectSettingsLabel', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = `#AAA`;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Stage Select Settings`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.parent.outerBorderWidth.value, { d });
                d.replaceTop(() => d.parent.parent.outerBorderWidth.value, { d });
                d.replaceWidth(() => d.parent.width - d.left * 2, { d });
                d.replaceHeight(() => d.parent.height * 0.08, { d });
            }
        });

        d.settingsContainer = Zon.UI.UIElementDiv2.create('settingsContainer', d.element.style.zIndex, d, {
            constructorFunc: (d) => {
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x080808FF).cssString;
                d.makeScrollableColumn();
            },
            setupFunc: (d) => {
                for (const settingID of d.parent.parent._stageSettingIDs) {
                    const setting = Zon.Settings.getGameSetting(settingID);
                    d.addChild(setting.constructor.SettingUIPanelClass, setting);
                }

                d.replaceLeft(() => d.parent.label.left, { d });
                d.replaceTop(() => d.parent.label.bottom + d.parent.parent.outerBorderWidth.value / 2, { d });
                d.replaceWidth(() => d.parent.label.width, { d });
                d.replaceHeight(() => d.parent.height - d.top - d.parent.parent.outerBorderWidth.value, { d });
            }
        });
    }
    postLoadSetup() {
        
    }
    onClickStageSelectButton(displayedStageNum, selectStage) {
        this.stageSwapPopup.showPopup(displayedStageNum, selectStage);
    }
}

Zon.UI.stageSettingsUIState = Zon.UI.StageSettingsUIState.create();