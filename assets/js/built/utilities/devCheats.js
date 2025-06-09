"use strict";

if (zonDebug) {
    Zon.DevCheats = {};

    Zon.DevCheats.preLoadSetup = () => {

    }

    Zon.DevCheats.postLoadSetup = () => {
        
    }

    Zon.DevCheats.onStartGame = () => {
        //Zon.DevCheats.makeBalls();
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

    Zon.DevCheats.runTests = () => {
        Zon.DevCheats.simpleBigNumberConversionTest();
        //BinaryTests.allTests();
        //Zon.DevCheats.runSaveLoadTests();
        //BigNumberTests.Test_BigNumberConversions();
        //NumberTests.Test_CalculateSignificandExponent();
        //Struct.EquationTests.runTests();
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
}