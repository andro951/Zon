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

    postLoadSetup() {
        
    }

    setup = () => {
        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Zon.device.height * (1 - Zon.UI.CloseButtonUIState.heightScale));

        const zeroButton = Zon.UI.SimpleTextButton.create('zeroButton', () => console.log(`Play Zero`), 'Play Zero', this,
            () => Zon.UI.musicUIState.width * 0.1,
            () => Zon.UI.musicUIState.fileInput.bottom + 4,
            () => Zon.UI.musicUIState.width * 0.8,
            () => Zon.UI.musicUIState.height * 0.1
        );

        super.setup();
    }
}

Zon.UI.musicUIState = Zon.UI.MusicUIState.create();