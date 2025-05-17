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
for (let i = 0; i < 10; i++) {
    Zon.balls.push(new Zon.Ball((i + 1) * 50, Zon.combatUI.element.height - 50, new Vectors.Polar(25, (Math.random() * 2 + 1) * Math.PI / 4)));//1 PI / 4 to 3 PI / 4
}

function test4() {
    Zon.LevelData.preSetLoadedValuesSetup();
    test4Inner();
}

async function test4Inner() {
    await Zon.LevelData.allStageImagesLoadedPromise;
    const levelData = new Zon.LevelData(Zon.StageID.MONSTERS_WILD_CREATURES, 1);
    //const levelDataToString = levelData.toString;
    //console.log(levelDataToString());
    //console.log(`${levelData}`);
    const blocksManager = new Zon.BlocksManager();
    blocksManager.setLevelData(levelData);
    blocksManager.setupLevel();
    Zon.game.lateUpdate.add(blocksManager.update);
    Zon.game.lateDraw.add(blocksManager.draw);
}

test4();

