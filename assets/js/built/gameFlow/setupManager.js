"use strict";

Zon.Setup.postConstructors = new Actions.Action();
Zon.Setup.onSetupUI = new Actions.Action();

Zon.Setup.setup = function() {
    Zon.Setup.postConstructors.call();
    Zon.Setup.onSetupUI.call();
}