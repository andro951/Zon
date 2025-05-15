"use strict";

Zon.Settings = class {
    constructor() {
        this.combatLayoutDefault = 'default';
        this.combatLayoutCenter = 'center';
        this.combatLayoutBottom = 'bottom';
        this.combatLayout = new DataTypes.Variable(this.combatLayoutDefault);
    }
}
Zon.settings = new Zon.Settings();