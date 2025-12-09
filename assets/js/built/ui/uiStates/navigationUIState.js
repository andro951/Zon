"use strict";

Zon.UI.NavigationUIState = class extends Zon.MainDisplayUIState {
    constructor() {
        super('navigationUI', {
            postConstructorFunc: Zon.UI.NavigationUIState._postConstructorFunc,
        });
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }
    static _postConstructorFunc(d) {
        
    }
    postLoadSetup() {
        
    }
}

Zon.UI.navigationUIState = Zon.UI.NavigationUIState.create();