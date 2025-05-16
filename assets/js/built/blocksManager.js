"use strict";

Zon.BlocksManager = class {
    constructor() {
        this.canvas = document.getElementById('combatAreaCanvas');
        this.ctx = this.canvas.getContext('2d');
        const widthScale = 8 / 9;
        this.blockArea = new Struct.DynamicRectangle(
            new Variable.Dependent(() => (Zon.device.left + Zon.device.width) / 2 - Zon.device.width * widthScale , Zon.device._left, Zon.device._width),
            new Variable.Dependent(() => (Zon.device.top + Zon.device.height) / 2 - Zon.device.height * widthScale, Zon.device._top, Zon.device._height),
            new Variable.Dependent(() => Zon.device.width * widthScale, Zon.device._width),
            new Variable.Dependent(() => Zon.device.height * widthScale, Zon.device._height),
        );

        this._levelData = null;
        this._blocksCount = 0;
        this._x0 = null;
        this._y0 = null;
        this._imagePixelsWidth = null;
        this._imagePixelsHeight = null;
        this._blockSize = null;
        this._blocks = null;
        this.onUpdate = new Actions.Action();
        this.onDraw = new Actions.Action();
    }

    getBlockX(xPixel) {
        return this._x0 + xPixel * this._blockSize;
    }
    getBlockY(yPixel) {
        return this._y0 + yPixel * this._blockSize;
    }
    getBlockPosition(xPixel, yPixel) {
        return new Vectors.Vector(this.getBlockX(xPixel), this.getBlockY(yPixel));
    }
    getBlock(xPixel, yPixel) {
        return this._blocks[this.getBlockIndex(xPixel, yPixel)];
    }
    getBlockIndex(xPixel, yPixel) {
        return yPixel * this._imagePixelsWidth + xPixel;
    }
    get blocks() {
        return this._blocks.filter(block => block !== null);
    }

    get levelData() {
        return this._levelData;
    }
    setLevelData(levelData) {
        this._levelData = levelData;
    }
    setupLevel() {
        if (Zon.timeController.skipSetupLevel)
            return;

        this.clearAllBlocks();
        this._imagePixelsWidth = this._levelData.width;
        this._imagePixelsHeight = this._levelData.height;
        this._blockSize = 1;
        this._x0 = -(this._imagePixelsWidth - 1) * this._blockSize / 2;
        this._y0 = -(this._imagePixelsHeight - 1) * this._blockSize / 2;
        this.blocks = new Array(this._imagePixelsWidth * this._imagePixelsHeight);

        for (let yPixel = 0; yPixel < this._imagePixelsHeight; yPixel++) {
            for (let xPixel = 0; xPixel < this._imagePixelsWidth; xPixel++) {
                const color = this._levelData.pixels[this.getBlockIndex(xPixel, yPixel)];
                const blockIndex = xPixel + yPixel * this._imagePixelsWidth;
                if (color.a === 0) {
                    this._blocks[blockIndex] = null;
                    continue;
                }

                const block = new Zon.Block(this, this.getBlockPosition(xPixel, yPixel), blockIndex, this._levelData.blockHP ? this._levelData.blockHP[blockIndex] : this._levelData.blockMaxHealth, color);
                this._blocks[blockIndex] = block;
                this._blocksCount++;
            }
        }
    }
    update() {
        this.onUpdate.call();
    }
    draw() {
        this.onDraw.call();
    }
    onStopSkipPhysicsSetupLevel() {
        this.setupLevel();
    }
    /*
    internal void OnKilled(Block block) {
	blocksCount--;
	if (weakPointBlock != null && block == weakPointBlock)
		BasicAttackCriticalHits.OnWeakPointBlockKilled();

	blocks[block.Index] = null;
	UnityEngine.Object.Destroy(block.gameObject);
	if (blocksCount <= 0) {
		CompleteLevel();
	}
}
private void CompleteLevel() {
	Game.Instance.OnCompleteStage(LevelData);
}
    */
    onKilled(block) {
        this._blocksCount--;
        if (this._blocksCount <= 0) {
            this.completeLevel();
        }
    }
}