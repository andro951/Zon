"use strict";

const Zon = {};
Zon.Setup = {};
const Struct = {};
const Extensions = {};
const Numbers = {};
const Trig = {};
const Algebra = {};

Zon.name = "Zon";

if (zonDebug) {
    console.log("Zon Debugging Enabled");
}

Zon.init = async function() {
    await Zon.Setup.setupAndStartGame();
    Zon.GameManager.start();
}