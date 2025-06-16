"use strict";

Zon.audioContext = new (window.AudioContext || window.webkitAudioContext)();

Zon.MusicManager = class MusicManager {
    constructor() {
        this._songs = new Map();//Map of [SongData, Song]
        this._songQueue = new Struct.Deque();//Queue of SongReferences
        this._maxSongQueueSize = 10;
        this._previousSongs = new Struct.Deque();//Queue of SongReferences
        this._maxPreviousSongsSize = 2;
        this._previousSongDatas = new Struct.Deque();//Queue of SongData
        this._maxPreviousSongDatasSize = 10 - this._maxPreviousSongsSize;
        this._allSongDatas = new Struct.NodeArray(`SongData`);

        this.songNames = new Set();

        this.totalSongWeight = new Variable.Dependent(() => this._allSongDatas.reduce((sum, songData) => sum + songData.weight.value, 0), `TotalSongWeight`, this);
        this.totalSongWeight.onChangedAction.add(this._onTotalSongWeightChanged);

        this._songBeingPlayedBufferSource = null;
        this._songBeingPlayedArrayBuffer = null;
        this._analyser = Zon.audioContext.createAnalyser();
        this._analyser.fftSize = 256;
        this._dataArray = new Uint8Array(this._analyser.fftSize);

        this.currentSongSmoothedAmplitude = new Variable.Value(0, `CurrentSongSmoothedAmplitude`);

        this.songBeingPlayedName = new Variable.Value(() => "", `SongBeingPlayed`);

        this._paused = new Variable.Value(true, `MusicPaused`);
        this._displayPlayButton = new Variable.Dependent(() => this._paused.value, `DisplayPlayButton`, this);
        this._allSongDatas.onChangedAction.add(this._onSongDatasChanged);
        this._dbPromise = this._openDB();
        Zon.Setup.postLoadSetupActions.add(this.postLoadSetup);
    }

    postLoadSetup = () => {
        //console.log("Zon.MusicManager postLoadSetup called.");
        this.shuffleSongsSetting = Zon.Settings.getPreferenceVariable(Zon.PreferenceSettingsID.SHUFFLE_SONGS);
        this.shuffleSongsSetting.onChangedAction.add(this._onShuffleSongsChanged);
        this._getSongDatas();
    }

    static _songMetaName = "songsMeta";
    static _songDataName = "songsData";
    _openDB = async () => {
        //Deletes old database
        // await new Promise((resolve, reject) => {
        //     const deleteRequest = indexedDB.deleteDatabase("ZonMusicDB");

        //     deleteRequest.onsuccess = () => {
        //         console.log("Old database deleted successfully.");
        //         resolve();
        //     };

        //     deleteRequest.onerror = (event) => {
        //         console.warn("Error deleting old database. Proceeding anyway.");
        //         resolve(); // Still resolve so we can continue trying to open the DB
        //     };

        //     deleteRequest.onblocked = () => {
        //         console.warn("Database deletion blocked (possibly still open elsewhere).");
        //         resolve(); // Proceed cautiously anyway
        //     };
        // });

        return new Promise((resolve, reject) => {
            const request = indexedDB.open("ZonMusicDB", 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(Zon.MusicManager._songMetaName)) {
                    db.createObjectStore(Zon.MusicManager._songMetaName, { keyPath: "name" });
                }

                if (!db.objectStoreNames.contains(Zon.MusicManager._songDataName)) {
                    db.createObjectStore(Zon.MusicManager._songDataName, { keyPath: "name" });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    _getSongDatas = async () => {
        //console.log("Loading song metadata from IndexedDB...");
        const db = await this._dbPromise;
        //console.log(`Opened IndexedDB: ${db.name}, version: ${db.version}`);
        const tx = db.transaction(Zon.MusicManager._songMetaName, "readonly");
        const store = tx.objectStore(Zon.MusicManager._songMetaName);
        const request = store.getAll();
        //console.log(`Requesting all song metadata entries from store: ${Zon.MusicManager._songMetaName}`);
        try {
            const entries = await new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            entries.sort((a, b) => a.addedAt - b.addedAt);

            //console.log(`Loaded ${entries.length} song metadata entries from IndexedDB.`);
            const newSongDatas = entries.map(entry => Zon.SongData.fromDBEntry(entry));
            this._allSongDatas.replaceAll(newSongDatas);
        } catch (error) {
            console.error("Failed to load song metadata:", error);
        }
    }

    _saveNewSongFromFile = async (file) => {
        const name = file.name.removeFileExtension();
        if (this.songNames.has(name)) {
            console.warn(`Song with name "${name}" already exists. Skipping upload.`);
            return;
        }

        const arrayBuffer = await file.arrayBuffer();
        const db = await this._dbPromise;
        const tx = db.transaction([Zon.MusicManager._songMetaName, Zon.MusicManager._songDataName], "readwrite");
        const metaStore = tx.objectStore(Zon.MusicManager._songMetaName);
        const dataStore = tx.objectStore(Zon.MusicManager._songDataName);
        dataStore.put({
            name: name,
            data: arrayBuffer,
        });
        metaStore.put({
            name: name,
            weightExpMult: 0,
            artist: "",
            album: "",
            img: null,
            addedAt: Date.now(),
        });

        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = reject;
        });

        this._allSongDatas.push(new Zon.SongData(name, 0));
    }

    onUploadMusicFile = async (file) => {
        //console.log(`Uploading music file: ${file.name}`);
        await this._saveNewSongFromFile(file);
    }

    _loadSong = async (name) => {
        if (!name)
            throw new Error("Song name cannot be null or undefined.");

        const db = await this._dbPromise;
        const tx = db.transaction(Zon.MusicManager._songDataName, "readonly");
        const store = tx.objectStore(Zon.MusicManager._songDataName);
        const request = store.get(name);

        return new Promise((resolve, reject) => {
            request.onsuccess = async () => {
                const entry = request.result;
                if (entry && entry.data) {
                    try {
                        const decoded = await Zon.audioContext.decodeAudioData(entry.data.slice(0));
                        resolve(decoded);
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    reject(new Error("No song data found with name: " + name));
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    deleteSong = async (name) => {
        //console.log(`Deleting song "${name}" from IndexedDB...`);
        const db = await this._dbPromise;
        const tx = db.transaction([Zon.MusicManager._songMetaName, Zon.MusicManager._songDataName], "readwrite");
        const metaStore = tx.objectStore(Zon.MusicManager._songMetaName);
        const dataStore = tx.objectStore(Zon.MusicManager._songDataName);
        
        const metaRequest = metaStore.delete(name);
        const dataRequest = dataStore.delete(name);

        await new Promise((resolve, reject) => {
            dataRequest.onerror = metaRequest.onerror = () => {
                console.error(`Failed to delete song "${name}":`, metaRequest.error || dataRequest.error);
                reject(metaRequest.error || dataRequest.error);
            };

            dataRequest.onsuccess = metaRequest.onsuccess = () => {
                let songData = null;
                for (const item of this._allSongDatas) {
                    if (item.name === name) {
                        songData = item;
                        break;
                    }
                }

                if (!songData) {
                    console.warn(`Song "${name}" not found in _allSongDatas.`);
                    return resolve();
                }

                songData.removeGetNext();
                //console.log(`Deleted song "${name}" from IndexedDB`);
                resolve();
            };
        });
    }

    deleteAllSongs = async () => {
        //console.log("Deleting all songs from IndexedDB...");
        const db = await this._dbPromise;
        const tx = db.transaction([Zon.MusicManager._songMetaName, Zon.MusicManager._songDataName], "readwrite");
        const metaStore = tx.objectStore(Zon.MusicManager._songMetaName);
        const dataStore = tx.objectStore(Zon.MusicManager._songDataName);
        
        const metaRequest = metaStore.clear();
        const dataRequest = dataStore.clear();

        await new Promise((resolve, reject) => {
            metaRequest.onerror = dataRequest.onerror = () => {
                console.error("Failed to delete all songs:", metaRequest.error || dataRequest.error);
                reject(metaRequest.error || dataRequest.error);
            };

            metaRequest.onsuccess = dataRequest.onsuccess = () => {
                console.log("All songs deleted from IndexedDB.");
                this._allSongDatas.clear();
                resolve();
            };
        });
    }

    _onTotalSongWeightChanged = () => {
        //console.log("Total song weight changed, updating play chances and bounds...");
        if (this._allSongDatas.length === 0)
            return;

        const totalWeight = this.totalSongWeight.value;
        let cumulative = 0;
        for (const song of this._allSongDatas) {
            song._playChance = song.weight.value / totalWeight;
            song._lowerBound = cumulative;
            cumulative += song._playChance;
            song._upperBound = cumulative;
            //console.log(`Updated song: ${song.name.value}, Weight: ${song.weight.value}, PlayChance: ${song._playChance}, LowerBound: ${song._lowerBound}, UpperBound: ${song._upperBound}`);
        }

        this._allSongDatas.at(-1)._upperBound = 1;

        //console.log(`Updated play chances and bounds for ${this._allSongDatas.length} songs.  New total weight: ${totalWeight}`);
    }

    _onSongDatasChanged = () => {
        //console.log(`Song datas changed.  this._allSongDatas.length: ${this._allSongDatas.length}, this.songNames.size: ${this.songNames.size}`);
        //this._allSongDatas.forEach(songData => console.log(`SongData: ${songData.name.value}, Weight: ${songData.weight.value}`));
        if (this._allSongDatas.length === this.songNames.size) {
            if (this._allSongDatas.length === 0) {
                return;
            }
            else {
                throw new Error(`_onSongDatasChanged();  this._allSongDatas.length === this.songNames.size; ${this._allSongDatas.length} === ${this.songNames.size}`);
            }
        }
        if (this._allSongDatas.length < this.songNames.size) {
            //Song(s) removed
            this._onRemoveSongs();
        }
        else {
            //Song(s) added or renamed
            this._onAddSongs();
        }
    }

    _onRemoveSongs = () => {
        //console.log("Removing songs that no longer exist in the song data array...");
        this._updateSongNames();
        if (!this._songQueue.isEmpty) {
            if (!this.songNames.has(this._songQueue.first.name))
                this._songQueue.first.stop();
        }

        this._songQueue.removeWhere(song => !this.songNames.has(song.name));
        this._updateSongQueue();

        this._previousSongDatas.removeWhere(name => !this.songNames.has(name));
        this._previousSongs.removeWhere(song => !this.songNames.has(song.name));
        this._updatePreviousSongs();
    }

    _updatePreviousSongs = () => {
        while (this._previousSongs.size < this._maxPreviousSongsSize && !this._previousSongDatas.isEmpty) {
            const mostRecentSongData = this._previousSongDatas.popLast();
            const songRef = mostRecentSongData.getSongReference();
            if (!songRef)
                throw new Error(`Failed to get song reference for previous song data: ${mostRecentSongData}`);

            this._previousSongs.addToFront(songRef);
        }

        while (this._previousSongs.size > this._maxPreviousSongsSize) {
            const removedSongRef = this._previousSongs.popFirst();
            if (!removedSongRef)
                throw new Error("Failed to remove previous song, deque is empty.");
            
            this._previousSongDatas.add(removedSongRef.song.songData);
            const song = removedSongRef.song;
            removedSongRef.onDelete();
            song.tryDelete();
        }

        while (this._previousSongDatas.size > this._maxPreviousSongDatasSize) {
            this._previousSongDatas.next();
        }
    }

    _onAddSongs = () => {
        //console.log("Adding new songs...");
        this._updateSongNames();
        this._clearAndRefreshSongQueue();
    }

    _clearQueueExceptCurrent = () => {
        while (this._songQueue.size > 1) {
            //console.log(`Removing last song from queue: ${this._songQueue.last.name.value}`);
            this._songQueue.prev();
        }
    }

    _clearAndRefreshSongQueue = () => {
        this._clearQueueExceptCurrent();
        this._updateSongQueue();
    }

    _getRandomSong = () => {
        if (this._allSongDatas.length === 0)
            throw new Error("No songs available to select from.");

        const r = Math.random();
        let low = 0;
        let high = this._allSongDatas.length - 1;
        //console.log(`Selecting random song from ${this._allSongDatas.length} songs.  r: ${r}, low: ${low}, high: ${high}`);
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            const song = this._allSongDatas.get(mid);
            if (song._lowerBound < 0 || song._upperBound > 1)
                throw new Error(`Invalid bounds for song ${song.name.value}: lowerBound: ${song._lowerBound}, upperBound: ${song._upperBound}`);

            //console.log(`Checking song at index ${mid}: ${song.name.value}, lowerBound: ${song._lowerBound}, upperBound: ${song._upperBound}`);
            if (r < song._lowerBound) {
                high = mid - 1;
            } else if (r >= song._upperBound) {
                low = mid + 1;
            } else {
                low = mid;
                break;
            }
        }

        return this._allSongDatas.get(low).getSongReference();
    }

    _getNextSong = () => {
        if (this._allSongDatas.length === 0)
            throw new Error("No songs available.");

        return (this._songQueue.last?.song.songData.next() ?? this._allSongDatas.get(0)).getSongReference();
    }

    _updateSongQueue = () => {
        if (this._allSongDatas.length === 0) {
            if (!this._paused.value)
                this._paused.value = true;

            return;
        }

        const shuffle = this.shuffleSongsSetting.value;
        while (this._songQueue.size < this._maxSongQueueSize) {
            const song = shuffle ? this._getRandomSong() : this._getNextSong();
            if (!song)
                throw new Error("Failed to get a random song from the song data array.");

            //console.log(`Adding song to queue: ${song.name.value}`);
            this._songQueue.add(song);
        }

        while (this._songQueue.size > this._maxSongQueueSize) {
            const removedSongRef = this._songQueue.popLast();
            if (!removedSongRef)
                throw new Error("Failed to remove song from queue, deque is empty.");

            const song = removedSongRef.song;
            removedSongRef.onDelete();
            song.tryDelete();
        }
    }

    _updateSongNames = () => {
        this.songNames = new Set(this._allSongDatas.map(songData => songData.name));
    }

    _onRenameSong = (oldName, newName) => {
        this.songNames.delete(oldName);
        this.songNames.add(newName);
    }

    _onShuffleSongsChanged = () => {
        this._clearAndRefreshSongQueue();
    }

    playNextSong = () => {
        if (this._songQueue.isEmpty)
            return;

        this._songQueue.first.stop();

        const currentSong = this._songQueue.popFirst();
        if (!currentSong)
            throw new Error("Failed to get current song from queue.");

        currentSong.removeAsCurrentSong();
        this._previousSongs.add(currentSong);
        this._updatePreviousSongs();
        this._updateSongQueue();
        this.play();
    }

    playPreviousSong = () => {
        if (this._previousSongs.isEmpty) {
            this._restartSong();
            return;
        }

        this._songQueue.first.stop();

        const previousSong = this._previousSongs.popLast();
        if (!previousSong)
            throw new Error("Failed to get previous song from queue.");

        const currentSong = this._songQueue.first;
        if (!currentSong)
            throw new Error("No current song to play previous song after.");

        currentSong.removeAsCurrentSong();
        this._songQueue.addToFront(previousSong);
        this._updatePreviousSongs();
        this._songQueue.first.play();
        this._updateSongQueue();
    }

    _restartSong = () => {
        this._songQueue?.first.restart();
    }

    _playSong = (songArrayBuffer, offset, songDataRef) => {
        this._stopSong();
        this._songBeingPlayedArrayBuffer = songArrayBuffer;
        this._songBeingPlayedBufferSource = Zon.audioContext.createBufferSource();
        this._songBeingPlayedBufferSource.buffer = this._songBeingPlayedArrayBuffer;
        this._songBeingPlayedBufferSource.connect(this._analyser).connect(Zon.audioContext.destination);
        this._songBeingPlayedBufferSource.onended = () => {
            if (this._paused.value)
                return;

            this.playNextSong();
        };
        songDataRef._startTime = Zon.audioContext.currentTime - offset;
        this._songBeingPlayedBufferSource.start(0, offset);
    }

    _stopSong = () => {
        if (this._songBeingPlayedBufferSource) {
            this._songBeingPlayedBufferSource.onended = null;
            try {
                this._songBeingPlayedBufferSource.stop();
            } catch (e) {}
            this._songBeingPlayedBufferSource.disconnect();
            this._songBeingPlayedBufferSource = null;
            this._songBeingPlayedArrayBuffer = null;
        }
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

    playSongByName = async (name) => {
        let songData = null;
        for (let i = 0; i < this._allSongDatas.length; i++) {
            const song = this._allSongDatas.get(i);
            if (song.name.value === name) {
                songData = song;
                break;
            }
        }

        if (songData === null)
            throw new Error(`Song with name "${name}" not found in song data.`);

        this._clearQueueExceptCurrent();
        this._songQueue.add(songData.getSongReference());
        this.playNextSong();
    }

    playButtonPressed = () => {
        if (this._songQueue.isEmpty)
            return;

        if (this._paused.value) {
            this.play();
        }
        else {
            this.pause();
        }
    }

    pause = () => {
        if (this._paused.value)
            return;

        this._songQueue.first.stop();
        this._paused.value = true;
    }

    play = () => {
        if (this._songQueue.isEmpty)
            return;

        this._paused.value = false;
        this._songQueue.first.play();
    }

    preDraw() {
        this._analyser.getByteTimeDomainData(this._dataArray);
        const raw = this._dataArray[Math.floor(this._dataArray.length / 2)];
        const normalized = (raw - 128) / 128;

        const alpha = 0.2;
        this.currentSongSmoothedAmplitude.value = (1 - alpha) * this.currentSongSmoothedAmplitude.value + alpha * normalized;
    }
}

Zon.musicManager = new Zon.MusicManager();