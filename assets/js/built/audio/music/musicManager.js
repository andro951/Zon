"use strict";

Zon.audioContext = new (window.AudioContext || window.webkitAudioContext)();

Zon.MusicManager = class MusicManager {
    constructor() {
        this.songBeingPlayedBufferSource = null;
        this.songBeingPlayedArrayBuffer = null;
        this.nextSongArrayBuffer = null;
        this.currentSongSmoothedAmplitude = new Variable.Value(0, `CurrentSongSmoothedAmplitude`);
        this.analyser = Zon.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.fftSize);
        this.songNames = Variable.createArray(`SongNames`);
        this.songPlayOrder = [];
        this._songIndex = new Variable.Value(-1, `SongIndex`);
        this._songBeingPlayedName = new Variable.Dependent(() => this.songNames[this._songIndex.value] ?? "", `SongBeingPlayed`, this);//Use this when a song is recieved to check if it should play immediatly.
        this._nextSongName = new Variable.Value("", `NextSongName`);
        this._nextSongIndex = new Variable.Value(-1, `NextSongIndex`);
        this._nextSongIndex.onChangedAction.add(this._pickAndQueueNextSong);
        this._songOrderIndex = -1;
        this._paused = new Variable.Value(false, `MusicPaused`);
        this._playingSong = new Variable.Value(false, `PlayingSong`);
        this._displayPlayButton = new Variable.Dependent(() => !this._playingSong.value || this._paused.value, `DisplayPlayButton`, this);
        this._startTime = 0;
        this._resumeOffset = 0;
        this.songNames.onChangedAction.add(this._updateSongOrder);
        this.dbPromise = this._openDB();
        Zon.Setup.postLoadSetupActions.add(this.postLoadSetup);
    }

    postLoadSetup = () => {
        this.shuffleSongsSetting = Zon.Settings.getPreferenceVariable(Zon.PreferenceSettingsID.SHUFFLE_SONGS);
        this.shuffleSongsSetting.onChangedAction.add(this._onShuffleSongsChanged);
        this._getStoredSongNames();
    }

    _openDB = async () => {
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

    _saveSongToIndexedDB = async (file) => {
        console.log(`Saving song "${file.name}" to IndexedDB...`);
        const arrayBuffer = await file.arrayBuffer();
        console.log(`Song "${file.name}" loaded as ArrayBuffer.`);
        const db = await this.dbPromise;
        console.log(`Got IndexedDB instance for saving song "${file.name}"...`);
        const tx = db.transaction("songs", "readwrite");
        const store = tx.objectStore("songs");
        const name = file.name.removeFileExtension();
        store.put(arrayBuffer, name);
        console.log(`Saving song "${name}" before Promise...`);
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = reject;
        });

        console.log(`Saving song "${name}" after Promise...`);
        this.songNames.push(name);
        console.log(`Saved song "${name}" to IndexedDB`);
    }

    _getStoredSongNames = async () => {
        const db = await this.dbPromise;
        const tx = db.transaction("songs", "readonly");
        const store = tx.objectStore("songs");
        const request = store.getAllKeys();

        try {
            const names = await new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            this.songNames.replaceAll(names);
        } catch (error) {
            console.error("Failed to load song names:", error);
        }
    }

    _loadSongByName = async (name) => {
        if (!name)
            throw new Error("Song name cannot be null or undefined.");

        const db = await this.dbPromise;
        const tx = db.transaction("songs", "readonly");
        const store = tx.objectStore("songs");
        const request = store.get(name);

        return new Promise((resolve, reject) => {
            request.onsuccess = async () => {
                const arrayBuffer = request.result;
                if (arrayBuffer) {
                    try {
                        const decoded = await Zon.audioContext.decodeAudioData(arrayBuffer.slice(0));
                        resolve(decoded);
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    reject(new Error("No song found with name: " + name));
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    onUploadMusicFile = async (file) => {
        console.log(`Uploading music file: ${file.name}`);
        await this._saveSongToIndexedDB(file);
    }

    _updateSongOrder = () => {
        console.log(`Updating song order.  SongNames:`, this.songNames);//TODO: this is being called twice at the start.
        const playOrderLength = this.songPlayOrder.length;
        const songNamesLength = this.songNames.length;
        if (playOrderLength === songNamesLength)
            return;

        if (songNamesLength <= 0) {
            this.songPlayOrder = [];
            this._songIndex.value = -1;
            this._nextSongIndex.value = -1;
            this._songOrderIndex = -1;
            this.nextSongArrayBuffer = null;
            this.songBeingPlayedBufferSource = null;
            this.songBeingPlayedArrayBuffer = null;
            this.currentSongSmoothedAmplitude.value = 0;
            this._stopSong(false);
            return;
        }
        
        if (playOrderLength === 0) {
            this._setDefaultSongPlayOrder();

            if (Zon.Settings.getPreference(Zon.PreferenceSettingsID.SHUFFLE_SONGS))
                this.songPlayOrder.shuffle();

            this._songOrderIndex = -1;
        }
        else if (playOrderLength < songNamesLength)  {
            //Added new song(s)
            if (Zon.Settings.getPreference(Zon.PreferenceSettingsID.SHUFFLE_SONGS)) {
                while (this.songPlayOrder.length < songNamesLength) {
                    const i = Math.floor(Math.random() * songNamesLength);
                    if (i <= this._songOrderIndex) {
                        this._songOrderIndex++;
                        this.songPlayOrder.splice(i, 0, this.songPlayOrder.length);
                        if (i === this._nextSongIndex.value)
                            this._nextSongIndex.onChanged();

                        if (this._songIndex.value !== this.songPlayOrder[this._songOrderIndex])
                            throw new Error(`Song order index mismatch: ${this._songIndex.value} !== ${this.songPlayOrder[this._songOrderIndex]}`);
                    }
                }
            }
            else {
                while (this.songPlayOrder.length < songNamesLength) {
                    this.songPlayOrder.push(this.songPlayOrder.length);
                }
            }
        }
        else {
            //Removed song(s)
            for (let i = this.songPlayOrder.length - 1; i >= 0; i--) {
                const songIndex = this.songPlayOrder[i];
                if (songIndex >= songNamesLength) {
                    if (songIndex === this._songIndex.value) {
                        this._tryPlayNextSong();
                    }

                    this.songPlayOrder.splice(i, 1);
                }
            }

            if (this.songPlayOrder.length !== songNamesLength)
                throw new Error(`Song play order length mismatch: ${this.songPlayOrder.length} !== ${songNamesLength}`);
        }

        this._updateSongIndexes();
    }

    _pickAndQueueNextSong = () => {
        if (this._nextSongIndex.value === undefined || this._nextSongIndex.value === null) {
            console.warn("Next song index is undefined or null, resetting to 0.");
            this._nextSongIndex.value = 0;
            return;
        }

        this.nextSongArrayBuffer = null;
        if (this.songPlayOrder.length === 0) {
            console.warn("_pickAndQueueNextSong(); songPlayOrder is empty.");
            return;
        }
        
        const nextSongName = this.songNames[this._nextSongIndex.value];
        if (!nextSongName) {
            console.warn(`No song name found for next song index: ${this._nextSongIndex.value}`);
            return;
        }

        this._queueNextSong(nextSongName);
    }

    _updateSongIndexes = () => {
        if (this._songOrderIndex >= this.songPlayOrder.length)
            throw new Error(`Song order index out of bounds: ${this._songOrderIndex} >= ${this.songPlayOrder.length}`);

        this._songIndex.value = this._songOrderIndex !== -1 ? this.songPlayOrder[this._songOrderIndex] : -1;
        this._nextSongIndex.value = this.songPlayOrder[this._songOrderIndex + 1] ?? 0;
    }

    _onShuffleSongsChanged = () => {
        const shuffle = this.shuffleSongsSetting.value;
        if (shuffle) {
            this.songPlayOrder.shuffle();
        } else {
            this._setDefaultSongPlayOrder();
            this._updateSongIndexes();
        }
    }

    _setDefaultSongPlayOrder = () => {
        this.songPlayOrder.length = 0;
        for (let i = 0; i < this.songNames.length; i++) {
            this.songPlayOrder.push(i);
        }
    }

    _queueNextSong = async (name) => {
        const decodedBuffer = await this._loadSongByName(name);
        if (!decodedBuffer) {
            console.error(`Failed to load song by name: ${name}`);
            return;
        }

        this._storeNextSong(decodedBuffer);
    }

    playSongByName = async (name) => {
        const decodedBuffer = await this._loadSongByName(name);
        this._storeNextSong(decodedBuffer);
        this._tryPlayNextSong();
    }

    _storeNextSong = (nextSongArrayBuffer) => {
        if (!nextSongArrayBuffer) {
            console.error("No next song array buffer provided.");
            return;
        }

        this.nextSongArrayBuffer = nextSongArrayBuffer;
        if (!this._playingSong.value && this._failedToPlayNextSong)
            this._tryPlayNextSong();

        this._failedToPlayNextSong = false;
    }

    playButtonPressed = () => {
        if (this._paused.value) {
            this.resumeSong();
            return;
        }

        if (this.songBeingPlayedArrayBuffer) {
            this.pauseSong();
            return;
        }

        this._tryPlayNextSong();
    }

    linkPauseButton = (pauseButton) => {
        pauseButton.playIconPath = Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.ICONS, Zon.UI.MusicUIState.MusicControls.pauseButtonDefaultIcon);
        pauseButton.pauseIconPath = Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.ICONS, `PauseIcon`);
        this._displayPlayButton.onChangedAction.add(() => {
            if (this._displayPlayButton.value) {
                pauseButton.icon.setBackgroundImage(pauseButton.playIconPath);
            }
            else {
                pauseButton.icon.setBackgroundImage(pauseButton.pauseIconPath);
            }
        });
    }

    _playSong = (songArrayBuffer, offset = 0) => {
        this._stopSong();
        this.songBeingPlayedArrayBuffer = songArrayBuffer;
        this.songBeingPlayedBufferSource = Zon.audioContext.createBufferSource();
        this.songBeingPlayedBufferSource.buffer = this.songBeingPlayedArrayBuffer;
        this.songBeingPlayedBufferSource.connect(this.analyser).connect(Zon.audioContext.destination);
        this.songBeingPlayedBufferSource.onended = () => {
            if (this._paused.value)
                return;

            this._tryPlayNextSong();
        };
        this._startTime = Zon.audioContext.currentTime - offset;
        this.songBeingPlayedBufferSource.start(0, offset);
        this._playingSong.value = true;
    }

    _playNextSong = () => {
        if (!this.nextSongArrayBuffer) {
            //this._stopSong(false);
            console.error("No music file stored to play.");
            return;
        }

        this._songOrderIndex = this._nextSongIndex.value;
        this._playSong(this.nextSongArrayBuffer);
        this.nextSongArrayBuffer = null;
    }

    _tryPlayNextSong = () => {
        this._failedToPlayNextSong = false;
        if (this.nextSongArrayBuffer) {
            this._playNextSong();
            this._updateSongIndexes();
        } else {
            this._playingSong.value = false;
            this._failedToPlayNextSong = true;
            console.warn("No next song to play.");
        }
    };

    pauseSong = () => {
        if (this._paused.value)
            return;

        if (this.songBeingPlayedBufferSource) {
            try {
                this._paused.value = true;
                this._resumeOffset = Zon.audioContext.currentTime - this._startTime;
                this._stopSong();
            } catch (e) {
                this._paused.value = false;
                this._resumeOffset = 0;
            }
        }
    }

    resumeSong = () => {
        if (this._paused.value) {
            this._paused.value = false;
            if (this.songBeingPlayedArrayBuffer)
                this._playSong(this.songBeingPlayedArrayBuffer, this._resumeOffset);

            this._resumeOffset = 0;
        }
    }

    nextSong = () => {
        this._stopSong();
        this.resumeSong();
        this._tryPlayNextSong();
    }

    deleteSong = async (name) => {
        console.log(`Deleting song "${name}" from IndexedDB...`);
        const db = await this.dbPromise;
        const tx = db.transaction("songs", "readwrite");
        const store = tx.objectStore("songs");
        const request = store.delete(name);

        await new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const index = this.songNames.indexOf(name);
                if (index === -1)
                    return;

                if (index < this.songNames.length - 1) {//If it's the last song, calling this.songNames.remove(name) will handle it correctly.
                    for (let i = this.songPlayOrder.length - 1; i >= 0; i--) {
                        if (this.songPlayOrder[i] > index) {
                            this.songPlayOrder[i]--;
                            if (i === this._songOrderIndex) {
                                this._songIndex.value = this.songPlayOrder[i];
                            }
                        }
                        else if (this.songPlayOrder[i] === index) {
                            if (i === this._songOrderIndex) {
                                this._tryPlayNextSong();
                            }
                            else if (i === this._nextSongIndex.value) {
                                this._nextSongIndex.value = this.songPlayOrder[i + 1] ?? 0;
                            }

                            this.songPlayOrder.splice(i, 1);
                        }
                    }
                }

                if (this._songIndex.value === index)
                    return reject(new Error(`Failed to switch song index after deletion: ${this._songIndex.value} === ${index}`));

                this.songNames.remove(name);
                console.log(`Deleted song "${name}" from IndexedDB`);
                resolve();
            };
            request.onerror = () => {
                console.error(`Failed to delete song "${name}":`, request.error);
                reject(request.error);
            };
        });
    }

    deleteAllSongs = async () => {
        console.log("Deleting all songs from IndexedDB...");
        const db = await this.dbPromise;
        const tx = db.transaction("songs", "readwrite");
        const store = tx.objectStore("songs");
        const request = store.clear();

        await new Promise((resolve, reject) => {
            request.onsuccess = () => {
                this.songNames.clear();
                resolve();
            };
            request.onerror = () => {
                console.error("Failed to delete all songs:", request.error);
                reject(request.error);
            };
        });
    }

    _stopSong = async (stoppingToPlayNextSong = true) => {
        if (this.songBeingPlayedBufferSource) {
            this.songBeingPlayedBufferSource.onended = null;
            try {
                this.songBeingPlayedBufferSource.stop();
            } catch (e) {}
            this.songBeingPlayedBufferSource.disconnect();
            this.songBeingPlayedBufferSource = null;
            this._startTime = 0;
        }

        if (!stoppingToPlayNextSong)
            this._playingSong.value = false;
    };


    preDraw() {
        this.analyser.getByteTimeDomainData(this.dataArray);
        const raw = this.dataArray[Math.floor(this.dataArray.length / 2)];
        const normalized = (raw - 128) / 128;

        const alpha = 0.2;
        this.currentSongSmoothedAmplitude.value = (1 - alpha) * this.currentSongSmoothedAmplitude.value + alpha * normalized;
    }
}

Zon.musicManager = new Zon.MusicManager();