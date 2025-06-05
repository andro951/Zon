"use strict";

Zon.UI.SideBarButton = class SideBarButton extends Zon.UI.UIElementDiv {
    constructor(parent) {
        super('sideBarButton', Zon.UI.UIElementZID.MAIN_UI, parent);
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
        this.element.addOnClick(this.onClick);
        Zon.UI.sideBar.shown.onChangedAction.add(this.updateIcon);
    }
    setup = () => {
        this.replaceLeft(() => Zon.topUI.width - this.width - 4, this);
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

        this.element.setBackgroundImage(Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.UI_PANELS, 'buttonSquare_grey_pressed_NoRips'));
        this.showIconPath = Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.ICONS, 'SideBarShowIcon');
        this.hideIconPath = Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.ICONS, 'SideBarHideIcon');
        this.updateIcon();
        
        super.setup();
    }

    updateIcon = () => {
        this.icon.setBackgroundImage(Zon.UI.sideBar.shown.value ? this.hideIconPath : this.showIconPath);
    }

    onClick = () => {
        Zon.UI.sideBar.toggle();
    }
}

Zon.UI.SideBar = class SideBar extends Zon.UI.UIElementDiv {
    constructor() {
        super('sideBar', Zon.UI.UIElementZID.SIDE_BAR);
        this.animation = new Zon.UI.SlideAnimationHorizontal(this, false);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x101010FF).cssString;
        this.element.makeScrollableColumn();
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
        this.replaceLeft(() => Zon.device.width - this.width);
        this.replaceTop(() => Zon.topUI.sideBarButton.height + 10);
        this.replaceWidth(() => Zon.device.width * 0.12);
        this.replaceHeight(() => Zon.bottomUI.top - this.top - 10);

        this._addIconButton('stageSelectButton', Zon.stageUIState.show, 'StageIcon');
        //this._addIconButton('stageSelectButton2', () => console.log("Clicked Stage Select2"), 'StageIcon');

        super.setup();
    }

    _addIconButton(buttonName, onClick, iconName) {
        const iconPath = Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.ICONS, iconName);
        this._addButton(buttonName, onClick, iconPath);
    }
    _addButton(buttonName, onClick, iconPath) {
        const padding = 4;
        const lastChild = this.lastChild;
        const topFunct = lastChild ? () => lastChild.bottom + padding : () => padding;
        const button = Zon.UI.SimpleIconButton.create(buttonName, onClick, iconPath, this, () => Zon.device.width * 0.01, topFunct);
        this.lastChild = button;
    }
}

Zon.UI.sideBar = Zon.UI.SideBar.create();