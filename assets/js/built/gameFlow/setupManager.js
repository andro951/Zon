"use strict";

Zon.Setup.postConstructors = new Actions.Action();
Zon.Setup.onSetupUI = new Actions.Action();

// Zon.Setup.setup = function() {
//     Zon.Setup.postConstructors.call();
//     Zon.Setup.onSetupUI.call();
// }

Zon.Setup.setup = async function() {
    await Zon.Setup.startAsynchronousLoading();
    Zon.Setup.createInstances();
    Zon.Setup.postConstructors.call();
    Zon.Setup.onSetupUI.call();
    await Zon.Setup.setupLevel();
}

Zon.Setup.startAsynchronousLoading = function() {
    Zon.LevelData.preSetLoadedValuesSetup();
}

Zon.Setup.createInstances = function() {
    Zon.game = new Zon.Game();
    Zon.timeController = new Zon.TimeController();
    Zon.blocksManager = new Zon.BlocksManager();
}

Zon.Setup.setupLevel = async function() {
    await Zon.LevelData.allStageImagesLoadedPromise;
    const levelData = new Zon.LevelData(Zon.StageID.MONSTERS_WILD_CREATURES, 1);
    //const levelDataToString = levelData.toString;
    //console.log(levelDataToString());
    //console.log(`${levelData}`);
    Zon.blocksManager.setLevelData(levelData);
    Zon.blocksManager.setupLevel();
    Zon.game.lateUpdate.add(Zon.blocksManager.update);
    Zon.game.lateDraw.add(Zon.blocksManager.draw);
}