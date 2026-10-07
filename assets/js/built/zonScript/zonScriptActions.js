"use strict";

Zon.ScriptActionNames = {
    SET_GAME_SETTING: `SetGameSetting`,
    TRY_EMPOWER_CORE: `TryEmpowerCore`,
    TRY_RESET_CORE_ENHANCEMENT_POINTS: `TryResetCoreEnhancementPoints`,
}

ZonScript.sf.defineScriptAction(
    Zon.ScriptActionNames.SET_GAME_SETTING,
    (args) => {
        if (args.length != 2)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError(`Invalid number of arguments to ${Zon.ScriptActionNames.SET_GAME_SETTING}. Expected 2 arguments.`);

        const [settingName, value] = args;

        const settingId = Zon.GameSettingsID[settingName];
        if (settingId === undefined)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError("Invalid setting name: " + settingName);
            
        Zon.Settings.setGameByPlayer(settingId, value);
    },
    () => true,
    "Set any game setting.", 
    [
        new ScriptForge.ScriptActionParameter("Game Setting Name", "The name of the setting to set."),
        new ScriptForge.ScriptActionParameter("Value", "The value to set the setting to."),
    ],
    1
);

ZonScript.sf.defineScriptAction(
    Zon.ScriptActionNames.TRY_EMPOWER_CORE,
    (args) => {
        if (args.length < 1 || args.length > 2)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError(`Invalid number of arguments to ${Zon.ScriptActionNames.TRY_EMPOWER_CORE}. Expected 1 or 2 arguments.`);

        let [coreName, levels] = args;
        if (typeof coreName !== "string")
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError(`Invalid core name: ` + coreName);

        if (levels === undefined) {
            levels = 1;
        }
        else {
            if (typeof levels !== "number")
                throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError("Levels must be a positive integer: " + levels);

            if (levels < 0)
                throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError("Levels must be a positive integer: " + levels);

            if (levels === 0)
                return;

            if (!Number.isInteger(levels))
                throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError("Levels must be a positive integer: " + levels);
        }
        
        const coreID = Zon.CoreID[coreName];
        if (coreID === undefined)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError("Invalid core name: " + coreName);

        const core = Zon.coreManager.getCore(coreID);
        if (!core)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError("Core not found: " + coreName);

        core.tryEmpower(levels);
    },
    (args) => {
        if (args.length < 1)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError(`Invalid number of arguments to ${Zon.ScriptActionNames.TRY_EMPOWER_CORE}?. Expected at least 1 argument.`);

        const [coreName] = args;
        if (typeof coreName !== "string")
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError(`Invalid core name: ` + coreName);

        const coreID = Zon.CoreID[coreName];
        if (coreID === undefined)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError("Invalid core name: " + coreName);

        const core = Zon.coreManager.getCore(coreID);
        if (!core)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError("Core not found: " + coreName);

        return core.isUnlocked.value;
    },
    "Try to empower a core by a certain number of levels. Defaults to 1 level if not specified.",
    [
        new ScriptForge.ScriptActionParameter("Core Name", "The name of the core to empower."),
        new ScriptForge.ScriptActionParameter("Levels", "The number of levels to empower the core by. Defaults to 1 if not specified.", true),
    ],
    1
);

ZonScript.sf.defineScriptAction(
    Zon.ScriptActionNames.TRY_RESET_CORE_ENHANCEMENT_POINTS,
    (args) => {
        if (args.length !== 1)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError(`Invalid number of arguments to ${Zon.ScriptActionNames.TRY_RESET_CORE_ENHANCEMENT_POINTS}. Expected 1 argument.`);

        const [coreName] = args;
        if (typeof coreName !== "string")
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError(`Invalid core name: ` + coreName);
        
        const coreID = Zon.CoreID[coreName];
        if (coreID === undefined)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError("Invalid core name: " + coreName);

        const core = Zon.coreManager.getCore(coreID);
        if (!core)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError("Core not found: " + coreName);

        core.tryResetEnhancementPoints();
    },
    (args) => {
        if (args.length !== 1)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError(`Invalid number of arguments to ${Zon.ScriptActionNames.TRY_RESET_CORE_ENHANCEMENT_POINTS}?. Expected 1 argument.`);

        const [coreName] = args;
        if (typeof coreName !== "string")
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError(`Invalid core name: ` + coreName);
        
        const coreID = Zon.CoreID[coreName];
        if (coreID === undefined)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError("Invalid core name: " + coreName);

        const core = Zon.coreManager.getCore(coreID);
        if (!core)
            throw new ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError("Core not found: " + coreName);

        return core.canResetEnhancementPoints();
    },
    "Try to reset a core's enhancement points.",
    [
        new ScriptForge.ScriptActionParameter("Core Name", "The name of the core to reset enhancement points on."),
    ],
    1
);