"use strict";

Zon.UI.AbilityUIState = class extends Zon.MainDisplayUIState {
    constructor() {
        super('abilityUI', {
            postConstructorFunc: Zon.UI.AbilityUIState._postConstructorFunc,
        });
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }
    static _postConstructorFunc(d) {
        
    }
    postLoadSetup() {
        
    }
}

Zon.UI.abilityUIState = Zon.UI.AbilityUIState.create();