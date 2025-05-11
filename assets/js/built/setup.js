"use strict";

const Zon = {}

Zon.name = "Zon";

Zon.init = function() {
    Zon.initGame();
    Zon.topUI.show();
    Zon.combatUI.show();
    Zon.bottomUI.show();
    Zon.game.start();
}