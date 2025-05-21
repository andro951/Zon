"use strict";

const Zon = {};
Zon.Setup = {};
const Struct = {};
const Extensions = {};
const Numbers = {};
const Trig = {};
const Algebra = {};

Zon.name = "Zon";

Zon.debug = true;

// Zon.init = function() {
//     Zon.game = new this.Game();
//     Zon.timeController = new Zon.TimeController();
//     Zon.Setup.setup();
//     Zon.showCombatUI();
//     Zon.game.start();
// }

Zon.init = async function() {
    await Zon.Setup.setup();
    Zon.showCombatUI();
    Zon.game.start();
}