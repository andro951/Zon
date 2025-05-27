"use strict";

const Zon = {};
Zon.Setup = {};
const Struct = {};
const Extensions = {};
const Numbers = {};
const Trig = {};
const Algebra = {};
Zon.UI = {};
const Enum = {};

Zon.name = "Zon";

if (zonDebug) {
    console.log("Zon Debugging Enabled");
}

Zon.init = async function() {
    Zon.Setup.setupAndStartGame();
}