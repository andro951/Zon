"use strict";

const SpeedTesting = {};

SpeedTesting.collision = function() {
    const runs = 10000000;
    const ball = new Zon.Ball(new Vectors.Vector(0, 0), new Vectors.Vector(5, 10));
    let testData1 = {
        runs: [],
        total: 0,
    }
    for (let t = 0; t < 2; t++) {
        const xCollision = t < 1;
        const start = performance.now();
        for (let i = 0; i < runs; i++) {
            ball.onCollision(xCollision);
        }

        const end = performance.now();
        testData1.runs.push(end - start);
    }

    testData1.total = testData1.runs.reduce((a, b) => a + b, 0);
    
    let testData2 = {
        runs: [],
        total: 0,
    }
    for (let t = 0; t < 2; t++) {
        const xCollision = t < 1;
        const start = performance.now();
        for (let i = 0; i < runs; i++) {
            ball.onCollision2(xCollision);
        }

        const end = performance.now();
        testData2.runs.push(end - start);
    }

    testData2.total = testData2.runs.reduce((a, b) => a + b, 0);

    console.log("Test data 1", testData1);
    console.log("Test data 2", testData2);
}

//SpeedTesting.collision();