"use strict";

Zon.UI.SideBarButton = class SideBarButton extends Zon.UI.UIElementDiv {
    constructor(parent) {
        super('sideBarButton', Zon.UI.UIElementZID.MAIN_UI, parent);
        this.element.style.cursor = 'pointer';

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
    }
    postConstructor() {
        super.postConstructor();

        this.element.addOnClick(this.onClick);
        Zon.UI.sideBar.shown.onChangedAction.add(this.updateIcon);
    }
    setup() {
        super.setup();

        this.replaceLeft(() => Zon.topUI.width - this.width - 4, this);
        this.replaceTop(() => 5);
        this.replaceWidth(() => Zon.device.width * 0.1);
        this.replaceHeight(() => Zon.topUI.height * 0.25);

        this.element.setBackgroundImage(Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.UI_PANELS, 'buttonSquare_grey_pressed_NoRips'));
        this.showIconPath = Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.ICONS, 'SideBarShowIcon');
        this.hideIconPath = Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.ICONS, 'SideBarHideIcon');
        this.updateIcon();
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
        this.makeScrollableColumn();
    }
    setup() {
        super.setup();

        this.replaceLeft(() => Zon.device.width - this.width);
        this.replaceTop(() => Zon.topUI.sideBarButton.height + 10);
        this.replaceWidth(() => Zon.device.width * 0.12);
        this.replaceHeight(() => Zon.bottomUI.top - this.top - 10);

        //Stage Select Button
        this._addButton('stageSelectButton', Zon.UI.stageUIState.show, 'StageIcon');

        //Music Button
        this._addButton('musicButton', Zon.UI.musicUIState.show, 'MusicIcon', {
            leftFunc: () => Zon.device.width * 0.01 - 5 * Zon.musicManager.currentSongSmoothedAmplitude.value,
            widthFunc: () => Zon.device.width * 0.1 + 10 * Zon.musicManager.currentSongSmoothedAmplitude.value
        });

        //Pause Button
        const pauseButton = this._addButton('sideBarPauseButton', Zon.musicManager.playButtonPressed, Zon.UI.MusicUIState.MusicControls.pauseButtonDefaultIcon);
        Zon.musicManager.linkPauseButton(pauseButton);

        //Delete All Music Button
        this._addButton('sideBarDeleteAllMusicButton', Zon.musicManager.deleteAllSongs, 'CloseIcon');
    }
    _addButton(name, onClick, iconName, options = {}) {
        options.leftFunc ??= () => Zon.device.width * 0.01;
        options.widthFunc ??= () => Zon.device.width * 0.1;
        options.heightFunc ??= () => Zon.topUI.height * 0.25;
        return this.addIconButton(name, onClick, iconName, options);
    }
}

Zon.UI.sideBar = Zon.UI.SideBar.create();