"use strict";

Zon.StageID = {
    MONSTERS_WILD_CREATURES: 0,
    BUGS: 1,
    MONSTERS_ASSORTED_LV2: 2,
    MONSTERS_UNDEAD: 3,
    ARMOR: 4,
    MONSTERS_ASSORTED_LV3: 5,
    MONSTERS_ASSORTED_LV4: 6,
    MONSTERS_MAGES: 7,
    HELMETS: 8,
    MONSTERS_DEMONS: 9,
};
Zon.StageIDNames = [];
Enum.createEnum(Zon.StageID, Zon.StageIDNames);

Zon.LevelData = class LevelData {
    static maxStage = Zon.StageID.COUNT - 1;
    static maxStageNum = 10;
    static startingStage = Zon.StageID.MONSTERS_WILD_CREATURES;
    static startingStageNum = 1;
    static startingStageDisplayedNum = 1;
    static stageCompletionAetherBonusStageMultiplier = 2;
    static baseStageCompletionAetherBonus = Struct.BigNumber.ONE;
    static baseBlockHealth = Struct.BigNumber.ONE;
    static {
        this.getStageIndex = function(stageID, stageNum) {
            return (stageID - this.startingStage) * this.maxStageNum + stageNum - this.startingStageNum;
        };

        this.maxStageDisplayedNum = this.getDisplayedStageNum(this.maxStage, this.maxStageNum);
        this.stageCompletionAetherBonusPerPrestige = this.maxStageDisplayedNum;
        this.maxStageIndex = this.getStageIndex(this.maxStage, this.maxStageNum);
        this.stageCount = this.maxStageIndex + 1;
        Zon.Setup.preLoadSetupActions.add(this.preLoadSetup.bind(this));
    }
    
    constructor(stageID, stageNum) {
        this.stageID = stageID;
        this.stageNum = stageNum;
        this.stageDuration = 0;
        this.setup();
        this.blockMaxHealth = Zon.LevelData.getBlockMaxHealth(this.displayedStageNum);
        this.getRandomPngFile();
    }

    static preLoadSetup() {
        const stageNum = `stageNum`;
        const maxStageNum = `maxStageNum`;
        const constants = [
            [maxStageNum, `${this.maxStageDisplayedNum}`]
        ];
        const args = [
            new Zon.Type_N(stageNum),
        ];
        const effStageNum = `effStageNum`;
        this.effStageNumEquation = Zon.Equation_N.create(effStageNum, `${stageNum} + ${Zon.GlobalVarNames.PRESTIGE_COUNT} * ${maxStageNum}`, [], args, constants);
        const healthPow = `healthPow`;
        this.blockHealthPowEquation = Zon.Equation_N.create(healthPow, `3 * (2^(${effStageNum} / 10) - 1)`, [], args, constants, [this.effStageNumEquation]);
        this.blockMaxHealthEquation = Zon.Equation_BN.create(`baseBlockHealth`, `10^${healthPow}`, [], args, constants, [this.effStageNumEquation, this.blockHealthPowEquation]);
        this.getBlockMaxHealth = this.blockMaxHealthEquation.getValue;

        const aetherBonusPow = `stageCompletionAetherBonusPow`;
        this.stageCompletionAetherBonusPowEquation = Zon.Equation_N.create(aetherBonusPow, `3 * (2^(${effStageNum} / 10) - 1) + ${effStageNum} / 10`, [], args, constants, [this.effStageNumEquation]);

        this.stageCompletionAetherBonusEquation = Zon.Equation_BN.create(`stageCompletionAetherBonus`, `10^${aetherBonusPow}`, [], args, constants, [this.effStageNumEquation, this.stageCompletionAetherBonusPowEquation]);
        this.getStageCompletionBaseAetherReward = this.stageCompletionAetherBonusEquation.getValue
    }

    // static getBlockMaxHealth(displayedStageNum, prestigeCount) {
    //     //return Zon.LevelData.baseBlockHealth.multiplyByPow10(displayedStageNum + this.maxStageDisplayedNum * prestigeCount);//.tryBumpDown();
    //     return Zon.LevelData.baseBlockHealth.multiplyByPow10(3 * (2 ** ((displayedStageNum + this.maxStageDisplayedNum * prestigeCount) / 10) - 1));//.tryBumpDown();
    // }

    // static getStageCompletionBaseAetherReward(displayedStageNum, prestigeCount) {
    //     //return Zon.LevelData.baseStageCompletionAetherBonus.multiplyByPow10((displayedStageNum + this.maxStageDisplayedNum * prestigeCount) / 2);
    //     const stageCount = displayedStageNum + this.maxStageDisplayedNum * prestigeCount;
    //     return Zon.LevelData.baseStageCompletionAetherBonus.multiplyByPow10(3 * (2 ** (stageCount / 10) - 1) + stageCount / 10);
    // }

    copyStage = (stageID, stageNum, width, height, pixels, blockHP, blockMaxHealth, stageDuration) => {
        const stage = new Zon.LevelData(stageID, stageNum);
        stage.width = width;
        stage.height = height;
        stage.pixels = pixels;
        stage.blockHP = blockHP;
        stage.stageDuration = stageDuration;
        this.setup();
        stage.blockMaxHealth = blockMaxHealth;
    }

    setup = () => {
        this.displayedStageNum = Zon.LevelData.getDisplayedStageNum(this.stageID, this.stageNum);
        this.stageIndex = Zon.LevelData.getStageIndex(this.stageID, this.stageNum);
    }

    update = () => {
        this.stageDuration += Time.TimeController.deltaTime;
    }

    get isMaxStage() {
        return this.stageID == Zon.LevelData.maxStage && this.stageNum == Zon.LevelData.maxStageNum;
    }

    get isStartingStage() {
        return this.stageID == Zon.LevelData.startingStage && this.stageNum == Zon.LevelData.startingStageNum;
    }

    static getStageToReturnToStage1Index() {
        return Zon.LevelData.displayedStageNumToStageIndex(Zon.Settings.stageToReturnToStage1.value);
    }

    get levelName() {
        return this.imgName();
    }

    getRandomPngFile = () => {
        const textures = Zon.LevelData.allLevelTextures[Zon.StageIDNames[this.stageID]];
        const keys = Object.keys(textures);
        const randomIndex = Math.floor(Math.random() * keys.length);
        this.imageWrapper = textures[keys[randomIndex]];
        this.forwardMethodsFrom(this.imageWrapper, !!this.imgName);//Ignore duplicates error if this.imgName is already defined.  !! is to cast to boolean.
    }

    toString = () => {
        return `LevelData; ID: ${this.stageID}, Width: ${this.width()}, Height: ${this.height()}, LevelName: ${this.levelName}`;
    }

    giveLevelRewards = () => {
        this.giveResourceRewards();
        this.givePostResourceRewards();
    }

    static getStageCompletionAetherReward(displayedStageIndex, prestigeCount) {
        const stageCompletionAetherBonus = Zon.LevelData.getStageCompletionBaseAetherReward(displayedStageIndex, prestigeCount);
        const finalStageCompletionAetherBonus = stageCompletionAetherBonus.multiply(Zon.AetherBonusManager.aetherBonus.value);
        if (finalStageCompletionAetherBonus.isNegative) {
            throw new Error(`finalStageCompletionAetherBonus is negative: ${finalStageCompletionAetherBonus}`);
        }

        return finalStageCompletionAetherBonus;
    }

    get aetherStageCompletionReward() {
        return Zon.LevelData.getStageCompletionAetherReward(this.displayedStageNum, Zon.game.prestigeCount);
    }

    giveResourceRewards = () => {
        Zon.playerInventory.receiveAether(this.aetherStageCompletionReward);
    }

    givePostResourceRewards = () => {
        Zon.StageBonusManager.onCompleteStage(this);
    }

    static getStageName(stageID, stageNum) {
        return `${this.getDisplayedStageNum(stageID, stageNum)}`;
    }

    static getDisplayedStageNum(stageID, stageNum) {
        return this.getStageIndex(stageID, stageNum) + this.startingStageDisplayedNum;
    }

    static toStageIDAndNum(displayedStageIndex) {
        const stageID = Math.floor(displayedStageIndex / this.maxStageNum) + this.startingStage;
        const stageNum = displayedStageIndex % this.maxStageNum + this.startingStageNum;
        return { stageID, stageNum };
    }

    static displayedStageNumToStageIndex(displayedStageNum) {
        return displayedStageNum - this.startingStageDisplayedNum;
    }

    static allLevelTextures;
    static postLoadTextures() {
        Zon.LevelData.allLevelTextures = Zon.allTextures[Zon.TextureFolders.levels];
    }
}