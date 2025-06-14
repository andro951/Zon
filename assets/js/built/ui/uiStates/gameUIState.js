"use strict";

Zon.GameUIState = class extends Zon.UI.UIElementDiv {
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
    setup() {
        super.setup();

        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => 0);
        this.replaceHeight(() => 0);
    }
}

Zon.gameUIState = Zon.GameUIState.create();