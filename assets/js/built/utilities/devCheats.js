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
        Zon.Keybindings.registerKeyPress(`3`, () => {
            Zon.DevCheats.onPress3();
        });
    }

    Zon.DevCheats.killAllBlocks = () => {
        for (const block of Zon.blocksManager.blocks) {
            block.kill();
        }

        console.log(`All blocks killed.`);
    }

    Zon.DevCheats.onPress3 = () => {
        // const logUISizes = (ui) => {
        //     const element = ui.element;
        //     const style = element.style;
        //     console.log(`${element.id} - left: ${style.left}, top: ${style.top}, width: ${style.width}, height: ${style.height}.`);
        //     console.log(`${element.id} - _value; left: ${ui._left._value}, top: ${ui._top._value}, width: ${ui._width._value}, height: ${ui._height._value}.`);
        //     console.log(`${element.id} - value; left: ${ui.left}, top: ${ui.top}, width: ${ui.width}, height: ${ui.height}.`);
        //     console.log(`element.style.display: ${ui.element.style.display}`);
        // }

        // logUISizes(Zon.device);
        // logUISizes(Zon.topUI);
        // logUISizes(Zon.combatUI);
        // logUISizes(Zon.bottomUI);
        // console.log("Window size:", window.innerWidth, window.innerHeight);



        // console.log(`${Zon.UI.scriptsUIState.element.style.backgroundColor}`);
        // console.log(`${Zon.UI.scriptsUIState.useableSpace.element.style.backgroundColor}`);
        // console.log(`${Zon.UI.scriptsUIState.useableSpace.scriptPanelsList.element.style.backgroundColor}`);
        // const scriptPanel = Zon.UI.scriptsUIState.useableSpace.scriptPanelsList.children[0];
        // console.log(`${scriptPanel.element.style.backgroundColor}`);
        // console.log(`${scriptPanel.scriptTitle.element.style.backgroundColor}`);


        
        //Zon.UI.UIElementBase.testingLineSpacing();

        // const popup = Zon.UI.Popup.allPopups.values().next().value;
        // const textPanel = popup.popupPanel.popupText;
        // console.log(`textPanel width, height: ${textPanel.width}, ${textPanel.height}`);



        // const textFunc = new Variable.DependentFunction(() =>
        //     `Test Text`
        //     , {  });
        // Zon.UI.InfoPopup.makePopup('Test Info Popup', textFunc, Zon.device);


        ZonScript.runEquivalentNumericBenchmark();
    }

    Zon.DevCheats.runTests = () => {
        //Zon.DevCheats.simpleBigNumberConversionTest();
        //BinaryTests.allTests();
        //Zon.DevCheats.runSaveLoadTests();
        //BigNumberTests.Test_BigNumberConversions();
        //NumberTests.Test_CalculateSignificandExponent();
        //Struct.EquationTests.runTests();
        //Zon.DevCheats.runCircleGetBlockTests();
        Zon.combatCore.isUnlocked.value = true;//Unlock combat core for testing
        
        if (ZonScript.runOldTestScripts)
            ZonScript.test();

        Collision.Tests.runTests();
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