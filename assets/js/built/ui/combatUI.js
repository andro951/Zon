"use strict";

Zon.updateCombatLayout = () => {
    const combatLayoutSetting = Zon.Settings.getDisplay(Zon.DisplaySettingsID.COMBAT_UI_LAYOUT);
    Zon.topUI.updateCombatLayout(combatLayoutSetting);
    Zon.combatUI.updateCombatLayout(combatLayoutSetting);
    Zon.bottomUI.updateCombatLayout(combatLayoutSetting);
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

Zon.TopUI = class TopUI extends Zon.UI.UIElementDiv {
    constructor() {
        super('topUI', Zon.UI.UIElementZID.MAIN_UI);
        this.topUIPercentOfHeight = 0.2;
        this.topUIAspectRatio = 3;
        this.levelBar = new Zon.UI.PlayerLevelBar(this);
        this.aetherUI = new Zon.UI.AetherUI(this);
    }

    setup = () => {
        this.backGroundColor.uint = 0x060606FF;
        this.replaceLeft(() => Zon.device.left);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Math.min(Zon.device.height * this.topUIPercentOfHeight, Zon.device.width / this.topUIAspectRatio));
        this.updateCombatLayout(Zon.Settings.getDisplay(Zon.DisplaySettingsID.COMBAT_UI_LAYOUT));
        // this.draw();
        // Zon.device.onResize.add(this.draw);

        // const panel = document.createElement('div');
        // panel.id = 'someBasicPanel';
        // panel.style.position = 'absolute';
        // panel.style.left = '0px';
        // panel.style.top = '0px';
        // panel.style.width = '200px';
        // panel.style.height = '150px';
        // panel.style.backgroundColor = 'rgba(30, 30, 30, 1)';
        // panel.style.border = '2px solid white';
        // panel.style.borderRadius = '8px';
        // document.body.appendChild(panel);
        
        //super.setup();
    }

    // draw = () => {
    //     this.clearCanvas();
    //     this.ctx.save();
    //     this.ctx.globalAlpha = 0.5;
    //     Zon.UI.drawNineSliceImage(this.ctx, Zon.allTextures.ui.buttonSquare_grey_pressed_NoRips.img(), 0, 0, this.element.width, this.element.height, 8, 4);
    //     this.ctx.restore();
    //     this.ctx.globalAlpha = 0.2;
    //     this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    //     this.ctx.globalCompositeOperation = 'multiply';
    //     this.ctx.fillRect(0, 0, this.element.width, this.element.height);
    //     this.ctx.restore();
    //     this.drawTechText(1000);
    // }

    // drawTechText = (text) => {
    //     //this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    //     this.ctx.font = "24px Orbitron";
    //     this.ctx.fillStyle = "#00ffff"; // neon cyan
    //     //this.ctx.textAlign = "center";
    //     this.ctx.fillText(text, 24, 24);
    // };

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

Zon.CombatUI = class CombatUI extends Zon.UI.UIElementCanvas {
    constructor() {
        super('combatAreaCanvas', 960, 960, Zon.UI.UIElementZID.COMBAT_UI);
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
}
Zon.combatUI = new Zon.CombatUI();

Zon.BottomUI = class BottomUI extends Zon.UI.UIElementCanvas {
    constructor() {
        super('bottomUI', 960, 420, Zon.UI.UIElementZID.MAIN_UI);
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