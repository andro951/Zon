"use strict";

Zon.CoreManager = class {
    constructor() {
        this.aetherCores = [];
        this.aetherCoresByIdName = new Map();
        this.allEnhancements = new Map();
        this.selectedCoreIndex = new Variable.Value(0, "SelectedCore");
    }

    preLoadSetup = () => {
        for (const enhancement of this.allEnhancements.values()) {
            enhancement.preLoadSetup();
        }

        this.initializeCores();
        this.registerEnhancementsWithCores();
        for (const core of this.aetherCores) {
            core.preLoadSetup();
        }
        
        //Zon.IOManager.registerSaveLoadInfo(Zon.SaveFileTypeID.GAME, this.saveLoadInfo());
    }

    initializeCores = () => {
        for (const core of this.aetherCoresByIdName.values()) {
            for (const coreIdName of core.beforeCores()) {
                const beforeCore = this.aetherCoresByIdName.get(coreIdName);
                if (beforeCore == null)
                    throw new Error(`Core with idName ${coreIdName} not found for core ${core.idName()} in beforeCores().`);

                if (beforeCore == core)
                    throw new Error(`Core ${core.idName()} cannot have itself as a beforeCore.`);
            }

            for (const coreIdName of core.afterCores()) {
                const afterCore = this.aetherCoresByIdName.get(coreIdName);
                if (afterCore == null)
                    throw new Error(`Core with idName ${coreIdName} not found for core ${core.idName()} in afterCores().`);

                if (afterCore == core)
                    throw new Error(`Core ${core.idName()} cannot have itself as an afterCore.`);
            }
        }

        for (const core of this.aetherCoresByIdName.values()) {
            if (this.aetherCores.length == 0) {
                this.aetherCores.push(core);
                continue;
            }

            let inserted = false;
            const beforeCores = core.beforeCores();
            const afterCores = core.afterCores();
            for (let i = 0; i < this.aetherCores.length; i++) {
                const currentCore = this.aetherCores[i];
                const currentCoreIdName = currentCore.idName();
                if (afterCores.has(currentCoreIdName)) {
                    if (beforeCores.has(currentCoreIdName))
                        throw new Error(`Core ${core.idName()} cannot have core ${currentCore.idName()} as both a beforeCore and afterCore.`);

                    continue;
                }

                if (beforeCores.has(currentCoreIdName)) {
                    this.aetherCores.splice(i, 0, core);
                    inserted = true;
                    break;
                }
            }

            if (!inserted)
                this.aetherCores.push(core);
        }

        for (let i = 0; i < this.aetherCores.length; i++) {
            const core = this.aetherCores[i];
            core._coreID = i;
            Zon.CoreID[core.idName()] = i;
        }

        Enum.createEnum(Zon.CoreID, Zon.CoreIDNames, false);
    }

    preSetLoadedValuesSetup = () => {
        for (const core of this.aetherCores) {
            core.preSetLoadedValuesSetup();
        }
    }

    postLoadSetup = () => {
        for (const enhancement of this.allEnhancements.values()) {
            enhancement.postLoadSetup();
        }

        this.selectCore(Zon.CoreID.Combat);
    }

    saveLoadInfo = () => {
        let info = new Zon.SaveLoadInfo(Zon.SaveLoadID.AETHER_CORES);
        info.add(this.aetherCores.getSaveLoadHelper((core) => core.saveLoadHelper()));
        return info;
    }

    registerEnhancementsWithCores = () => {
        for (const enhancement of this.allEnhancements.values()) {
            const core = Zon.coreManager.getCore(enhancement.coreID());
            if (core === undefined)
                console.log(`CoreManager.preSetLoadedValuesSetup(); core (${enhancement.coreID}) is null.`);

            core.onSetEnhancementToCore(enhancement);
        }
    }
    
    registerCore = (core) => {
        core.validateCore();

        const coreIDName = core.idName();
        if (this.aetherCoresByIdName.has(coreIDName))
            throw new Error(`Core with idName ${coreIDName} is already registered.`);
        
        this.aetherCoresByIdName.set(coreIDName, core);

        return core;
    }

    getCore = (coreID) => {
        return this.aetherCores[coreID];
    }
    tryCraftingCore = (core) => {
        if (core.isUnlocked())
            return;

        if (Zon.playerInventory.trySpendAether(core.craftCost())) {
            core.craftCore();
        }
    }
    onClickEnhanceButton = (enhancement) => {
        const levelsUpgraded = enhancement.tryUpgrade(1);
    }
    
    selectCore = (coreID) => {
        if (!Number.isInteger(coreID) || coreID < 0 || coreID >= this.aetherCores.length)
            throw new Error(`Invalid coreID ${coreID} in selectCore().`);

        this.selectedCoreIndex.value = coreID;
    }

    selectedCore = () => this.getCore(this.selectedCoreIndex.value);
    
    registerEnhancement(enhancement) {
        this.allEnhancements.set(enhancement.enhancementID, enhancement);
        return enhancement;
    }
    
    getEnhancement(enhancementID) {
        return this.allEnhancements.get(enhancementID);
    }
}

Zon.coreManager = new Zon.CoreManager();