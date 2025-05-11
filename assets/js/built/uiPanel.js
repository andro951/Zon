"use strict";

Zon.UIPanel = class {
    constructor() {
        this.element = undefined;
        this.visible = false;
    }
    resize() {
        
    }
    show() {
        if (this.visible)
            return;
            
        this.resize();
        Zon.device.registerResize(this);
        this.element.style.display = 'block';
        this.visible = true;
    }
    hide() {
        if (!this.visible)
            return;
        
        Zon.device.unregisterResize(this);
        this.element.style.display = 'none';
        this.visible = false;
    }
}