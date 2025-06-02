"use strict";

Zon.InventoryUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super();
    }
    static create(...args) {
        const inventoryUIState = new this(...args);
        inventoryUIState.bindAll();
        inventoryUIState.postConstructor();
        return inventoryUIState;
    }
    postConstructor() {
        super.postConstructor();
    }
    postLoadSetup() {
        
    }

    setup = () => {
        //super.setup();
    }
}

Zon.inventoryUIState = Zon.InventoryUIState.create();