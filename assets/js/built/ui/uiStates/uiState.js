"use strict";

Zon.UI.UIStateCanvas = class extends Zon.UI.UIElementCanvas {
    constructor(canvasId, animation, width = 300, height = 150, zIndex = 0, parent = Zon.device) {
        super(canvasId, width, height, zIndex, parent);
        this.animation = typeof animation === 'function' ? animation(this) : animation;
    }
    static create(...args) {
        const uiStateCanvas = new this(...args);
        uiStateCanvas.bindAll();
        uiStateCanvas.postConstructor();
        return uiStateCanvas;
    }
    postConstructor() {
        super.postConstructor();
    }
    show() {
        if (this.shown.value)
            return;

        this.animation.show();
    }

    hide() {
        if (!this.shown.value)
            return;

        this.animation.hide();
    }

    forceShow() {
        super.show();
    }

    forceHide() {
        super.hide();
    }
}

Zon.UI.UIStateDiv = class extends Zon.UI.UIElementDiv {
    constructor(divId, animation, zIndex = 0, parent = Zon.device) {
        super(divId, zIndex, parent);
        this.animation = typeof animation === 'function' ? animation(this) : animation;
    }
    static create(...args) {
        const uiStateDiv = new this(...args);
        uiStateDiv.bindAll();
        uiStateDiv.postConstructor();
        return uiStateDiv;
    }
    postConstructor() {
        super.postConstructor();
    }
    show() {
        if (this.shown.value)
            return;

        this.animation.show();
    }

    hide() {
        if (!this.shown.value)
            return;

        this.animation.hide();
    }

    forceShow() {
        super.show();
    }

    forceHide() {
        super.hide();
    }
}