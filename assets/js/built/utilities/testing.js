"use strict";

// function test() {
//     for (let i = 1; i < 100; i++) {
//         const log = i.bitLength();
//         const log2 = Math.ceil(Math.log2(i + 1));
//         if (log !== log2) {
//             console.error(`bitLength(${i}) = ${log}, expected ${log2}`);
//         }
//         else {
//             console.log(`bitLength(${i}) = ${log}`);
//         }
//     }
// }

// test();

// function test2() {
//     for (let i = 1n; i < 100n; i++) {
//         const log = i.bitLength();
//         const log2 = Math.ceil(Math.log2(Number(i) + 1));
//         if (log !== log2) {
//             console.error(`bitLength(${i}) = ${log}, expected ${log2}`);
//         }
//         else {
//             console.log(`bitLength(${i}) = ${log}`);
//         }
//     }
// }

// test2();


// function test3() {
//     const max = 0x0001FFFFFFFFFFFFF;
//     const maxShift = 0x0001FFFFFFFFFFFFF >>> 0;
//     console.log(`max: ${max}, maxShift: ${maxShift}`);
// }

// test3();

Zon.balls = [];
// for (let i = 0; i < 1; i++) {
//     Zon.balls.push(new Zon.Ball((i + 1) * 50, Zon.combatUI.element.height - 50, new Vectors.Polar(25, (Math.random() * 2 + 1) * Math.PI / 4)));//1 PI / 4 to 3 PI / 4
// }

const ballData = [
    [ 35, Zon.combatUI.element.height - 35, new Vectors.Polar(25, (Math.random() * 2 + 1) * Math.PI / 4) ],
    [ 35, 35, new Vectors.Polar(25, (Math.random() * 2 + 1) * Math.PI / 4) ],
    [ Zon.combatUI.element.width - 35, Zon.combatUI.element.height - 35, new Vectors.Polar(25, (Math.random() * 2 + 1) * Math.PI / 4) ],
    [ Zon.combatUI.element.width - 35, 35, new Vectors.Polar(25, (Math.random() * 2 + 1) * Math.PI / 4) ],
];

for (let i = 0; i < ballData.length; i++) {
    const data = ballData[i];
    const ball = new Zon.Ball(data[0], data[1], data[2]);
    Zon.balls.push(ball);
}

// function test4() {
//     Zon.LevelData.preSetLoadedValuesSetup();
//     test4Inner();
// }

// async function test4Inner() {
//     await Zon.LevelData.allStageImagesLoadedPromise;
//     const levelData = new Zon.LevelData(Zon.StageID.MONSTERS_WILD_CREATURES, 1);
//     //const levelDataToString = levelData.toString;
//     //console.log(levelDataToString());
//     //console.log(`${levelData}`);
//     const blocksManager = new Zon.BlocksManager();
//     blocksManager.setLevelData(levelData);
//     blocksManager.setupLevel();
//     Zon.game.lateUpdate.add(blocksManager.update);
//     Zon.game.lateDraw.add(blocksManager.draw);
// }

// test4();

// function testReflect() {
//     const Vector = Vectors.Vector; // Assuming your Vector class is here

//     function approxEqual(v1, v2, epsilon = 1e-10) {
//         return Math.abs(v1.x - v2.x) < epsilon && Math.abs(v1.y - v2.y) < epsilon;
//     }

//     // Helper to generate diagonal vectors with +/- signs for 2,3 magnitudes
//     function generateVectors(magnitudes) {
//         const signs = [1, -1];
//         const vectors = [];
//         for (const xSign of signs) {
//             for (const ySign of signs) {
//                 for (const mag of magnitudes) {
//                     vectors.push(new Vector(xSign * mag, ySign * mag));
//                 }
//             }
//         }
//         return vectors;
//     }

//     const magnitudes = [2, 3];

//     // Test cases for axis and velocity with magnitudes 2 and 3, all sign combos
//     const velocityVectors = generateVectors(magnitudes);
//     const axisVectors = generateVectors(magnitudes);

//     const tests = [];

//     // Add your original basic tests first
//     tests.push(
//         {
//             v: new Vector(1, 0),
//             axis: new Vector(1, 0).perpendicular,
//             expected: new Vector(-1, 0),
//             desc: "Reflect off vertical right-pointing normal"
//         },
//         {
//             v: new Vector(-1, 0),
//             axis: new Vector(-1, 0).perpendicular,
//             expected: new Vector(1, 0),
//             desc: "Reflect off vertical left-pointing normal"
//         },
//         {
//             v: new Vector(0, 1),
//             axis: new Vector(0, 1).perpendicular,
//             expected: new Vector(0, -1),
//             desc: "Reflect off horizontal down-pointing normal"
//         },
//         {
//             v: new Vector(0, -1),
//             axis: new Vector(0, -1).perpendicular,
//             expected: new Vector(0, 1),
//             desc: "Reflect off horizontal up-pointing normal"
//         },
//         {
//             v: new Vector(1, 1),
//             axis: new Vector(1, 0).perpendicular,
//             expected: new Vector(-1, 1),
//             desc: "Reflect diagonal velocity off vertical normal"
//         },
//         {
//             v: new Vector(1, 1),
//             axis: new Vector(0, 1).perpendicular,
//             expected: new Vector(1, -1),
//             desc: "Reflect diagonal velocity off horizontal normal"
//         }
//     );

//     // Add tests for all combinations of velocity and axis from magnitudes 2, 3
//     velocityVectors.forEach((v, vi) => {
//         axisVectors.forEach((axis, ai) => {
//             // Calculate expected by formula: R = 2 * proj_axis(V) - V
//             // proj_axis(V) = (V ⋅ A / |A|^2) * A
//             const dot = v.x * axis.x + v.y * axis.y;
//             const axisLenSq = axis.x * axis.x + axis.y * axis.y;
//             const k = 2 * (dot / axisLenSq);
//             const expectedX = k * axis.x - v.x;
//             const expectedY = k * axis.y - v.y;
//             const expected = new Vector(expectedX, expectedY);

//             tests.push({
//                 v,
//                 axis,
//                 expected,
//                 desc: `Reflect velocity (${v.x},${v.y}) off axis (${axis.x},${axis.y})`
//             });
//         });
//     });

//     let passed = 0;
//     for (const test of tests) {
//         const result = test.v.reflect(test.axis);
//         if (approxEqual(result, test.expected)) {
//             console.log(`PASS: ${test.desc} => (${result.x}, ${result.y})`);
//             passed++;
//         } else {
//             console.error(`FAIL: ${test.desc}`);
//             console.error(`  Expected: (${test.expected.x}, ${test.expected.y})`);
//             console.error(`  Got:      (${result.x}, ${result.y})`);
//         }
//     }

//     console.log(`Passed ${passed} out of ${tests.length} tests.`);
// }

// testReflect();