"use strict";

Zon.BlocksManager = class {
    constructor() {
        this.canvas = document.getElementById('combatAreaCanvas');
        this.ctx = this.canvas.getContext('2d');
        const widthScale = 8 / 9;
        this.blockArea = new Struct.DynamicRectangle(
            new Variable.Dependent(() => Zon.device.left + Zon.device.width * (1 - widthScale) / 2),
            new Variable.Dependent(() => Zon.device.top + Zon.device.height * (1 - widthScale) / 2),
            new Variable.Dependent(() => Zon.device.width * widthScale),
            new Variable.Dependent(() => Zon.device.height * widthScale),
        );

        this._levelData = null;
        this._x0 = null;
        this._y0 = null;
        this._imagePixelsWidth = null;
        this._imagePixelsHeight = null;
        this._blockSize = null;
        this._blocks = null;
        this._blocksSet = new Set();
        this.weakPointBlock = null;
    }

    getBlockX = (xPixel) => {
        return this._x0 + xPixel * this._blockSize;
    }
    getBlockY = (yPixel) => {
        return this._y0 + yPixel * this._blockSize;
    }
    getBlockPosition = (xPixel, yPixel) => {
        return new Vectors.Vector(this.getBlockX(xPixel), this.getBlockY(yPixel));
    }
    getBlock = (xPixel, yPixel) => {
        return this._blocks[this.getBlockIndex(xPixel, yPixel)];
    }
    getBlockIndex = (xPixel, yPixel) => {
        return yPixel * this._imagePixelsWidth + xPixel;
    }
    tileHasBlock = (xIndex, yIndex) => {
        return !!this.getBlock(xIndex, yIndex);
    }
    get blocks() {
        return this._blocksSet;//TODO: make sure this works as a map.
    }
    get blocksCount() {
        return this._blocksSet.size;
    }
    get levelData() {
        return this._levelData;
    }
    setLevelData = (levelData) => {
        this._levelData = levelData;
    }
    setupLevel = () => {
        if (Zon.timeController.skipSetupLevel)
            return;

        this.clearAllBlocks();
        this._imagePixelsWidth = this._levelData.width();
        this._imagePixelsHeight = this._levelData.height();
        this._blockSize = 100;
        this._x0 = this.blockArea.left;
        this._y0 = this.blockArea.top;
        this._blocks = new Array(this._imagePixelsWidth * this._imagePixelsHeight);

        for (let yPixel = 0; yPixel < this._imagePixelsHeight; yPixel++) {
            for (let xPixel = 0; xPixel < this._imagePixelsWidth; xPixel++) {
                const color = this._levelData.pixels([this.getBlockIndex(xPixel, yPixel)]);
                const blockIndex = xPixel + yPixel * this._imagePixelsWidth;
                if (color.a === 0) {
                    this._blocks[blockIndex] = null;
                    continue;
                }

                const block = new Zon.Block(this._blockSize, this._blockSize, this, this.getBlockX(xPixel), this.getBlockY(yPixel), blockIndex, this._levelData.blockHP ? this._levelData.blockHP[blockIndex] : this._levelData.blockMaxHealth, color);
                this._blocks[blockIndex] = block;
                this._blocksSet.add(block);
            }
        }
    }
    update = () => {
        this.blocks.forEach(block => block.update());
    }
    draw = () => {
        this.blocks.forEach(block => block.draw());
    }
    onStopSkipPhysicsSetupLevel = () => {
        this.setupLevel();
    }
    onKilled = (block) => {
        if (this.weakPointBlock !== null && block === this.weakPointBlock) {
            Zon.BasicAttackCriticalHits.onWeakPointBlockKilled();
        }

        this._blocks[block.index] = null;
        this._blocksSet.delete(block);
        if (this.blocksCount <= 0) {
            this.completeLevel();
        }
    }
    completeLevel = () => {
        Zon.game.onCompleteStage(this._levelData);
    }
    afkModeForceCompleteLevel = (levelTime) => {
        this._levelData.stageDuration = levelTime;
        this.completeLevel();
    }
    clearAllBlocks = () => {
        if (!this._blocks)
            return;

        for (let i = 0; i < this._blocks.length; i++) {
            const block = this._blocks[i];
            if (block) {
                block.destroy();
            }
        }

        this._blocks = null;
        this._blocksSet.clear();
    }
    onSwapLevel = () => {
        this.tryUpdateLevelDataPixelsAndHP();
    }
    tryUpdateLevelDataPixelsAndHP = () => {
        if (this.blocksCount > 0)
            this.updateLevelDataPixelsAndHP();
    }
    updateLevelDataPixelsAndHP = () => {
        //TODO: switch to using the set to iterate and store as a map instead of an array.
        this._levelData.blockHP = new Array(this._blocks.length);
        for (let yPixel = 0; yPixel < this._imagePixelsHeight; yPixel++) {
            for (let xPixel = 0; xPixel < this._imagePixelsWidth; xPixel++) {
                const blockIndex = this.getBlockIndex(xPixel, yPixel);
                const block = this._blocks[blockIndex];
                if (block === null) {
                    this._levelData.pixels([blockIndex]).a = 0;
                    this._levelData.blockHP[blockIndex] = Numbers.Triple.ZERO;
                } else {
                    this._levelData.blockHP[blockIndex] = block.health.HP;
                }
            }
        }
    }
    preSave = () => {
        this.updateLevelDataPixelsAndHP();
        //this.tryUpdateLevelDataPixelsAndHP();//TODO: Swap to try?
    }
    getRandomBlock = () => {
        return this.blocks.getRandom();
    }
    createWeakPointBlock = () => {
        this.resetWeakPointBlock();
        if (this.blocksCount <= 0)
            return null;

        const allBlocks = this.blocks;

        //Try to pick a block >= 25% of max hp
        const threshold = this._levelData.blockMaxHealth.multiply(Numbers.Triple.create(1n, -2));
        let block = allBlocks.filter(b => b.health.HP.greaterThanOrEqual(threshold)).getRandom();
        if (!block) {
            //If no block found >= 25% max hp, pick a random block.
            block = allBlocks.getRandom();
        }

        this.weakPointBlock = block;
        this.weakPointBlock.setWeakPoint();
        return this.weakPointBlock;
    }
    resetWeakPointBlock = () => {
        if (this.weakPointBlock !== null) {
            this.weakPointBlock.resetWeakPoint();
            this.weakPointBlock = null;
        }
    }
    onWeakPointHit = () => {
        this.resetWeakPointBlock();
    }
    onWeakPointMiss = () => {
        this.resetWeakPointBlock();
    }
    onWeakPointKilled = () => {
        this.resetWeakPointBlock();
    }
}