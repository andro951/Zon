"use strict";

const Zon = {};
Zon.Setup = {};
const Struct = {};
const Extensions = {};
const Trig = {};
const Algebra = {};
Zon.UI = {};
const Enum = {};
Zon.Util = {};

Zon.name = "Zon";

document.body.style.overflowX = 'hidden';
document.body.style.overflowY = 'hidden';

if (zonDebug) {
    console.log("Zon Debugging Enabled");
}

Zon.init = async function() {
    Zon.Setup.setupAndStartGame();
}