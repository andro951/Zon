"use strict";

Zon.StageBonusManager = {};

Zon.StageBonusManager.totalStageBonus = Variable.Dependent.empty(`TotalStageAetherBonus`);

Zon.StageBonusManager.preLoadSetup = () => {

}

Zon.StageBonusManager.preSetLoadedValuesSetup = () => {
    Zon.StageBonusManager.totalStageBonus.replaceEquation(() => Struct.BigNumber.ONE);
}

Zon.StageBonusManager.onCompleteStage = (levelData) => {
    
}