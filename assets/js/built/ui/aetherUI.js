"use strict";

Zon.UI.AetherUI = class AetherUI extends Zon.UI.UIElementDiv {
    constructor(parent = null) {
        super('aetherUI', Zon.UI.UIElementZID.MAIN_UI, parent);

        //this.element.style.border = "2px solid #888"; // metallic gray
        this.element.style.overflow = "hidden"; // clip the fill inside
        this.element.style.color = "white";
        this.element.style.fontFamily = "Bruno Ace SC";
        //this.element.style.textAlign = "center";
        this.element.style.lineHeight = "100%";
        this.element.style.display = "flex";
        this.element.style.alignItems = "center";
        //this.element.style.justifyContent = "right";
        this.element.setBorder(1, "black");

        this.label = document.createElement("div");
        this.label.style.position = "relative";
        this.label.style.zIndex = "1";
        this.label.textContent = "0";
        this.element.appendChild(this.label);
    }
    postConstructor() {
        super.postConstructor();

        Zon.playerInventory.aether.addOnChangedDrawAction(this._updateText);
    }
    _updateText = () => {
        this.label.textContent = `${Zon.playerInventory.aether.value.toString()}`;
    }

    setup() {
        super.setup();
        
        this.replaceLeft(() => 10);
        this.replaceTop(() => 5);
        this.replaceWidth(() => Zon.topUI.width * 0.3);
        this.replaceHeight(() => Zon.topUI.height * 0.2);

        this._updateText();
    }
}