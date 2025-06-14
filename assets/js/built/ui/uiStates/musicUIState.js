"use strict";

Zon.UI.MusicUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('musicUI', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
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
    static SongButtonsList = class SongButtonsList extends Zon.UI.UIElementDiv {
        constructor(parent) {
            super(`SongButtonsList`, Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, parent);
            this.buttons = [];
            this.element.style.backgroundColor = Struct.Color.fromUInt(0xFF0000FF).cssString;
            
            this.element.makeScrollableColumn(this);
        }
        postConstructor() {
            super.postConstructor();
            
            // const button = document.createElement('div');
            // button.textContent = 'Shrink Me';
            // //button.style.position = 'absolute';
            // //button.style.left = '100px';
            // //button.style.top = '100px';
            // button.style.width = '40px'; // Small width
            // button.style.height = '40px';
            // button.style.whiteSpace = 'nowrap';
            // //button.style.overflow = 'hidden';
            // //button.style.padding = '5px';
            // //button.style.border = '1px solid black';
            // button.style.fontSize = '20px'; // Start large
            // button.style.lineHeight = '1';
            // //button.style.fontFamily = 'sans-serif';
            // //button.style.boxSizing = 'border-box';

            // this.element.appendChild(button);

            // // Shrink to fit logic with layout delay
            // function shrinkToFit(btn) {
            //     //requestAnimationFrame(() => {
            //         let fontSize = parseFloat(btn.style.fontSize);
            //         const minFontSize = 5;

            //         while (btn.scrollWidth > btn.clientWidth && fontSize > minFontSize) {
            //             fontSize -= 1;
            //             btn.style.fontSize = fontSize + 'px';
            //         }
            //     //});
            // }

            // shrinkToFit(button);

            // this.shown.onChangedAction.add(() => shrinkToFit(button));
        }
        setup() {
            super.setup();
            
            this.replaceLeft(() => 0);
            this.replaceTop(() => Zon.UI.musicUIState.fileInput.bottom + 4);
            this.replaceWidth(() => Zon.UI.musicUIState.width);
            this.replaceHeight(() => Zon.UI.musicUIState.height * 0.8);
            // console.log(`Zon.UI.musicUIState.fileInput.bottom: ${Zon.UI.musicUIState.fileInput.bottom}`);
            // console.log(`top: ${this.top}`);

            Zon.musicManager.songNames.onChangedAction.add(this.addAllButtons);
            this.addAllButtons();
        }
        removeAllButtons() {
            this.buttons.forEach(button => this.element.removeChild(button.element));
            this.buttons = [];
            this.lastSongButton = undefined;
        }
        _makeButton(songName) {
            const padding = 6;
            const lastSongButton = this.lastSongButton;
            const topFunct = lastSongButton ? new Variable.DependentFunction(() => lastSongButton.bottom + padding, { lastSongButton }) : () => padding;
            // console.log(`Zon.UI.musicUIState.fileInput.bottom: ${Zon.UI.musicUIState.fileInput.bottom}`);
            // console.log(`top: ${(topFunct instanceof Variable.DependentFunction) ? topFunct.getValue() : topFunct()}`);
            // console.log(`lastSongButton.height: ${lastSongButton?.height}`);
            const button = Zon.UI.SimpleTextButton.create(
                `songButton_${songName}`,
                () => Zon.musicManager.playSongByName(songName),
                songName,
                this,
                () => Zon.UI.musicUIState.width * 0.1,
                topFunct,
                () => Zon.UI.musicUIState.width * 0.8,
                () => Zon.UI.musicUIState.height * 0.1
            );
            this.lastSongButton = button;
            this.buttons.push(button);
            return button;
        }
        addAllButtons() {
            console.log(`Adding all song buttons:`, Zon.musicManager.songNames.length);
            this.removeAllButtons();
            const songNames = Zon.musicManager.songNames;
            for (const songName of songNames) {
                this._makeButton(songName);
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