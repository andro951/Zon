"use strict";

Zon.BasicAttack = class BasicAttack extends Zon.Ability {
    constructor() {
        super();
        this.range = 100; // Default range
    }

    onLeftClick = (clickPos) => {
        const blocks = Zon.blocksManager.getBlocksCircle(clickPos, this.range);
    }
}

Zon.basicAttack = new Zon.BasicAttack();