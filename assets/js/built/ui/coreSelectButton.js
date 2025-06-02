"use strict";

Zon.CoreSelectButton = class {
    constructor() {
        
    }
    static create(...args) {
        const coreSelectButton = new this(...args);
        coreSelectButton.bindAll();
        coreSelectButton.postConstructor();
        return coreSelectButton;
    }
    postConstructor() {
        //super.postConstructor();
    }
    postLoadSetup() {
        
    }
}

Zon.coreSelectButton = Zon.CoreSelectButton.create();