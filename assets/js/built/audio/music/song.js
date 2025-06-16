"use strict";

Zon.SongData = class SongData {
    static _expBase = 0.25; // 2^(0.25 * weightExpMult) => 1.189207115 b^4 = 2
    constructor(name, weight) {
        this.name = new Variable.Value(name, `${name}_Name`);
        this._weightExpMult = new Variable.Value(weight, `${name}_WeightExpMult`);
        this.weight = new Variable.Dependent(() => Math.pow(2, this._weightExpMult.value * Zon.SongData._expBase), `${name}_Weight`, this);
        this.weight.onChangedAction.add(() => this.totalSongWeight.onChanged());
        //this._playChance = new Variable.Dependent(() => this.weight.value / Zon.musicManager.totalSongWeight.value, `${name}_PlayChance`, this, false);//Not linked

        this._playChance = -1;
        this._lowerBound = -1;
        this._upperBound = -1;
    }

    static fromDBEntry(entry) {
        return new Zon.SongData(entry.name, entry.weightExpMult);
    }

    getSongReference() {
        let song = Zon.musicManager._songs.get(this);
        if (!song) {
            song = new Zon.Song(this);
            Zon.musicManager._songs.set(this, song);
        }

        const songRef = new Zon.SongReference(song);
        return songRef;
    }
}

Zon.Song = class Song {
    constructor(songData) {
        this.songData = songData;
        this.songReferences = new Set();
        this.songBuffer = null;
        this.onLoadBuffer = new Actions.Action();
        this._songBufferPromise = Zon.musicManager._loadSong(songData.name.value).then((buffer) => {
            this.bufferReady = true;
            this.songBuffer = buffer;
            this.onLoadBuffer.call();
            return buffer;
        });
        this.bufferReady = false;
    }

    get name() {
        return this.songData.name;
    }
    get weight() {
        return this.songData.weight;
    }

    tryDelete() {
        if (this.hasReferences)
            return false;

        Zon.musicManager._songs.delete(this.songData);
        return true;
    }
    onDeleteSong() {
        if (this.hasReferences)
            throw new Error(`Cannot delete song with references: ${this.songReferences.size}`);
    }

    addReference(reference) {
        if (this.songReferences.has(reference))
            throw new Error(`Song already has reference: ${reference}`);
            
        this.songReferences.add(reference);
    }

    removeReference(reference) {
        if (!this.songReferences.has(reference))
            throw new Error(`Song does not have reference: ${reference}`);
        
        this.songReferences.delete(reference);
    }

    get hasReferences() {
        return this.songReferences.size > 0;
    }
}

Zon.SongReference = class SongReference {
    constructor(song) {
        this.song = song;
        this.song.addReference(this);
        this._startTime = 0;
    }

    get name() {
        return this.song.name;
    }
    get weight() {
        return this.song.weight;
    }

    play = () => {
        if (this.song.bufferReady) {
            if (!this.song.songBuffer)
                throw new Error(`${this.name} Song buffer is not ready for song: ${this.song.name.value}`);

            Zon.musicManager._playSong(this.song.songBuffer, this._resumeOffset ?? 0, this);
            this._resumeOffset = 0;
        }
        else {
            this.song.onLoadBuffer.add(this.play);
        }
    }
    stop = () => {
        this._resumeOffset = Zon.audioContext.currentTime - this._startTime;
        this._startTime = 0;
        Zon.musicManager._stopSong();
    }
    restart = () => {
        this._resumeOffset = 0;
        if (Zon.musicManager._paused.value)
            return;

        if (this.song.bufferReady) {
            Zon.musicManager.restartSong();
        }
    }
    removeAsCurrentSong = () => {
        this._resumeOffset = 0;
    }

    onDelete = () => {
        this.song.removeReference(this);
        this.song = null;
    }
}