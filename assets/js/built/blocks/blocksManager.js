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
        this.blockDamagedFadeTimeSettingInv = new Variable.Dependent(() => 1 / this.blockDamagedFadeTimeSetting, `BlockDamagedFadeTimeSettingInv`, this);
        this.blockHealthTextFontSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_FONT);
        this.blockHealthTextFont = new Variable.Dependent(() => `24px ` + Zon.Settings.BlockHealthTextFonts[this.blockHealthTextFontSetting.value], `BlockHealthTextFont`, this);
        this.blockHealthTextFont.onChangedAction.add(this.updateAllBlockHealthTextFonts);
        this.blockHealthTextColorSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_COLOR);
        this.blockHealthTextColorString = new Variable.Dependent(() => this.blockHealthTextColorSetting.value.cssString, `BlockHealthTextColorString`, this);
        this.blockHealthTextOutlineColorSetting = Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.BLOCK_HEALTH_TEXT_OUTLINE_COLOR);
        this.blockHealthTextOutlineColorString = new Variable.Dependent(() => this.blockHealthTextOutlineColorSetting.value.cssString, `BlockHealthTextOutlineColorString`, this);
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
        return [...this._blocksSet];//TODO: make sure this works as a map.
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
    /*
    For instance, density is d(r) = 1 - r/R like you said.
    integral[a, b]{1 - r/R} dr
    {r - 0.5 / R * r^2}|[a, b]
    mass of line segment = b - a - 0.5 / R * (b^2 - a^2)

    use atan2() to get the angle of all 4 corners.
    Then check the angles to split the cube into 3 parts.  integrate between the 4 angles giving 3 segments to add to gether.

    Test by summing a full circle, should be this:
    2 * pi * r * (Range - r) * dr
    Sum(2 * pi * r * (Range - r)) * dr
    2 * pi * integral[0, Range](Range * r - r^2) * dr

    2 * pi * {0.5 * R * r^2 - 1/3 * r^3}|[0, R]
    2 * pi * (0.5 * R^3 - 1/3 * R^3)
    1/3 * pi * R^3
    */
    getBlocksCircle = (position, radius) => {
        //Returns blocks in a circle from left to right, top to bottom.
        let checkedBlocks = new Set();
        const positionX = position.x;
        const positionY = position.y;
        const left = this.blockArea.left;
        const top = this.blockArea.top;
        const blockWidth = this._blockSize.x;
        const blockHeight = this._blockSize.y;
        const x0 = positionX - radius;
        const y0 = positionY - radius;
        const x1 = positionX + radius;
        const y1 = positionY + radius;
        const yCPixel = Math.ceil((positionY - top) / blockHeight) - 1;
        const x0Pixel = Math.max(Math.ceil((x0 - left) / blockWidth) - 1, 0);
        const y0Pixel = Math.max(Math.ceil((y0 - top) / blockHeight) - 1, 0);
        const x1Pixel = Math.min(Math.floor((x1 - left) / blockWidth), this._imagePixelsWidth - 1);
        const y1Pixel = Math.min(Math.floor((y1 - top) / blockHeight), this._imagePixelsHeight - 1);
        const blocks = [];

        //Top
        const r2 = radius * radius;
        let y = (y0Pixel + 1) * blockHeight + top - positionY;
        for (let yPixel = y0Pixel; yPixel < yCPixel; yPixel++) {
            const y2 = y * y;
            y += blockHeight;
            const xOffset = Math.sqrt(r2 - y2);
            const xPixelStart = Math.max(Math.ceil((positionX - xOffset - left) / blockWidth) - 1, 0);
            const xPixelEnd = Math.min(Math.floor((positionX + xOffset - left) / blockWidth), this._imagePixelsWidth - 1);
            for (let xPixel = xPixelStart; xPixel <= xPixelEnd; xPixel++) {
                if (zonDebug) {
                    const blockIndex = this.getBlockIndex(xPixel, yPixel);
                    if (checkedBlocks.has(blockIndex))
                        console.error(`Block ${blockIndex} already checked!`);

                    checkedBlocks.add(blockIndex);
                }

                const block = this.getBlock(xPixel, yPixel);
                if (!block)
                    continue;

                blocks.push(block);
            }
        }

        //Center
        for (let xPixel = x0Pixel; xPixel <= x1Pixel; xPixel++) {
            if (zonDebug) {
                const blockIndex = this.getBlockIndex(xPixel, yCPixel);
                if (checkedBlocks.has(blockIndex))
                    console.error(`Block ${blockIndex} already checked!`);

                checkedBlocks.add(blockIndex);
            }

            const block = this.getBlock(xPixel, yCPixel);
            if (!block)
                continue;

            blocks.push(block);
        }

        //Bottom
        y = (yCPixel + 1) * blockHeight + top - positionY;
        for (let yPixel = yCPixel + 1; yPixel <= y1Pixel; yPixel++) {
            const y2 = y * y;
            y += blockHeight;
            const xOffset = Math.sqrt(r2 - y2);
            const xPixelStart = Math.max(Math.ceil((positionX - xOffset - left) / blockWidth) - 1, 0);
            const xPixelEnd = Math.min(Math.floor((positionX + xOffset - left) / blockWidth), this._imagePixelsWidth - 1);
            for (let xPixel = xPixelStart; xPixel <= xPixelEnd; xPixel++) {
                if (zonDebug) {
                    const blockIndex = this.getBlockIndex(xPixel, yPixel);
                    if (checkedBlocks.has(blockIndex))
                        console.error(`Block ${blockIndex} already checked!`);

                    checkedBlocks.add(blockIndex);
                }

                const block = this.getBlock(xPixel, yPixel);
                if (!block)
                    continue;

                blocks.push(block);
            }
        }

        return blocks;
    }
    getBlocksCircleOld(position, radius) {//TODO: delete
        const x0 = position.x - radius;
        const y0 = position.y - radius;
        const x1 = position.x + radius;
        const y1 = position.y + radius;
        const left = this.blockArea.left;
        const top = this.blockArea.top;
        const xCPixel = Math.ceil((position.x - left) / this._blockSize.x) - 1;
        const yCPixel = Math.ceil((position.y - top) / this._blockSize.y) - 1;
        const x0Pixel = Math.ceil((x0 - left) / this._blockSize.x) - 1;
        const y0Pixel = Math.ceil((y0 - top) / this._blockSize.y) - 1;
        const x1Pixel = Math.floor((x1 - left) / this._blockSize.x);
        const y1Pixel = Math.floor((y1 - top) / this._blockSize.y);
        const blocks = [];
        const distances = [];

        //Center
        const centerXInRange = xCPixel >= 0 && xCPixel < this._imagePixelsWidth;
        const centerYInRange = yCPixel >= 0 && yCPixel < this._imagePixelsHeight;
        if (centerXInRange && centerYInRange) {
            const centerBlock = this.getBlock(xCPixel, yCPixel);
            if (centerBlock) {
                distances.push(0);
                blocks.push(centerBlock);
            }
        }
        
        //Left center
        const leftOfCenterInRange = xCPixel - 1 >= 0;
        if (leftOfCenterInRange && centerYInRange) {
            for (let xPixel = x0Pixel; xPixel < xCPixel; xPixel++) {
                const block = this.getBlock(xPixel, yCPixel);
                if (block) {
                    distances.push(position.x - block.right);
                    blocks.push(block);
                }
            }
        }

        //Right center
        const rightOfCenterInRange = xCPixel + 1 < this._imagePixelsWidth;
        if (rightOfCenterInRange && centerYInRange) {
            for (let xPixel = xCPixel + 1; xPixel <= x1Pixel; xPixel++) {
                const block = this.getBlock(xPixel, yCPixel);
                if (block) {
                    blocks.push(block);
                }
            }
        }

        //Top center
        const topOfCenterInRange = yCPixel - 1 >= 0;
        if (topOfCenterInRange && centerXInRange) {
            for (let yPixel = y0Pixel; yPixel < yCPixel; yPixel++) {
                const block = this.getBlock(xCPixel, yPixel);
                if (block) {
                    blocks.push(block);
                }
            }
        }

        //Bottom center
        const bottomOfCenterInRange = yCPixel + 1 < this._imagePixelsHeight;
        if (bottomOfCenterInRange && centerXInRange) {
            for (let yPixel = yCPixel + 1; yPixel <= y1Pixel; yPixel++) {
                const block = this.getBlock(xCPixel, yPixel);
                if (block) {
                    blocks.push(block);
                }
            }
        }

        const blockWidth = this._blockSize.x;
        const blockHeight = this._blockSize.y;

        //Left up block
        if (leftOfCenterInRange && topOfCenterInRange) {
            let xPixelEnd = x0Pixel;
            for (let yPixel = yCPixel - 1; yPixel >= y0Pixel; yPixel--) {
                for (let xPixel = xCPixel - 1; xPixel >= xPixelEnd; xPixel--) {
                    const block = this.getBlock(xPixel, yPixel);
                    if (!block)
                        continue;

                    const distance = position.distance(block);
                    if (distance <= radius) {
                        blocks.push(block);
                    }
                    else {
                        xPixelEnd = xPixel + 1;
                        break;
                    }
                }
            }
        }




        // if (leftOfCenterInRange && topOfCenterInRange) {
        //     let xPixelEnd = x0Pixel;
        //     for (let yPixel = yCPixel - 1; yPixel >= y0Pixel; yPixel--) {
        //         for (let xPixel = xCPixel - 1; xPixel >= xPixelEnd; xPixel--) {
        //             const block = this.getBlock(xPixel, yPixel);
        //             if (!block)
        //                 continue;

        //             blockPos.x = (xPixel + 1) * blockWidth + left;
        //             blockPos.y = (yPixel + 1) * blockHeight + top;
        //             const distance = position.distance(blockPos);
        //             if (distance <= radius) {
        //                 blocks.push(block);
        //             }
        //             else {
        //                 xPixelEnd = xPixel + 1;
        //                 break;
        //             }
        //         }
        //     }
        // }

        /*
        const blockPos = new Vectors.Vector(0, 0);

// Left up block (you already have this)
// ... your existing code ...

// Right up block
if (rightOfCenterInRange && topOfCenterInRange) {
    let xPixelEnd = x1Pixel;
    for (let yPixel = yCPixel - 1; yPixel >= y0Pixel; yPixel--) {
        for (let xPixel = xCPixel + 1; xPixel <= xPixelEnd; xPixel++) {
            const block = this.getBlock(xPixel, yPixel);
            if (!block)
                continue;

            blockPos.x = xPixel * this._blockSize.x + this.blockArea.left;
            blockPos.y = (yPixel + 1) * this._blockSize.y + this.blockArea.top;
            const distance = position.distance(blockPos);
            if (distance <= radius) {
                blocks.push(block);
            } else {
                // Shrink right boundary for next rows
                xPixelEnd = xPixel - 1;
                break;
            }
        }
    }
}

// Left down block
if (leftOfCenterInRange && bottomOfCenterInRange) {
    let xPixelEnd = x0Pixel;
    for (let yPixel = yCPixel + 1; yPixel <= y1Pixel; yPixel++) {
        for (let xPixel = xCPixel - 1; xPixel >= xPixelEnd; xPixel--) {
            const block = this.getBlock(xPixel, yPixel);
            if (!block)
                continue;

            blockPos.x = (xPixel + 1) * this._blockSize.x + this.blockArea.left;
            blockPos.y = yPixel * this._blockSize.y + this.blockArea.top;
            const distance = position.distance(blockPos);
            if (distance <= radius) {
                blocks.push(block);
            } else {
                // Shrink left boundary for next rows
                xPixelEnd = xPixel + 1;
                break;
            }
        }
    }
}

// Right down block
if (rightOfCenterInRange && bottomOfCenterInRange) {
    let xPixelEnd = x1Pixel;
    for (let yPixel = yCPixel + 1; yPixel <= y1Pixel; yPixel++) {
        for (let xPixel = xCPixel + 1; xPixel <= xPixelEnd; xPixel++) {
            const block = this.getBlock(xPixel, yPixel);
            if (!block)
                continue;

            blockPos.x = xPixel * this._blockSize.x + this.blockArea.left;
            blockPos.y = yPixel * this._blockSize.y + this.blockArea.top;
            const distance = position.distance(blockPos);
            if (distance <= radius) {
                blocks.push(block);
            } else {
                // Shrink right boundary for next rows
                xPixelEnd = xPixel - 1;
                break;
            }
        }
    }
}

        */
    }
}

Zon.blocksManager = new Zon.BlocksManager();