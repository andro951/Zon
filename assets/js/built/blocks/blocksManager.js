"use strict";

Zon.BlocksManager = class {
    constructor() {
        this.canvas = document.getElementById('combatAreaCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileCount = new Vectors.Vector(16, 16);
        this.heightScaleNum = 8;
        this.heightScaleDenom = 9;
        this.widthScaleNum = 8;
        this.widthScaleDenom = 9;
        this.blockArea = new Struct.Rectangle(
            this.canvas.width / this.widthScaleDenom / 2 * (this.widthScaleDenom - this.heightScaleNum),
            this.canvas.height / this.heightScaleDenom / 2 * (this.heightScaleDenom - this.heightScaleNum),
            this.canvas.width / this.widthScaleDenom * this.widthScaleNum,
            this.canvas.height / this.heightScaleDenom * this.heightScaleNum
        );

        this._levelData = null;
        this._imagePixelsWidth = null;
        this._imagePixelsHeight = null;
        this._blockSize = null;
        this._blocks = null;
        this._blocksSet = new Set();
        this.weakPointBlock = null;
        
        Zon.Setup.preSetLoadedValuesSetupActions.add(this.preSetLoadedValues);
    }

    preSetLoadedValues = () => {
        this.blockDrawModeSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_HEALTH_DRAW_MODE);
        this.blockHealthDimSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_HEALTH_DIM);
        this.blockHealthDimSetting.onChangedAction.add(this.updateAllBlockDullColors);
        this.blockDamagedColorStrengthSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_DAMAGED_COLOR_STRENGTH);
        this.blockDamagedColorSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_DAMAGED_COLOR);
        this.blockDamagedFadeTimeSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_DAMAGED_FADE_TIME);
        this.blockDamagedFadeTimeSettingInv = new Variable.Dependent(() => 1 / this.blockDamagedFadeTimeSetting, this);
        this.blockHealthTextFontSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_FONT);
        this.blockHealthTextFont = new Variable.Dependent(() => `24px ` + Zon.Settings.BlockHealthTextFonts[this.blockHealthTextFontSetting.value], this);
        this.blockHealthTextFont.onChangedAction.add(this.updateAllBlockHealthTextFonts);
        this.blockHealthTextColorSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_COLOR);
        this.blockHealthTextColorString = new Variable.Dependent(() => this.blockHealthTextColorSetting.value.cssString, this);
        this.blockHealthTextOutlineColorSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_OUTLINE_COLOR);
        this.blockHealthTextOutlineColorString = new Variable.Dependent(() => this.blockHealthTextOutlineColorSetting.value.cssString, this);
        this.blockHealthTextOutlineStyleSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_OUTLINE_STYLE);
        this.blockHealthTextOutlineWidthSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_OUTLINE_WIDTH);
        this.blockHealthTextSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT);
        this.blockHealthOutlineSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_HEALTH_OUTLINE);
    }

    updateAllBlockHealthTextFonts = () => {
        for (const block of this._blocksSet) {
            block.ctx.font = this.blockHealthTextFont.value;
        }
    }

    updateAllBlockDullColors = () => {
        const dimAmount = this.blockHealthDimSetting.value;
        for (const block of this._blocksSet) {
            block.updateDullColor(dimAmount);
        }
    }

    getBlockX = (xPixel) => {
        return this.blockArea.left + xPixel * this._blockSize.x;
    }
    getBlockY = (yPixel) => {
        return this.blockArea.top + yPixel * this._blockSize.y;
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
        this.tileCount = new Vectors.Vector(this._imagePixelsWidth, this._imagePixelsHeight);
        this._blockSize = new Vectors.Vector(this.blockArea.width / this.tileCount.x, this.blockArea.height / this.tileCount.y);//100, 100
        this._blocks = new Array(this._imagePixelsWidth * this._imagePixelsHeight);

        for (let yPixel = 0; yPixel < this._imagePixelsHeight; yPixel++) {
            for (let xPixel = 0; xPixel < this._imagePixelsWidth; xPixel++) {
                const color = this._levelData.pixels([this.getBlockIndex(xPixel, yPixel)]);
                const blockIndex = xPixel + yPixel * this._imagePixelsWidth;
                if (color.a === 0) {
                    this._blocks[blockIndex] = null;
                    continue;
                }

                const block = new Zon.Block(this._blockSize.x, this._blockSize.y, this, this.getBlockX(xPixel), this.getBlockY(yPixel), blockIndex, this._levelData.blockHP ? this._levelData.blockHP[blockIndex] : this._levelData.blockMaxHealth, color);
                this._blocks[blockIndex] = block;
                this._blocksSet.add(block);
            }
        }
    }
    update = () => {
        //this.blocks.forEach(block => block.update());
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
        if (!this._blocks || !this._levelData || !this._levelData.pixels || !this._levelData.blockHP)
            return;

        this._levelData.blockHP = new Array(this._blocks.length);
        for (let yPixel = 0; yPixel < this._imagePixelsHeight; yPixel++) {
            for (let xPixel = 0; xPixel < this._imagePixelsWidth; xPixel++) {
                const blockIndex = this.getBlockIndex(xPixel, yPixel);
                const block = this._blocks[blockIndex];
                if (block === null) {
                    this._levelData.pixels([blockIndex]).a = 0;
                    this._levelData.blockHP[blockIndex] = Struct.BigNumber.ZERO;
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
        const threshold = this._levelData.blockMaxHealth.multiply(Struct.BigNumber.create(1, -2));
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

Zon.blocksManager = new Zon.BlocksManager();