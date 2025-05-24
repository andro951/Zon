"use strict";

Zon.GameUIState = class extends Zon.UIState {
    constructor() {
        super();
    }
    
    show = () => {
        Zon.showCombatUI();//TODO
    }

    hide = () => {
        Zon.hideCombatUI();//TODO
    }

    onPause = () => {
        
    }

    onResume = () => {
        
    }
}

Zon.gameUIState = new Zon.GameUIState();