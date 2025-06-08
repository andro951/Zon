"use strict";

Zon.AetherBonusManager = {};

Zon.AetherBonusManager.aetherBonus = Variable.Dependent.empty(`AetherBonus`);

Zon.AetherBonusManager.postLoadSetup = () => {
    Zon.AetherBonusManager.aetherBonus.replaceEquation(() => Zon.StageBonusManager.totalStageBonus.value.multiply(Zon.AetherGained.totalMultiplier.value));
}
Zon.Setup.postLoadSetupActions.add(Zon.AetherBonusManager.postLoadSetup);