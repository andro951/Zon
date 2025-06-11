"use strict";

Zon.Setup.setupAndStartGame = () => {
    Variable.Base.pause();
    Zon.Setup.startAsyncLoading();
    Zon.Setup.preLoadSetup();
    //Zon.Setup.loadOrNewGame(true);//true for new game
    Zon.Setup.loadOrNewGame();
}

Zon.Setup.startAsyncLoading = () => {
    Zon.TextureLoader.startAsyncLoading();
}

Zon.Setup.postLoadSetValuesStartGame = async () => {
    await Zon.TextureLoader.allTexturesLoadedPromise;
    Zon.Setup.postLoadSetup();
    Zon.Setup.finalizeUI();
    Variable.Base.resume();
}

Zon.Setup.preLoadSetupActions = new Actions.Action();

Zon.Setup.preLoadSetup = () => {
    Zon.IOManager.preLoadSetup();

    if (zonDebug) {
        Zon.DevCheats.preLoadSetup();
    }

    Zon.Settings.preLoadSetup();
    Zon.StageBonusManager.preLoadSetup();
    Zon.StageSmartReset.preLoadSetup();
    Zon.Blueprint.preLoadSetup();
    Zon.ProgressionManager.preLoadSetup();
    Zon.Setup.preLoadSetupActions.call();
    Zon.talentManager.preLoadSetup();
}

Zon.Setup.loadOrNewGame = (newGame) => {
    Zon.game.startLoad(newGame, 0, 0);//TODO: saveNums
}

Zon.Setup.finishedLoading = () => {
    Zon.Setup.preSetLoadedValuesSetup();
    Zon.Setup.setLoadedValuesAndStartGame();
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

Zon.Setup.setLoadedValuesAndStartGame = async () => {

    Zon.IOManager.setAllLoadedValues();
    await Zon.Setup.postLoadSetValuesStartGame();
    Zon.GameManager.start();
}

Zon.Setup.postLoadSetupActions = new Actions.Action();

Zon.Setup.postLoadSetup = () => {
    Zon.Settings.postLoadSetup();
    Zon.game.postLoadSetup();
    Zon.manaBar.postLoadSetup();
    Zon.staminaBar.postLoadSetup();
    Zon.coreManager.postLoadSetup();
    Zon.abilityController.postLoadSetup();
    Zon.abilityUIState.postLoadSetup();//After abilityController
    Zon.inventoryUIState.postLoadSetup();
    Zon.UI.stageUIState.postLoadSetup();
    Zon.timeController.postLoadSetup();
    Zon.StageSmartReset.postLoadSetup();
    Zon.craftingManager.postLoadSetup();//After playerInventory
    Zon.assemblersUIState.postLoadSetup();//After craftingManager
    Zon.coreUIState.postLoadSetup();
    Zon.coreSelectButton.postLoadSetup();
    Zon.Setup.postLoadSetupActions.call();

    Zon.DevCheats.postLoadSetup();
}

Zon.Setup.linkAndFinalizeUISetupActions = new Actions.Action();
Zon.Setup.postLinkAndFinalizeUiSetupActions = new Actions.Action();
Zon.Setup.startedLinkAndFinalizeUISetupActions = false;

Zon.Setup.finalizeUI = () => {
    Zon.Setup.startedLinkAndFinalizeUISetupActions = true;
    Zon.Setup.linkAndFinalizeUISetupActions.call();
    Zon.Setup.postLinkAndFinalizeUiSetupActions.call();
}

Zon.Setup.start = () => {
    Zon.game.start();
    Zon.timeController.onStartGame();
    Zon.ProgressionManager.onStartGame();

    Zon.DevCheats.onStartGame();
}

Zon.Setup.preSaveGame = () => {
    Zon.blocksManager.preSave();
}