"use strict";

Zon.UI.MusicUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('musicUI', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }

    postConstructor() {
        super.postConstructor();

        this.fileInput = Zon.UI.MusicUIState.MusicFileInput.create(this);
        this.musicControls = Zon.UI.MusicUIState.MusicControls.create(this);
        this.songButtons = Zon.UI.MusicUIState.SongButtonsList.create(this);

    }
    static MusicFileInput = class MusicFileInput extends Zon.UI.UIElementDiv {
        constructor(parent) {
            super('musicFileInput', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, parent);
            this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;

            this.element.style.justifyContent = 'center';
            this.element.style.alignItems = 'center';
            this.fileInput = document.createElement('input');
            this.fileInput.type = 'file';
            this.fileInput.accept = 'audio/*';
            this.fileInput.style.width = 'auto';
            this.fileInput.style.height = 'auto';

            this.fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    Zon.musicManager.onUploadMusicFile(file);
                }
            });

            this.element.appendChild(this.fileInput);
        }
        setup() {
            super.setup();

            // console.log(`this.element.style.width: ${this.element.style.width}`);
            // console.log(`this.element.style.height: ${this.element.style.height}`);
            this.replaceLeft(() => 0);
            this.replaceTop(() => 4);
            this.replaceWidth(() => Zon.device.width * 0.9);
            this.replaceHeight(() => 20);
        }
    }
    static MusicControls = class MusicControls extends Zon.UI.UIElementDiv {
        constructor(parent) {
            super('musicControls', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, parent);

            this.makeScrollableRow();
        }
        static pauseButtonDefaultIcon = 'PlayIcon';
        setup() {
            super.setup();

            this.replaceLeft(() => Zon.UI.musicUIState.width * 0.05);
            this.replaceTop(() => Zon.UI.musicUIState.fileInput.bottom + 4);
            this.replaceWidth(() => Zon.UI.musicUIState.width - this.left * 2);
            this.replaceHeight(() => Zon.UI.musicUIState.height * 0.08);

            const pauseButton = this._addButton('pauseButton', Zon.musicManager.playButtonPressed, Zon.UI.MusicUIState.MusicControls.pauseButtonDefaultIcon);
            Zon.musicManager.linkPauseButton(pauseButton);
            this._addButton('nextSongButton', Zon.musicManager.playNextSong, 'NextIcon');

            //const skipButton
        }
        _addButton(name, onClick, iconName, options = {}) {
            options.topFunc ??= () => Zon.UI.musicUIState.musicControls.height * 0.05;
            options.widthFunc ??= () => Zon.UI.musicUIState.musicControls.height * 1.2;
            options.heightFunc ??= () => Zon.UI.musicUIState.musicControls.height * 0.9;
            return this.addIconButton(name, onClick, iconName, options);
        }
    }
    static SongButtonsList = class SongButtonsList extends Zon.UI.UIElementDiv {
        constructor(parent) {
            super(`SongButtonsList`, Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, parent);
            this.buttons = [];
            this.element.style.backgroundColor = Struct.Color.fromUInt(0xFF0000FF).cssString;
            
            this.makeScrollableColumn();
            this.childrenPadding.value = 6;
        }
        setup() {
            super.setup();
            
            this.replaceLeft(() => 0);
            this.replaceTop(() => Zon.UI.musicUIState.musicControls.bottom + 4);
            this.replaceWidth(() => Zon.UI.musicUIState.width);
            this.replaceHeight(() => Zon.UI.musicUIState.height - this.top);
            // console.log(`Zon.UI.musicUIState.fileInput.bottom: ${Zon.UI.musicUIState.fileInput.bottom}`);
            // console.log(`top: ${this.top}`);

            Zon.musicManager._allSongDatas.onChangedAction.add(this.addAllButtons);
            this.addAllButtons();
        }
        _addButton(songName) {
            // console.log(`Zon.UI.musicUIState.fileInput.bottom: ${Zon.UI.musicUIState.fileInput.bottom}`);
            // console.log(`top: ${(topFunct instanceof Variable.DependentFunction) ? topFunct.getValue() : topFunct()}`);
            // console.log(`lastSongButton.height: ${lastSongButton?.height}`);

            return this.addTextButton(`songButton_${songName}`, () => Zon.musicManager.playSongByName(songName), songName, {
                leftFunc: () => Zon.UI.musicUIState.width * 0.1,
                widthFunc: () => Zon.UI.musicUIState.width * 0.8,
                heightFunc: () => Zon.UI.musicUIState.height * 0.1,
            });
        }
        addAllButtons() {
            //console.log(`Adding all song buttons:`, Zon.musicManager._allSongDatas.length);
            this.removeAllChildren();
            const songNames = Zon.musicManager._allSongDatas;
            for (const songData of songNames) {
                this._addButton(songData.name.value);
            }
        }
    }

    postLoadSetup() {
        
    }

    setup = () => {
        super.setup();

        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Zon.device.height * (1 - Zon.UI.CloseButtonUIState.heightScale));
    }
}

Zon.UI.musicUIState = Zon.UI.MusicUIState.create();