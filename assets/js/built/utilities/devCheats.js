"use strict";

Zon.DevCheats = {};

Zon.DevCheats.preLoadSetup = () => {

}

Zon.DevCheats.postLoadSetup = () => {
    
}

Zon.DevCheats.onStartGame = () => {
    Zon.DevCheats.makeBalls();
    Zon.DevCheats.runTests();
}

Zon.DevCheats.makeBalls = () => {
    const speed = 25;
    Zon.balls = [];
    for (let i = 0; i < 10; i++) {
        Zon.balls.push(new Zon.Ball((i + 1) * 50, Zon.combatUI.element.height - 50, new Vectors.Polar(speed, (Math.random() * 2 + 1) * Math.PI / 4)));//1 PI / 4 to 3 PI / 4
    }

    const ballData = [
        [ 35, Zon.combatUI.element.height - 35, new Vectors.Polar(speed, (Math.random() * 2 + 1) * Math.PI / 4) ],
        [ 35, 35, new Vectors.Polar(speed, (Math.random() * 2 + 1) * Math.PI / 4) ],
        [ Zon.combatUI.element.width - 35, Zon.combatUI.element.height - 35, new Vectors.Polar(speed, (Math.random() * 2 + 1) * Math.PI / 4) ],
        [ Zon.combatUI.element.width - 35, 35, new Vectors.Polar(speed, (Math.random() * 2 + 1) * Math.PI / 4) ],
    ];

    for (let i = 0; i < ballData.length; i++) {
        const data = ballData[i];
        const ball = new Zon.Ball(data[0], data[1], data[2]);
        Zon.balls.push(ball);
    }
}

Zon.DevCheats.runTests = () => {
    
}