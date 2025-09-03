"use strict";

Zon.BasicAttack = class BasicAttack extends Zon.Ability {
    constructor() {
        super();
        this.range = 200;
        this.baseDamage = Struct.BigNumber.create(10);
    }

    onLeftClick = (clickPos) => {
        const blocks = Zon.blocksManager.getBlocksCircle(clickPos, this.range);
        this._damageBasedOnDistanceSimple(blocks, clickPos, this.range);
    }
    _damageBasedOnDistanceSimple = (blocks, clickPos, range) => {
        const minDamageDistance = this.range + Zon.blocksManager._blockSize.x * Math.sqrt(2) / 2 + Number.EPSILON;
        for (const block of blocks) {
            const distance = block.center.distance(clickPos);
            if (distance <= range) {
                const distanceMult = 1 - distance / minDamageDistance;
                if (distanceMult <= 0)
                    throw new Error(`distanceMult is less than or equal to 0: ${distanceMult}`);

                const damage = this.baseDamage.multiply(Struct.BigNumber.create(distanceMult));
                block.hit(damage, this, distanceMult);
            }
        }
    }
}

Zon.basicAttack = new Zon.BasicAttack();