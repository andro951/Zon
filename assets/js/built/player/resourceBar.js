"use strict";

Zon.ResourceBar = class extends Zon.UI.UIElementDiv {
    constructor() {
        super();
    }
    static create(...args) {
        const resourceBar = new this(...args);
        resourceBar.bindAll();
        resourceBar.postConstructor();
        return resourceBar;
    }
    postConstructor() {
        super.postConstructor();
    }
    setup = () => {
        //super.setup();
    }
}