"use strict";

Zon.Settings = {};

Zon.Settings.preLoadSetup = () => {
    Zon.Settings.createAllSettings();
    Zon.IOManager.registerSaveLoadInfo(Zon.SaveFileTypeID.SETTINGS, new Zon.Settings.settingsSaveLoadInfo());
}

Zon.Settings.postLoadSetup = () => {
    const automaticallyGoToNextStage = Zon.Settings.getSetting(Zon.SettingsID.AUTOMATICALLY_GO_TO_NEXT_STAGE);
    const automaticallyReturnToStage1 = Zon.Settings.getSetting(Zon.SettingsID.AUTOMATICALLY_RETURN_TO_STAGE_1);
    const smartReturnToStage1 = Zon.Settings.getSetting(Zon.SettingsID.SMART_RETURN_TO_STAGE_1);
    const stageToReturnToStage1 = Zon.Settings.getSetting(Zon.SettingsID.STAGE_TO_RETURN_TO_STAGE_1);
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

Zon.Settings.getSetting = (id) => {
    return Zon.Settings.allSettings[id];
}

Zon.Settings.getVariable = (id) => {
    return Zon.Settings.allSettings[id].variable;
}

Zon.Settings.get = (id) => {
    return Zon.Settings.allSettings[id].value;
}

Zon.Settings.set = (id, value) => {
    Zon.Settings.allSettings[id].set(value);
}

Zon.Settings.setByPlayer = (id, value) => {
    Zon.Settings.allSettings[id].setByPlayer(value);
}

Zon.Settings.settingsSaveLoadInfo = class extends Zon.SaveLoadInfo {
    constructor() {
        const arr = Zon.Settings.allSettings.map(setting => setting.saveLoadHelper());
        super(Zon.SaveLoadID.SETTINGS, arr);
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
        for (let i = 0; i < Zon.Settings.allSettings.length; i++) {
            const setting = Zon.Settings.allSettings[i];
            this.add(setting.saveLoadHelper());
        }
    }
}

{
    Zon.Setting = class extends Zon.IHasSaveLoadHelper {
        constructor(id, defaultValue, name = null) {
            if (new.target === Zon.Setting) {
                throw new TypeError("Cannot construct Setting instances directly");
            }

            super();
            this.id = id;
            this.defaultValue = defaultValue;
            this.name = name ?? Zon.SettingsIDNames[id];
            this._value = new Variable.Value(defaultValue);
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

        createButton = (canvas, x, y, width, height) => {//TODO
            throw new Error("createButton not implemented");
        }

        valueSaveLoadHelper = () => {
            throw new Error("valueSaveLoadHelper not implemented");
        }

        saveLoadHelper = () => {
            return new this.settingSaveLoadHelper(this);
        }

        settingSaveLoadHelper = class {
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
    }

    Zon.BoolSetting = class extends Zon.Setting {
        constructor(id, defaultValue, name = null) {
            super(id, defaultValue, name);
        }
        
        createButton = (canvas, x, y, width, height) => {//TODO
            throw new Error("createButton not implemented");
        }

        valueSaveLoadHelper = () => {
            return Zon.SaveLoadHelper_B.fromVariable(this._value);
        }
    }

    Zon.IntSetting = class extends Zon.Setting {
        constructor(id, defaultValue, minValue = Number.MIN_SAFE_INTEGER, maxValue = Number.MAX_SAFE_INTEGER, saveLength = null, name = null) {
            if (defaultValue < minValue || defaultValue > maxValue)
                throw new Error(`Default value ${defaultValue} is out of range [${minValue}, ${maxValue}]`);
                
            super(id, defaultValue, name);
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

        createButton = (canvas, x, y, width, height) => {//TODO
            throw new Error("createButton not implemented");
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
        constructor(id, defaultValue, minValue = 0, maxValue = Number.MAX_SAFE_INTEGER, saveLength = null, name = null) {
            if (defaultValue < minValue || defaultValue > maxValue)
                throw new Error(`Default value ${defaultValue} is out of range [${minValue}, ${maxValue}]`);
                
            super(id, defaultValue, name);
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

        createButton = (canvas, x, y, width, height) => {//TODO
            throw new Error("createButton not implemented");
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
        constructor(id, defaultValue, minValue = Number.MIN_VALUE, maxValue = Number.MAX_VALUE, name = null) {
            if (defaultValue < minValue || defaultValue > maxValue)
                throw new Error(`Default value ${defaultValue} is out of range [${minValue}, ${maxValue}]`);
                
            super(id, defaultValue, name);
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

        createButton = (canvas, x, y, width, height) => {//TODO
            throw new Error("createButton not implemented");
        }

        valueSaveLoadHelper = () => {
            return Zon.SaveLoadHelper_N.fromVariable(this._value);
        }
    }

    Zon.DropDownSetting = class extends Zon.Setting {
        constructor(id, defaultValue, optionsEnum, optionNames, saveLength = null, name = null) {
            if (!optionNames[defaultValue])
                throw new Error(`Default value ${defaultValue} is not a valid option in ${optionsEnum}`);

            super(id, defaultValue, name);
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

        createButton = (canvas, x, y, width, height) => {//TODO
            throw new Error("createButton not implemented");
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

        constructor(id, defaultValue, name = null) {
            if (defaultValue < Zon.ColorSetting.minValue || defaultValue > Zon.ColorSetting.maxValue)
                throw new Error(`Default value ${defaultValue} is out of range [${Zon.ColorSetting.minValue}, ${Zon.ColorSetting.maxValue}]`);

            super(id, defaultValue, name);
            this._value.value = Struct.Color.fromUInt(defaultValue);
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

            this._value.value.uint = newValueUint;
        }

        get isDefaultValue() {
            return this._value.value.uint === this.defaultValue;
        }

        createButton = (canvas, x, y, width, height) => {//TODO
            throw new Error("createButton not implemented");
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

Zon.SettingsID = {
    AUTOMATICALLY_GO_TO_NEXT_STAGE: 0,
    AUTOMATICALLY_RETURN_TO_STAGE_1: 1,
    SMART_RETURN_TO_STAGE_1: 2,
    DOUBLE_CLICK_HOLD_MAX_SPEED: 3,
    CLICK_AND_HOLD_BUTTONS: 4,
    SCIENTIFIC_NOTATION: 5,
    STAGE_TO_RETURN_TO_STAGE_1: 6,
    COMBAT_UI_LAYOUT: 7,
    BLOCK_HEALTH_DRAW_MODE: 8,
    BLOCK_HEALTH_DIM: 9,
    BLOCK_DAMAGED_COLOR_STRENGTH: 10,
    BLOCK_DAMAGED_COLOR: 11,
    BLOCK_DAMAGED_FADE_TIME: 12,
    BLOCK_HEALTH_TEXT_FONT: 13,
    BLOCK_HEALTH_TEXT_COLOR: 14,
    BLOCK_HEALTH_TEXT_OUTLINE_STYLE: 15,
    BLOCK_HEALTH_TEXT_OUTLINE_COLOR: 16,
    BLOCK_HEALTH_TEXT_OUTLINE_WIDTH: 17,
    BLOCK_HEALTH_TEXT: 18,
    BLOCK_HEALTH_OUTLINE: 19,
};
Zon.SettingsIDNames = [];
Enum.createEnum(Zon.SettingsID, Zon.SettingsIDNames);
Zon.Settings.createAllSettings = () => {
    if (Zon.Settings.allSettings) {
        console.warn("Zon.Settings.allSettings already created");
        return;
    }

    Zon.Settings.allSettings = [
        new Zon.BoolSetting(Zon.SettingsID.AUTOMATICALLY_GO_TO_NEXT_STAGE, true),
        new Zon.BoolSetting(Zon.SettingsID.AUTOMATICALLY_RETURN_TO_STAGE_1, false),
        new Zon.BoolSetting(Zon.SettingsID.SMART_RETURN_TO_STAGE_1, false),
        new Zon.BoolSetting(Zon.SettingsID.DOUBLE_CLICK_HOLD_MAX_SPEED, true),
        new Zon.BoolSetting(Zon.SettingsID.CLICK_AND_HOLD_BUTTONS, true),
        new Zon.BoolSetting(Zon.SettingsID.SCIENTIFIC_NOTATION, false),
        new Zon.IntSetting(Zon.SettingsID.STAGE_TO_RETURN_TO_STAGE_1, 2, 1, Zon.LevelData.maxStageDisplayedNum),
        new Zon.DropDownSetting(Zon.SettingsID.COMBAT_UI_LAYOUT, Zon.Settings.CombatUILayoutID.DEFAULT, Zon.Settings.CombatUILayoutID, Zon.Settings.CombatUILayoutIDNames),
        new Zon.DropDownSetting(Zon.SettingsID.BLOCK_HEALTH_DRAW_MODE, Zon.Settings.BlockHealthDrawModeID.RADIAL_ACCURATE, Zon.Settings.BlockHealthDrawModeID, Zon.Settings.BlockHealthDrawModeIDNames),
        new Zon.NumberSetting(Zon.SettingsID.BLOCK_HEALTH_DIM, 0.2, 0, 1),
        new Zon.NumberSetting(Zon.SettingsID.BLOCK_DAMAGED_COLOR_STRENGTH, 0.7, 0, 1),
        new Zon.ColorSetting(Zon.SettingsID.BLOCK_DAMAGED_COLOR, 0xFF0000FF),
        new Zon.NumberSetting(Zon.SettingsID.BLOCK_DAMAGED_FADE_TIME, 2, 0, 10000),//seconds
        new Zon.DropDownSetting(Zon.SettingsID.BLOCK_HEALTH_TEXT_FONT, Zon.Settings.BlockHealthTextFontID.MICHROMA, Zon.Settings.BlockHealthTextFontID, Zon.Settings.BlockHealthTextFontIDNames),
        new Zon.ColorSetting(Zon.SettingsID.BLOCK_HEALTH_TEXT_COLOR, 0xFFFFFFFF),
        new Zon.DropDownSetting(Zon.SettingsID.BLOCK_HEALTH_TEXT_OUTLINE_STYLE, Zon.Settings.BlockHealthTextOutlineStyleID.OUTLINE, Zon.Settings.BlockHealthTextOutlineStyleID, Zon.Settings.BlockHealthTextOutlineStyleIDNames),
        new Zon.ColorSetting(Zon.SettingsID.BLOCK_HEALTH_TEXT_OUTLINE_COLOR, 0x000000FF),
        new Zon.UIntSetting(Zon.SettingsID.BLOCK_HEALTH_TEXT_OUTLINE_WIDTH, 3, 0, 15, 4),
        new Zon.BoolSetting(Zon.SettingsID.BLOCK_HEALTH_TEXT, true),
        new Zon.BoolSetting(Zon.SettingsID.BLOCK_HEALTH_OUTLINE, true),
    ];

    Zon.Settings.ScientificNotation = Zon.Settings.allSettings[Zon.SettingsID.SCIENTIFIC_NOTATION].variable;
}

Zon.Settings.displayOrder = [
    Zon.SettingsID.AUTOMATICALLY_GO_TO_NEXT_STAGE,
    Zon.SettingsID.AUTOMATICALLY_RETURN_TO_STAGE_1,
    Zon.SettingsID.STAGE_TO_RETURN_TO_STAGE_1,
    Zon.SettingsID.SMART_RETURN_TO_STAGE_1,
    Zon.SettingsID.DOUBLE_CLICK_HOLD_MAX_SPEED,
    Zon.SettingsID.CLICK_AND_HOLD_BUTTONS,
    Zon.SettingsID.SCIENTIFIC_NOTATION,
    Zon.SettingsID.COMBAT_UI_LAYOUT,
    Zon.SettingsID.BLOCK_HEALTH_DRAW_MODE,
    Zon.SettingsID.BLOCK_HEALTH_DIM,
    Zon.SettingsID.BLOCK_DAMAGED_COLOR_STRENGTH,
    Zon.SettingsID.BLOCK_DAMAGED_COLOR,
    Zon.SettingsID.BLOCK_DAMAGED_FADE_TIME,
    Zon.SettingsID.BLOCK_HEALTH_OUTLINE,
    Zon.SettingsID.BLOCK_HEALTH_TEXT,
    Zon.SettingsID.BLOCK_HEALTH_TEXT_FONT,
    Zon.SettingsID.BLOCK_HEALTH_TEXT_COLOR,
    Zon.SettingsID.BLOCK_HEALTH_TEXT_OUTLINE_STYLE,
    Zon.SettingsID.BLOCK_HEALTH_TEXT_OUTLINE_COLOR,
    Zon.SettingsID.BLOCK_HEALTH_TEXT_OUTLINE_WIDTH,
];