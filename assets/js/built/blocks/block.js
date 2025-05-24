"use strict";

Zon.Block = class extends Struct.Rectangle {
    constructor(width, height, blocksManager, left, top, index, health, color) {
        super(left, top, width, height);
        this.blocksManager = blocksManager;
        this.index = index;
        this.health = new Zon.Health(health, this);
        this.health.onHPZero.add(this.kill);
        this.color = color;
        this.isWeakPoint = false;
        this.canvas = document.getElementById('combatAreaCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.hitColorTimer = 0;
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
    }

    hit = (damage, source) => {
        const damageReceived = this.health.damage(damage, source);
        if (damageReceived.isPositive) {
            this.hitColorTimer = 1;
        }
            
        return damageReceived;
    }
}