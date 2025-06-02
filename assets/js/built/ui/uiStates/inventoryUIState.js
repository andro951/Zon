"use strict";

Zon.InventoryUIState = class extends Zon.CloseButtonLinkedUIState {
    constructor() {
        super();
    }

    postLoadSetup() {
        
    }

    setup = () => {
        //super.setup();
    }
}

Zon.inventoryUIState = new Zon.InventoryUIState();