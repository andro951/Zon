"use strict";

Zon.AetherCore = class AetherCore {
    constructor() {
        
    }
    preLoadSetup() {
        this.constructIsUnlocked();
        this.constructAttunementLevel();
        this.constructCoreEmpowermentInfo();
        this.constructEmpowermentLevel();
        this.constructCoreEnhancementInfo();
        this.constructEnhanceLevel();
        this.constructResetCost();//after attunementlevel
    }
    saveLoadHelper = () => {
        //     SaveLoadHelper_List list = new();
        //     list.Add(AttunementLevel.SaveLoadHelper());
        //     list.Add(IsUnlocked.SaveLoadHelper());
        //     list.Add(EmpowerLevel.SaveLoadHelper());
        //     list.Add(EnhanceLevel.SaveLoadHelper());
        //     list.Add(CoreUIState.Instance.EnhancementsZoomScrollRects[(int)CoreID].SaveLoadHelper());//TODO: Make sure EnhancementsZoomScrollRects is set before Save/Load
        //     //$"enhancements.Count: {enhancements.Count}, enhancementIDs: {string.Join(", ", enhancements.Select(e => $"{e.Key}"))}".Log();
        //     list.Add(enhancements.GetSaveLoadHelper((e) => e.SaveLoadHelper(), 8));
        //     return list;
    }

    preSetLoadedValuesSetup = () => {
        this.constructAllOtherValues();
        Zon.reincarnationManager.onReincarnationResetActions.add(this.onReincarnationReset);
        for (const enhancement of this.enhancements.values()) {
            enhancement.preSetLoadedValuesSetup();
        }

        for (const enhancement of this.enhancements.values()) {
            enhancement.preSetLoadedValuesSetup2();
        }
    }
    constructAllOtherValues = () => {
        this.constructSpentEnhancementPoints();

        //this Core Dependent
        this.constructExtraEnhancementPoints();
        this.constructAttunementLevelAfterReset();
        this.constructTotalEmpowermentLevel();

        this.constructEnhancementPoints();//After ExtraEnhancementPoints
        this.constructUnspentEnhancementPoints();//After EnhancementPoints, SpentEnhancementPoints
        this.constructEnhancementPointsAfterReset();//After EnhancementPoints, AttunementLevelAfterReset
    }
    static coreString = "Core";
    nameNoSpaces = () => {
        return `${this.idName()}${Zon.AetherCore.coreString}`;
    }
    idName = () => {
        return Zon.CoreIDNames[this.coreID()];
    }
    name = () => {
        return this.nameNoSpaces().addSpaces();
    }
    beforeCores = () => {
        throw new Error("Method 'beforeCore()' must be implemented.");
    }
    afterCores = () => {
        throw new Error("Method 'afterCore()' must be implemented.");
    }
    description = () => {
        throw new Error("Method 'description()' must be implemented.");
    }
    coreInfo = () => {
        throw new Error("Method 'coreInfo()' must be implemented.");
    }
    color = () => {
        throw new Error("Method 'color()' must be implemented.");
    }
    attunementHowProgress = () => {
        throw new Error("Method 'attunementHowProgress()' must be implemented.");
    }
    coreID = () => {
        if (this._coreID == undefined)//_coreID is set by CoreManager.
            throw new Error("Property '_coreID' must be set in the constructor of the subclass.");

        return this._coreID;
    }
    idName = () => {
        throw new Error("Method 'idName()' must be implemented.");
    }
    validateCore = () => {
        const idName = this.idName();
        if (idName == null || idName == undefined || idName == '')
            throw new Error(`Core ${this.constructor.name} has invalid idName: ${idName}`);
        
        const beforeCores = this.beforeCores();
        if (!(beforeCores instanceof Set))
            throw new Error(`Core ${this.constructor.name} beforeCores() must return a Set.`);

        for (const coreIdName of beforeCores) {
            if (typeof coreIdName !== 'string')
                throw new Error(`Core ${this.constructor.name} beforeCores() must return a Set of strings. Invalid value: ${coreIdName}`);
        }

        const afterCores = this.afterCores();
        if (!(afterCores instanceof Set))
            throw new Error(`Core ${this.constructor.name} afterCores() must return a Set.`);

        for (const coreIdName of afterCores) {
            if (typeof coreIdName !== 'string')
                throw new Error(`Core ${this.constructor.name} afterCores() must return a Set of strings. Invalid value: ${coreIdName}`);
        }
    }
    craftCost = () => {
        throw new Error("Method 'craftCost()' must be implemented.");
    }
    imagePath = () => {
        if (this._imagePath == undefined)
            this._imagePath = this._getImagePath();

        return this._imagePath;
    }
    _getImagePath = () => {
        return Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.CORES, this.nameNoSpaces());
    }
    smallImagePath = () => {
        if (this._smallImagePath == undefined)
            this._smallImagePath = this._getSmallImagePath();

        return this._smallImagePath;
    }
    _getSmallImagePath = () => {
        return Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.CORES, this.nameNoSpaces() + '_32x32');
    }
    constructIsUnlocked = () => {
        this.isUnlocked = new Variable.Value(false, "IsUnlocked");
        this.isUnlocked.onChangedAction.add(() => Zon.ProgressionManager.onUnlockCore(this));
    }
    craftCore = () => {
        if (this.isUnlocked.value)
            return;

        this.isUnlocked.value = true;
        this.onCraftCore();
    }
    onCraftCore = () => {
        throw new Error("Method 'onCraftCore()' must be implemented.");
    }
    enhancements = new Map();
    onSetEnhancementToCore = (enhancement) => {
        this.enhancements.set(enhancement.id, enhancement);
    }

    _xpPerAttunementLevelEquation = () => {
        throw new Error("Method '_xpPerAttunementLevelEquation()' must be implemented.");
    }
    _attunementLevelToXpEquation = () => {
        throw new Error("Method '_attunementLevelToXpEquation()' must be implemented.");
    }
    _attunementXpToLevelEquation = () => {
        throw new Error("Method '_attunementXpToLevelEquation()' must be implemented.");
    }
    constructAttunementLevel = () => {
        this.attunementLevelName = `${this.nameNoSpaces()}AttunementLevel`;
        this.attunementLevelProgressName = `${this.nameNoSpaces()}AttunementLevelTotalXP`;
        this.attunementLevelTracker = new Struct.ProgressLevelTracker_Sum_N(this.attunementLevelName, this.attunementLevelProgressName, this._xpPerAttunementLevelEquation(), this._attunementLevelToXpEquation(), this._attunementXpToLevelEquation());
        this.attunementLevel = this.attunementLevelTracker.level.makeGlobal(`${this.name()} Attunement Level`);
        //this.attunementLevel.onChangedAction.add(() => console.log(`${this.name()} Attunement Level updated: ${this.attunementLevel.value}`));
        this.totalAttunementXP = this.attunementLevelTracker.totalProgress.makeGlobal(`Total ${this.name()} Attunement XP (All xp gained, not just xp in the current attunement level)`);
    }
    
    constructEnhancementPoints = () => {
        this.enhancementPoints = new Variable.Dependent(() => this.attunementLevel.value + this.extraEnhancementPoints.value, `${this.name()} Enhancement Points`, { this: this });
        // this.enhancementPoints.onChangedAction.add(() => {
        //     console.log(`Enhancement Points updated.`);
        // });
    }

    constructExtraEnhancementPoints = () => {
        //this.extraEnhancementPoints = new Variable.Dependent(() => this.coreEnhancementInfo.totalBonus.value + this.enhanceLevel.value, `${this.name()} Extra Enhancement Points`, { this: this });
        this.extraEnhancementPoints = new Variable.Dependent(() => 
            this.enhanceLevel.level.value, `${this.name()} Extra Enhancement Points`, { this: this });
    }

    constructCoreEnhancementInfo = () => {
        //this.coreEnhancementInfo = Zon.CoreEnhancement.getCoreEnhancementInfo(this.coreID());
    }

    constructUnspentEnhancementPoints = () => {
        this.unspentEnhancementPoints = new Variable.Dependent(() => 
            this.enhancementPoints.value - this.spentEnhancementPoints.value, `${this.nameNoSpaces()}UnspentEnhancementPoints`, { this: this });

        // this.unspentEnhancementPoints.onChangedAction.add(() => {
        //     console.log(`Unspent Enhancement Points updated.`);
        // });
    }

    constructSpentEnhancementPoints = () => {
        this.spentEnhancementPoints = new Variable.DependentList(0, `${this.nameNoSpaces()}SpentEnhancementPoints`, (a, b) => a + b);
        for (const enhancement of this.enhancements.values()) {
            this.spentEnhancementPoints.add(enhancement.levelTracker().level);
        }
    }

    canResetEnhancementPoints = () => {
        return this.isUnlocked.value && this.spentEnhancementPoints.value > 0;
    }

    tryResetEnhancementPoints = () => {
        if (this.spentEnhancementPoints.value === 0)
            return false;

        this.resetEnhancementPoints();

        return true;
    }

    resetEnhancementPoints = () => {
        if (this.spentEnhancementPoints.value === 0)
            throw new Error("Cannot reset enhancement points when no points have been spent.");

        const paused = Variable.Base.tryPause(this);
        for (const enhancement of this.enhancements.values()) {
            enhancement.levelTracker().reset();
        }

        //const previousXP = this.attunementLevelTracker.totalProgress.value;
        //const previousLevel = this.attunementLevelTracker.level.value;
        this.attunementLevelTracker.totalProgress.value = this.attunementLevelTracker.totalProgress.value - this.resetCost.value;
        if (paused)
            Variable.Base.resume(this);

        //console.log(`Enhancement points reset for ${this.name()}. Attunement XP reduced by ${this.resetCost.value} from ${previousXP} to ${this.attunementLevelTracker.totalProgress.value}, attunement level: from ${previousLevel} to ${this.attunementLevelTracker.level.value}.`);

        Zon.ScriptTriggers.onResetCoreEnhancementPoints(this.idName());
    }
    
    constructResetCost = () => {
        this.resetCostPercent = new Variable.Value(0.1, "Reset Cost Percent");
        this.resetCost = new Variable.Dependent(() => Math.trunc(this.attunementLevelTracker.totalProgress.value * this.resetCostPercent.value), `${this.name()} Reset Cost`, { this: this });
    }

    constructAttunementLevelAfterReset = () => {
        const levelName = `${this.name()} Attunement Level After Reset`;
        const progressName = `${this.name()} Attunement Level After Reset Progress`;
        this.attunementLevelAfterResetLevelTracker = new Struct.ProgressLevelTracker_Sum_N(levelName, progressName, this.attunementLevelTracker._progressPerLevelEquation, this.attunementLevelTracker._levelToProgressEquation, this.attunementLevelTracker._progressToLevelEquation);
        this.attunementLevelTracker.totalProgress.onChangedAction.add(() => this.attunementLevelAfterResetLevelTracker.totalProgress.value = Math.trunc((1 - this.resetCostPercent.value) * this.attunementLevelTracker.totalProgress.value));
    }

    constructEnhancementPointsAfterReset = () => {
        this.enhancementPointsAfterReset = new Variable.Dependent(() => this.enhancementPoints.value - this.attunementLevelTracker.level.value + this.attunementLevelAfterResetLevelTracker.level.value, `${this.name()} Enhancement Points After Reset`, { this: this });
    }

    tryUpgradeEnhancement = (costLevelTracker, levels) => {
        const { leveledUp, cost } = costLevelTracker.tryLevelUp(levels, this.unspentEnhancementPoints.value);
        if (leveledUp < 1)
            return 0;

        if (this.spentEnhancementPoints.value < 0)
            throw new Error(`Upgrading ${costLevelTracker} caused SpentEnhancementPoints to be < 0: ${this.spentEnhancementPoints.value}`);

        return leveledUp;
    }
    
    _empowermentCostEquation = () => {
        throw new Error("Method '_empowermentCostEquation()' must be implemented.");
    }
    constructEmpowermentLevel = () => {
        this.empowerLevel = new Struct.CostLevelTracker_Equation_BN(this._empowermentCostEquation(), `${this.nameNoSpaces()}EmpowermentLevel`);
    }

    constructTotalEmpowermentLevel = () => {
        //this.totalEmpowermentLevel = new Variable.Dependent(() => this.coreEmpowermentInfo.totalBonus.value + this.empowerLevel.level.value, `${this.name()} Total Empowerment Level`, { this: this });
        this.totalEmpowermentLevel = new Variable.Dependent(() => this.empowerLevel.level.value, `${this.nameNoSpaces()}TotalEmpowermentLevel`, { this: this });
        this.totalEmpowermentLevel.makeGlobal(`${this.name()} Total Empowerment Level (combination of the core's empowerment level and bonuses that provide extra empowerment levels)`);
    }

    constructCoreEmpowermentInfo = () => {
        //this.coreEmpowermentInfo = Zon.CoreEmpowerment.getCoreEmpowermentInfo(this.coreID());
    }

    tryEmpower = (levels) => Zon.playerInventory.trySpendAetherLevelTracker(levels, this.empowerLevel);

    _enhanceCostEquation = () => {
        throw new Error("Method '_enhanceCostEquation()' must be implemented.");
    }

    constructEnhanceLevel = () => {
        this.enhanceLevel = new Struct.CostLevelTracker_Equation_BN(this._enhanceCostEquation(), `${this.name()} Enhancement Level`);
    }

    tryEnhance = (levels) => Zon.playerInventory.trySpendAetherLevelTracker(levels, this.enhanceLevel);

    onReincarnationReset = () => {
        this.isUnlocked.reset();

        for (const enhancement of this.enhancements.values()) {
            enhancement.onReincarnationReset();
        }

        //Variables
        this.attunementLevelTracker.reset();
        this.attunementLevelAfterResetLevelTracker.reset();
        this.empowerLevel.reset();
        this.enhanceLevel.reset();

        //Dependent Variables
        this.totalEmpowermentLevel.reset();
        this.extraEnhancementPoints.reset();
        this.enhancementPoints.reset();
        this.enhancementPointsAfterReset.reset();
        this.spentEnhancementPoints.reset();
        this.unspentEnhancementPoints.reset();
    }
}

Zon.CoreID = {}//Set in CoreManager during preLoadSetup
Zon.CoreIDNames = [];//Set in CoreManager during preLoadSetup