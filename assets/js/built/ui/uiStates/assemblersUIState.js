"use strict";

Zon.AssemblersUIState = class extends Zon.UI.CloseButtonLinkedUIState {
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

Zon.assemblersUIState = Zon.AssemblersUIState.create();