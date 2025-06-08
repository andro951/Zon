"use strict";

Zon.Game = class Game {
    constructor() {
        this.loopStarted = false;
        this.lateUpdate = new Actions.Action();
        this.lateDraw = new Actions.Action();
        this.onCompleteStageActions = new Actions.Action();
        this.onLevelReadyActions = new Actions.Action();
        this.levelIsReady = false;
        this.levelDatas = new Array(Zon.LevelData.stageCount).fill(null);
        this.stageID = new Variable.Value(Zon.LevelData.startingStage, `CurrentStage`);
        this.stageNum = new Variable.Value(Zon.LevelData.startingStageNum, `CurrentStageNumber`);
        this.highestStageAvailable = new Variable.Value(Zon.LevelData.startingStage, `HighestStageAvailable`);
        this.highestStageNumAvailable = new Variable.Value(Zon.LevelData.startingStageNum, `HighestStageNumberAvailable`);
        this.prestigeCount = new Variable.Value(0, `PrestigeCount`);
        this.tickRemainder = 0;
        this.lastTickStart = performance.now();
        this.timePerTick = 0.00000000001;
        this.lastPerSecondUpdate = this.lastTickStart - 1000;
        this.autoSavedThisSecond = false;
        Zon.Setup.preLoadSetupActions.add(this.preLoadSetup);
    }

    GameSaveLoadInfo = class GameSaveLoadInfo extends Zon.SaveLoadInfo {
        constructor() {
            super(Zon.SaveLoadID.GAME, [
                Zon.SaveLoadHelper_UI32.fromVariable(Zon.game.stageID, Zon.IOManager.commonDataHelper.stageBits),
                Zon.SaveLoadHelper_UI32.fromVariable(Zon.game.stageNum, Zon.IOManager.commonDataHelper.stageNumBits),
                Zon.SaveLoadHelper_UI32.fromVariable(Zon.game.highestStageAvailable, Zon.IOManager.commonDataHelper.stageBits),
                Zon.SaveLoadHelper_UI32.fromVariable(Zon.game.highestStageNumAvailable, Zon.IOManager.commonDataHelper.stageNumBits),
                Zon.SaveLoadHelper_UI32_AL.fromVariable(Zon.game.prestigeCount),
            ]);
        }
    }

    preLoadSetup = () => {
        Zon.IOManager.registerSaveLoadInfo(Zon.SaveFileTypeID.GAME, new this.GameSaveLoadInfo());
        Zon.Settings.getGameVariable(Zon.GameSettingsID.STAGE_TO_RETURN_TO_STAGE_1).onChangedAction.add(this.onStageToReturnToStage1SettingChanged);
        Zon.Settings.getGameVariable(Zon.GameSettingsID.AUTOMATICALLY_RETURN_TO_STAGE_1).onChangedAction.add(this.onAutomaticallyReturnToStage1SettingChanged);
    }

    preSetLoadedValuesSetup = () => {

    }

    postLoadSetup = () => {
        this.setupLevel();
    }

    start = () => {
        console.log("Game started");
        requestAnimationFrame(this.loop);
    }

    //#region Update/Loop

    loop = () => {
        Zon.timeController.updateLoopTime();
        this.updateLoop(this.getTickSpeed());
        this.drawLoop();

        if (this.tickRemainder >= 1) {
            requestAnimationFrame(this.loop);
            return;
        }

        const timeSpentOnLoop = performance.now() - Zon.timeController.timeMilliseconds;
        const timeLeftToNextFrame = Zon.timeController.targetTimePerFrameMilliseconds.value - timeSpentOnLoop;
        if (timeLeftToNextFrame > 0) {
            setTimeout(this.loop, timeLeftToNextFrame);
        }
        else {
            requestAnimationFrame(this.loop);
        }
    }

    //The number of updates to run per updateLoop call.  (Game speed)  Allows fractional values, tracking remainder with this.tickRemainder.
    getTickSpeed = () => {
        return 1;
    }

    updateLoop = (ticksToRun) => {
        if (ticksToRun < 0)
            throw new Error("ticksToRun must be a positive number");

        let ticksToRunInt;

        {
            const totalTicks = Math.min(ticksToRun + this.tickRemainder, Number.MAX_SAFE_INTEGER);
            ticksToRunInt = Math.floor(totalTicks);
            this.tickRemainder = totalTicks - ticksToRunInt;
        }

        this.realTimeUpdate();

        if (ticksToRunInt <= 0)
            return;

        let start = performance.now();
        const targetTimePerFrame = Zon.timeController.targetTimePerFrameMilliseconds.value;
        let effectiveStart = this.lastTickStart + targetTimePerFrame;
        if (effectiveStart < start) {
            if (start - effectiveStart < targetTimePerFrame)
                start = effectiveStart;
        }

        const endTime = start + targetTimePerFrame;
        const maxTimeToStartProcess = start + targetTimePerFrame * 0.9;
        
        let ticks = 0;
        const ticksPerTimeCheck = 200;
        let iEnd = Math.min(ticksPerTimeCheck, ticksToRunInt - ticks);
        while ((ticks < ticksToRunInt || Zon.processManager.hasProcesses) && performance.now() < endTime) {
            const loopStart = performance.now();
            for (let i = 0; i < iEnd; i++) {
                this.update();
            }

            ticks += iEnd;

            if (Zon.processManager.hasProcesses && performance.now() < maxTimeToStartProcess) {
                const now = performance.now();
                const yieldTime = ticks < ticksToRunInt ? now + (endTime - now) / 2 : endTime;
                Zon.processManager.executeProcesses(yieldTime);
            }
            else {
                if (ticks >= ticksToRunInt)
                    break;

                const tEnd = performance.now();
                const tDiff = tEnd - start;
                if (tDiff >= targetTimePerFrame)
                    break;

                this.timePerTick = (tEnd - loopStart) / iEnd;
                iEnd = Math.min(ticksPerTimeCheck, ticksToRunInt - ticks, Math.ceil((targetTimePerFrame - tDiff) / this.timePerTick));
                if (iEnd <= ticksPerTimeCheck)
                    break;
            }
        }

        if (zonDebug) {
            //console.log(`Ran ${ticks} of ${ticksToRunInt} ticks in ${performance.now() - start} ms.  (remainder: ${this.tickRemainder})`);
        }

        this.tickRemainder += ticksToRun - ticks;

        return ticks;
    }

    realTimeUpdateActions = new Actions.Action();
    oncePerSecondUpdateActions = new Actions.Action();

    realTimeUpdate = () => {
        const timeSinceLastPerSecondUpdate = Zon.timeController.timeMilliseconds - this.lastPerSecondUpdate;
        this.realTimeUpdateActions.call();
        if (!this.autoSavedThisSecond && timeSinceLastPerSecondUpdate >= 100) {
            this.autoSavedThisSecond = true;
            Zon.IOManager.saveGameAsync(0);//TODO: saveNum
        }

        if (timeSinceLastPerSecondUpdate < 1000)
            return;

        if (timeSinceLastPerSecondUpdate >= 2000) {
            console.error(`Game realTimeUpdate: More than 2 seconds since last per second update! (${timeSinceLastPerSecondUpdate} ms)`);
            this.lastPerSecondUpdate = Zon.timeController.timeMilliseconds;
        }
        else {
            this.lastPerSecondUpdate += 1000;
        }
        
        this.oncePerSecondUpdate();
    }

    oncePerSecondUpdate = () => {
        if (!this.autoSavedThisSecond)
            console.error("Game oncePerSecondUpdate: autoSavedThisSecond should be true at this point!");

        this.autoSavedThisSecond = false;
        this.oncePerSecondUpdateActions.call();
    }

    update = () => {
        Zon.blocksManager.update();
        Zon.BallManager.update();
        Zon.playerInventory.update();
        this.lateUpdate.call();
    }

    //#endregion Update/Loop

    //#region Load

    _saveFileExists = (saveFileTypeID, saveNum) => {
        const saveName = Zon.IOManager.getSaveName(saveFileTypeID, saveNum);
        return localStorage.getItem(saveName) !== null;
    }

    startLoad = (newGame, gameSaveNum, settingsSaveNum) => {
        // if (newGame) {//TODO: Changed for forcing it to work for now.  Switch when save/load UI is implemented.
        //     Zon.IOManager.tryMakeNewSaveFile(Zon.SaveFileTypeID.GAME, gameSaveNum);
        //     Zon.IOManager.tryMakeNewSaveFile(Zon.SaveFileTypeID.GAME_SETTINGS, settingsSaveNum);
        //     Zon.IOManager.tryMakeNewSaveFile(Zon.SaveFileTypeID.DISPLAY_SETTINGS, settingsSaveNum);
        // }

        if (!this._saveFileExists(Zon.SaveFileTypeID.GAME, gameSaveNum))
            Zon.IOManager.tryMakeNewSaveFile(Zon.SaveFileTypeID.GAME, gameSaveNum);

        if (!this._saveFileExists(Zon.SaveFileTypeID.GAME_SETTINGS, settingsSaveNum))
            Zon.IOManager.tryMakeNewSaveFile(Zon.SaveFileTypeID.GAME_SETTINGS, settingsSaveNum);

        if (!this._saveFileExists(Zon.SaveFileTypeID.DISPLAY_SETTINGS, settingsSaveNum))
            Zon.IOManager.tryMakeNewSaveFile(Zon.SaveFileTypeID.DISPLAY_SETTINGS, settingsSaveNum);

        Zon.IOManager.loadGameAsync(gameSaveNum);
        Zon.IOManager.loadGameSettingsAsync(settingsSaveNum);
        Zon.IOManager.loadDisplaySettingsAsync(settingsSaveNum);
        requestAnimationFrame(this._loadLoop);
    }

    _loadLoop = () => {
        let start = performance.now();
        const targetTimePerFrame = Zon.timeController.targetTimePerFrameMilliseconds.value;
        let effectiveStart = this.lastTickStart + targetTimePerFrame;
        if (effectiveStart < start) {
            if (start - effectiveStart < targetTimePerFrame)
                start = effectiveStart;
        }

        const yieldTime = start + targetTimePerFrame;
        Zon.processManager.executeProcesses(yieldTime);
        if (Zon.processManager.hasProcesses) {
            requestAnimationFrame(this._loadLoop);
        }
        else {
            Zon.Setup.finishedLoading();
        }
    }

    //#endregion Load

    //#region Draw

    drawLoop = () => {
        this.draw();
    }

    onNextDrawActions = new Actions.Action();
    preDrawActions = new Actions.Action();
    draw = () => {
        Zon.combatUI.clearCanvas();
        this.preDrawActions.call();
        Zon.blocksManager.draw();
        Zon.BallManager.draw();
        this.lateDraw.call();
        this.onNextDrawActions.callAndClear();
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

    //#endregion Draw

    stopStage = () => {
        this.levelIsReady = false;
        Zon.blocksManager.clearAllBlocks();
    }

    giveLevelRewards = (levelData) => {
        levelData.giveLevelRewards();
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

    checkUpdateStageAutomaticallyGoToNextStage = (completedLevelData) => {
        //Zon.StageSmartReset.onCompleteStageBeforeCheckingResetToStage1(completedLevelData); can switch the stage, so only change it if it hasn't been changed.
        if (completedLevelData.stageID !== this.stageID.value || completedLevelData.stageNum !== this.stageNum.value)
            return;

        if (Zon.Settings.getGame(Zon.GameSettingsID.AUTOMATICALLY_GO_TO_NEXT_STAGE)) {
            let stageSelected = false;
            if (Zon.Settings.getGame(Zon.GameSettingsID.AUTOMATICALLY_RETURN_TO_STAGE_1)) {
                if (Zon.Settings.getGame(Zon.GameSettingsID.STAGE_TO_RETURN_TO_STAGE_1) <= Zon.LevelData.startingStage) {
                    Variable.Base.pause();
                    this.stageID.value = Zon.LevelData.startingStage;
                    this.stageNum.value = Zon.LevelData.startingStageNum;
                    stageSelected = true;
                    Variable.Base.resume();
                }
            }

            if (!stageSelected) {
                if (this.stageNum.value === Zon.LevelData.maxStageNum) {
                    if (this.stageID.value < Zon.LevelData.maxStage) {
                        this.stageID.value++;
                        this.stageNum.value = Zon.LevelData.startingStageNum;
                    }
                }
                else {
                    this.stageNum.value++;
                }
            }
        }
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

    onStageToReturnToStage1SettingChanged = () => {

    }

    onAutomaticallyReturnToStage1SettingChanged = () => {

    }
};

Zon.game = new Zon.Game();