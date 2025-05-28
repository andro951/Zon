"use strict";

Zon.Block = class extends Struct.Rectangle {
    constructor(width, height, blocksManager, left, top, index, health, color) {
        super(left, top, width, height);
        this.blocksManager = blocksManager;
        this.index = index;
        //this.health = new Zon.Health(health, this);
        this.health = new Zon.Health(health.multiply(Numbers.Triple.create(20n, 0n)), this);
        this.health.onHPZero.add(this.kill);
        this.color = color;
        this.normalColorString = this.color.cssString;
        this.isWeakPoint = false;
        this.canvas = document.getElementById('combatAreaCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.hitColorTimer = 0;
        this.updateDullColor(Zon.blocksManager.blockHealthDimSetting.value);
    }

    kill = () => {
        this.blocksManager.onKilled(this);
        this.destroy();
    }

    destroy = () => {
        this.health = null;
    }

    setWeakPoint = () => {
        this.isWeakPoint = true;
    }

    resetWeakPoint = () => {
        this.isWeakPoint = false;
    }

    updateDullColor = (dimAmount) => {
        this.dullColorString = this.color.dim(dimAmount).cssString;
    }

    update = () => {

    }

    draw = () => {
        let normalColor;
        if (this.hitColorTimer > 0) {
            this.hitColorTimer -= Zon.timeController.deltaTimeSeconds * Zon.blocksManager.blockDamagedFadeTimeSettingInv.value;
            if (this.hitColorTimer <= 0) {
                this.ctx.fillStyle = this.normalColorString;
                this.hitColorTimer = 0;
            }
            else {
                normalColor = this.color.blend(Zon.blocksManager.blockDamagedColorSetting.value, this.hitColorTimer * Zon.blocksManager.blockDamagedColorStrengthSetting.value).cssString;
            }
        }
        else {
            normalColor = this.normalColorString;
        }

        if (Zon.blocksManager.blockDrawModeSetting.value === Zon.Settings.BlockHealthDrawModeID.NONE) {
            this.ctx.fillStyle = normalColor;
            this.ctx.fillRect(this.left, this.top, this.width, this.height);
        }
        else {
            if (!this.health.isMax) {
                this.ctx.fillStyle = this.dullColorString;
                this.ctx.fillRect(this.left, this.top, this.width, this.height);
            }

            switch (Zon.blocksManager.blockDrawModeSetting.value) {
                case Zon.Settings.BlockHealthDrawModeID.RADIAL_ACCURATE:
                    this.drawRadialSquareFillSlow(this.ctx, this.left, this.top, this.width, this.health.percentFull, normalColor);
                    break;
                case Zon.Settings.BlockHealthDrawModeID.RADIAL_FAST:
                    this.drawRadialSquareFillFast(this.ctx, this.left, this.top, this.width, this.health.percentFull, normalColor);
                    break;
                case Zon.Settings.BlockHealthDrawModeID.LEFT_TO_RIGHT:
                    this.drawRectFillLeftToRight(this.ctx, this.left, this.top, this.width, this.height, this.health.percentFull, normalColor);
                    break;
                case Zon.Settings.BlockHealthDrawModeID.NONE:
                    // Do nothing
                    break;
            }
        }
    }

    drawRectFillLeftToRight(ctx, x, y, width, height, ratio, fillStyle) {
        const originalFillStyle = ctx.fillStyle;
        ctx.fillStyle = fillStyle;
        ctx.fillRect(x, y, width * ratio, height);
        ctx.fillStyle = originalFillStyle;
    }

    static SIDE_PERCENT = 0.25;
    static HALF_SIDE_PERCENT = 0.125;
    static INV_SIDE_PERCENT = 4;
    drawRadialSquareFillSlow(ctx, x, y, width, ratio, fillStyle) {
        if (ratio <= 0)
            return;

        const originalFillStyle = ctx.fillStyle;
        ctx.fillStyle = fillStyle;
        if (ratio >= 1) {
            ctx.fillRect(x, y, width, width);
            ctx.fillStyle = originalFillStyle;
            return;
        }

        ctx.beginPath();
        const halfWidth = width * 0.5;
        const centerX = x + halfWidth;
        const centerY = y + halfWidth;
        const right = x + width;
        const bottom = y + width;
        ctx.moveTo(centerX, centerY); //Start at center
        ctx.lineTo(centerX, y); //Line to top center
        if (ratio <= Zon.Block.HALF_SIDE_PERCENT) {
            //Line to top left
            const angle = Math.PI * 2 * (1 - ratio);
            const topLeftX = x + halfWidth * (1 + Math.tan(angle));
            ctx.lineTo(topLeftX, y);
        }
        else {
            ctx.lineTo(x, y); //Line to top left
            let remainingRatio = ratio - Zon.Block.HALF_SIDE_PERCENT;
            if (remainingRatio <= Zon.Block.SIDE_PERCENT) {
                //Line to botom left
                const angle = (remainingRatio - Zon.Block.HALF_SIDE_PERCENT) * Math.PI * 2;
                const botomLeftY = y + halfWidth * (1 + Math.tan(angle));
                ctx.lineTo(x, botomLeftY);
            }
            else {
                ctx.lineTo(x, bottom); //Line to botom left
                remainingRatio -= Zon.Block.SIDE_PERCENT;
                if (remainingRatio <= Zon.Block.SIDE_PERCENT) {
                    //Line to botom right
                    const angle = (remainingRatio - Zon.Block.HALF_SIDE_PERCENT) * Math.PI * 2;
                    const botomRightX = x + halfWidth * (1 + Math.tan(angle));
                    ctx.lineTo(botomRightX, bottom);
                }
                else {
                    ctx.lineTo(right, bottom); //Line to botom right
                    remainingRatio -= Zon.Block.SIDE_PERCENT;
                    if (remainingRatio <= Zon.Block.SIDE_PERCENT) {
                        //Line to top right
                        //const topRightY = y + width * (1 - remainingRatio * Zon.Block.INV_SIDE_PERCENT);
                        const angle = -(remainingRatio - Zon.Block.HALF_SIDE_PERCENT) * Math.PI * 2;
                        const topRightY = y + halfWidth * (1 + Math.tan(angle));
                        ctx.lineTo(right, topRightY);
                    }
                    else {
                        ctx.lineTo(right, y); //Line to top right
                        remainingRatio -= Zon.Block.SIDE_PERCENT;
                        const angle = Math.PI * 2 * (1 - ratio);
                        const lastX = x + halfWidth * (1 + Math.tan(angle));
                        ctx.lineTo(lastX, y);//Line to center-right
                    }
                }
            }
        }

        ctx.lineTo(centerX, centerY); //Line back to center
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = originalFillStyle;
    }

    drawRadialSquareFillFast(ctx, x, y, width, ratio, fillStyle) {
        if (ratio <= 0)
            return;

        const originalFillStyle = ctx.fillStyle;
        ctx.fillStyle = fillStyle;
        if (ratio >= 1) {
            ctx.fillRect(x, y, width, width);
            ctx.fillStyle = originalFillStyle;
            return;
        }

        ctx.beginPath();
        const halfWidth = width * 0.5;
        const centerX = x + halfWidth;
        const centerY = y + halfWidth;
        const right = x + width;
        const bottom = y + width;
        ctx.moveTo(centerX, centerY); //Start at center
        ctx.lineTo(centerX, y); //Line to top center
        if (ratio <= Zon.Block.HALF_SIDE_PERCENT) {
            //Line to top left
            const topLeftX = x + width * (0.5 - ratio * Zon.Block.INV_SIDE_PERCENT);
            ctx.lineTo(topLeftX, y);
        }
        else {
            ctx.lineTo(x, y); //Line to top left
            let remainingRatio = ratio - Zon.Block.HALF_SIDE_PERCENT;
            if (remainingRatio <= Zon.Block.SIDE_PERCENT) {
                //Line to botom left
                const botomLeftY = y + width * (remainingRatio * Zon.Block.INV_SIDE_PERCENT);
                ctx.lineTo(x, botomLeftY);
            }
            else {
                ctx.lineTo(x, bottom); //Line to botom left
                remainingRatio -= Zon.Block.SIDE_PERCENT;
                if (remainingRatio <= Zon.Block.SIDE_PERCENT) {
                    //Line to botom right
                    const botomRightX = x + width * (remainingRatio * Zon.Block.INV_SIDE_PERCENT);
                    ctx.lineTo(botomRightX, bottom);
                }
                else {
                    ctx.lineTo(right, bottom); //Line to botom right
                    remainingRatio -= Zon.Block.SIDE_PERCENT;
                    if (remainingRatio <= Zon.Block.SIDE_PERCENT) {
                        //Line to top right
                        const topRightY = y + width * (1 - remainingRatio * Zon.Block.INV_SIDE_PERCENT);
                        ctx.lineTo(right, topRightY);
                    }
                    else {
                        ctx.lineTo(right, y); //Line to top right
                        remainingRatio -= Zon.Block.SIDE_PERCENT;
                        const lastX = x + width * (1 - remainingRatio * Zon.Block.INV_SIDE_PERCENT);
                        ctx.lineTo(lastX, y);//Line to center-right
                    }
                }
            }
        }

        ctx.lineTo(centerX, centerY); //Line back to center
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = originalFillStyle;
    }

    hit = (damage, source) => {
        const damageReceived = this.health.damage(damage, source);
        if (Zon.blocksManager.blockDamagedFadeTimeSetting.value > 0 && damageReceived.isPositive) {
            this.hitColorTimer = 1;
        }
            
        return damageReceived;
    }
}