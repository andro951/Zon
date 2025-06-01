"use strict";

Zon.StageBonusManager = {};

Zon.StageBonusManager.totalStageBonus = Variable.Dependent.empty();

Zon.StageBonusManager.preLoadSetup = () => {

}

Zon.StageBonusManager.preSetLoadedValuesSetup = () => {
    Zon.StageBonusManager.totalStageBonus.replaceEquation(() => Numbers.Triple.ONE);
}

Zon.StageBonusManager.onCompleteStage = (levelData) => {
    
}