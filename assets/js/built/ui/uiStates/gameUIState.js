"use strict";

Zon.GameUIState = class extends Zon.UI.UIElementDiv {
    constructor() {
        super();
    }
    static create(...args) {
        const gameUIState = new this(...args);
        gameUIState.bindAll();
        gameUIState.postConstructor();
        return gameUIState;
    }
    postConstructor() {
        super.postConstructor();
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

Zon.gameUIState = Zon.GameUIState.create();