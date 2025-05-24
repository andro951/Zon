"use strict";

Zon.BallManager = {};

Zon.BallManager.ballsMap = new Map();
Zon.BallManager.balls = [];
Zon.BallManager.ballsArea = new Struct.Rectangle(0, 0, 0, 0);

Zon.BallManager.preLoadSetup = () => {
    Zon.game.onLevelReadyActions.add(Zon.BallManager.onLevelReady);
    Zon.Setup.preSetLoadedValuesSetupActions.add(Zon.BallManager.preSetLoadedValuesSetup);
}

Zon.BallManager.preSetLoadedValuesSetup = () => {
    const padding = 40;
    const height = Zon.blocksManager.blockArea.height / 16 - padding * 2;
    Zon.BallManager.ballsArea = new Struct.Rectangle(
        Zon.blocksManager.blockArea.left + padding,
        Zon.blocksManager.blockArea.bottom + height + padding,
        Zon.blocksManager.blockArea.width - padding * 2,
        height
    );
}

Zon.Setup.preSetLoadedValuesSetupActions.add(Zon.BallManager.preLoadSetup);

Zon.BallManager.getDefaultUpwardAngle = () => {
    return (Math.random() * 2 + 1) * Math.PI / 4;
}

Zon.BallManager.createBall = (ballID, x = null, y = null, speed = null, angleRadians = null) => {
    if (x === null) {
        x = Zon.BallManager.ballsArea.left + Zon.BallManager.ballsArea.width / 2;
    }

    if (y === null) {
        y = Zon.BallManager.ballsArea.top + Zon.BallManager.ballsArea.height / 2;
    }

    if (angleRadians === null) {
        angleRadians = Zon.BallManager.getDefaultUpwardAngle();
    }

    let ball;
    switch (ballID) {
        case Zon.BallID.BASIC:
            ball = new Zon.Ball(x, y, speed, angleRadians);
            break;
        default:
            console.error("Ball ID not found: " + ballID);
            return null;
    }

    let set = Zon.BallManager.ballsMap.get(ballID);
    if (!set) {
        set = new Set();
        Zon.BallManager.ballsMap.set(ballID, set);
    }

    set.add(ball);
    Zon.BallManager.balls.push(ball);
    return ball;
}

Zon.BallManager.ballsInStartingLocation = false;

Zon.BallManager.onLevelReady = (levelData) => {
    Zon.BallManager.moveAllBallsToStartingLocation();
}

Zon.BallManager.moveAllBallsToStartingLocation = () => {
    if (Zon.BallManager.ballsInStartingLocation)
        return;

    for (const ball of Zon.BallManager.balls) {
        const x = Zon.BallManager.ballsArea.left + Math.random() * Zon.BallManager.ballsArea.width;
        const y = Zon.BallManager.ballsArea.top + Math.random() * Zon.BallManager.ballsArea.height;
        ball.x = x;
        ball.y = y;
        ball.velocity = Vectors.Vector.fromPolar(ball.speed, Zon.BallManager.getDefaultUpwardAngle());
    }

    Zon.BallManager.ballsInStartingLocation = true;
}

Zon.BallManager.onBallCollisionWithNonHealthObject = (ball) => {
    Zon.focus.onBallCollisionWithNonHealthObject(ball);
}

Zon.BallManager.updateBallPositions = () => {
    if (!Zon.focus.inUse)
        return;

    for (const ball of Zon.BallManager.balls) {
        ball.updateBallLastPosition();
    }
}

Zon.BallManager.update = () => {
    Zon.BallManager.ballsInStartingLocation = false;
    for (const ball of Zon.BallManager.balls) {
        ball.update();
        if (Zon.BallManager.ballsInStartingLocation)
            break;
    }
}

Zon.BallManager.draw = () => {
    for (const ball of Zon.BallManager.balls) {
        ball.draw();
    }
}

Zon.BallManager.checkBallCount = (ballID, count) => {
    if (count < 0) {
        console.error(`Invalid count: ${count}. Count must be greater than or equal to 0.`);
        return;
    }

    const set = Zon.BallManager.ballsMap.get(ballID);
    if (!set)
        return;

    const amountToDelete = set.size - count;
    if (amountToDelete <= 0)
        return;

    let remainingToDelete = amountToDelete;
    for (let i = Zon.BallManager.balls.length - 1; i >= 0; i--) {
        const ball = Zon.BallManager.balls[i];
        if (!ball) {
            console.error(`Ball ${i} is null in checkBallCount.`);
            continue;
        }

        if (ball.id === ballID) {
            Zon.BallManager.balls.swapPop(i);
            set.delete(ball);
            remainingToDelete--;
            if (remainingToDelete <= 0)
                break;
        }
    }

    if (remainingToDelete > 0)
        console.error(`Not enough balls to delete. Expected ${amountToDelete}, but only found ${amountToDelete - remainingToDelete}.`);
}

Zon.BallID = {
    BASIC: 0,
    COUNT: 1,
    NONE: 2,
};