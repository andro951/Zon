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
        this.top = undefined;
        this.bottom = undefined;
        this.left = undefined;
        this.right = undefined;
        this.width = undefined;
        this.height = undefined;
        window.addEventListener("load", () => Zon.device.resize());
        window.addEventListener("resize", () => Zon.device.resize());
        this.resizeListenners = new Set();
    }

    resize() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        this.height = this.isMobile ? screenHeight * (this.heightRatio / this.DEFAULT_HEIGHT_RATIO) : screenHeight;
        this.width = Math.min(this.height * this.widthRatio / this.heightRatio, screenWidth);
        this.top = (screenHeight - this.height) / 2;
        this.bottom = this.top + this.height;
        this.left = (screenWidth - this.width) / 2;
        this.right = this.left + this.width;
        for (const uiPanel of this.resizeListenners) {
            uiPanel.resize();
        }
    }

    registerResize(uiPanel) {
        this.resizeListenners.add(uiPanel);
    }
    unregisterResize(uiPanel) {
        this.resizeListenners.delete(uiPanel);
    }
}

Zon.device = new Zon.Device();