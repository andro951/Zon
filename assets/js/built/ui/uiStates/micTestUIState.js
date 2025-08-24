"use strict";

Zon.UI.MicTestUIState = class MicTestUIState extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('micTestUI', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, Zon.device, {
            postConstructorFunc: Zon.UI.MicTestUIState._postConstructorFunc,
        });
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
        this.micFrequency = new Variable.Value(0, 'micFrequency');
        this._settingIDs = [
            Zon.PreferenceSettingsID.MicrophoneGain,
            Zon.PreferenceSettingsID.MicrophoneNoiseThreshold,
        ];
    }
    static _postConstructorFunc(d) {
        const borderWidth = 2;
        d.label = Zon.UI.UIElementDiv2.create('micTestPageLabel', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = `#AAA`;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Mic Test Page`;
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

        d.frequencyDisplay = Zon.UI.UIElementDiv2.create('frequencyDisplay', d.element.zIndex, d, {
            constructorFunc: (d) => {
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
            },
            postConstructorFunc: (d) => {
                d.text.replaceEquation(() => `${d.parent.parent.micFrequency.value.toFixed(2).padStart(7, '0')}\n${Zon.Music.FrequencyToNote(d.parent.parent.micFrequency.value)}`, {d});
            },
            setupFunc: (d) => {
                d.replaceLeft(() => Zon.UI.micTestUIState.useableSpace.width * 0.1);
                d.replaceTop(() => d.parent.label.bottom + borderWidth, {d});
                d.replaceWidth(() => Zon.UI.micTestUIState.useableSpace.width - d.left * 2, {d});
                d.replaceHeight(() => d.width * 0.2, {d});
            }
        });

        d.settingsContainer = Zon.UI.UIElementDiv2.create('settingsContainer', d.element.style.zIndex, d, {
            constructorFunc: (d) => {
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x080808FF).cssString;
                d.makeScrollableColumn();
            },
            setupFunc: (d) => {
                for (const settingID of d.parent.parent._settingIDs) {
                    const setting = Zon.Settings.getPreferenceSetting(settingID);
                    d.addChild(setting.constructor.SettingUIPanelClass, setting);
                }

                d.replaceLeft(() => d.parent.label.left, { d });
                d.replaceTop(() => d.parent.frequencyDisplay.bottom + d.parent.parent.outerBorderWidth.value / 2, { d });
                d.replaceWidth(() => d.parent.label.width, { d });
                d.replaceHeight(() => d.parent.height - d.top - d.parent.parent.outerBorderWidth.value, { d });
            }
        });
    }
    onMicReady = () => {
        Zon.game.preDrawActions.add(this.preDraw);
    }
    preDraw = () => {
        this.micFrequency.value = Zon.micManager.getDominantFrequency();
    }
}

Zon.UI.micTestUIState = Zon.UI.MicTestUIState.create();