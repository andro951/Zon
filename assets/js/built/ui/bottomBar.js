"use strict";

Zon.UI.BottomBar = class BottomBar extends Zon.UI.UIElementDiv {
    constructor() {
        super('bottomBar', Zon.UI.UIElementZID.BOTTOM_BUTTONS, Zon.device);
        //this.element.style.backgroundColor = Struct.Color.fromUInt(0xFF0000FF).cssString;
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
            () => this._addButton('abilitiesButton', Zon.UI.abilityUIState.toggle, 'TargetIcon'),
            () => this._addButton('slottedAbilitiesButton', Zon.UI.slottedAbilitiesUIState.toggle, 'CombatIcon'),
            () => this._addButton('coreButton', Zon.UI.coreUIState.toggle, 'CoreIcon'),
            () => this._addButton('craftingButton', Zon.UI.craftingUIState.toggle, 'CraftingIcon'),
            () => this._addButton('upgradesButton', Zon.UI.upgradesUIState.toggle, 'UpgradeIcon'),
            () => this._addButton('navigationButton', Zon.UI.navigationUIState.toggle, 'NavigationIcon'),
        ];

        for (const createButtonFunction of this.createButtonFunctions) {
            createButtonFunction();
        }
    }
    _addButton(name, onClick, iconName, options = {}) {
        const spacing = 2;
        const count = this.createButtonFunctions.length;
        options.topFunc ??= () => spacing;
        options.widthFunc ??= new Variable.DependentFunction(() => (Zon.bottomUI.bottomBar.width - this.childrenPadding.value * (count + 1)) / count, { this: this });
        options.heightFunc ??= () => Zon.bottomUI.bottomBar.height - 2 * spacing;
        const button = this.addIconButton(name, onClick, iconName, options);
        return button;
    }
}