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
        this.top = new DataTypes.Variable(undefined);
        this.left = new DataTypes.Variable(undefined);
        this.width = new DataTypes.Variable(undefined);
        this.height = new DataTypes.Variable(undefined);
        this.bottom = new DataTypes.DependentVariable(() =>  Zon.device.top.value + Zon.device.height.value, this.top, this.height);
        this.right = new DataTypes.DependentVariable(() => Zon.device.left.value + Zon.device.width.value, this.left, this.width);
        window.addEventListener("load", () => Zon.device.resize());
        window.addEventListener("resize", () => Zon.device.resize());
        this.resizeListenners = new Set();
        this.resize();
    }

    resize() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        DataTypes.VariableBase.pause();
        this.height.set(this.isMobile ? screenHeight * (this.heightRatio / this.DEFAULT_HEIGHT_RATIO) : screenHeight);
        this.width.set(Math.min(this.height * this.widthRatio / this.heightRatio, screenWidth));
        this.top.set((screenHeight - this.height) / 2);
        this.left.set((screenWidth - this.width) / 2);
        DataTypes.VariableBase.resume();
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