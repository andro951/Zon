"use strict";

Zon.IOManager = {};

Zon.IOManager.savingInProgress = new Set();
Zon.IOManager.saveLoadInfos = new Map();

Zon.IOManager.preLoadSetup = () => {
    Zon.IOManager.registerCommonDataHelper();
}

//SaveLoadHelpers store values using get() to take a quickly capture the curent save data.
// There is only one instance of each helper, tied directly to the game data is saves.
// Because there is only one instance of each helper, there can't be multiple saves of the same type in progress at the same time.

Zon.IOManager.tryMakeNewSaveFile = (saveFileTypeID, saveNum) => {
    const saveName = Zon.IOManager.getSaveName(saveFileTypeID, saveNum);
    if (localStorage.getItem(saveName) !== null) {
        throw new Error(`Save file ${saveName} already exists. Cannot create new save file.`);
    }

    Zon.IOManager.saveAsync(saveFileTypeID, saveNum);
}

{
    Zon.IOManager.saveGameImmediate = (saveNum) => {
        Zon.IOManager.saveImmediate(Zon.SaveFileTypeID.GAME, saveNum);
    }

    Zon.IOManager.saveGameAsync = (saveNum) => {
        Zon.IOManager.saveAsync(Zon.SaveFileTypeID.GAME, saveNum);
    }

    Zon.IOManager.saveGameSettingsImmediate = (saveNum) => {
        Zon.IOManager.saveImmediate(Zon.SaveFileTypeID.GAME_SETTINGS, saveNum);
    }

    Zon.IOManager.saveGameSettingsAsync = (saveNum) => {
        Zon.IOManager.saveAsync(Zon.SaveFileTypeID.GAME_SETTINGS, saveNum);
    }

    Zon.IOManager.saveDisplaySettingsImmediate = (saveNum) => {
        Zon.IOManager.saveImmediate(Zon.SaveFileTypeID.DISPLAY_SETTINGS, saveNum);
    }

    Zon.IOManager.saveDisplaySettingsAsync = (saveNum) => {
        Zon.IOManager.saveAsync(Zon.SaveFileTypeID.DISPLAY_SETTINGS, saveNum);
    }
}//Imm/Async saves

Zon.IOManager.saveImmediate = (saveFileTypeID, saveNum) => {
    Zon.IOManager.saveAsync(saveFileTypeID, saveNum);
    Zon.processManager.executeAllSaveProcesses();
}

Zon.IOManager.saveAsync = (saveFileTypeID, saveNum) => {
    if (Zon.IOManager.savingInProgress.has(saveFileTypeID)) {
        Zon.processManager.executeAllSaveProcesses();
    }

    Zon.IOManager.startSaving(saveFileTypeID, saveNum);
}

Zon.IOManager.startSaving = (saveFileTypeID, saveNum) => {
    const saveLoadInfos = Zon.IOManager.saveLoadInfos.get(saveFileTypeID);
    if (!saveLoadInfos) {
        const error = `No saveLoadInfo found for saveFileTypeID: ${saveFileTypeID}`;
        console.error(error);
        if (zonDebug)
            throw new Error(error);
            
        return;
    }

    Zon.IOManager.startSaveProcess(saveFileTypeID, saveLoadInfos, saveNum);
}

Zon.IOManager.startSaveProcess = (saveFileTypeID, saveLoadInfos, saveNum) => {
    const saveProcess = Zon.IOManager.saveProcess(saveFileTypeID, saveLoadInfos, saveNum);
    saveProcess.next();
    Zon.processManager.addSaveProcess(saveProcess);
}

Zon.IOManager.saveProcess = function*(saveFileTypeID, saveLoadInfos, saveNum) {
    try {
        if (Zon.IOManager.loadingInProgress.has(saveFileTypeID))
            throw new Error(`Cannot save while loading ${Zon.SaveFileTypeIDNames[saveFileTypeID]}.`);

        if (Zon.IOManager.loadDataReady.has(saveFileTypeID))
            throw new Error(`Cannot save.  Loaded data hasn't been set yet.  ${Zon.SaveFileTypeIDNames[saveFileTypeID]}.`);
            
        Zon.IOManager.savingInProgress.add(saveFileTypeID);
        if (saveFileTypeID === Zon.SaveFileTypeID.GAME) {
            Zon.Setup.preSaveGame();
        }

        Zon.IOManager.get(saveLoadInfos);
        let processCommand = yield;
        
        const writer = new Binary.Writer().createStream();
        //const startTime = performance.now();
        if (saveLoadInfos.length < 1)
            throw new Error(`No saveLoadHelpers found for saveLoadInfos.`);

        let count = 0;
        for (let i = 0; i < saveLoadInfos.length; i++) {
            const saveLoadInfo = saveLoadInfos[i];
            if (saveLoadInfo) {
                count++;
            }
        }

        //console.log(`Saving ${Zon.SaveFileTypeIDNames[saveFileTypeID]} with ${count} SaveLoadInfos.`);
        if (count <= 0) {
            throw new Error(`No valid SaveLoadInfos found for saveFileTypeID: ${saveFileTypeID}.`);
        }

        writer.writeUInt32(count, 16);
        for (let id = 0; id < saveLoadInfos.length; id++) {
            const saveLoadInfo = saveLoadInfos[id];
            if (saveLoadInfo) {
                //console.log(`Writing SaveLoadInfo with ID: ${id} (${Zon.SaveLoadIDNames[id]})`);
                writer.writeUInt32(id, 16);
                saveLoadInfo.write(writer);
            }
            else {
                continue;
            }

            switch (processCommand ?? Zon.ProcessCommandID.NONE) {
                case Zon.ProcessCommandID.STOP_YIELDING:
                    break;
                case Zon.ProcessCommandID.ABORT:
                    throw new Error(`Save process aborted for ${Zon.SaveFileTypeIDNames[saveFileTypeID]}.`);
                case Zon.ProcessCommandID.NONE:
                    processCommand = yield;
                    break;
                default:
                    throw new Error(`Unknown process command: ${processCommand}`);
            }
        }

        const saveName = Zon.IOManager.getSaveName(saveFileTypeID, saveNum);
        writer.saveToLocalStorage(saveName);
        //const endTime = performance.now();
        //console.log(`Saved ${saveName} in ${endTime - startTime}ms`);
    }
    catch (error) {
        const errorMessage = `Error saving ${Zon.SaveFileTypeIDNames[saveFileTypeID]}: ${error}`;
        console.error(errorMessage);
        if (zonDebug)
            throw new Error(errorMessage);
    }

    finally {
        Zon.IOManager.savingInProgress.delete(saveFileTypeID);
    }
}

Zon.IOManager.get = (saveLoadInfos) => {
    if (saveLoadInfos.length < 1)
        throw new Error(`No saveLoadHelpers found for saveLoadInfos.`);
    
    for (let id = 0; id < saveLoadInfos.length; id++) {
        const saveLoadInfo = saveLoadInfos[id];
        if (saveLoadInfo)
            saveLoadInfo.get();
    }
}

Zon.IOManager.getSaveName = (saveFileTypeID, saveNum) => {
    switch (saveFileTypeID) {
        case Zon.SaveFileTypeID.GAME:
            return `zon_save_game_${saveNum}`;
        case Zon.SaveFileTypeID.GAME_SETTINGS:
            return `zon_save_game_settings_${saveNum}`;
        case Zon.SaveFileTypeID.DISPLAY_SETTINGS:
            return `zon_save_display_settings_${saveNum}`;
        case Zon.SaveFileTypeID.MODS:
            return `zon_save_mods_${saveNum}`;
        case Zon.SaveFileTypeID.MOD_SETTINGS:
            return `zon_save_mod_settings_${saveNum}`;
        default:
            console.error(`Unknown saveFileTypeID: ${saveFileTypeID}`);
            return null;
    }
}

Zon.IOManager.registerSaveLoadInfo = (saveFileTypeID, saveLoadInfo) => {
    let arr = Zon.IOManager.saveLoadInfos.get(saveFileTypeID);
    if (!arr) {
        arr = [];
        Zon.IOManager.saveLoadInfos.set(saveFileTypeID, arr);
    }

    if (arr.some(info => info.ID === saveLoadInfo.ID)) {
        const error = `SaveLoadInfo with ID ${saveLoadInfo.ID} already exists for saveFileTypeID ${saveFileTypeID}`;
        console.error(error);
        if (zonDebug)
            throw new Error(error);

        return;
    }

    arr[saveLoadInfo.ID] = saveLoadInfo;
}

Zon.IOManager.loadDataReady = new Set();
Zon.IOManager.loadingInProgress = new Set();

{
    Zon.IOManager.loadGameImmediate = (saveNum) => {
        Zon.IOManager.loadImmediate(Zon.SaveFileTypeID.GAME, saveNum);
    }

    Zon.IOManager.loadGameAsync = (saveNum) => {
        Zon.IOManager.loadAsync(Zon.SaveFileTypeID.GAME, saveNum);
    }

    Zon.IOManager.loadGameSettingsImmediate = (saveNum) => {
        Zon.IOManager.loadImmediate(Zon.SaveFileTypeID.GAME_SETTINGS, saveNum);
    }

    Zon.IOManager.loadGameSettingsAsync = (saveNum) => {
        Zon.IOManager.loadAsync(Zon.SaveFileTypeID.GAME_SETTINGS, saveNum);
    }

    Zon.IOManager.loadDisplaySettingsImmediate = (saveNum) => {
        Zon.IOManager.loadImmediate(Zon.SaveFileTypeID.DISPLAY_SETTINGS, saveNum);
    }

    Zon.IOManager.loadDisplaySettingsAsync = (saveNum) => {
        Zon.IOManager.loadAsync(Zon.SaveFileTypeID.DISPLAY_SETTINGS, saveNum);
    }
}//Imm/Async loads

Zon.IOManager.loadImmediate = (saveFileTypeID, saveNum) => {
    Zon.IOManager.startLoading(saveFileTypeID, saveNum);
    Zon.processManager.executeAllLoadProcesses();
}

Zon.IOManager.loadAsync = (saveFileTypeID, saveNum) => {
    if (Zon.IOManager.loadingInProgress.has(saveFileTypeID)) {
        Zon.processManager.executeAllLoadProcesses();
    }

    Zon.IOManager.startLoading(saveFileTypeID, saveNum);
}

Zon.IOManager.startLoading = (saveFileTypeID, saveNum) => {
    const saveLoadInfos = Zon.IOManager.saveLoadInfos.get(saveFileTypeID);
    if (!saveLoadInfos) {
        const error = `No saveLoadInfo found for saveFileTypeID: ${saveFileTypeID}`;
        console.error(error);
        if (zonDebug)
            throw new Error(error);
            
        return;
    }

    Zon.IOManager.startLoadProcess(saveFileTypeID, saveLoadInfos, saveNum);
}

Zon.IOManager.startLoadProcess = (saveFileTypeID, saveLoadInfos, saveNum) => {
    const loadProcess = Zon.IOManager.loadProcess(saveFileTypeID, saveLoadInfos, saveNum);
    loadProcess.next();
    Zon.processManager.addLoadProcess(loadProcess);
}

Zon.IOManager.loadProcess = function*(saveFileTypeID, saveLoadInfos, saveNum) {
    let completedLoading = false;
    try {
        if (Zon.IOManager.savingInProgress.has(saveFileTypeID)) {
            Zon.processManager.executeAllSaveProcesses();
        }

        Zon.IOManager.loadingInProgress.add(saveFileTypeID);
        let processCommand = yield;

        const saveName = Zon.IOManager.getSaveName(saveFileTypeID, saveNum);
        const reader = new Binary.Reader();
        if (!reader) {
            throw new Error(`No save found for ${saveName}`);
        }

        reader.loadFromLocalStorage(saveName);

        const startTime = performance.now();

        const count = reader.readUInt32(16);
        //console.log(`Loading ${saveName} with ${count} SaveLoadInfos.`);
        if (count <= 0)
            throw new Error(`SaveLoadInfos count was ${count} for ${saveName}.`);

        for (let i = 0; i < count; i++) {
            const infoID = reader.readUInt32(16);
            //console.log(`Reading SaveLoadInfo with ID: ${infoID} (${Zon.SaveLoadIDNames[infoID]})`);
            const saveLoadInfo = saveLoadInfos[infoID];
            if (saveLoadInfo) {
                saveLoadInfo.read(reader);
            }
            else {
                throw new Error(`Tried to read SaveLoadInfo (${Zon.SaveLoadIDNames[infoID]}), but none found in saveLoadInfos[${Zon.SaveFileTypeIDNames[saveFileTypeID]}].`);
            }

            switch (processCommand ?? Zon.ProcessCommandID.NONE) {
                case Zon.ProcessCommandID.STOP_YIELDING:
                    break;
                // case Zon.ProcessCommandID.ABORT:
                //     return;//Not tested
                case Zon.ProcessCommandID.NONE:
                    processCommand = yield;
                    break;
                default:
                    throw new Error(`Unknown process command: ${processCommand}`);
            }
        }

        reader.verifyFullyRead();
        const endTime = performance.now();
        console.log(`Loaded ${saveName} in ${endTime - startTime}ms`);
        completedLoading = true;
    }
    catch (error) {
        const errorMessage = `Error loading ${Zon.SaveFileTypeIDNames[saveFileTypeID]}: ${error}`;
        console.error(errorMessage);
        if (zonDebug)
            throw new Error(errorMessage);
    }

    finally {
        if (completedLoading) {
            Zon.IOManager.loadingInProgress.delete(saveFileTypeID);
            Zon.IOManager.loadDataReady.add(saveFileTypeID);
        }
        else {
            Zon.IOManager.loadingInProgress.delete(saveFileTypeID);
            Zon.IOManager.loadDataReady.delete(saveFileTypeID);
        }
    }
}

Zon.IOManager.setAllLoadedValues = () => {
    for (const saveFileTypeID of Zon.IOManager.loadDataReady) {
        Zon.IOManager._checkLoadDataReady(saveFileTypeID);
    }

    for (const saveFileTypeID of Zon.IOManager.loadDataReady) {
        Zon.IOManager._setLoadedValues(saveFileTypeID);
    }
}

Zon.IOManager.setLoadedValues = (saveFileTypeID) => {
    Zon.IOManager._checkLoadDataReady(saveFileTypeID);
    Zon.IOManager._setLoadedValues(saveFileTypeID);
}

Zon.IOManager._checkLoadDataReady = (saveFileTypeID) => {
    if (!Zon.IOManager.loadDataReady.has(saveFileTypeID))
        throw new Error(`Zon.IOManager.loadDataReady[${Zon.SaveFileTypeIDNames[saveFileTypeID]}] is not set. Cannot set all loaded values.`);
}

Zon.IOManager._setLoadedValues = (saveFileTypeID) => {
    const saveLoadInfos = Zon.IOManager.saveLoadInfos.get(saveFileTypeID);
    if (!saveLoadInfos) {
        const error = `No saveLoadInfo found for saveFileTypeID: ${saveFileTypeID}`;
        console.error(error);
        if (zonDebug)
            throw new Error(error);
            
        return;
    }

    for (const saveLoadInfo of saveLoadInfos) {
        if (saveLoadInfo) {
            saveLoadInfo.set();
        }
    }

    Zon.IOManager.loadDataReady.delete(saveFileTypeID);
}

Zon.SaveFileTypeID = {
    GAME: 0,
    GAME_SETTINGS: 1,
    DISPLAY_SETTINGS: 2,
    MODS: 3,
    MOD_SETTINGS: 4,
}
Zon.SaveFileTypeIDNames = [];
Enum.createEnum(Zon.SaveFileTypeID, Zon.SaveFileTypeIDNames, false);

Zon.SaveLoadID = {
    COMMON_DATA: 0,
    INVENTORY: 1,
    ABILITIES: 2,
    TIME_CONTROLLER: 3,
    SETTINGS: 4,
    STAGE_BONUS_MANAGER: 5,
    GAME: 6,
    STAGE_SMART_RESET: 7,
    PROGRESSION: 8,
    AETHER_CORES: 9,
    CRAFTING_MANAGER: 10,
    REINCARNATION: 11,
    TALENT_MANAGER: 12,
    PLAYER_STATS: 13,
    MANA_BAR: 14,
    STAMINA_BAR: 15,
}
Zon.SaveLoadIDNames = [];
Enum.createEnum(Zon.SaveLoadID, Zon.SaveLoadIDNames, false);

Zon.IOManager.CommonDataHelper = class CommonDataHelper extends Zon.SaveLoadInfo {
    constructor() {
        super(Zon.SaveLoadID.COMMON_DATA);
        this.addHelpers();
    }

    write = (writer) => {
        writer.writeUInt32AutoLength(this.saveLoadHelpers.length);
        for (let id = 0; id < this.saveLoadHelpers.length; id++) {
            const item = this.saveLoadHelpers[id];
            item.write(writer);
        }
    }
    read = (reader) => {
        this.count = reader.readUInt32AutoLength();
        for (let id = 0; id < this.count; id++) {
            const item = this.saveLoadHelpers[id];
            item.read(reader);
        }
    }
    get = () => {
        for (const item of this.saveLoadHelpers) {
            item.get();
        }
    }
    set = () => {
        for (let id = 0; id < this.count; id++) {
            const item = this.saveLoadHelpers[id];
            item.set();
        }
    }

    //The number of bits can safely be changed between versions if more space is needed.
    stageBits = new Zon.LoadConstantHelper_UI32((Zon.StageID.COUNT - 1).bitLength32());
    stageNumBits = new Zon.LoadConstantHelper_UI32(Zon.LevelData.maxStageNum.bitLength32());
    settingsEnumBits = new Zon.LoadConstantHelper_UI32((Zon.GameSettingsID.COUNT - 1).bitLength32());
    itemIDBits = new Zon.LoadConstantHelper_UI32((Zon.ItemType.COUNT).bitLength32());

    addHelpers = () => {
        // for (const key of Object.keys(this)) {
        //     const value = this[key];
        //     if (value instanceof Zon.LoadConstantHelper) {
        //         this.add(value);
        //     }
        // }
        this.add(this.stageBits);
        this.add(this.stageNumBits);
        this.add(this.settingsEnumBits);
        this.add(this.itemIDBits);
    }
}

Zon.IOManager.commonDataHelper = null;
Zon.IOManager.registerCommonDataHelper = () => {
    Zon.IOManager.commonDataHelper = new Zon.IOManager.CommonDataHelper();
    Zon.IOManager.registerSaveLoadInfo(Zon.SaveFileTypeID.GAME, Zon.IOManager.commonDataHelper);
}