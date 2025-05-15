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
                this.top = this.top.copyData(new DataTypes.DependentVariable(() => Zon.device.top.value, Zon.device.top));
                break;
            case Zon.settings.combatLayoutCenter:
                this.top = this.top.copyData(new DataTypes.DependentVariable(() => Zon.combatUI.top.value - Zon.topUI.height.value, Zon.combatUI.top, this.height));
                break;
            default:
                throw new Error(`Unknown combat layout: ${newLayout}`);
        }

        if (this.visible)
            this.addTopListener();

        if (this.left.constructor === DataTypes.VariableBase) {
            if (this.visible)
                this.removeLeftListener();

            this.left = this.left.copyData(new DataTypes.DependentVariable(() => Zon.device.left.value, Zon.device.left));
            if (this.visible)
                this.addLeftListener();
        }

        if (this.width.constructor === DataTypes.VariableBase) {
            if (this.visible)
                this.removeWidthListener();

            this.width = this.width.copyData(new DataTypes.DependentVariable(() => Zon.device.width.value, Zon.device.width));
            if (this.visible)
                this.addWidthListener();
        }

        if (this.height.constructor === DataTypes.VariableBase) {
            if (this.visible)
                this.removeHeightListener();

            this.height = this.height.copyData(new DataTypes.DependentVariable(() => Math.min(Zon.device.height.value * Zon.topUI.topUIPercentOfHeight, Zon.device.width.value / Zon.topUI.topUIAspectRatio), Zon.device.width, Zon.device.height));
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
                this.top = this.top.copyData(new DataTypes.DependentVariable(() => Zon.device.top.value + (Zon.device.height.value - Zon.device.width.value) / 2, Zon.device.top, Zon.device.width, Zon.device.height));
                break;
            case Zon.settings.combatLayoutBottom:
                this.top = this.top.copyData(new DataTypes.DependentVariable(() => Zon.bottomUI.top.value - Zon.combatUI.height.value, Zon.bottomUI.top, this.height));
                break;
        }

        if (this.visible)
            this.addTopListener();
        
        if (this.left.constructor === DataTypes.VariableBase) {
            if (this.visible)
                this.removeLeftListener();

            this.left = this.left.copyData(new DataTypes.DependentVariable(() => Zon.device.left.value, Zon.device.left));
            if (this.visible)
                this.addLeftListener();
        }

        if (this.width.constructor === DataTypes.VariableBase) {
            if (this.visible)
                this.removeWidthListener();

            this.width = this.width.copyData(new DataTypes.DependentVariable(() => Zon.device.width.value, Zon.device.width));
            if (this.visible)
                this.addWidthListener();
        }

        if (this.height.constructor === DataTypes.VariableBase) {
            if (this.visible)
                this.removeHeightListener();

            this.height = this.height.copyData(new DataTypes.DependentVariable(() => Zon.device.width.value / Zon.combatUI.combatUIAspectRatio, Zon.device.width));
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
                this.top = this.top.copyData(new DataTypes.DependentVariable(() => {
                    return Zon.device.bottom.value - Zon.bottomUI.height.value;
                }, Zon.device.bottom , this.height));
                break;
            case Zon.settings.combatLayoutCenter:
                this.top = this.top.copyData(new DataTypes.DependentVariable(() => Zon.combatUI.bottom.value, Zon.combatUI.bottom));
                break;
        }

        if (this.visible)
            this.addTopListener();

        if (this.left.constructor === DataTypes.VariableBase) {
            if (this.visible)
                this.removeLeftListener();

            this.left = this.left.copyData(new DataTypes.DependentVariable(() => Zon.device.left.value, Zon.device.left));
            if (this.visible)
                this.addLeftListener();
        }

        if (this.width.constructor === DataTypes.VariableBase) {
            if (this.visible)
                this.removeWidthListener();

            this.width = this.width.copyData(new DataTypes.DependentVariable(() => Zon.device.width.value, Zon.device.width));
            if (this.visible)
                this.addWidthListener();
        }

        if (this.height.constructor === DataTypes.VariableBase) {
            if (this.visible)
                this.removeHeightListener();

            this.height = this.height.copyData(new DataTypes.DependentVariable(() => Math.min(Zon.device.height.value * this.bottomUIPercentOfHeight, Zon.device.width.value / this.bottomUIAspectRatio), Zon.device.width, Zon.device.height));
            if (this.visible)
                this.addHeightListener();
        }
    }
}
Zon.bottomUI = new Zon.BottomUI();