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
    }
    updateCombatLayout(newLayout) {
        if (this.visible)
            this.removeTopListener();

        switch (newLayout) {
            case Zon.settings.combatLayoutDefault:
            case Zon.settings.combatLayoutBottom:
                this.replaceTop(new Variable.Dependent(() => Zon.device.top, Zon.device._top));
                break;
            case Zon.settings.combatLayoutCenter:
                this.replaceTop(new Variable.Dependent(() => Zon.combatUI.top - Zon.topUI.height, Zon.combatUI._top, this._height));
                break;
            default:
                throw new Error(`Unknown combat layout: ${newLayout}`);
        }

        if (this.visible)
            this.addTopListener();

        if (this.leftIsDefault()) {
            if (this.visible)
                this.removeLeftListener();

            this.replaceLeft(new Variable.Dependent(() => Zon.device.left, Zon.device._left));
            if (this.visible)
                this.addLeftListener();
        }

        if (this.widthIsDefault()) {
            if (this.visible)
                this.removeWidthListener();

            this.replaceWidth(new Variable.Dependent(() => Zon.device.width, Zon.device._width));
            if (this.visible)
                this.addWidthListener();
        }

        if (this.heightIsDefault()) {
            if (this.visible)
                this.removeHeightListener();

            this.replaceHeight(new Variable.Dependent(() => Math.min(Zon.device.height * Zon.topUI.topUIPercentOfHeight, Zon.device.width / Zon.topUI.topUIAspectRatio), Zon.device._width, Zon.device._height));
            if (this.visible)
                this.addHeightListener();
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
    
    updateCombatLayout(newLayout) {
        if (this.visible)
            this.removeTopListener();

        switch (newLayout) {
            case Zon.settings.combatLayoutDefault:
            case Zon.settings.combatLayoutCenter:
                this.replaceTop(new Variable.Dependent(() => Zon.device.top + (Zon.device.height - Zon.device.width) / 2, Zon.device._top, Zon.device._width, Zon.device._height));
                break;
            case Zon.settings.combatLayoutBottom:
                this.replaceTop(new Variable.Dependent(() => Zon.bottomUI.top - Zon.combatUI.height, Zon.bottomUI._top, this._height));
                break;
        }

        if (this.visible)
            this.addTopListener();

        if (this.leftIsDefault()) {
            if (this.visible)
                this.removeLeftListener();

            this.replaceLeft(new Variable.Dependent(() => Zon.device.left, Zon.device._left));
            if (this.visible)
                this.addLeftListener();
        }

        if (this.widthIsDefault()) {
            if (this.visible)
                this.removeWidthListener();

            this.replaceWidth(new Variable.Dependent(() => Zon.device.width, Zon.device._width));
            if (this.visible)
                this.addWidthListener();
        }

        if (this.heightIsDefault()) {
            if (this.visible)
                this.removeHeightListener();

            this.replaceHeight(new Variable.Dependent(() => Zon.device.width / Zon.combatUI.combatUIAspectRatio, Zon.device._width));
            if (this.visible)
                this.addHeightListener();
        }
    }

    clearCanvas() {
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

    updateCombatLayout(newLayout) {
        if (this.visible)
            this.removeTopListener();

        switch (newLayout) {
            case Zon.settings.combatLayoutDefault:
            case Zon.settings.combatLayoutBottom:
                this.replaceTop(new Variable.Dependent(() => Zon.device.bottom - Zon.bottomUI.height, Zon.device._bottom , this._height));
                break;
            case Zon.settings.combatLayoutCenter:
                this.replaceTop(new Variable.Dependent(() => Zon.combatUI.bottom, Zon.combatUI._bottom));
                break;
        }

        if (this.visible)
            this.addTopListener();

        if (this.leftIsDefault()) {
            if (this.visible)
                this.removeLeftListener();

            this.replaceLeft(new Variable.Dependent(() => Zon.device.left, Zon.device._left));
            if (this.visible)
                this.addLeftListener();
        }

        if (this.widthIsDefault()) {
            if (this.visible)
                this.removeWidthListener();

            this.replaceWidth(new Variable.Dependent(() => Zon.device.width, Zon.device._width));
            if (this.visible)
                this.addWidthListener();
        }

        if (this.heightIsDefault()) {
            if (this.visible)
                this.removeHeightListener();

            this.replaceHeight(new Variable.Dependent(() => Math.min(Zon.device.height * this.bottomUIPercentOfHeight, Zon.device.width / this.bottomUIAspectRatio), Zon.device._width, Zon.device._height));
            if (this.visible)
                this.addHeightListener();
        }
    }
}
Zon.bottomUI = new Zon.BottomUI();