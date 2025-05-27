"use strict";

Zon.Block = class extends Struct.Rectangle {
    constructor(width, height, blocksManager, left, top, index, health, color) {
        super(left, top, width, height);
        this.blocksManager = blocksManager;
        this.index = index;
        this.health = new Zon.Health(health, this);// new Zon.Health(health.multiply(Numbers.Triple.create(20n, 0n)), this);
        this.health.onHPZero.add(this.kill);
        this.color = color;
        this.isWeakPoint = false;
        this.canvas = document.getElementById('combatAreaCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.hitColorTimer = 0;
        this.radialFastSetting = Zon.Settings.getVariable(Zon.SettingsID.BLOCK_HEALTH_RADIAL_FAST);
    }

    static hitColor = Struct.Color.fromRGBA(255, 0, 0, 255);
    static hitColorDuration = 2;

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

    update = () => {

    }

    draw = () => {
        if (this.hitColorTimer > 0) {
            this.hitColorTimer -= Zon.timeController.deltaTimeSeconds / Zon.Block.hitColorDuration;
            if (this.hitColorTimer < 0)
                this.hitColorTimer = 0;
        }

        this.ctx.fillStyle = this.hitColorTimer > 0 ? this.color.blend(Zon.Block.hitColor, this.hitColorTimer).cssString : this.color.cssString;//TODO: use an acton to update this instead of doing every frame.
        this.ctx.fillRect(this.left, this.top, this.width, this.height);
        if (this.radialFastSetting.value)
            this.drawRadialRectFill(this.ctx, this.left, this.top, this.width, this.height, this.health.percentFull);
    }

    static SIDE_PERCENT = 0.25;
    static HALF_SIDE_PERCENT = 0.125;
    static INV_SIDE_PERCENT = 4;

    drawRadialRectFill(ctx, x, y, width, height, ratio, fillStyle = 'red') {
        if (ratio <= 0)
            return;

        if (ratio >= 1) {
            ctx.fillStyle = fillStyle;
            ctx.fillRect(x, y, width, height);
            return;
        }

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.beginPath();
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const centerX = x + halfWidth;
        const centerY = y + halfHeight;
        const right = x + width;
        const bottom = y + height;
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
                const botomLeftY = y + height * (remainingRatio * Zon.Block.INV_SIDE_PERCENT);
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
                        const topRightY = y + height * (1 - remainingRatio * Zon.Block.INV_SIDE_PERCENT);
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
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.restore();
    }

    drawRadialSquareFillArc(ctx, x, y, size, ratio, fillStyle = 'red') {
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const radius = size * Math.SQRT2 / 2; // cover entire square corner to corner
        const angle = ratio * 2 * Math.PI;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, size, size);     // clip to square
        ctx.clip();

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + angle, false); // start from top
        ctx.closePath();

        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.restore();
    }


    hit = (damage, source) => {
        const damageReceived = this.health.damage(damage, source);
        if (damageReceived.isPositive) {
            //this.hitColorTimer = 1;
        }
            
        return damageReceived;
    }
}