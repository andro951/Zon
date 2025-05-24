"use strict";

Zon.Game = class {
    constructor() {
        this.loopStarted = false;
        this.loopInterval = undefined;
        this.TICK_INTERVAL = 10;// 100 FPS
        this.FPS = 1000 / this.TICK_INTERVAL;
        this.prestigeCount = 0;
        this.lateUpdate = new Actions.Action();
        this.lateDraw = new Actions.Action();
        this.onCompleteStageActions = new Actions.Action();
        this.onLevelReadyActions = new Actions.Action();
        this.levelIsReady = false;
        this.levelDatas = new Array(Zon.LevelData.stageCount).fill(null);
        this.stageID = new Variable.Value(Zon.LevelData.startingStage);
        this.stageNum = new Variable.Value(Zon.LevelData.startingStageNum);
        this.highestStageAvailable = new Variable.Value(Zon.LevelData.startingStage);
        this.highestStageNumAvailable = new Variable.Value(Zon.LevelData.startingStageNum);
    }

    start = () => {
        // Game start logic
        console.log("Game started");

        this.loopInterval = window.setInterval(this.loop.bind(this), this.TICK_INTERVAL);
    }

    postLoadSetup = async () => {
        await Zon.LevelData.allStageImagesLoadedPromise;
        this.setupLevel();
    }

    loop = () => {
        Zon.timeController.updateLoopTime();
        this.updateLoop(this.getUpdateSpeed());
        this.drawLoop();
        // Game loop logic
        //console.log("Game loop running", performance.now());
        //this.dummyGame.update();
    }

    getUpdateSpeed = () => {
        return 1;
    }

    updateLoop = (updatesToRun) => {
        for (let i = 0; i < updatesToRun; i++) {
            this.update();
        }
    }

    update = () => {
        Zon.blocksManager.update();
        Zon.BallManager.update();
        this.lateUpdate.call();
    }

    drawLoop = () => {
        this.draw();
    }

    draw = () => {
        Zon.combatUI.clearCanvas();
        Zon.blocksManager.draw();
        Zon.BallManager.draw();
        this.lateDraw.call();
    }

    onCompleteStage = (levelData) => {
        this.stopStage();
        this.giveLevelRewards(levelData);
        this.onCompleteStageActions.call(levelData);
        Zon.timeController.onLevelCompleted(levelData);

        this.updateAvailableStageIDAndNum();

        Zon.StageSmartReset.onCompleteStageBeforeCheckingResetToStage1(levelData);

        this.checkUpdateStageAutomaticallyGoToNextStage(levelData);

        this.levelDatas[levelData.stageIndex] = null;
        this.setupLevel();
    }

    stopStage = () => {
        this.levelIsReady = false;
        Zon.blocksManager.clearAllBlocks();
    }

    giveLevelRewards = (levelData) => {
        
    }

    updateAvailableStageIDAndNum = () => {
        let nextStageID = this.stageID.value;
        let nextStageNum = this.stageNum.value + 1;
        if (nextStageNum > Zon.LevelData.maxStageNum) {
            nextStageNum = Zon.LevelData.startingStageNum;
            nextStageID++;
        }

        if (nextStageID > Zon.LevelData.maxStage) {
            this.highestStageAvailable.value = Zon.LevelData.maxStage;
            this.highestStageNumAvailable.value = Zon.LevelData.maxStageNum;
        }
        else {
            if (nextStageID > this.highestStageAvailable.value) {
                this.highestStageAvailable.value = nextStageID;
                this.highestStageNumAvailable.value = nextStageNum;
            }
            else if (nextStageID === this.highestStageAvailable.value) {
                if (nextStageNum > this.highestStageNumAvailable.value) {
                    this.highestStageNumAvailable.value = nextStageNum;
                }
            }
        }
    }

    checkUpdateStageAutomaticallyGoToNextStage = (levelData) => {

    }

    setupLevel = () => {
        const stageIndex = Zon.LevelData.getStageIndex(this.stageID.value, this.stageNum.value);
        let levelData = this.levelDatas[stageIndex];
        if (levelData === null) {
            levelData = new Zon.LevelData(this.stageID.value, this.stageNum.value);
            this.levelDatas[stageIndex] = levelData;
        }

        Zon.blocksManager.setLevelData(levelData);

        Zon.timeController.onSetupLevelBeforeBlocksManager();
        Zon.blocksManager.setupLevel();
        Zon.timeController.resume();
        this.levelIsReady = true;

        this.onLevelReadyActions.call(levelData);
    }

    getLevelData = (stageIndex) => {
        return this.levelDatas[stageIndex];
    }

    preSetLoadedValuesSetup = () => {

    }
};

Zon.game = new Zon.Game();