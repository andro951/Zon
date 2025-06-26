"use strict";

Zon.GlobalVariables = new Map();

Variable.Base.prototype.makeGlobal = function () {
    if (!this.name)
        throw new Error("Variable name is not set.");

    Zon.GlobalVariables.set(this.name, this);
    return this;
}

Zon.GlobalVarNames = {
    PLAYER_LEVEL: "PlayerLevel",
    PLAYER_LEVEL_PROGRESS: `PlayerXP`,
    PRESTIGE_COUNT: `PrestigeCount`,
}