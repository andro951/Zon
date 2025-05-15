"use strict";

Zon.StageID = {
    NONE: 0,
    MONSTERS_WILD_CREATURES: 1,
    BUGS: 2,
    MONSTERS_ASSORTEDLV2: 3,
    MONSTERS_UNDEAD: 4,
    ARMOR: 5,
    MONSTERS_ASSORTEDLV3: 6,
    MONSTERS_ASSORTEDLV4: 7,
    MONSTERS_MAGES: 8,
    HELMETS: 9,
    MONSTERS_DEMONS: 10,
    COUNT: 11,
};

Zon.LevelData = class {
    constructor(stageID, stageNum) {
        this.stageID = stageID;
        this.stageNum = stageNum;
        this.stageDuration = 0;
        this.setup();
        this.blockMaxHealth = getBlockMaxHealth(this.displayedStageNum, Zon.game.prestigeCount);
        this.getRandomPngFile();
    }

    copyStage(stageID, stageNum, width, height, pixels, blockHP, blockMaxHealth, stageDuration) {
        const stage = new Zon.LevelData(stageID, stageNum);
        stage.width = width;
        stage.height = height;
        stage.pixels = pixels;
        stage.blockHP = blockHP;
        stage.stageDuration = stageDuration;
        this.setup();
        stage.blockMaxHealth = blockMaxHealth;
    }

    setup() {
        this.displayedStageNum = this.getDisplayedStageNum(this.stageID, this.stageNum);
        this.stageIndex = getStageIndex(this.stageID, this.stageNum);
    }

    update() {
        stageDuration += Time.TimeController.deltaTime;
    }

    static blockHealthMultiplePerPrestige = Zon.LevelData.maxStageDisplayedNum;
    static getBlockMaxHealth(displayedStageNum, prestigeCount) {
        Zon.LevelData.baseBlockHealth.multiplyByPow10(displayedStageNum + blockHealthMultiplePerPrestiege * prestigeCount).tryBumpDown();
    }

    
}