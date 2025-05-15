"use strict";

const Zon = {}

Zon.name = "Zon";

Zon.debug = true;

Zon.init = function() {
    Zon.initGame();
    Zon.finishAndShowCombatUI();
    Zon.game.start();
}