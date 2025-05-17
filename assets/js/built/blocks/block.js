"use strict";

Zon.Block = class extends Struct.Rectangle {
    constructor(width, height, blocksManager, left, top, index, health, color) {
        super(left, top, width, height);
        this.blocksManager = blocksManager;
        this.index = index;
        this.health = new Zon.Health(health, this);
        this.color = color;
        this.isWeakPoint = false;
        this.canvas = document.getElementById('combatAreaCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    kill = () => {
        this.blocksManager.onKilled(this);
        this.destroy();
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
        this.ctx.fillStyle = this.color.toCSSString;//TODO: use an acton to update this instead of doing every frame.
        this.ctx.fillRect(this.left, this.top, this.width, this.height);
    }
}