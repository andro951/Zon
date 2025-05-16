"use strict";

Zon.Device = class {
    constructor() {
        this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
        this.DEFAULT_HEIGHT_RATIO = 15;
        this.DEFAULT_WIDTH_RATIO = 9;
        this.DEFAULT_DEAD_SPACE_RATIO = 0.5;
        const topDeadSpace = this.isMobile ? this.DEFAULT_DEAD_SPACE_RATIO : 0;
        const bottomDeadSpace = this.isMobile ? this.DEFAULT_DEAD_SPACE_RATIO : 0;
        this.heightRatio = this.DEFAULT_HEIGHT_RATIO + topDeadSpace + bottomDeadSpace;
        this.widthRatio = this.DEFAULT_WIDTH_RATIO;
        this.usedHeightRatio = this.DEFAULT_HEIGHT_RATIO;
        this.usedWidthRatio = this.DEFAULT_WIDTH_RATIO;
        this.rect = Struct.DynamicRectangle.empty();
        window.addEventListener("load", () => Zon.device.resize());
        window.addEventListener("resize", () => Zon.device.resize());
        this.resizeListenners = new Set();
        this.resize();
    }

    get top() {
        return this.rect.top;
    }
    get left() {
        return this.rect.left;
    }
    get width() {
        return this.rect.width;
    }
    get height() {
        return this.rect.height;
    }
    get right() {
        return this.rect.right;
    }
    get bottom() {
        return this.rect.bottom;
    }
    get _top() {
        return this.rect._top;
    }
    get _left() {
        return this.rect._left;
    }
    get _width() {
        return this.rect._width;
    }
    get _height() {
        return this.rect._height;
    }
    get _right() {
        return this.rect._right;
    }
    get _bottom() {
        return this.rect._bottom;
    }

    resize() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        Variable.Base.pause();
        this._height.set(this.isMobile ? screenHeight * (this.heightRatio / this.DEFAULT_HEIGHT_RATIO) : screenHeight);
        this._width.set(Math.min(this.height * this.widthRatio / this.heightRatio, screenWidth));
        this._top.set((screenHeight - this.height) / 2);
        this._left.set((screenWidth - this.width) / 2);
        Variable.Base.resume();
        // if (Zon.device) {
        //     console.log('this.top', Zon.device.top.value);
        //     console.log('this.left', Zon.device.left.value);
        //     console.log('this.width', Zon.device.width.value);
        //     console.log('this.height', Zon.device.height.value);
        //     console.log('this.bottom', Zon.device.bottom.value);
        //     console.log('this.right', Zon.device.right.value);
        // }
    }
}

Zon.device = new Zon.Device();