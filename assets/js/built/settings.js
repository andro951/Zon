"use strict";

Zon.Settings = {};

Zon.Settings.preLoadSetup = () => {
    Zon.Settings.createAllSettings();
    Zon.IOManager.registerSaveLoadInfo(Zon.SaveFileTypeID.GAME_SETTINGS, new Zon.Settings.SettingsSaveLoadInfo(Zon.SaveLoadID.SETTINGS, Zon.Settings.allGameSettings));
    Zon.IOManager.registerSaveLoadInfo(Zon.SaveFileTypeID.DISPLAY_SETTINGS, new Zon.Settings.SettingsSaveLoadInfo(Zon.SaveLoadID.SETTINGS, Zon.Settings.allDisplaySettings));
    Zon.IOManager.registerSaveLoadInfo(Zon.SaveFileTypeID.PREFERENCES, new Zon.Settings.SettingsSaveLoadInfo(Zon.SaveLoadID.SETTINGS, Zon.Settings.allPreferenceSettings));
}

Zon.Settings.postLoadSetup = () => {
    const automaticallyGoToNextStage = Zon.Settings.getGameSetting(Zon.GameSettingsID.AutomaticallyGoToNextStage);
    const automaticallyReturnToStage1 = Zon.Settings.getGameSetting(Zon.GameSettingsID.AutomaticallyReturnToStage1);
    const smartReturnToStage1 = Zon.Settings.getGameSetting(Zon.GameSettingsID.SmartReturnToStage1);
    const stageToReturnToStage1 = Zon.Settings.getGameSetting(Zon.GameSettingsID.StageToReturnToStage1);
    automaticallyGoToNextStage.onChangedAction.add(() => {
        if (!automaticallyGoToNextStage.value) {
            automaticallyReturnToStage1.value = false;
            smartReturnToStage1.value = false;
        }
    });
    automaticallyReturnToStage1.onChangedAction.add(() => {
        if (automaticallyReturnToStage1.value) {
            automaticallyGoToNextStage.value = true;
        }
        else {
            smartReturnToStage1.value = false;
        }
    });
    stageToReturnToStage1.onChangedByPlayerAction.add(() => {
        smartReturnToStage1.value = false;
        automaticallyReturnToStage1.value = true;
    });
    smartReturnToStage1.onChangedAction.add(() => {
        if (smartReturnToStage1.value) {
            automaticallyReturnToStage1.value = true;
        }
    });
    smartReturnToStage1.onChangedByPlayerAction.add(() => {
        if (smartReturnToStage1.value)
            Zon.StageSmartReset.onSetSmartReturnSettingToTrue();
    });
}

{
    Zon.Settings.getGameSetting = (id) => {
        return Zon.Settings.allGameSettings[id];
    }
    Zon.Settings.getGameVariable = (id) => {
        return Zon.Settings.allGameSettings[id].variable;
    }
    Zon.Settings.getGame = (id) => {
        return Zon.Settings.allGameSettings[id].value;
    }
    Zon.Settings.setGame = (id, value) => {
        Zon.Settings.allGameSettings[id].set(value);
    }
    Zon.Settings.setGameByPlayer = (id, value) => {
        Zon.Settings.allGameSettings[id].setByPlayer(value);
    }

    Zon.Settings.getDisplaySetting = (id) => {
        return Zon.Settings.allDisplaySettings[id];
    }
    Zon.Settings.getDisplayVariable = (id) => {
        return Zon.Settings.allDisplaySettings[id].variable;
    }
    Zon.Settings.getDisplay = (id) => {
        return Zon.Settings.allDisplaySettings[id].value;
    }
    Zon.Settings.setDisplay = (id, value) => {
        Zon.Settings.allDisplaySettings[id].set(value);
    }
    Zon.Settings.setDisplayByPlayer = (id, value) => {
        Zon.Settings.allDisplaySettings[id].setByPlayer(value);
    }

    Zon.Settings.getPreferenceSetting = (id) => {
        return Zon.Settings.allPreferenceSettings[id];
    }
    Zon.Settings.getPreferenceVariable = (id) => {
        return Zon.Settings.allPreferenceSettings[id].variable;
    }
    Zon.Settings.getPreference = (id) => {
        return Zon.Settings.allPreferenceSettings[id].value;
    }
    Zon.Settings.setPreference = (id, value) => {
        Zon.Settings.allPreferenceSettings[id].set(value);
    }
    Zon.Settings.setPreferenceByPlayer = (id, value) => {
        Zon.Settings.allPreferenceSettings[id].setByPlayer(value);
    }
}//get/set

Zon.Settings.SettingsSaveLoadInfo = class extends Zon.SaveLoadInfo {
    constructor(saveLoadID, settings) {
        const arr = settings.map(setting => setting.saveLoadHelper());
        super(saveLoadID, arr);
    }

    write = (writer) => {
        const bits = Zon.IOManager.commonDataHelper.settingsEnumBits.value;
        const count = this.saveLoadHelpers.filter(helper => !helper.isDefaultValue).length;
        writer.writeUInt32(count, bits);
        for (let i = 0; i < this.saveLoadHelpers.length; i++) {
            const helper = this.saveLoadHelpers[i];
            if (helper.isDefaultValue)
                continue;

            writer.writeUInt32(i, bits);
            helper.write(writer);
        }
    }
    read = (reader) => {
        const bits = Zon.IOManager.commonDataHelper.settingsEnumBits.value;
        const count = reader.readUInt32(bits);
        for (let i = 0; i < count; i++) {
            const id = reader.readUInt32(bits);
            this.saveLoadHelpers[id].read(reader);
        }
    }

    addAddSettings = () => {
        for (let i = 0; i < Zon.Settings.allGameSettings.length; i++) {
            const setting = Zon.Settings.allGameSettings[i];
            this.add(setting.saveLoadHelper());
        }
    }
}

{
    Zon.Setting = class Setting extends Zon.IHasSaveLoadHelper {
        constructor(id, settingType, defaultValue, name = null, variableClass = Variable.Value) {
            if (new.target === Zon.Setting)
                throw new TypeError("Cannot construct Setting instances directly");

            super();
            this.id = id;
            this.settingType = settingType;
            this.defaultValue = defaultValue;
            if (!name) {
                switch (settingType) {
                    case Zon.SettingTypeID.GAME:
                        this.name = Zon.GameSettingsIDNames[id].addSpaces();
                        break;
                    case Zon.SettingTypeID.DISPLAY:
                        this.name = Zon.DisplaySettingsIDNames[id].addSpaces();
                        break;
                    case Zon.SettingTypeID.PREFERENCE:
                        this.name = Zon.PreferenceSettingsIDNames[id].addSpaces();
                        break;
                    default:
                        throw new Error(`Unknown setting type: ${settingType}`);
                }
            }
            else {
                this.name = name;
            }
            
            this._value = new variableClass(defaultValue, `Setting${this.name}Value`);
            this.onChangedAction = this._value.onChangedAction;
            this.onChangedByPlayerAction = new Actions.Action();
        }

        get value() {
            return this._value.value;
        }

        set value(newValue) {
            this._value.value = newValue;
        }

        get variable() {
            return this._value;
        }

        get isDefaultValue() {
            return this._value.value === this.defaultValue;
        }

        setByPlayer = (newValue) => {
            this._value.value = newValue;
            this.onChangedByPlayerAction.call(newValue);
        }

        valueSaveLoadHelper = () => {
            throw new Error("valueSaveLoadHelper not implemented");
        }

        saveLoadHelper = () => {
            return new Zon.Setting.SettingSaveLoadHelper(this);
        }

        static SettingSaveLoadHelper = class SettingsaveLoadHelper {
            constructor(setting) {
                this.setting = setting;
                this.isDefaultValue = true;
                this.settingHelper = this.setting.valueSaveLoadHelper();
            }
            
            write = (writer) => {
                if (this.isDefaultValue)
                    return;

                this.settingHelper.write(writer);
                this.isDefaultValue = true;
            }
            read = (reader) => {
                this.settingHelper.read(reader);
                this.isDefaultValue = false;
            }
            get = () => {
                this.settingHelper.get();
                this.isDefaultValue = this.setting.isDefaultValue;
            }
            set = () => {
                if (this.isDefaultValue)
                    return;

                this.settingHelper.set();
            }
        }

        static SettingPanel = class SettingPanel extends Zon.UI.UIElementDiv {
            constructor(parent, lastChild, padding, applyDefaultTopOrLeft, setting) {
                if (new.target === Zon.Setting.SettingPanel)
                    throw new TypeError("Cannot construct SettingPanel instances directly");

                super(`settingPanel_${setting.id}`, parent.element.style.zIndex, parent);
                if (!setting)
                    throw new Error("SettingPanel must be constructed with a valid setting");

                this.setting = setting;
                this._applyDefaultTopOrLeft = applyDefaultTopOrLeft;
                this.element.style.backgroundColor = Struct.Color.fromUInt(0x303030FF).cssString;
                this.element.style.borderWidth = `1px`;
                this.element.style.borderStyle = 'solid';
                this.element.style.borderColor = `#AAA`;
                this.element.style.display = 'flex';
                this.element.style.justifyContent = 'center';
                this.element.style.alignItems = 'center';
                this.element.style.whiteSpace = 'nowrap';
            }
            static borderWidth = 2;
            static padding = 2;
            postConstructor() {
                super.postConstructor();

                const borderWidth = Zon.Setting.SettingPanel.borderWidth;
                const padding = Zon.Setting.SettingPanel.padding;
                this.settingPanel = Zon.UI.UIElementDiv2.create(`${this.setting.name}SettingPanel`, this.element.style.zIndex, this, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.innerWidth - d.width - padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(d.parent._getSettingWidthFunc(d), { d });
                        d.replaceHeight(() => d.parent.innerHeight - padding * 2, { d });
                    }
                });

                this.label = Zon.UI.UIElementDiv2.create(`${this.setting.name}SettingLabel`, this.element.style.zIndex, this, {
                    constructorFunc: (d) => {
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                        d.element.style.fontWeight = `bold`;
                        d.element.textContent = d.parent.setting.name;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.whiteSpace = 'nowrap';
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => padding, { d });
                        d.replaceTop(() => d.parent.settingPanel.top, { d });
                        d.replaceWidth(() => d.parent.innerWidth - d.left - padding * 2 - d.parent.settingPanel.width, { d });
                        d.replaceHeight(() => d.parent.settingPanel.height, { d });
                    }
                });
            }
            setup() {
                super.setup();

                this.replaceLeft(() => this.parent.childrenPadding.value);
                this._applyDefaultTopOrLeft(this);
                delete this._applyDefaultTopOrLeft;
                this.replaceWidth(() => this.parent.innerWidth - 2 * this.parent.childrenPadding.value - Zon.UI.UIElementBase.expectedScrollBarWidth);
                this.replaceHeight(() => this.parent.innerHeight * 0.08);
            }
            _getSettingWidthFunc() {
                throw new Error("_getSettingWidthFunc must be implemented in subclasses.");
            }
        }
    }

    Zon.BoolSetting = class extends Zon.Setting {
        constructor(id, settingType, defaultValue, name = null) {
            super(id, settingType, defaultValue, name);
        }

        static SettingUIPanelClass = class BoolSettingPanel extends Zon.Setting.SettingPanel {
            constructor(parent, lastChild, padding, applyDefaultTopOrLeft, setting) {
                super(parent, lastChild, padding, applyDefaultTopOrLeft, setting);
                this.element.style.display = 'flex';
                this.element.style.justifyContent = 'center';
                this.element.style.alignItems = 'center';
            }
            postConstructor() {
                super.postConstructor();

                this.settingPanel.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                this.settingPanel._display = 'flex';
                this.settingPanel.element.style.justifyContent = 'center';
                this.settingPanel.element.style.alignItems = 'center';
                this.settingPanel.element.style.cursor = 'pointer';
                this.settingPanel.element.addOnClick(() => {
                    this.setting.value = !this.setting.value;
                });

                this.checkBox = Zon.UI.UIElementDiv2.create(`${this.setting.name}CheckBox`, this.element.style.zIndex, this.settingPanel, {
                    constructorFunc: (d) => {
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                    },
                    postConstructorFunc: (d) => {
                        d.text.replaceEquation(() => d.parent.parent.setting.value ? "X" : "", { d });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => (d.parent.innerWidth - d.width) * 0.5, { d });
                        d.replaceTop(() => (d.parent.innerHeight - d.height) * 0.5, { d });
                        d.replaceWidth(() => d.parent.innerWidth * 0.75, { d });
                        d.replaceHeight(() => d.parent.innerHeight * 0.75, { d });
                    }
                });
            }
            _getSettingWidthFunc = (d) => () => d.innerHeight;
        }

        valueSaveLoadHelper = () => {
            return Zon.SaveLoadHelper_B.fromVariable(this._value);
        }
    }

    Zon.IntSetting = class extends Zon.Setting {
        constructor(id, settingType, defaultValue, minValue = Number.MIN_SAFE_INTEGER, maxValue = Number.MAX_SAFE_INTEGER, saveLength = null, name = null) {
            if (defaultValue < minValue || defaultValue > maxValue)
                throw new Error(`Default value ${defaultValue} is out of range [${minValue}, ${maxValue}]`);
                
            super(id, settingType, defaultValue, name);
            this.minValue = minValue;
            this.maxValue = maxValue;
            this.saveLength = saveLength;
        }

        get value() {
            return this._value.value;
        }

        set value(newValue) {
            if (newValue < this.minValue) {
                newValue = this.minValue;
            }
            else if (newValue > this.maxValue) {
                newValue = this.maxValue;
            }

            this._value.value = newValue;
        }

        static SettingUIPanelClass = class IntSettingPanel extends Zon.Setting.SettingPanel {
            constructor(parent, lastChild, padding, applyDefaultTopOrLeft, setting) {
                super(parent, lastChild, padding, applyDefaultTopOrLeft, setting);
            }
            postConstructor() {
                super.postConstructor();

                const borderWidth = Zon.Setting.SettingPanel.borderWidth;
                const padding = Zon.Setting.SettingPanel.padding;
                this.incButton = Zon.UI.UIElementDiv2.create(`${this.setting.name}Inc`, this.element.style.zIndex, this.settingPanel, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.cursor = 'pointer';
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        d.element.textContent = `>`;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                        d.element.style.whiteSpace = 'nowrap';
                    },
                    postConstructorFunc: (d) => {
                        d.element.addOnClick(() => {
                            this.setting.value = this.setting.value + 1;
                        });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.innerWidth - d.width - padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(() => d.parent.innerWidth * 0.2 - padding, { d });
                        d.replaceHeight(() => d.parent.innerHeight - 2 * padding, { d });
                    }
                });

                this.decButton = Zon.UI.UIElementDiv2.create(`${this.setting.name}Dec`, this.element.style.zIndex, this.settingPanel, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.cursor = 'pointer';
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        d.element.textContent = `<`;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                        d.element.style.whiteSpace = 'nowrap';
                    },
                    postConstructorFunc: (d) => {
                        d.element.addOnClick(() => {
                            this.setting.value = this.setting.value - 1;
                        });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.parent.incButton.left - d.width - padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(() => d.parent.innerWidth * 0.2 - padding, { d });
                        d.replaceHeight(() => d.parent.innerHeight - 2 * padding, { d });
                    }
                });

                this.inputBox = Zon.UI.UIInputElement.create(`${this.setting.name}InputBox`, this.element.style.zIndex, this.settingPanel, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.color = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.cursor = 'pointer';
                        //d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        //d.element.style.borderWidth = `${borderWidth}px`;
                        //d.element.style.borderStyle = 'solid';
                        //d.element.style.borderColor = `#AAA`;
                        d.element.style.whiteSpace = 'nowrap';
                        d.element.type = 'number';
                    },
                    postConstructorFunc: (d) => {
                        d.text.replaceEquation(() => `${d.parent.parent.setting.value}`, { d });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(() => d.parent.parent.decButton.left - padding * 2, { d });
                        d.replaceHeight(() => d.parent.innerHeight - 2 * padding, { d });
                    },
                    changeFunc: (d, e) => {
                        const settingValue = this.setting.value;
                        const inputValue = parseInt(e.target.value, 10);
                        if (isNaN(inputValue)) {
                            d._setText(`${settingValue}`);
                        }
                        else {
                            this.setting.value = Math.trunc(inputValue);
                            d._setText(`${this.setting.value}`);
                        }
                    }
                });
            }
            _getSettingWidthFunc = (d) => () => d.parent.innerWidth * 0.4;
        }

        valueSaveLoadHelper = () => {
            if (!this.saveLength) {
                return Zon.SaveLoadHelper_I32_AL.fromVariable(this._value, true);
            }
            else {
                return Zon.SaveLoadHelper_I32.fromVariable(this._value, this.saveLength, true);
            }
        }
    }

    Zon.UIntSetting = class extends Zon.Setting {
        constructor(id, settingType, defaultValue, minValue = 0, maxValue = Number.MAX_SAFE_INTEGER, saveLength = null, name = null) {
            if (defaultValue < minValue || defaultValue > maxValue)
                throw new Error(`Default value ${defaultValue} is out of range [${minValue}, ${maxValue}]`);
                
            super(id, settingType, defaultValue, name);
            this.minValue = minValue;
            this.maxValue = maxValue;
            this.saveLength = saveLength;
        }

        get value() {
            return this._value.value;
        }

        set value(newValue) {
            if (newValue < this.minValue) {
                newValue = this.minValue;
            }
            else if (newValue > this.maxValue) {
                newValue = this.maxValue;
            }

            this._value.value = newValue;
        }

        static SettingUIPanelClass = class UIntSettingPanel extends Zon.Setting.SettingPanel {
            constructor(parent, lastChild, padding, applyDefaultTopOrLeft, setting) {
                super(parent, lastChild, padding, applyDefaultTopOrLeft, setting);
            }
            postConstructor() {
                super.postConstructor();

                const borderWidth = Zon.Setting.SettingPanel.borderWidth;
                const padding = Zon.Setting.SettingPanel.padding;
                this.incButton = Zon.UI.UIElementDiv2.create(`${this.setting.name}Inc`, this.element.style.zIndex, this.settingPanel, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.cursor = 'pointer';
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        d.element.textContent = `>`;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                        d.element.style.whiteSpace = 'nowrap';
                    },
                    postConstructorFunc: (d) => {
                        d.element.addOnClick(() => {
                            this.setting.value = this.setting.value + 1;
                        });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.innerWidth - d.width - padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(() => d.parent.innerWidth * 0.2 - padding, { d });
                        d.replaceHeight(() => d.parent.innerHeight - 2 * padding, { d });
                    }
                });

                this.decButton = Zon.UI.UIElementDiv2.create(`${this.setting.name}Dec`, this.element.style.zIndex, this.settingPanel, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.cursor = 'pointer';
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        d.element.textContent = `<`;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                        d.element.style.whiteSpace = 'nowrap';
                    },
                    postConstructorFunc: (d) => {
                        d.element.addOnClick(() => {
                            this.setting.value = this.setting.value - 1;
                        });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.parent.incButton.left - d.width - padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(() => d.parent.innerWidth * 0.2 - padding, { d });
                        d.replaceHeight(() => d.parent.innerHeight - 2 * padding, { d });
                    }
                });

                this.inputBox = Zon.UI.UIInputElement.create(`${this.setting.name}InputBox`, this.element.style.zIndex, this.settingPanel, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.color = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.cursor = 'pointer';
                        //d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        //d.element.style.borderWidth = `${borderWidth}px`;
                        //d.element.style.borderStyle = 'solid';
                        //d.element.style.borderColor = `#AAA`;
                        d.element.style.whiteSpace = 'nowrap';
                        d.element.type = 'number';
                    },
                    postConstructorFunc: (d) => {
                        d.text.replaceEquation(() => `${d.parent.parent.setting.value}`, { d });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(() => d.parent.parent.decButton.left - padding * 2, { d });
                        d.replaceHeight(() => d.parent.innerHeight - 2 * padding, { d });
                    },
                    changeFunc: (d, e) => {
                        const settingValue = this.setting.value;
                        const inputValue = parseInt(e.target.value, 10);
                        if (isNaN(inputValue)) {
                            d._setText(`${settingValue}`);
                        }
                        else {
                            this.setting.value = Math.trunc(inputValue);
                            d._setText(`${this.setting.value}`);
                        }
                    }
                });
            }
            _getSettingWidthFunc = (d) => () => d.parent.innerWidth * 0.4;
        }

        valueSaveLoadHelper = () => {
            if (!this.saveLength) {
                return Zon.SaveLoadHelper_UI32_AL.fromVariable(this._value);
            }
            else {
                return Zon.SaveLoadHelper_UI32.fromVariable(this._value, this.saveLength);
            }
        }
    }

    Zon.NumberSetting = class extends Zon.Setting {
        constructor(id, settingType, defaultValue, minValue = Number.MIN_VALUE, maxValue = Number.MAX_VALUE, name = null) {
            if (defaultValue < minValue || defaultValue > maxValue)
                throw new Error(`Default value ${defaultValue} is out of range [${minValue}, ${maxValue}]`);
                
            super(id, settingType, defaultValue, name);
            this.minValue = minValue;
            this.maxValue = maxValue;
        }

        get value() {
            return this._value.value;
        }

        set value(newValue) {
            if (newValue < this.minValue) {
                newValue = this.minValue;
            }
            else if (newValue > this.maxValue) {
                newValue = this.maxValue;
            }

            this._value.value = newValue;
        }

        static SettingUIPanelClass = class UIntSettingPanel extends Zon.Setting.SettingPanel {
            constructor(parent, lastChild, padding, applyDefaultTopOrLeft, setting) {
                super(parent, lastChild, padding, applyDefaultTopOrLeft, setting);
            }
            postConstructor() {
                super.postConstructor();

                const borderWidth = Zon.Setting.SettingPanel.borderWidth;
                const padding = Zon.Setting.SettingPanel.padding;
                this.incButton = Zon.UI.UIElementDiv2.create(`${this.setting.name}Inc`, this.element.style.zIndex, this.settingPanel, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.cursor = 'pointer';
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        d.element.textContent = `>`;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                        d.element.style.whiteSpace = 'nowrap';
                    },
                    postConstructorFunc: (d) => {
                        d.element.addOnClick(() => {
                            this.setting.value = this.setting.value + 1;
                        });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.innerWidth - d.width - padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(() => d.parent.innerWidth * 0.2 - padding, { d });
                        d.replaceHeight(() => d.parent.innerHeight - 2 * padding, { d });
                    }
                });

                this.decButton = Zon.UI.UIElementDiv2.create(`${this.setting.name}Dec`, this.element.style.zIndex, this.settingPanel, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.cursor = 'pointer';
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        d.element.textContent = `<`;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                        d.element.style.whiteSpace = 'nowrap';
                    },
                    postConstructorFunc: (d) => {
                        d.element.addOnClick(() => {
                            this.setting.value = this.setting.value - 1;
                        });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.parent.incButton.left - d.width - padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(() => d.parent.innerWidth * 0.2 - padding, { d });
                        d.replaceHeight(() => d.parent.innerHeight - 2 * padding, { d });
                    }
                });

                this.inputBox = Zon.UI.UIInputElement.create(`${this.setting.name}InputBox`, this.element.style.zIndex, this.settingPanel, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.color = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.cursor = 'pointer';
                        //d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        //d.element.style.borderWidth = `${borderWidth}px`;
                        //d.element.style.borderStyle = 'solid';
                        //d.element.style.borderColor = `#AAA`;
                        d.element.style.whiteSpace = 'nowrap';
                        d.element.type = 'number';
                    },
                    postConstructorFunc: (d) => {
                        d.text.replaceEquation(() => `${d.parent.parent.setting.value}`, { d });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(() => d.parent.parent.decButton.left - padding * 2, { d });
                        d.replaceHeight(() => d.parent.innerHeight - 2 * padding, { d });
                    },
                    changeFunc: (d, e) => {
                        const settingValue = this.setting.value;
                        const inputValue = parseFloat(e.target.value);
                        if (isNaN(inputValue)) {
                            d._setText(`${settingValue}`);
                        }
                        else {
                            this.setting.value = inputValue;
                            d._setText(`${this.setting.value}`);
                        }
                    }
                });
            }
            _getSettingWidthFunc = (d) => () => d.parent.innerWidth * 0.4;
        }

        valueSaveLoadHelper = () => {
            return Zon.SaveLoadHelper_N.fromVariable(this._value);
        }
    }

    Zon.DropDownSetting = class extends Zon.Setting {
        constructor(id, settingType, defaultValue, optionsEnum, optionNames, saveLength = null, name = null) {
            if (!optionNames[defaultValue])
                throw new Error(`Default value ${defaultValue} is not a valid option in ${optionsEnum}`);

            super(id, settingType, defaultValue, name);
            this.saveLength = saveLength;
            this.optionsEnum = optionsEnum;
            this.optionNames = optionNames;
        }

        get value() {
            return this._value.value;
        }

        set value(newValue) {
            if (!this.optionsEnum[newValue]) {
                console.error(`New value ${newValue} is not a valid option in ${this.optionsEnum}`);
                return;
            }

            this._value.value = newValue;
        }

        valueSaveLoadHelper = () => {
            if (!this.saveLength) {
                return Zon.SaveLoadHelper_UI32_AL.fromVariable(this._value);
            }
            else {
                return Zon.SaveLoadHelper_UI32.fromVariable(this._value, this.saveLength);
            }
        }
    }

    Zon.ColorSetting = class extends Zon.Setting {
        static minValue = 0;
        static maxValue = 0xFFFFFFFF;

        constructor(id, settingType, defaultValue, name = null) {
            if (defaultValue < Zon.ColorSetting.minValue || defaultValue > Zon.ColorSetting.maxValue)
                throw new Error(`Default value ${defaultValue} is out of range [${Zon.ColorSetting.minValue}, ${Zon.ColorSetting.maxValue}]`);

            super(id, settingType, defaultValue, name, Variable.ColorVar);
            this._value.uint = defaultValue;
        }

        get value() {
            return this._value.value;
        }

        set value(newValue) {
            let newValueUint = newValue.uint;
            if (newValueUint < Zon.ColorSetting.minValue) {
                newValueUint = Zon.ColorSetting.minValue;
            }
            else if (newValueUint > Zon.ColorSetting.maxValue) {
                newValueUint = Zon.ColorSetting.maxValue;
            }

            this._value.uint = newValueUint;
        }

        get isDefaultValue() {
            return this._value.uint === this.defaultValue;
        }

        valueSaveLoadHelper = () => {
            return Zon.SaveLoadHelper_Color.fromVariable(this._value);
        }
    }
}//Settings classes

{
    Zon.Settings.CombatUILayoutID = {
        DEFAULT: 0,
        CENTER: 1,
        BOTTOM: 2,
    }
    Zon.Settings.CombatUILayoutIDNames = [];
    Enum.createEnum(Zon.Settings.CombatUILayoutID, Zon.Settings.CombatUILayoutIDNames);

    Zon.Settings.BlockHealthDrawModeID = {
        RADIAL_ACCURATE: 0,
        RADIAL_FAST: 1,
        LEFT_TO_RIGHT: 2,
    }
    Zon.Settings.BlockHealthDrawModeIDNames = [];
    Enum.createEnum(Zon.Settings.BlockHealthDrawModeID, Zon.Settings.BlockHealthDrawModeIDNames);

    Zon.Settings.BlockHealthTextFontID = {
        MICHROMA: 0,
        ORBITRON: 1,
        BRUNO_ACE_SC: 2,
        AUDIOWIDE: 3,
    }
    Zon.Settings.BlockHealthTextFontIDNames = [];
    Enum.createEnum(Zon.Settings.BlockHealthTextFontID, Zon.Settings.BlockHealthTextFontIDNames);
    Zon.Settings.BlockHealthTextFonts = Object.freeze([
        "Michroma",
        "Orbitron",
        "Bruno Ace SC",
        "Audiowide",
    ]);

    Zon.Settings.BlockHealthTextOutlineStyleID = {
        SHADOW: 0,
        OUTLINE: 1,
    }
    Zon.Settings.BlockHealthTextOutlineStyleIDNames = [];
    Enum.createEnum(Zon.Settings.BlockHealthTextOutlineStyleID, Zon.Settings.BlockHealthTextOutlineStyleIDNames);
}//Settings enums

Zon.SettingTypeID = {
    GAME: 0,
    DISPLAY: 1,
    PREFERENCE: 2
}

Zon.GameSettingsID = {
    AutomaticallyGoToNextStage: 0,
    AutomaticallyReturnToStage1: 1,
    SmartReturnToStage1: 2,
    DoubleClickHoldMaxSpeed: 3,
    ClickAndHoldButtons: 4,
    StageToReturnToStage1: 5,
};
Zon.GameSettingsIDNames = [];
Enum.createEnum(Zon.GameSettingsID, Zon.GameSettingsIDNames);

Zon.DisplaySettingsID = {
    ScientificNotation: 0,
    CombatUILayout: 1,
    BlockHealthDrawMode: 2,
    BlockHealthDim: 3,
    BlockDamagedColorStrength: 4,
    BlockDamagedColor: 5,
    BlockDamagedFadeTime: 6,
    BlockHealthTextFont: 7,
    BlockHealthTextColor: 8,
    BlockHealthTextOutlineStyle: 9,
    BlockHealthTextOutlineColor: 10,
    BlockHealthTextOutlineWidth: 11,
    BlockHealthText: 12,
    BlockHealthOutline: 13,
};
Zon.DisplaySettingsIDNames = [];
Enum.createEnum(Zon.DisplaySettingsID, Zon.DisplaySettingsIDNames);

Zon.PreferenceSettingsID = {
    ShuffleSongs: 0,
    MicrophoneGain: 1,
    MicrophoneNoiseThreshold: 2,
    BeatLoudnessChange: 3,
}
Zon.PreferenceSettingsIDNames = [];
Enum.createEnum(Zon.PreferenceSettingsID, Zon.PreferenceSettingsIDNames);

Zon.Settings.createAllSettings = () => {
    if (Zon.Settings.allGameSettings) {
        console.warn("Zon.Settings.allGameSettings already created");
        return;
    }

    Zon.Settings.allGameSettings = [
        new Zon.BoolSetting(Zon.GameSettingsID.AutomaticallyGoToNextStage, Zon.SettingTypeID.GAME, true),
        new Zon.BoolSetting(Zon.GameSettingsID.AutomaticallyReturnToStage1, Zon.SettingTypeID.GAME, false),
        new Zon.BoolSetting(Zon.GameSettingsID.SmartReturnToStage1, Zon.SettingTypeID.GAME, false),
        new Zon.BoolSetting(Zon.GameSettingsID.DoubleClickHoldMaxSpeed, Zon.SettingTypeID.GAME, true),
        new Zon.BoolSetting(Zon.GameSettingsID.ClickAndHoldButtons, Zon.SettingTypeID.GAME, true),
        new Zon.UIntSetting(Zon.GameSettingsID.StageToReturnToStage1, Zon.SettingTypeID.GAME, 2, 1, Zon.LevelData.maxStageDisplayedNum),
    ];

    Zon.Settings.allDisplaySettings = [
        new Zon.BoolSetting(Zon.DisplaySettingsID.ScientificNotation, Zon.SettingTypeID.DISPLAY, false),
        new Zon.DropDownSetting(Zon.DisplaySettingsID.CombatUILayout, Zon.SettingTypeID.DISPLAY, Zon.Settings.CombatUILayoutID.DEFAULT, Zon.Settings.CombatUILayoutID, Zon.Settings.CombatUILayoutIDNames),
        new Zon.DropDownSetting(Zon.DisplaySettingsID.BlockHealthDrawMode, Zon.SettingTypeID.DISPLAY, Zon.Settings.BlockHealthDrawModeID.RADIAL_ACCURATE, Zon.Settings.BlockHealthDrawModeID, Zon.Settings.BlockHealthDrawModeIDNames),
        new Zon.NumberSetting(Zon.DisplaySettingsID.BlockHealthDim, Zon.SettingTypeID.DISPLAY, 0.2, 0, 1),
        new Zon.NumberSetting(Zon.DisplaySettingsID.BlockDamagedColorStrength, Zon.SettingTypeID.DISPLAY, 0.7, 0, 1),
        new Zon.ColorSetting(Zon.DisplaySettingsID.BlockDamagedColor, Zon.SettingTypeID.DISPLAY, 0xFF0000FF),
        new Zon.NumberSetting(Zon.DisplaySettingsID.BlockDamagedFadeTime, Zon.SettingTypeID.DISPLAY, 2, 0, 10000),//seconds
        new Zon.DropDownSetting(Zon.DisplaySettingsID.BlockHealthTextFont, Zon.SettingTypeID.DISPLAY, Zon.Settings.BlockHealthTextFontID.MICHROMA, Zon.Settings.BlockHealthTextFontID, Zon.Settings.BlockHealthTextFontIDNames),
        new Zon.ColorSetting(Zon.DisplaySettingsID.BlockHealthTextColor, Zon.SettingTypeID.DISPLAY, 0xFFFFFFFF),
        new Zon.DropDownSetting(Zon.DisplaySettingsID.BlockHealthTextOutlineStyle, Zon.SettingTypeID.DISPLAY, Zon.Settings.BlockHealthTextOutlineStyleID.OUTLINE, Zon.Settings.BlockHealthTextOutlineStyleID, Zon.Settings.BlockHealthTextOutlineStyleIDNames),
        new Zon.ColorSetting(Zon.DisplaySettingsID.BlockHealthTextOutlineColor, Zon.SettingTypeID.DISPLAY, 0x000000FF),
        new Zon.UIntSetting(Zon.DisplaySettingsID.BlockHealthTextOutlineWidth, Zon.SettingTypeID.DISPLAY, 3, 0, 15, 4),
        new Zon.BoolSetting(Zon.DisplaySettingsID.BlockHealthText, Zon.SettingTypeID.DISPLAY, true),
        new Zon.BoolSetting(Zon.DisplaySettingsID.BlockHealthOutline, Zon.SettingTypeID.DISPLAY, true),
    ];

    Zon.Settings.allPreferenceSettings = [
        new Zon.BoolSetting(Zon.PreferenceSettingsID.ShuffleSongs, Zon.SettingTypeID.PREFERENCE, false),
        new Zon.NumberSetting(Zon.PreferenceSettingsID.MicrophoneGain, Zon.SettingTypeID.PREFERENCE, 1, 0, 10),
        new Zon.NumberSetting(Zon.PreferenceSettingsID.MicrophoneNoiseThreshold, Zon.SettingTypeID.PREFERENCE, 0.01, 0, 1),
        new Zon.NumberSetting(Zon.PreferenceSettingsID.BeatLoudnessChange, Zon.SettingTypeID.PREFERENCE, 1.5, 1, 100),
    ];

    Zon.Settings.ScientificNotation = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.ScientificNotation);
}

Zon.Settings.gameSettingsDisplayOrder = [
    Zon.GameSettingsID.AutomaticallyGoToNextStage,
    Zon.GameSettingsID.AutomaticallyReturnToStage1,
    Zon.GameSettingsID.StageToReturnToStage1,
    Zon.GameSettingsID.SmartReturnToStage1,
    Zon.GameSettingsID.DoubleClickHoldMaxSpeed,
    Zon.GameSettingsID.ClickAndHoldButtons,
];

Zon.Settings.displaySettingsDisplayOrder = [
    Zon.DisplaySettingsID.ScientificNotation,
    Zon.DisplaySettingsID.CombatUILayout,
    Zon.DisplaySettingsID.BlockHealthDrawMode,
    Zon.DisplaySettingsID.BlockHealthDim,
    Zon.DisplaySettingsID.BlockDamagedColorStrength,
    Zon.DisplaySettingsID.BlockDamagedColor,
    Zon.DisplaySettingsID.BlockDamagedFadeTime,
    Zon.DisplaySettingsID.BlockHealthOutline,
    Zon.DisplaySettingsID.BlockHealthText,
    Zon.DisplaySettingsID.BlockHealthTextFont,
    Zon.DisplaySettingsID.BlockHealthTextColor,
    Zon.DisplaySettingsID.BlockHealthTextOutlineStyle,
    Zon.DisplaySettingsID.BlockHealthTextOutlineColor,
    Zon.DisplaySettingsID.BlockHealthTextOutlineWidth,
];

Zon.Settings.preferenceSettingsDisplayOrder = [
    Zon.PreferenceSettingsID.ShuffleSongs,
];