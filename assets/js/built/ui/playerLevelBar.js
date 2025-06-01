"use strict";

Zon.UI.PlayerLevelBar = class PlayerLevelBar extends Zon.UI.UIElementDiv {
    constructor(parent) {
        super('playerLevelBar', Zon.UI.UIElementZID.MAIN_UI, parent);
        // Style outer container
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x060606FF).cssString;
        this.element.style.border = "2px solid #888";
        this.element.style.overflow = "hidden";
        this.element.style.color = "white";
        this.element.style.fontFamily = "Bruno Ace SC";
        this.element.style.textAlign = "center";
        this.element.style.lineHeight = "100%";
        this._display = "flex";
        this.element.style.alignItems = "center";
        this.element.style.justifyContent = "center";
        this.element.setBorder(1, "black");

        // Fill element
        this.fill = document.createElement("div");
        this.fill.style.position = "absolute";
        this.fill.style.left = "0";
        this.fill.style.top = "0";
        this.fill.style.height = "100%";
        this.fill.style.backgroundColor = Struct.Color.fromUInt(0x52E36AFF).cssString;
        this.fill.style.zIndex = "0";
        this.fill.style.width = "0%";
        this.element.appendChild(this.fill);

        // Text overlay
        this.label = document.createElement("div");
        this.label.style.position = "relative";
        this.label.style.zIndex = "1";
        this.label.innerText = "Level 1";
        this.element.appendChild(this.label);

        Zon.playerLevel.level.addOnChangedDrawAction(this._updateText);
        Zon.playerLevel.progressToNextLevel.addOnChangedDrawAction(this._updateFill);
    }

    _updateText = () => {
        this.label.innerText = `Level ${Zon.playerLevel.level.value}`;
    }

    _updateFill = () => {
        const pct = Math.max(0, Math.min(1, Zon.playerLevel.progressToNextLevel.value));
        this.fill.style.width = `${pct * 100}%`;
    }

    setup = () => {
        const widthPercent = 0.3;
        this.replaceLeft(() => Zon.topUI.width * (1 - widthPercent) * 0.5);
        this.replaceTop(() => 5);
        this.replaceWidth(() => Zon.topUI.width * widthPercent);
        this.replaceHeight(() => Zon.topUI.height * 0.2);

        this._updateText();
        this._updateFill();
        super.setup();
    }
}