"use strict";

Zon.GameUIState = class extends Zon.UI.UIStateDiv {
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

    setup = () => {
        //super.setup();
    }
}

Zon.gameUIState = new Zon.GameUIState();