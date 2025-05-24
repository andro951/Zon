"use strict";

Zon.Settings = class {
    constructor() {
        this.combatLayoutDefault = 'default';
        this.combatLayoutCenter = 'center';
        this.combatLayoutBottom = 'bottom';
        this.combatLayout = new Variable.Value(this.combatLayoutDefault);
    }

    preLoadSetup = () => {
        
    }

    postLoadSetup = () => {
        
    }
}

Zon.settings = new Zon.Settings();