"use strict";

Zon.UI.SlottedAbilitiesUIState = class extends Zon.UI.UIElementDiv {
    constructor() {
        super('slottedAbilitiesUI', Zon.UI.UIElementZID.SIDE_BAR);
        this.animation = new Zon.UI.SlideAnimationHorizontal(this, false);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0xFF0000FF).cssString;
        this.makeScrollableColumn(false);
    }
    setup() {
        super.setup();

        this.replaceLeft(() => Zon.bottomUI.bottomBar.left + Zon.bottomUI.bottomBar.width - this.width);
        this.replaceTop(() => Zon.bottomUI.bottomBar.top);
        this.replaceWidth(() => Zon.bottomUI.bottomBar.width * 2/3);
        this.replaceHeight(() => Zon.bottomUI.bottomBar.height);
    }
}

Zon.UI.slottedAbilitiesUIState = Zon.UI.SlottedAbilitiesUIState.create();