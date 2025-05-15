"use strict";

Zon.Block = class {
    constructor(width, height, blocksManager, position, index, health, color) {
        this.width = width;
        this.height = height;
        this.blocksManager = blocksManager;
        this.position = position;
        this.index = index;
        this.health = new Zon.Health(health, this);
        this.color = color;
        this.isWeakPoint = false;
        this.canvas = document.getElementById('combatAreaCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    kill() {
        this.blocksManager.onKilled(this);
    }

    setWeakPoint() {
        this.isWeakPoint = true;
    }

    resetWeakPoint() {
        this.isWeakPoint = false;
    }

    update() {

    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

Zon.block = new Zon.Block(20, 20, null, new Vectors.Vector(100, 100), 0, 10, 'red');