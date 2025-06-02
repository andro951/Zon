"use strict";

Zon.StaminaBar = class extends Zon.ResourceBar {
    constructor() {
        super();
    }
    static create(...args) {
        const staminaBar = new this(...args);
        staminaBar.bindAll();
        staminaBar.postConstructor();
        return staminaBar;
    }
    postConstructor() {
        super.postConstructor();
    }
    postLoadSetup() {
        
    }
}

Zon.staminaBar = Zon.StaminaBar.create();