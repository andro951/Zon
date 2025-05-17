"use strict";

Zon.finishAndShowCombatUI = function() {
    Zon.updateCombatLayout();
    Zon.showCombatUI();
}
Zon.updateCombatLayout = function() {
    Zon.topUI.updateCombatLayout(Zon.settings.combatLayout.value);
    Zon.combatUI.updateCombatLayout(Zon.settings.combatLayout.value);
    Zon.bottomUI.updateCombatLayout(Zon.settings.combatLayout.value);
    if (Zon.topUI.visible)
        Zon.topUI.updateAllValues();

    if (Zon.combatUI.visible)
        Zon.combatUI.updateAllValues();

    if (Zon.bottomUI.visible)
        Zon.bottomUI.updateAllValues();
}
Zon.showCombatUI = function() {
    Zon.topUI.show();
    Zon.combatUI.show();
    Zon.bottomUI.show();
}

Zon.TopUI = class extends Zon.UIPanel {
    constructor() {
        super(document.getElementById('topUI'));
        this.topUIPercentOfHeight = 0.2;
        this.topUIAspectRatio = 3;
        this.replaceLeft(this.calculateLeft, Zon.device._left);
        this.replaceWidth(this.calculateWidth, Zon.device._width);
        this.replaceHeight(this.calculateHeight, Zon.device._width, Zon.device._height);
    }
    calculateLeft = () => Zon.device.left;
    calculateWidth = () => Zon.device.width;
    calculateHeight = () => Math.min(Zon.device.height * this.topUIPercentOfHeight, Zon.device.width / this.topUIAspectRatio);
    updateCombatLayout = (newLayout) => {
        switch (newLayout) {
            case Zon.settings.combatLayoutDefault:
            case Zon.settings.combatLayoutBottom:
                this.calculateTop = () => Zon.device.top;
                this.replaceTop(this.calculateTop, Zon.device._top);
                break;
            case Zon.settings.combatLayoutCenter:
                this.calculateTop = () => Zon.combatUI.top - Zon.topUI.height;
                this.replaceTop(() => this.calculateTop, Zon.combatUI._top, this._height);
                break;
            default:
                throw new Error(`Unknown combat layout: ${newLayout}`);
        }


    }
}
Zon.topUI = new Zon.TopUI();

Zon.CombatUI = class extends Zon.UIPanel {
    constructor() {
        super(document.getElementById('combatAreaCanvas'));
        this.ctx = this.element.getContext('2d');
        this.combatAreaPercentOfHeight = 0.6;
        this.combatUIAspectRatio = 9 / 9;
        this.replaceLeft(() => Zon.device.left, Zon.device._left);
        this.replaceWidth(() => Zon.device.width, Zon.device._width);
        this.replaceHeight(() => Zon.device.width / Zon.combatUI.combatUIAspectRatio, Zon.device._width);
    }
    
    updateCombatLayout = (newLayout) => {
        switch (newLayout) {
            case Zon.settings.combatLayoutDefault:
            case Zon.settings.combatLayoutCenter:
                this.replaceTop(() => Zon.device.top + (Zon.device.height - Zon.device.width) / 2, Zon.device._top, Zon.device._width, Zon.device._height);
                break;
            case Zon.settings.combatLayoutBottom:
                this.replaceTop(() => Zon.bottomUI.top - Zon.combatUI.height, Zon.bottomUI._top, this._height);
                break;
        }
    }

    clearCanvas = () => {
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    }
}
Zon.combatUI = new Zon.CombatUI();

Zon.BottomUI = class extends Zon.UIPanel {
    constructor() {
        super(document.getElementById('bottomUI'));
        this.bottomUIPercentOfHeight = 0.2;
        this.bottomUIAspectRatio = 3;
        this.replaceLeft(() => Zon.device.left, Zon.device._left);
        this.replaceWidth(() => Zon.device.width, Zon.device._width);
        this.replaceHeight(() => Math.min(Zon.device.height * this.bottomUIPercentOfHeight, Zon.device.width / this.bottomUIAspectRatio), Zon.device._width, Zon.device._height);
    }

    updateCombatLayout = (newLayout) => {
        switch (newLayout) {
            case Zon.settings.combatLayoutDefault:
            case Zon.settings.combatLayoutBottom:
                this.replaceTop(() => Zon.device.bottom - Zon.bottomUI.height, Zon.device._bottom , this._height);
                break;
            case Zon.settings.combatLayoutCenter:
                this.replaceTop(() => Zon.combatUI.bottom, Zon.combatUI._bottom);
                break;
        }
    }
}
Zon.bottomUI = new Zon.BottomUI();