"use strict";

Zon.UI.SideBarButton = class SideBarButton extends Zon.UI.UIElementDiv {
    constructor(parent) {
        super('sideBarButton', Zon.UI.UIElementZID.MAIN_UI + 1, parent);
        this.element.style.cursor = 'pointer';
    }
    static create(...args) {
        const sideBarButton = new this(...args);
        sideBarButton.bindAll();
        sideBarButton.postConstructor();
        return sideBarButton;
    }
    postConstructor() {
        super.postConstructor();
        this.element.addEventListener('click', this.onClick);
        Zon.UI.sideBar.shown.onChangedAction.add(this.updateIcon);
    }
    setup = () => {
        this.replaceLeft(() => Zon.topUI.width - this.width - 10);
        this.replaceTop(() => 5);
        this.replaceWidth(() => Zon.device.width * 0.1);
        this.replaceHeight(() => Zon.topUI.height * 0.25);

        const icon = document.createElement('div');
        this.icon = icon;
        this.icon.style.position = 'absolute';
        icon.style.top = '50%';
        icon.style.left = '50%';
        icon.style.transform = 'translate(-50%, -50%)';
        icon.style.width = '50%';
        icon.style.height = '50%';
        icon.style.pointerEvents = 'none';

        this.element.appendChild(icon);

        this.element.setBackgroundImage('buttonSquare_grey_pressed_NoRips');
        this.updateIcon();
        
        super.setup();
    }

    updateIcon = () => {
        this.icon.setBackgroundImage(Zon.UI.sideBar.shown.value ? 'SideBarHideIcon' : 'SideBarShowIcon');
    }

    onClick = () => {
        Zon.UI.sideBar.toggle();
    }
}

Zon.UI.SideBar = class SideBar extends Zon.UI.UIStateDiv {
    constructor() {
        super('sideBar', (uiState) => new Zon.UI.SlideAnimationHorizontal(uiState, false), Zon.UI.UIElementZID.SIDE_BAR);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x101010FF).cssString;
    }
    static create(...args) {
        const sideBar = new this(...args);
        sideBar.bindAll();
        sideBar.postConstructor();
        return sideBar;
    }
    postConstructor() {
        super.postConstructor();
    }
    setup() {
        this.replaceLeft(() => Zon.device.width - this.width, this);
        this.replaceTop(() => Zon.topUI.sideBarButton.height + 10);
        this.replaceWidth(() => Zon.device.width * 0.2);
        this.replaceHeight(() => Zon.bottomUI.top - this.top - 10);

        super.setup();
    }
}

Zon.UI.sideBar = Zon.UI.SideBar.create();