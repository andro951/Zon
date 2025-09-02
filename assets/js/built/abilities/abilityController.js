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

    onBeatDetected = () => {
        const blockArea = Zon.blocksManager.blockArea;
        const clickPos = new Vectors.Vector(blockArea.left + Math.random() * blockArea.width, blockArea.top + Math.random() * blockArea.height);
        Zon.basicAttack.onLeftClick(clickPos);
    }
}

Zon.abilityController = new Zon.AbilityController();