"use strict";

Zon.StageID = {
    NONE: 0,
    MONSTERS_WILD_CREATURES: 1,
    BUGS: 2,
    MONSTERS_ASSORTED_LV2: 3,
    MONSTERS_UNDEAD: 4,
    ARMOR: 5,
    MONSTERS_ASSORTED_LV3: 6,
    MONSTERS_ASSORTED_LV4: 7,
    MONSTERS_MAGES: 8,
    HELMETS: 9,
    MONSTERS_DEMONS: 10,
    COUNT: 11,
};

Zon.StageIDMap = Zon.StageIDNames = Object.entries(Zon.StageID)
    .filter(([k]) => k !== "COUNT")
    .reduce((acc, [k, v]) => {
        acc[v] = k;
        return acc;
    }, {});


Zon.LevelData = class {
    static maxStage = Zon.StageID.COUNT - 1;
    static maxStageNum = 10;
    static startingStage = Zon.StageID.MONSTERS_WILD_CREATURES;
    static startingStageNum = 1;
    static startingStageDisplayedNum = 1;
    static stageCompletionAetherBonusStageMultiplier = 2;
    static baseStageCompletionAetherBonus = Numbers.Triple.ONE;
    static baseBlockHealth = Numbers.Triple.ONE;
    static {
        this.getStageIndex = function(stageID, stageNum) {
            return (stageID - Zon.StageID.NONE) * this.maxStageNum + stageNum - this.startingStageNum;
        };

        this.stageCount = this.maxStage + 1;
        this.maxStageDisplayedNum = this.maxStage * this.maxStageNum;
        this.blockHealthMultiplePerPrestige = this.maxStageDisplayedNum;
        this.stageCompletionAetherBonusPerPrestige = this.maxStageDisplayedNum;
        this.maxStageIndex = this.getStageIndex(this.maxStage, this.maxStageNum);
    }
    
    constructor(stageID, stageNum) {
        this.stageID = stageID;
        this.stageNum = stageNum;
        this.stageDuration = 0;
        this.setup();
        this.blockMaxHealth = Zon.LevelData.getBlockMaxHealth(this.displayedStageNum, Zon.game.prestigeCount);
        this.getRandomPngFile();
    }

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

    static getBlockMaxHealth(displayedStageNum, prestigeCount) {
        return Zon.LevelData.baseBlockHealth.multiplyByPow10(displayedStageNum + Zon.LevelData.blockHealthMultiplePerPrestige * prestigeCount).tryBumpDown();
    }

    static getStageCompletionBaseAetherReward(displayedStageNum, prestigeCount) {
        return Zon.LevelData.baseStageCompletionAetherBonus.multiplyByPow10((displayedStageNum + Zon.LevelData.stageCompletionAetherBonusPerPrestige * prestigeCount) * Zon.LevelData.stageCompletionAetherBonusStageMultiplier);
    }

    static getStageToReturnToStage1Index() {
        return Zon.LevelData.displayedStageNumToStageIndex(Zon.Settings.stageToReturnToStage1.value);
    }

    get levelName() {
        return this.imgName();
    }

    getRandomPngFile = () => {
        const textures = Zon.LevelData.allLevelTextures[this.stageID];
        const randomIndex = Math.floor(Math.random() * textures.length);
        this.imageWrapper = textures[randomIndex];
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
        const finalStageCompletionAetherBonus = stageCompletionAetherBonus.multiplyByPow10(Zon.AetherBonusManager.aetherBonus.value);
        if (finalStageCompletionAetherBonus.isNegative) {
            throw new Error("finalStageCompletionAetherBonus is negative: " + finalStageCompletionAetherBonus);
        }

        return finalStageCompletionAetherBonus;
    }

    get aetherStageCompletionReward() {
        return Zon.LevelData.getStageCompletionAetherReward(this.displayedStageNum, Zon.game.prestigeCount);
    }

    giveResourceRewards = () => {
        Zon.PlayerInventory.receiveAether(this.aetherStageCompletionReward);
    }

    givePostResourceRewards = () => {
        Zon.StageBonusManager.onCompleteStage(this);
    }

    static getStageName(stageID, stageNum) {
        return `${Zon.LevelData.getDisplayedStageNum(stageID, stageNum)}`;
    }

    static getDisplayedStageNum(stageID, stageNum) {
        return Zon.LevelData.getStageIndex(stageID, stageNum) + Zon.LevelData.startingStageDisplayedNum;
    }

    static toStageIDAndNum(displayedStageIndex) {
        const stageID = Math.floor(displayedStageIndex / Zon.LevelData.maxStageNum) + Zon.StageID.NONE;
        const stageNum = displayedStageIndex % Zon.LevelData.maxStageNum + Zon.LevelData.startingStageNum;
        return { stageID, stageNum };
    }

    static displayedStageNumToStageIndex(displayedStageNum) {
        return displayedStageNum - Zon.LevelData.startingStageDisplayedNum;
    }

    static allLevelTextures = {};
    static allStageImagesLoadedPromise;
    static preSetLoadedValuesSetup() {
        Zon.LevelData.allLevelTextures = {};
        const stagePromises = [];
        for (let stageId = Zon.LevelData.startingStage; stageId <= Zon.LevelData.maxStage; stageId++) {
            const stageName = Zon.StageIDMap[stageId];
            const folder = `assets/textures/levels/${stageName}`;
            const manifestUrl = `${folder}/manifest.json`;

            const stagePromise = fetch(manifestUrl)
                .then(response => response.json())
                .then(manifest => {
                    return Promise.all(
                        manifest.files.map(filename =>
                            Zon.LevelData.loadImageWithPixels(`${folder}/${filename}`)
                        )
                    );
                })
                .catch(err => {
                    console.error(`Failed to load manifest for stage ${stageId}:`, err);
                    return [];
                })
                .then(textures => {
                    Zon.LevelData.allLevelTextures[stageId] = textures;
                });

            stagePromises.push(stagePromise);
        }

        Zon.LevelData.allStageImagesLoadedPromise = Promise.all(stagePromises);
    }
    static loadImageWithPixels(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = src;

            img.onload = () => resolve(new Struct.ImageDataWrapper(img));
            img.onerror = () => reject(new Error(`Failed to load ${src}`));
        });
    }
}