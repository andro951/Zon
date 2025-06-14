"use strict";

Zon.CoreSelectButton = class extends Zon.UI.UIElementDiv {
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

Zon.coreSelectButton = Zon.CoreSelectButton.create();