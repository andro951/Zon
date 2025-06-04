"use strict";

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
    //BinaryTests.allTests();
    //Zon.DevCheats.runSaveLoadTests();
    //BigNumberTests.Test_BigNumberConversions();
    //NumberTests.Test_CalculateSignificandExponent();
}

Zon.DevCheats.runSaveLoadTests = () => {
    Zon.IOManager.saveSettingsAsync(0);
    Zon.IOManager.saveSettingsAsync(1);
    Zon.IOManager.saveSettingsImmediate(1);
}