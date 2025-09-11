"use strict";

Zon.UI.BottomBar = class BottomBar extends Zon.UI.UIElementDiv {
    constructor() {
        super('bottomBar', Zon.UI.UIElementZID.BOTTOM_BUTTONS, Zon.device);
        //this.element.style.backgroundColor = Struct.Color.fromUInt(0x101010FF).cssString;
        this.element.style.backgroundColor = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
        this.makeScrollableRow(false);
    }
    static heightScale = 0.5;
    setup() {
        super.setup();
        
        this.replaceLeft(() => Zon.bottomUI.left);
        this.replaceTop(() => Zon.bottomUI.top + Zon.bottomUI.height * BottomBar.heightScale);
        this.replaceWidth(() => Zon.bottomUI.width - this.left);
        this.replaceHeight(() => Zon.bottomUI.height - (this.top - Zon.bottomUI.top));

        this.createButtonFunctions = [
            (i) => this._addButton(i, 'abilitiesButton', Zon.UI.abilityUIState.toggle, 'TargetIcon'),
            (i) => this._addButton(i, 'slottedAbilitiesButton', () => console.log("Slotted Abilities button pressed"), 'CombatIcon'),
            (i) => this._addButton(i, 'coreButton', Zon.UI.coreUIState.toggle, 'CoreIcon'),
            (i) => this._addButton(i, 'craftingButton', () => console.log("Crafting button pressed"), 'CraftingIcon'),
            (i) => this._addButton(i, 'upgradesButton', () => console.log("Upgrades button pressed"), 'UpgradeIcon'),
            (i) => this._addButton(i, 'navigationButton', () => console.log("Navigation button pressed"), 'NavigationIcon'),
        ];

        //this.children = Variable.createArray();
        let i = 0;
        for (const createButtonFunction of this.createButtonFunctions) {
            createButtonFunction(i++);
        }

        // //Stage Select Button
        // this._addButton('stageSelectButton', Zon.UI.stageUIState.show, 'StageIcon');

        // //Music Button
        // this._addButton('musicButton', Zon.UI.musicUIState.show, 'MusicIcon', {
        //     leftFunc: () => Zon.device.width * 0.01 - 5 * Zon.musicManager.currentSongSmoothedAmplitude.value,
        //     widthFunc: () => Zon.device.width * 0.1 + 10 * Zon.musicManager.currentSongSmoothedAmplitude.value
        // });

        // //Pause Button
        // const pauseButton = this._addButton('sideBarPauseButton', Zon.musicManager.playButtonPressed, Zon.UI.MusicUIState.MusicControls.pauseButtonDefaultIcon);
        // Zon.musicManager.linkPauseButton(pauseButton);

        // //Delete All Music Button
        // this._addButton('sideBarDeleteAllMusicButton', Zon.musicManager.deleteAllSongs, 'CloseIcon');

        // //Testing UI button
        // this._addButton('testingButton', Zon.UI.testingUIState.show, 'UpgradeIcon');

        // //Mic Test Button
        // this._addButton('micTestButton', Zon.UI.micTestUIState.show, 'InfoIcon');
    }
    _addButton(i, name, onClick, iconName, options = {}) {
        const index = i;
        const spacing = 2;
        const count = this.createButtonFunctions.length;
        options.leftFunc ??= () => index * (Zon.bottomUI.bottomBar.width / count) + spacing;
        options.topFunc ??= () => spacing;
        options.widthFunc ??= () => Zon.bottomUI.bottomBar.width / count - 2 * spacing;
        options.heightFunc ??= () => Zon.bottomUI.bottomBar.height - 2 * spacing;
        //onClick = () => console.log(name + ' button clicked');
        const button = this.addIconButton(name, onClick, iconName, options);
        return button;
    }
}