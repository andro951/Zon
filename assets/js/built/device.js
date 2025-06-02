"use strict";

Zon.Device = class extends Zon.UI.UIElementDiv {
    constructor() {
        //this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
        super('device', 0, window.document.body);
        this.dependentVariables = [];
        this.element.style.overflow = 'hidden';
        this.DEFAULT_HEIGHT_RATIO = 15;
        this.DEFAULT_WIDTH_RATIO = 9;
        this.heightRatio = this.DEFAULT_HEIGHT_RATIO;
        this.widthRatio = this.DEFAULT_WIDTH_RATIO;
        this.usedHeightRatio = this.DEFAULT_HEIGHT_RATIO;
        this.usedWidthRatio = this.DEFAULT_WIDTH_RATIO;
        this.rect = Struct.DynamicRectangle.empty();
        window.addEventListener("load", this.resize);
        window.addEventListener("resize", this.resize);
        this.onResize = new Actions.Action();
        this.resize();
        this.show();
        this._updateShown();
    }

    resize = () => {
        const screenWidth = window.innerWidth;// window.visualViewport?.width ?? window.innerWidth;
        const screenHeight = window.innerHeight;// window.visualViewport?.height ?? window.innerHeight;
        Variable.Base.pause();
        this._height.value = screenHeight;
        this._width.value = Math.min(this.height * this.widthRatio / this.heightRatio, screenWidth);
        this._top.value = (screenHeight - this.height) / 2;
        this._left.value = (screenWidth - this.width) / 2;
        Variable.Base.resume();
        this.onResize.call();
    }
}

Zon.device = new Zon.Device();