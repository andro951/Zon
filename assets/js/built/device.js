"use strict";

Zon.Device = class extends Zon.UI.UIElementDiv {
    constructor() {
        //this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
        super('device', 0, window.document.body, { dependentRect: false });
        this.dependentVariables = [];
        this.element.style.overflow = 'hidden';
        this.DEFAULT_HEIGHT_RATIO = 15;
        this.DEFAULT_WIDTH_RATIO = 9;
        this.heightRatio = this.DEFAULT_HEIGHT_RATIO;
        this.widthRatio = this.DEFAULT_WIDTH_RATIO;
        this.onResize = new Actions.Action();
    }
    postConstructor() {
        super.postConstructor();
        
        window.addEventListener("load", this.resize);
        window.addEventListener("resize", this.resize);
        
        this.resize();
        this.show();
    }
    resize() {
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

Zon.device = Zon.Device.create();