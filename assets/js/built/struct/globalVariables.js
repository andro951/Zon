"use strict";

Zon.GlobalVariables = new Map();

Variable.Base.prototype.makeGlobal = function (description) {
    if (!this.name)
        throw new Error("Variable name is not set.");
    
    if (typeof description !== 'string' || !description)
        throw new Error("Description must be a non-empty string.");

    Zon.GlobalVariables.set(this.name, this);
    ZonScript.sf.defineGetter(this.name, description, () => this.value);
    return this;
}

Zon.GlobalVarNames = {
    PLAYER_LEVEL: "PlayerLevel",
    PLAYER_LEVEL_PROGRESS: `PlayerXP`,
    PRESTIGE_COUNT: `PrestigeCount`,
    STAGE_COUNT: `StageCount`,
    AETHER: `Aether`,
    TOTAL_AETHER_EARNED: `TotalAetherEarned`
}