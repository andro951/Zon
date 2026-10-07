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
    }
    postConstructor() {
        super.postConstructor();
        
        //window.addEventListener("load", this.setDefaultSizeAndShow);
        window.addEventListener("resize", this.resize);
        
        //this.setDefaultSize();
        //this.resize();
    }
    setDefaultSizeAndShow() {
        this.setDefaultSize();
        this.show();
    }
    setDefaultSize() {
        const r = this.getRect();
        this._height._value = r.height;
        this._width._value = r.width;
        this._top._value = r.top;
        this._left._value = r.left;

        this._updateLeft();
        this._updateTop();
        this._updateWidth();
        this._updateHeight();
    }
    getRect() {
        const screenWidth = window.innerWidth;// window.visualViewport?.width ?? window.innerWidth;
        const screenHeight = window.innerHeight;// window.visualViewport?.height ?? window.innerHeight;
        const height = screenHeight;
        const width = Math.min(screenHeight * this.widthRatio / this.heightRatio, screenWidth);
        const top = (screenHeight - height) / 2;
        const left = (screenWidth - width) / 2;
        const r = {
            height,
            width,
            top,
            left,
        };

        //console.log(`r; height: ${r.height}, width: ${r.width}, top: ${r.top}, left: ${r.left}, screenWidth: ${screenWidth}, screenHeight: ${screenHeight}.`);

        return r;
    }
    resize() {
        const pausedByThisFunction = Variable.Base.tryPause(this);
        const r = this.getRect();
        this._height.value = r.height;
        this._width.value = r.width;
        this._top.value = r.top;
        this._left.value = r.left;
        if (pausedByThisFunction)
            Variable.Base.resume(this);
    }
}

Zon.device = Zon.Device.create();