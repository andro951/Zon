"use strict";

Zon.updateCombatLayout = () => {
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
Zon.showCombatUI = () => {
    Zon.topUI.show();
    Zon.combatUI.show();
    Zon.bottomUI.show();
}

Zon.hideCombatUI = () => {
    Zon.topUI.hide();
    Zon.combatUI.hide();
    Zon.bottomUI.hide();
}

Zon.TopUI = class extends Zon.UIPanel {
    constructor() {
        super(document.getElementById('topUI'));
        this.topUIPercentOfHeight = 0.2;
        this.topUIAspectRatio = 3;
    }

    setup = () => {
        this.replaceLeft(() => Zon.device.left);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Math.min(Zon.device.height * this.topUIPercentOfHeight, Zon.device.width / this.topUIAspectRatio));
        this.updateCombatLayout(Zon.settings.combatLayout.value);
    }

    updateCombatLayout = (newLayout) => {
        switch (newLayout) {
            case Zon.settings.combatLayoutDefault:
            case Zon.settings.combatLayoutBottom:
                this.calculateTop = () => Zon.device.top;
                this.replaceTop(this.calculateTop);
                break;
            case Zon.settings.combatLayoutCenter:
                this.calculateTop = () => Zon.combatUI.top - this.height;
                this.replaceTop(this.calculateTop);
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
    }

    setup = () => {
        this.replaceLeft(() => Zon.device.left);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Zon.device.width / Zon.combatUI.combatUIAspectRatio);
        this.updateCombatLayout(Zon.settings.combatLayout.value);
    }
    
    updateCombatLayout = (newLayout) => {
        switch (newLayout) {
            case Zon.settings.combatLayoutDefault:
            case Zon.settings.combatLayoutCenter:
                this.replaceTop(() => Zon.device.top + (Zon.device.height - Zon.device.width) / 2);
                break;
            case Zon.settings.combatLayoutBottom:
                this.replaceTop(() => Zon.bottomUI.top - Zon.combatUI.height);
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
    }

    setup = () => {
        this.replaceLeft(() => Zon.device.left);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Math.min(Zon.device.height * this.bottomUIPercentOfHeight, Zon.device.width / this.bottomUIAspectRatio));
        this.updateCombatLayout(Zon.settings.combatLayout.value);
    }

    updateCombatLayout = (newLayout) => {
        switch (newLayout) {
            case Zon.settings.combatLayoutDefault:
            case Zon.settings.combatLayoutBottom:
                this.replaceTop(() => Zon.device.bottom - Zon.bottomUI.height);
                break;
            case Zon.settings.combatLayoutCenter:
                this.replaceTop(() => Zon.combatUI.bottom);
                break;
        }
    }
}
Zon.bottomUI = new Zon.BottomUI();