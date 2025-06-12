"use strict";

Zon.Settings = {};

Zon.Settings.preLoadSetup = () => {
    Zon.Settings.createAllSettings();
    Zon.IOManager.registerSaveLoadInfo(Zon.SaveFileTypeID.GAME_SETTINGS, new Zon.Settings.SettingsSaveLoadInfo(Zon.SaveLoadID.SETTINGS, Zon.Settings.allGameSettings));
    Zon.IOManager.registerSaveLoadInfo(Zon.SaveFileTypeID.DISPLAY_SETTINGS, new Zon.Settings.SettingsSaveLoadInfo(Zon.SaveLoadID.SETTINGS, Zon.Settings.allDisplaySettings));
    Zon.IOManager.registerSaveLoadInfo(Zon.SaveFileTypeID.PREFERENCES, new Zon.Settings.SettingsSaveLoadInfo(Zon.SaveLoadID.SETTINGS, Zon.Settings.allPreferenceSettings));
}

Zon.Settings.postLoadSetup = () => {
    const automaticallyGoToNextStage = Zon.Settings.getGameSetting(Zon.GameSettingsID.AUTOMATICALLY_GO_TO_NEXT_STAGE);
    const automaticallyReturnToStage1 = Zon.Settings.getGameSetting(Zon.GameSettingsID.AUTOMATICALLY_RETURN_TO_STAGE_1);
    const smartReturnToStage1 = Zon.Settings.getGameSetting(Zon.GameSettingsID.SMART_RETURN_TO_STAGE_1);
    const stageToReturnToStage1 = Zon.Settings.getGameSetting(Zon.GameSettingsID.STAGE_TO_RETURN_TO_STAGE_1);
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
        constructor(id, defaultValue, name = null, variableClass = Variable.Value) {
            if (new.target === Zon.Setting)
                throw new TypeError("Cannot construct Setting instances directly");

            super();
            this.id = id;
            this.defaultValue = defaultValue;
            this.name = name ?? Zon.GameSettingsIDNames[id];
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

            super(id, defaultValue, name, Variable.ColorVar);
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

Zon.GameSettingsID = {
    AUTOMATICALLY_GO_TO_NEXT_STAGE: 0,
    AUTOMATICALLY_RETURN_TO_STAGE_1: 1,
    SMART_RETURN_TO_STAGE_1: 2,
    DOUBLE_CLICK_HOLD_MAX_SPEED: 3,
    CLICK_AND_HOLD_BUTTONS: 4,
    STAGE_TO_RETURN_TO_STAGE_1: 5,
};
Zon.GameSettingsIDNames = [];
Enum.createEnum(Zon.GameSettingsID, Zon.GameSettingsIDNames);

Zon.DisplaySettingsID = {
    SCIENTIFIC_NOTATION: 0,
    COMBAT_UI_LAYOUT: 1,
    BLOCK_HEALTH_DRAW_MODE: 2,
    BLOCK_HEALTH_DIM: 3,
    BLOCK_DAMAGED_COLOR_STRENGTH: 4,
    BLOCK_DAMAGED_COLOR: 5,
    BLOCK_DAMAGED_FADE_TIME: 6,
    BLOCK_HEALTH_TEXT_FONT: 7,
    BLOCK_HEALTH_TEXT_COLOR: 8,
    BLOCK_HEALTH_TEXT_OUTLINE_STYLE: 9,
    BLOCK_HEALTH_TEXT_OUTLINE_COLOR: 10,
    BLOCK_HEALTH_TEXT_OUTLINE_WIDTH: 11,
    BLOCK_HEALTH_TEXT: 12,
    BLOCK_HEALTH_OUTLINE: 13,
};
Zon.DisplaySettingsIDNames = [];
Enum.createEnum(Zon.DisplaySettingsID, Zon.DisplaySettingsIDNames);

Zon.PreferenceSettingsID = {
    SHUFFLE_SONGS: 0,
}

Zon.Settings.createAllSettings = () => {
    if (Zon.Settings.allGameSettings) {
        console.warn("Zon.Settings.allGameSettings already created");
        return;
    }

    Zon.Settings.allGameSettings = [
        new Zon.BoolSetting(Zon.GameSettingsID.AUTOMATICALLY_GO_TO_NEXT_STAGE, true),
        new Zon.BoolSetting(Zon.GameSettingsID.AUTOMATICALLY_RETURN_TO_STAGE_1, false),
        new Zon.BoolSetting(Zon.GameSettingsID.SMART_RETURN_TO_STAGE_1, false),
        new Zon.BoolSetting(Zon.GameSettingsID.DOUBLE_CLICK_HOLD_MAX_SPEED, true),
        new Zon.BoolSetting(Zon.GameSettingsID.CLICK_AND_HOLD_BUTTONS, true),
        new Zon.IntSetting(Zon.GameSettingsID.STAGE_TO_RETURN_TO_STAGE_1, 2, 1, Zon.LevelData.maxStageDisplayedNum),
    ];

    Zon.Settings.allDisplaySettings = [
        new Zon.BoolSetting(Zon.DisplaySettingsID.SCIENTIFIC_NOTATION, false),
        new Zon.DropDownSetting(Zon.DisplaySettingsID.COMBAT_UI_LAYOUT, Zon.Settings.CombatUILayoutID.DEFAULT, Zon.Settings.CombatUILayoutID, Zon.Settings.CombatUILayoutIDNames),
        new Zon.DropDownSetting(Zon.DisplaySettingsID.BLOCK_HEALTH_DRAW_MODE, Zon.Settings.BlockHealthDrawModeID.RADIAL_ACCURATE, Zon.Settings.BlockHealthDrawModeID, Zon.Settings.BlockHealthDrawModeIDNames),
        new Zon.NumberSetting(Zon.DisplaySettingsID.BLOCK_HEALTH_DIM, 0.2, 0, 1),
        new Zon.NumberSetting(Zon.DisplaySettingsID.BLOCK_DAMAGED_COLOR_STRENGTH, 0.7, 0, 1),
        new Zon.ColorSetting(Zon.DisplaySettingsID.BLOCK_DAMAGED_COLOR, 0xFF0000FF),
        new Zon.NumberSetting(Zon.DisplaySettingsID.BLOCK_DAMAGED_FADE_TIME, 2, 0, 10000),//seconds
        new Zon.DropDownSetting(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_FONT, Zon.Settings.BlockHealthTextFontID.MICHROMA, Zon.Settings.BlockHealthTextFontID, Zon.Settings.BlockHealthTextFontIDNames),
        new Zon.ColorSetting(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_COLOR, 0xFFFFFFFF),
        new Zon.DropDownSetting(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_OUTLINE_STYLE, Zon.Settings.BlockHealthTextOutlineStyleID.OUTLINE, Zon.Settings.BlockHealthTextOutlineStyleID, Zon.Settings.BlockHealthTextOutlineStyleIDNames),
        new Zon.ColorSetting(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_OUTLINE_COLOR, 0x000000FF),
        new Zon.UIntSetting(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_OUTLINE_WIDTH, 3, 0, 15, 4),
        new Zon.BoolSetting(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT, true),
        new Zon.BoolSetting(Zon.DisplaySettingsID.BLOCK_HEALTH_OUTLINE, true),
    ];

    Zon.Settings.allPreferenceSettings = [
        new Zon.BoolSetting(Zon.PreferenceSettingsID.SHUFFLE_SONGS, false),
    ];

    Zon.Settings.ScientificNotation = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.SCIENTIFIC_NOTATION);
}

Zon.Settings.gameSettingsDisplayOrder = [
    Zon.GameSettingsID.AUTOMATICALLY_GO_TO_NEXT_STAGE,
    Zon.GameSettingsID.AUTOMATICALLY_RETURN_TO_STAGE_1,
    Zon.GameSettingsID.STAGE_TO_RETURN_TO_STAGE_1,
    Zon.GameSettingsID.SMART_RETURN_TO_STAGE_1,
    Zon.GameSettingsID.DOUBLE_CLICK_HOLD_MAX_SPEED,
    Zon.GameSettingsID.CLICK_AND_HOLD_BUTTONS,
];

Zon.Settings.displaySettingsDisplayOrder = [
    Zon.DisplaySettingsID.SCIENTIFIC_NOTATION,
    Zon.DisplaySettingsID.COMBAT_UI_LAYOUT,
    Zon.DisplaySettingsID.BLOCK_HEALTH_DRAW_MODE,
    Zon.DisplaySettingsID.BLOCK_HEALTH_DIM,
    Zon.DisplaySettingsID.BLOCK_DAMAGED_COLOR_STRENGTH,
    Zon.DisplaySettingsID.BLOCK_DAMAGED_COLOR,
    Zon.DisplaySettingsID.BLOCK_DAMAGED_FADE_TIME,
    Zon.DisplaySettingsID.BLOCK_HEALTH_OUTLINE,
    Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT,
    Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_FONT,
    Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_COLOR,
    Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_OUTLINE_STYLE,
    Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_OUTLINE_COLOR,
    Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_OUTLINE_WIDTH,
];

Zon.Settings.preferenceSettingsDisplayOrder = [
    Zon.PreferenceSettingsID.SHUFFLE_SONGS,
];