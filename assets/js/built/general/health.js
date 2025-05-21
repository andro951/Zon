"use strict";

Zon.Health = class {
    onHPChanged = new Actions.Action();
    onDamaged = new Actions.Action();
    onHealed = new Actions.Action();
    onHPZero = new Actions.Action();
    onHPFull = new Actions.Action();
    onMaxHPChanged = new Actions.Action();

    constructor(maxHP, owner) {
        this._maxHP = maxHP;
        this.owner = owner;
        this._hp = maxHP;
    }

    get enemy() {
        return this.owner.enemy;
    }
    get maxHP() {
        return this._maxHP;
    }
    get hp() {
        return this._hp;
    }
    get percentFull() {
        return this._hp.Divide(this._maxHP).ToNumber();
    }

    damage = (damage, source, overKill = false) => {
        if (damage.isZero)
            return Numbers.Triple.ZERO;

        if (damage.isNegative) {
            return -this.heal(-damage, source);
        }

        let damageReceived;
        if (overKill) {
            damageReceived = damage;
        }
        else {
            damageReceived = Numbers.Triple.min(damage, this._hp);
        }

        if (damageReceived.isZero)
            return Numbers.Triple.ZERO;

        this._hp.subtract(damageReceived);
        this.onHPChanged.call(this.hp, -damageReceived, source);
        this.onDamaged.call(this.hp, damageReceived, source);
        if (!this.hp.isPositive)
            this.onHPZero.call(source);

        return damageReceived;
    }

    heal = (heal, source, overHeal = false) => {
        if (heal.isZero)
            return Numbers.Triple.ZERO;

        if (heal.isNegative) {
            return -this.damage(-heal, source);
        }

        let healingReceived;
        if (overHeal) {
            healingReceived = heal;
        }
        else {
            healingReceived = Numbers.Triple.min(heal, this.maxHP.subtract(this.hp));
        }

        if (healingReceived.isZero)
            return Numbers.Triple.ZERO;

        this._hp.add(healingReceived);
        this.onHPChanged.call(this.hp, healingReceived, source);
        this.onHealed.call(this.hp, healingReceived, source);
        if (this.hp.equals(this.maxHP))
            this.onHPFull.call(this.hp, source);

        return healingReceived;
    }

    setHealth = (health) => {
        this._hp = health;
    }

    setMaxHP = (newMaxHP, source) => {
        let old = this._maxHP;
        this._maxHP = newMaxHP;
        let diff = this._maxHP.subtract(old);
        if (diff.isPositive) {
            this.heal(diff, source);
        }
        else {
            if (!this._maxHP.isPositive) {
                this.damage(this.hp, source);
            }
            else {
                if (this.hp.greaterThan(this._maxHP)) {
                    this.damage(this.hp.subtract(this.maxHP), source);
                }
            }
        }

        this.onMaxHPChanged.call(this.maxHP, old, source);
    }

    setMaxHPNoEffects = (newMaxHP) => {
        let old = newMaxHP;
        this._maxHP = newMaxHP;
        let diff = newMaxHP.subtract(old);
        if (diff.isPositive) {
            this._hp.add(diff);
        }
        else {
            if (!this._maxHP.isPositive) {
                this._hp = Numbers.Triple.ZERO;
            }
            else {
                if (this.hp.greaterThan(this._maxHP)) {
                    this._hp = this._maxHP;
                }
            }
        }
    }
}