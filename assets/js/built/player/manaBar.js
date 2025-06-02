"use strict";

Zon.ManaBar = class extends Zon.ResourceBar {
    constructor() {
        super();
    }
    static create(...args) {
        const manaBar = new this(...args);
        manaBar.bindAll();
        manaBar.postConstructor();
        return manaBar;
    }
    postConstructor() {
        super.postConstructor();
    }
    postLoadSetup() {
        
    }
}

Zon.manaBar = Zon.ManaBar.create();