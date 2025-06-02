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
        this._display = "flex";
        this.element.style.alignItems = "center";
        //this.element.style.justifyContent = "right";
        this.element.setBorder(1, "black");

        this.label = document.createElement("div");
        this.label.style.position = "relative";
        this.label.style.zIndex = "1";
        this.label.innerText = "0";
        this.element.appendChild(this.label);
    }
    static create(...args) {
        const aetherUI = new this(...args);
        aetherUI.bindAll();
        aetherUI.postConstructor();
        return aetherUI;
    }
    postConstructor() {
        super.postConstructor();
        Zon.playerInventory.aether.addOnChangedDrawAction(this._updateText);
    }
    _updateText = () => {
        this.label.innerText = `${Zon.playerInventory.aether.value.toString()}`;
    }

    setup() {
        this.replaceLeft(() => 10);
        this.replaceTop(() => 5);
        this.replaceWidth(() => Zon.topUI.width * 0.3);
        this.replaceHeight(() => Zon.topUI.height * 0.2);

        this._updateText();
        super.setup();
    }
}