"use strict";

Zon.UI.MusicUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('musicUI', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }

    static create(...args) {
        const musicUIState = new this(...args);
        musicUIState.bindAll();
        musicUIState.postConstructor();
        return musicUIState;
    }

    postConstructor() {
        super.postConstructor();

        this.fileInput = Zon.UI.MusicUIState.MusicFileInput.create(this);

        this.songButtons = Zon.UI.MusicUIState.SongButtonsList.create(this);

    }
    static MusicFileInput = class MusicFileInput extends Zon.UI.UIElementDiv {
        constructor(parent) {
            super('musicFileInput', Zon.UI.UIElementZID.SIDE_BAR, parent);
            this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
        }

        static create(...args) {
            const musicFileInput = new this(...args);
            musicFileInput.bindAll();
            musicFileInput.postConstructor();
            return musicFileInput;
        }
        postConstructor() {
            super.postConstructor();
            this.fileInput = document.createElement('input');
            this.fileInput.type = 'file';
            this.fileInput.accept = 'audio/*';

            this.fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    Zon.musicManager.onUploadMusicFile(file);
                }
            });

            this.element.appendChild(this.fileInput);
        }
        setup() {
            this.replaceLeft(() => 0);
            this.replaceTop(() => 0);
            this.replaceWidth(() => 100);
            this.replaceHeight(() => 100);

            super.setup();
        }
    }
    static SongButtonsList = class SongButtonsList extends Zon.UI.UIElementDiv {
        constructor(parent) {
            super(`SongButtonsList`, Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, parent);
            this.buttons = [];
        }
        static create(...args) {
            const songButtonsList = new this(...args);
            songButtonsList.bindAll();
            songButtonsList.postConstructor();
            return songButtonsList;
        }
        postConstructor() {
            super.postConstructor();
            
            this.element.makeScrollableColumn();
        }
        setup() {
            this.replaceLeft(() => 0);
            this.replaceTop(() => Zon.UI.musicUIState.fileInput.bottom + 4);
            this.replaceWidth(() => Zon.UI.musicUIState.width);
            this.replaceHeight(() => Zon.UI.musicUIState.height * 0.8);

            this.addAllButtons();

            super.setup();
        }
        removeAllButtons() {
            this.buttons.forEach(button => this.element.removeChild(button.element));
            this.buttons = [];
        }
        addAllButtons() {
            this.removeAllButtons();
            // const zeroButton = Zon.UI.SimpleTextButton.create('zeroButton', () => Zon.musicManager.playSongByName(`REZZ & X1-Y2 - ZERO (Audio).mp3`), 'Play Zero', this,
            //     () => Zon.UI.musicUIState.width * 0.1,
            //     () => Zon.UI.musicUIState.fileInput.bottom + 4,
            //     () => Zon.UI.musicUIState.width * 0.8,
            //     () => Zon.UI.musicUIState.height * 0.1
            // );
        }
    }

    postLoadSetup() {
        
    }

    setup = () => {
        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Zon.device.height * (1 - Zon.UI.CloseButtonUIState.heightScale));

        super.setup();
    }
}

Zon.UI.musicUIState = Zon.UI.MusicUIState.create();