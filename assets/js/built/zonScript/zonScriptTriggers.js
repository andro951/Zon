Zon.ScriptTriggers = {};

Zon.ScriptTriggerNames = {
    ON_COMPLETE_STAGE: `OnCompleteStage`,
    ON_GAIN_AETHER: `OnGainAether`,
    ON_RESET_CORE_ENHANCEMENT_POINTS: `OnResetCoreEnhancementPoints`,
}

Zon.ScriptTriggers.onCompleteStageParameters = [
    new ScriptForge.ScriptParameter('displayedStageNum', 'StageNumber', `The stage number (1 to 100) the player just completed.`),
    new ScriptForge.ScriptParameter('aetherStageCompletionReward', 'AetherReward', `The amount of aether the player gained from completing the stage.`),
    new ScriptForge.ScriptParameter('blockMaxHealth', 'BlockHealth', `The health of each block in the stage.`),
    //new ScriptForge.ScriptParameter('stageDuration', 'StageDuration', `The amount of time (in seconds) it took the player to complete the stage.`),
];
Zon.ScriptTriggers.onCompleteStageArgsMap = new Map();
Zon.ScriptTriggers.levelDataToOnCompleteStageArgs = (levelData) => {
    Zon.ScriptTriggers.onCompleteStageArgsMap.clear();
    for (const param of Zon.ScriptTriggers.onCompleteStageParameters) {
        Zon.ScriptTriggers.onCompleteStageArgsMap.set(param.scriptName, levelData[param.internalName]);
    }
    
    return Zon.ScriptTriggers.onCompleteStageArgsMap;
}
Zon.ScriptTriggers.onCompleteStageTrigger = ZonScript.sf.defineTrigger(
    Zon.ScriptTriggerNames.ON_COMPLETE_STAGE,
    `Triggers after completing a stage.`,
    Zon.ScriptTriggers.onCompleteStageParameters,
    new Set([
        
    ])
);
Zon.ScriptTriggers.onCompleteStage = (levelData) => {
    Zon.ScriptTriggers.onCompleteStageTrigger.run(() => Zon.ScriptTriggers.levelDataToOnCompleteStageArgs(levelData));
}

Zon.ScriptTriggers.onGainAetherParameters = [
    new ScriptForge.ScriptParameter('aetherGained', 'AetherGained', `The amount of aether the player just gained.`),
];
Zon.ScriptTriggers.onGainAetherTrigger = ZonScript.sf.defineTrigger(
    Zon.ScriptTriggerNames.ON_GAIN_AETHER,
    `Triggers after gaining aether.`,
    Zon.ScriptTriggers.onGainAetherParameters,
    new Set([
        
    ])
);
Zon.ScriptTriggers.onGainAetherArgsMap = new Map();
Zon.ScriptTriggers.onGainAether = (aetherGained) => {
    Zon.ScriptTriggers.onGainAetherArgsMap.clear();
    const param = Zon.ScriptTriggers.onGainAetherParameters[0];
    Zon.ScriptTriggers.onGainAetherArgsMap.set(param.scriptName, aetherGained);
    Zon.ScriptTriggers.onGainAetherTrigger.run(() => Zon.ScriptTriggers.onGainAetherArgsMap);
}

Zon.ScriptTriggers.onResetCoreEnhancementPointsParameters = [
    new ScriptForge.ScriptParameter(`coreName`, `CoreName`, `The name of the core that just had it's Enhancement Points reset such as "Combat"`),
];
Zon.ScriptTriggers.onResetCoreEnhancementPointsTrigger = ZonScript.sf.defineTrigger(
    Zon.ScriptTriggerNames.ON_RESET_CORE_ENHANCEMENT_POINTS,
    `Triggers after resetting core enhancement points.`,
    Zon.ScriptTriggers.onResetCoreEnhancementPointsParameters,
    new Set([
        Zon.ScriptActionNames.TRY_RESET_CORE_ENHANCEMENT_POINTS
    ])
);
Zon.ScriptTriggers.onResetCoreEnhancementPointsArgsMap = new Map();
Zon.ScriptTriggers.onResetCoreEnhancementPoints = (coreName) => {
    Zon.ScriptTriggers.onResetCoreEnhancementPointsArgsMap.clear();
    const param = Zon.ScriptTriggers.onResetCoreEnhancementPointsParameters[0];
    Zon.ScriptTriggers.onResetCoreEnhancementPointsArgsMap.set(param.scriptName, coreName);
    Zon.ScriptTriggers.onResetCoreEnhancementPointsTrigger.run(() => Zon.ScriptTriggers.onResetCoreEnhancementPointsArgsMap);
}