"use strict";

Zon.updateCombatLayout = () => {
    const combatLayoutSetting = Zon.Settings.getDisplay(Zon.DisplaySettingsID.CombatUILayout);
    Zon.topUI.updateCombatLayout(combatLayoutSetting);
    Zon.combatUI.updateCombatLayout(combatLayoutSetting);
    Zon.bottomUI.updateCombatLayout(combatLayoutSetting);
}
Zon.Setup.preLoadSetupActions.add(() => 
    Zon.Settings.getDisplayVariable(Zon.DisplaySettingsID.CombatUILayout).onChangedAction.add(Zon.updateCombatLayout)
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
    }
    postConstructor() {
        super.postConstructor();

        this.levelBar = Zon.UI.PlayerLevelBar.create(this);
        this.aetherUI = Zon.UI.AetherUI.create(this);
        this.sideBarButton = Zon.UI.SideBarButton.create(this);
    }
    setup() {
        super.setup();
        
        this.backgroundColor.uint = 0x060606FF;
        this.replaceLeft(() => 0);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Math.min(Zon.device.height * this.topUIPercentOfHeight, Zon.device.width / this.topUIAspectRatio));
        this.updateCombatLayout(Zon.Settings.getDisplay(Zon.DisplaySettingsID.CombatUILayout));
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

    updateCombatLayout = (newLayout) => {
        switch (newLayout) {
            case Zon.Settings.CombatUILayoutID.DEFAULT:
            case Zon.Settings.CombatUILayoutID.BOTTOM:
                this.calculateTop = () => 0;
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
Zon.topUI = Zon.TopUI.create();

Zon.CombatUI = class CombatUI extends Zon.UI.UIElementCanvas {
    constructor() {
        super('combatAreaCanvas', 960, 960, Zon.UI.UIElementZID.COMBAT_UI);
        this.combatAreaPercentOfHeight = 0.6;
        this.combatUIAspectRatio = 9 / 9;
    }
    postConstructor() {
        super.postConstructor();

        this.element.addEventListener('pointerdown', (event) => {
            if (Zon.mouseManager.mouseIsDown.value)
                return;

            const rect = this.element.getBoundingClientRect();
            //const clickPos = new Vectors.Vector(event.clientX - rect.left, event.clientY - rect.top);
            const scaleX = this.element.width / rect.width;
            const scaleY = this.element.height / rect.height;
            const clickPos = new Vectors.Vector(
                (event.clientX - rect.left) * scaleX,
                (event.clientY - rect.top) * scaleY
            );
            console.log(`CombatUI clicked at: ${clickPos.x}, ${clickPos.y}`);
            Zon.abilityController.onClickCombatArea(clickPos, event.button);
        });


    }
    setup() {
        super.setup();

        this.replaceLeft(() => 0);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Zon.device.width / Zon.combatUI.combatUIAspectRatio);
        this.updateCombatLayout(Zon.Settings.getDisplay(Zon.DisplaySettingsID.CombatUILayout));
    }
    
    updateCombatLayout = (newLayout) => {
        switch (newLayout) {
            case Zon.Settings.CombatUILayoutID.DEFAULT:
            case Zon.Settings.CombatUILayoutID.CENTER:
                this.replaceTop(() => (Zon.device.height - Zon.device.width) / 2);
                break;
            case Zon.Settings.CombatUILayoutID.BOTTOM:
                this.replaceTop(() => Zon.bottomUI.top - Zon.combatUI.height);
                break;
        }
    }
}
Zon.combatUI = Zon.CombatUI.create();

Zon.BottomUI = class BottomUI extends Zon.UI.UIElementCanvas {
    constructor() {
        super('bottomUI', 960, 420, Zon.UI.UIElementZID.MAIN_UI);
        this.bottomUIPercentOfHeight = 0.2;
        this.bottomUIAspectRatio = 3;
    }
    setup() {
        this.replaceLeft(() => 0);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Math.min(Zon.device.height * this.bottomUIPercentOfHeight, Zon.device.width / this.bottomUIAspectRatio));
        this.updateCombatLayout(Zon.Settings.getDisplay(Zon.DisplaySettingsID.CombatUILayout));
    }

    updateCombatLayout = (newLayout) => {
        switch (newLayout) {
            case Zon.Settings.CombatUILayoutID.DEFAULT:
            case Zon.Settings.CombatUILayoutID.BOTTOM:
                this.replaceTop(() => Zon.device.height - Zon.bottomUI.height);
                break;
            case Zon.Settings.CombatUILayoutID.CENTER:
                this.replaceTop(() => Zon.combatUI.bottom);
                break;
        }
    }
}
Zon.bottomUI = Zon.BottomUI.create();