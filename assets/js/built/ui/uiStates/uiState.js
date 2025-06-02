"use strict";

Zon.UI.UIStateCanvas = class extends Zon.UI.UIElementCanvas {
    constructor(canvasId, animation, width = 300, height = 150, zIndex = 0, parent = Zon.device) {
        super(canvasId, width, height, zIndex, parent);
        this.animation = typeof animation === 'function' ? animation(this.rect) : animation;
        this.bindAll();
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

    forceShow = () => {
        super.show();
    }

    forceHide = () => {
        super.hide();
    }
}

Zon.UI.UIStateDiv = class extends Zon.UI.UIElementDiv {
    constructor(divId, animation, zIndex = 0, parent = Zon.device) {
        super(divId, zIndex, parent);
        this.animation = typeof animation === 'function' ? animation(this) : animation;
        this.bindAll();
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

    forceShow = () => {
        super.show();
    }

    forceHide = () => {
        super.hide();
    }
}