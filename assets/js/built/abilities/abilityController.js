"use strict";

Zon.AbilityController = class {
    constructor() {
        
    }

    postLoadSetup = () => {
        
    }

    onClickCombatArea = (clickPos, buttonID) => {
        switch (buttonID) {
            case Zon.MouseButtonID.LEFT:
                this._onLeftClickCombatArea(clickPos);
                break;
            case Zon.MouseButtonID.RIGHT:
                break;
        }
    }

    _onLeftClickCombatArea = (clickPos) => {
        Zon.basicAttack.onLeftClick(clickPos);
    }
}

Zon.abilityController = new Zon.AbilityController();