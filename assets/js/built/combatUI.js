"use strict";

Zon.TopUI = class extends Zon.UIPanel {
    constructor() {
        super();
        this.element = document.getElementById('topUI');
        this.topUIPercentOfHeight = 0.2;
        this.topUIAspectRatio = 3;
    }
    resize() {
        this.element.style.width = `${Zon.device.width}px`;
        this.element.style.height = `${Math.min(Zon.device.height * this.topUIPercentOfHeight, Zon.device.width / this.topUIAspectRatio)}px`;
        this.element.style.position = "absolute";
        this.element.style.left = `${Zon.device.left}px`;
        this.element.style.top = `${Zon.device.top}px`;
    }
}
Zon.topUI = new Zon.TopUI();

Zon.CombatUI = class extends Zon.UIPanel {
    constructor() {
        super();
        this.element = document.getElementById('combatAreaUI');
        this.combatAreaPercentOfHeight = 0.6;
    }

    resize() {
        this.element.style.width = `${Zon.device.width}px`;
        this.element.style.height = `${Zon.device.width}px`;
        this.element.style.position = "absolute";
        this.element.style.left = `${Zon.device.left}px`;
        this.element.style.top = `${Zon.device.top + (Zon.device.height - Zon.device.width) / 2}px`;
    }
}
Zon.combatUI = new Zon.CombatUI();

Zon.BottomUI = class extends Zon.UIPanel {
    constructor() {
        super();
        this.element = document.getElementById('bottomUI');
        this.bottomUIPercentOfHeight = 0.2;
        this.bottomUIAspectRatio = 3;
    }
    resize() {
        this.element.style.width = `${Zon.device.width}px`;
        const bottomUIHeight = Math.min(Zon.device.height * this.bottomUIPercentOfHeight, Zon.device.width / this.bottomUIAspectRatio);
        this.element.style.height = `${bottomUIHeight}px`;
        this.element.style.position = "absolute";
        this.element.style.left = `${Zon.device.left}px`;
        this.element.style.top = `${Zon.device.bottom - bottomUIHeight}px`;
    }
}
Zon.bottomUI = new Zon.BottomUI();