"use strict";

Zon.Setup.postConstructors = new Actions.Action();

Zon.Setup.setupAndStartGame = async () => {
    Variable.Base.pause();
    Zon.Setup.postConstructors.call();
    Zon.Setup.startAsyncLoading();
    Zon.Setup.preLoadSetup();
    Zon.Setup.load();
    Zon.Setup.preSetLoadedValuesSetup();
    await Zon.Setup.setLoadedValues();
}

Zon.Setup.startAsyncLoading = () => {
    Zon.LevelData.startAsyncLoading();
}

Zon.Setup.postLoadSetValuesStartGame = async () => {
    await Zon.Setup.postLoadSetup();
    Zon.Setup.finalizeUI();
    Variable.Base.resume();
}

Zon.Setup.preLoadSetupActions = new Actions.Action();

Zon.Setup.preLoadSetup = () => {
    if (zonDebug) {
        Zon.DevCheats.preLoadSetup();
    }

    Zon.settings.preLoadSetup();
    Zon.StageBonusManager.preLoadSetup();
    Zon.StageSmartReset.preLoadSetup();
    Zon.Blueprint.preLoadSetup();
    Zon.ProgressionManager.preLoadSetup();
    Zon.Setup.preLoadSetupActions.call();
    Zon.talentManager.preLoadSetup();
}

Zon.Setup.load = () => {
    Zon.IOManager.LoadGameAsync();
}

Zon.Setup.preSetLoadedValuesSetupActions = new Actions.Action();

Zon.Setup.preSetLoadedValuesSetup = () => {
    Zon.game.preSetLoadedValuesSetup();
    Zon.StageBonusManager.preSetLoadedValuesSetup();
    Zon.reincarnationManager.preSetLoadedValuesSetup();
    Zon.coreManager.preSetLoadedValuesSetup();
    Zon.talentManager.preSetLoadedValuesSetup();
    Zon.StageSmartReset.preSetLoadedValuesSetup();
    Zon.ProgressionManager.preSetLoadedValuesSetup();
    Zon.PlayerStat.preSetLoadedValuesSetup();
    Zon.CraftingTaskManager.preSetLoadedValuesSetup();
    Zon.Setup.preSetLoadedValuesSetupActions.call();

    Zon.Setup.preSetLoadedValuesUISetup();
}

Zon.Setup.preSetLoadedValuesSetupUIActions = new Actions.Action();

Zon.Setup.preSetLoadedValuesUISetup = () => {
    Zon.Setup.preSetLoadedValuesSetupUIActions.call();
}

Zon.Setup.waitingForLoadedValues = false;

Zon.Setup.onLoadDataReady = () => {
    if (Zon.Setup.waitingForLoadedValues) {
        Zon.Setup.waitingForLoadedValues = false;
        Zon.Setup.setLoadedValues();
    }
}

Zon.Setup.setLoadedValues = async () => {
    if (!Zon.IOManager.loadDataReady) {
        Zon.Setup.waitingForLoadedValues = true;
        return;
    }

    Zon.IOManager.setAllLoadedValues();
    await Zon.Setup.postLoadSetValuesStartGame();
}

Zon.Setup.postLoadSetupActions = new Actions.Action();

Zon.Setup.postLoadSetup = async () => {
    Zon.settings.postLoadSetup();
    await Zon.game.postLoadSetup();
    Zon.manaBar.postLoadSetup();
    Zon.staminaBar.postLoadSetup();
    Zon.coreManager.postLoadSetup();
    Zon.abilityController.postLoadSetup();
    Zon.abilityUIState.postLoadSetup();//After abilityController
    Zon.inventoryUIState.postLoadSetup();
    Zon.stageUIState.postLoadSetup();
    Zon.timeController.postLoadSetup();
    Zon.StageSmartReset.postLoadSetup();
    Zon.playerInventory.postLoadSetup();
    Zon.craftingManager.postLoadSetup();//After playerInventory
    Zon.assemblersUIState.postLoadSetup();//After craftingManager
    Zon.coreUIState.postLoadSetup();
    Zon.coreSelectButton.postLoadSetup();
    Zon.Setup.postLoadSetupActions.call();

    Zon.DevCheats.postLoadSetup();
}

Zon.Setup.linkAndFinalizeUISetupActions = new Actions.Action();
Zon.Setup.startedLinkAndFinalizeUISetupActions = false;

Zon.Setup.finalizeUI = () => {
    Zon.Setup.startedLinkAndFinalizeUISetupActions = true;
    Zon.Setup.linkAndFinalizeUISetupActions.call();
}

Zon.Setup.start = () => {
    Zon.game.start();
    Zon.timeController.onStartGame();
    Zon.ProgressionManager.onStartGame();

    Zon.DevCheats.onStartGame();
}

Zon.Setup.preSave = () => {
    Zon.blocksManager.preSave();
}