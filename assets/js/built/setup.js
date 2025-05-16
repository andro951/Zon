"use strict";

const Zon = {}
const Struct = {}

Zon.name = "Zon";

Zon.debug = true;

Zon.init = function() {
    Zon.initGame();
    Zon.finishAndShowCombatUI();
    Zon.game.start();
}