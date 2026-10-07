"use strict";

Zon.ReincarnationManager = class {
    constructor() {
        this.onReincarnationResetActions = new Actions.Action(`${this.constructor.name} onReincarnationResetActions`);   
    }
    
    preSetLoadedValuesSetup = () => {

    }
}

Zon.reincarnationManager = new Zon.ReincarnationManager();