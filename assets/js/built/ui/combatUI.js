"use strict";

Zon.updateCombatLayout = () => {
    const combatLayoutSetting = Zon.Settings.getDisplay(Zon.DisplaySettingsID.COMBAT_UI_LAYOUT);
    Zon.topUI.updateCombatLayout(combatLayoutSetting);
    Zon.combatUI.updateCombatLayout(combatLayoutSetting);
    Zon.bottomUI.updateCombatLayout(combatLayoutSetting);
    if (Zon.topUI.visible)
        Zon.topUI.updateAllValues();

    if (Zon.combatUI.visible)
        Zon.combatUI.updateAllValues();

    if (Zon.bottomUI.visible)
        Zon.bottomUI.updateAllValues();
}
Zon.Setup.preLoadSetupActions.add(() => 
    Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.COMBAT_UI_LAYOUT).onChangedAction.add(Zon.updateCombatLayout)
);

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
        const canvas = document.createElement('canvas');
        canvas.id = 'topUI';
        document.body.appendChild(canvas);
        super(canvas);
        this.element.width = 960;
        this.element.height = 420;
        this.ctx = this.element.getContext('2d');
        this.topUIPercentOfHeight = 0.2;
        this.topUIAspectRatio = 3;
    }

    setup = () => {
        this.replaceLeft(() => Zon.device.left);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Math.min(Zon.device.height * this.topUIPercentOfHeight, Zon.device.width / this.topUIAspectRatio));
        this.updateCombatLayout(Zon.Settings.getDisplay(Zon.DisplaySettingsID.COMBAT_UI_LAYOUT));
        this.draw();
        Zon.device.onResize.add(this.draw);
    }

    draw = () => {
        this.clearCanvas();
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        Zon.UI.drawNineSliceImage(this.ctx, Zon.allTextures.ui.buttonSquare_grey_pressed_NoRips.img(), 0, 0, this.element.width, this.element.height, 8, 4);
        this.ctx.restore();
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.fillRect(0, 0, this.element.width, this.element.height);
        this.ctx.restore();
        this.drawTechText(1000);
    }

    drawTechText = (text) => {
        //this.ctx.clearRect(0, 0, this.element.width, this.element.height);
        this.ctx.font = "24px Orbitron";
        this.ctx.fillStyle = "#00ffff"; // neon cyan
        //this.ctx.textAlign = "center";
        this.ctx.fillText(text, 24, 24);
    };

    clearCanvas = () => {
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    }

    updateCombatLayout = (newLayout) => {
        switch (newLayout) {
            case Zon.Settings.CombatUILayoutID.DEFAULT:
            case Zon.Settings.CombatUILayoutID.BOTTOM:
                this.calculateTop = () => Zon.device.top;
                this.replaceTop(this.calculateTop);
                break;
            case Zon.Settings.CombatUILayoutID.CENTER:
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
        const canvas = document.createElement('canvas');
        canvas.id = 'combatAreaCanvas';
        document.body.appendChild(canvas);
        super(canvas);
        this.element.width = 960;
        this.element.height = 960;
        this.ctx = this.element.getContext('2d');
        this.combatAreaPercentOfHeight = 0.6;
        this.combatUIAspectRatio = 9 / 9;
    }

    setup = () => {
        this.replaceLeft(() => Zon.device.left);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Zon.device.width / Zon.combatUI.combatUIAspectRatio);
        this.updateCombatLayout(Zon.Settings.getDisplay(Zon.DisplaySettingsID.COMBAT_UI_LAYOUT));
    }
    
    updateCombatLayout = (newLayout) => {
        switch (newLayout) {
            case Zon.Settings.CombatUILayoutID.DEFAULT:
            case Zon.Settings.CombatUILayoutID.CENTER:
                this.replaceTop(() => Zon.device.top + (Zon.device.height - Zon.device.width) / 2);
                break;
            case Zon.Settings.CombatUILayoutID.BOTTOM:
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
        this.updateCombatLayout(Zon.Settings.getDisplay(Zon.DisplaySettingsID.COMBAT_UI_LAYOUT));
    }

    updateCombatLayout = (newLayout) => {
        switch (newLayout) {
            case Zon.Settings.CombatUILayoutID.DEFAULT:
            case Zon.Settings.CombatUILayoutID.BOTTOM:
                this.replaceTop(() => Zon.device.bottom - Zon.bottomUI.height);
                break;
            case Zon.Settings.CombatUILayoutID.CENTER:
                this.replaceTop(() => Zon.combatUI.bottom);
                break;
        }
    }
}
Zon.bottomUI = new Zon.BottomUI();