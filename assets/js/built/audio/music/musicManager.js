"use strict";

Zon.audioContext = new (window.AudioContext || window.webkitAudioContext)();

Zon.MusicManager = class MusicManager {
    constructor() {
        this.songBeingPlayedBufferSource = null;
        this.songBeingPlayedArrayBuffer = null;
        this.storedMusicFileArrayBuffer = null;
        this.currentSongSmoothedAmplitude = new Variable.Value(0, `CurrentSongSmoothedAmplitude`);
        this.analyser = Zon.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.fftSize);
    }

    onUploadMusicFile = (file) => {
        this.decode(file, (decodedBuffer) => {
            this.storeBuffer(decodedBuffer);
            this.playStoredSong();
        });
    }
    async decode(file, afterAction) {
        const arrayBuffer = await file.arrayBuffer();
        this.storedMusicFileArrayBuffer = await Zon.audioContext.decodeAudioData(arrayBuffer);
        afterAction?.(this.storedMusicFileArrayBuffer);
    }
    storeBuffer = (buffer) => {
        this.storedMusicFileArrayBuffer = buffer;
    }
    playStoredSong = () => {
        if (!this.storedMusicFileArrayBuffer) {
            console.error("No music file stored to play.");
            return;
        }

        this.playSong(this.storedMusicFileArrayBuffer);
        this.storedMusicFileArrayBuffer = null;
    }
    playSong(songArrayBuffer) {
        this.songBeingPlayedArrayBuffer = songArrayBuffer;
        this.songBeingPlayedBufferSource = Zon.audioContext.createBufferSource();
        this.songBeingPlayedBufferSource.buffer = this.songBeingPlayedArrayBuffer;
        this.songBeingPlayedBufferSource.connect(this.analyser);
        this.analyser.connect(Zon.audioContext.destination);
        this.songBeingPlayedBufferSource.start(0);
    }
    preDraw() {
        this.analyser.getByteTimeDomainData(this.dataArray);
        const raw = this.dataArray[Math.floor(this.dataArray.length / 2)];
        const normalized = (raw - 128) / 128;

        // Optional: smooth the pulse for visual niceness
        const alpha = 0.2;
        this.currentSongSmoothedAmplitude.value = (1 - alpha) * this.currentSongSmoothedAmplitude.value + alpha * normalized;
    }
}

Zon.musicManager = new Zon.MusicManager();



/*
"use strict";

Zon.audioContext = new (window.AudioContext || window.webkitAudioContext)();

Zon.MusicManager = class MusicManager {
    constructor() {
        this.songBeingPlayedBufferSource = null;
        this.songBeingPlayedArrayBuffer = null;
        this.storedMusicFileArrayBuffer = null;
        this.currentSongAmplitude = new Variable.Value(0);
        this.dbPromise = this.openDB();
    }

    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("ZonMusicDB", 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore("songs");
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveSongToIndexedDB(file) {
        const arrayBuffer = await file.arrayBuffer();
        const db = await this.dbPromise;
        const tx = db.transaction("songs", "readwrite");
        const store = tx.objectStore("songs");
        store.put(arrayBuffer, file.name);
        await tx.complete?.();
        console.log(`Saved song "${file.name}" to IndexedDB`);
    }

    async getStoredSongNames() {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction("songs", "readonly");
            const store = tx.objectStore("songs");
            const request = store.getAllKeys();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async loadSongByName(name, callback) {
        const db = await this.dbPromise;
        const tx = db.transaction("songs", "readonly");
        const store = tx.objectStore("songs");
        const request = store.get(name);
        request.onsuccess = async () => {
            const arrayBuffer = request.result;
            if (arrayBuffer) {
                const decoded = await Zon.audioContext.decodeAudioData(arrayBuffer.slice(0)); // slice for compatibility
                callback(decoded);
            } else {
                console.error("No song found with name:", name);
            }
        };
        request.onerror = () => {
            console.error("Error loading song:", request.error);
        };
    }

    onUploadMusicFile = async (file) => {
        await this.saveSongToIndexedDB(file);

        this.decode(file, (decodedBuffer) => {
            this.storeBuffer(decodedBuffer);
            this.playStoredSong();
        });
    }

    async decode(file, afterAction) {
        const arrayBuffer = await file.arrayBuffer();
        this.storedMusicFileArrayBuffer = await Zon.audioContext.decodeAudioData(arrayBuffer.slice(0));
        afterAction?.(this.storedMusicFileArrayBuffer);
    }

    storeBuffer = (buffer) => {
        this.storedMusicFileArrayBuffer = buffer;
    }

    playStoredSong = () => {
        if (!this.storedMusicFileArrayBuffer) {
            console.error("No music file stored to play.");
            return;
        }

        this.playSong(this.storedMusicFileArrayBuffer);
        this.storedMusicFileArrayBuffer = null;
    }

    playSong(songArrayBuffer) {
        this.songBeingPlayedArrayBuffer = songArrayBuffer;
        this.songBeingPlayedBufferSource = Zon.audioContext.createBufferSource();
        this.songBeingPlayedBufferSource.buffer = this.songBeingPlayedArrayBuffer;
        this.songBeingPlayedBufferSource.connect(Zon.audioContext.destination);
        this.songBeingPlayedBufferSource.start(0);
    }

    preDraw() {
        this.currentSongAmplitude.value = 0; // fill this with amplitude logic if needed
    }
}

*/