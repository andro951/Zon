"use strict";

Zon.Focus = class extends Zon.Ability {
    constructor() {
        super();
        this.active = false;
        this.lastPosition = new Vectors.Vector(0, 0);
    }

    inUseUpdate = () => {
        if (!this.active)
            return;

        this.focusBalls();
        //this.lastPosition = FocusObj.transform.position;//TODO
        Zon.BallManager.updateBallPositions();
    }

    onBallCollisionWithNonHealthObject = (ball) => {
        
    }

    focusBalls = () => {
        
    }
}

Zon.focus = new Zon.Focus();