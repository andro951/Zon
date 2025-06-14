"use strict";

Zon.CoreUIState = class extends Zon.MainDisplayUIState {
    constructor() {
        super();
    }
    postLoadSetup() {
        
    }
    setup() {
        super.setup();

        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => 0);
        this.replaceHeight(() => 0);
    }
}

Zon.coreUIState = Zon.CoreUIState.create();