"use strict";

if (zonDebug) {
    Zon.DevCheats = {};

    Zon.DevCheats.preLoadSetup = () => {

    }

    Zon.DevCheats.postLoadSetup = () => {
        
    }

    Zon.DevCheats.onStartGame = () => {
        //Zon.DevCheats.makeBalls();
        Zon.DevCheats.registerKeybindings();
        Zon.DevCheats.runTests();
    }

    Zon.DevCheats.makeBalls = () => {
        const speed = 12;

        const ballData = [
            [ Zon.BallID.BASIC, 35, Zon.combatUI.element.height - 35, speed, (Math.random() * 2 + 1) * Math.PI / 4 ],
            [ Zon.BallID.BASIC, 35, 35, speed, (Math.random() * 2 + 1) * Math.PI / 4 ],
            [ Zon.BallID.BASIC, Zon.combatUI.element.width - 35, Zon.combatUI.element.height - 35, speed, (Math.random() * 2 + 1) * Math.PI / 4 ],
            [ Zon.BallID.BASIC, Zon.combatUI.element.width - 35, 35, speed, (Math.random() * 2 + 1) * Math.PI / 4 ],
        ];

        for (let i = 0; i < 10; i++) {
            ballData.push([Zon.BallID.BASIC, null, null, speed, null]);
        }

        for (let i = 0; i < ballData.length; i++) {
            const data = ballData[i];
            Zon.BallManager.createBall(...data);
        }
    }

    Zon.DevCheats.registerKeybindings = () => {
        Zon.Keybindings.registerKeyPress(`1`, Zon.DevCheats.killAllBlocks);
        Zon.Keybindings.registerKeyPress(`2`, () => {
            Zon.topUI.levelBar._fitText();
        });
    }

    Zon.DevCheats.killAllBlocks = () => {
        for (const block of Zon.blocksManager.blocks) {
            block.kill();
        }

        console.log(`All blocks killed.`);
    }

    Zon.DevCheats.runTests = () => {
        Zon.DevCheats.simpleBigNumberConversionTest();
        //BinaryTests.allTests();
        //Zon.DevCheats.runSaveLoadTests();
        //BigNumberTests.Test_BigNumberConversions();
        //NumberTests.Test_CalculateSignificandExponent();
        //Struct.EquationTests.runTests();
        //Zon.DevCheats.runCircleGetBlockTests();
    }

    Zon.DevCheats.simpleBigNumberConversionTest = () => {
        const string = `2.5e5`;
        const bigNumberFromString = Struct.BigNumber.parse(string);
        const numberFromString = parseFloat(string);
        if (bigNumberFromString.toNumber() !== numberFromString) {
            console.error(`BigNumber conversion failed: ${bigNumberFromString} !== ${numberFromString}`);
        }

        const bigNumber = Struct.BigNumber.fromBase10Exp(2.5, 5);
        const number = 2.5e5;
        if (bigNumber.toNumber() !== number) {
            console.error(`BigNumber creation failed: ${bigNumber} !== ${number}`);
        }

        //console.log(`Completed simple BigNumber conversion test.`);
    }

    Zon.DevCheats.runSaveLoadTests = () => {
        Zon.IOManager.saveSettingsAsync(0);
        Zon.IOManager.saveSettingsAsync(1);
        Zon.IOManager.saveSettingsImmediate(1);
    }

    Zon.DevCheats.runCircleGetBlockTests = () => {
        const tests = [
            { x: 0, y: 0, radius: 100 },                          // Origin, normal radius
            { x: 256.34, y: 684.23, radius: 86.7 },               // Random float values
            { x: -50, y: -50, radius: 30 },                       // Negative coordinates
            { x: 9999, y: 9999, radius: 150 },                    // Very large coordinates
            { x: 320.5, y: 240.5, radius: 0 },                    // Zero radius
            { x: 320.5, y: 240.5, radius: 0.001 },                // Tiny radius
            { x: 500, y: 500, radius: 99999 },                    // Huge radius
            { x: 100, y: 100, radius: -50 },                      // Negative radius
            { x: 1e6, y: 1e6, radius: 500 },                      // Scientific notation
            { x: 128.5, y: 64.25, radius: 32.75 },                // Mid-range decimal values
            { x: 0, y: 0, radius: Infinity },                     // Infinite radius
            { x: 128, y: 128, radius: Number.EPSILON },           // Smallest float difference
            { x: 0.1, y: 0.1, radius: 1 },                        // Small positive values
        ];

        for (const test of tests) {
            const { x, y, radius } = test;
            const blocks = Zon.blocksManager.getBlocksCircle(test, radius);
            console.log(`Blocks in circle at (${x}, ${y}) with radius ${radius}:`, blocks);
        }
    }
}