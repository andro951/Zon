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

async function test4() {
    await Zon.LevelData.preSetLoadedValuesSetup();
    console.log(`Zon.LevelData.blockHealthMultiplePerPrestige: ${Zon.LevelData.blockHealthMultiplePerPrestige}`);
    const levelData = new Zon.LevelData(Zon.StageID.MONSTERS_WILD_CREATURES, 1);

    
}

test4();