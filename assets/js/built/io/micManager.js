"use strict";

Zon.MicManager = class MicManager {
    constructor() {
        this.micAvailable = false;
        this.micReady = false;
        this.maxBeatsPerSecond = 20;
        this.beatDelay = 1000 / this.maxBeatsPerSecond;
        this.loudnessTimeKeptMS = 200;
        this.loudnessTimeKeptMSInv = 1 / this.loudnessTimeKeptMS;
        this.loudnessDeque = new Struct.Deque();//Deque of LoudnessPoints
        this.lastBeatTime = 0;
        Zon.Setup.postLoadSetupActions.add(this.postLoadSetup);
    }

    postLoadSetup = async () => {
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.micAvailable = true;
            // Mic access granted — proceed
        } catch (err) {
            if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
                alert("Microphone access is blocked. Please allow it from your browser's settings and reload the page.");
            } else {
                console.error("Mic access error:", err);
            }

            return;
        }

        const source = Zon.audioContext.createMediaStreamSource(stream);

        this.analyserNotes = Zon.audioContext.createAnalyser();
        this.analyserNotes.fftSize = 8192;
        this.timeDataNotes = new Uint8Array(this.analyserNotes.fftSize);
        source.connect(this.analyserNotes);

        this.analyserLoudness = Zon.audioContext.createAnalyser();
        this.analyserLoudness.fftSize = 256;
        this.halfFftSizeLoudness = this.analyserLoudness.fftSize * 0.5;
        this.halfFftSizeInvLoudness = 1 / this.halfFftSizeLoudness;
        this.dataArrayLoudness = new Uint8Array(this.analyserLoudness.fftSize);
        source.connect(this.analyserLoudness);

        this.micReady = true;

        this.micGainVariable = Zon.Settings.getPreferenceVariable(Zon.PreferenceSettingsID.MicrophoneGain);
        this.micNoiseThresholdVariable = Zon.Settings.getPreferenceVariable(Zon.PreferenceSettingsID.MicrophoneNoiseThreshold);
        this.beatLoudnessChangeVariable = Zon.Settings.getPreferenceVariable(Zon.PreferenceSettingsID.BeatLoudnessChange);

        Zon.UI.micTestUIState.onMicReady();

        if (Zon.audioContext.state === "suspended") {
            await Zon.audioContext.resume();
        }

        const now = performance.now();
        this.loudnessDeque.add(new this.LoudnessPoint(now - this.loudnessTimeKeptMS, 0));//TODO: don't allow note detection until this.loudnessTimeKeptMS has passed since starting updates
        this.loudnessDeque.add(new this.LoudnessPoint(now - this.loudnessTimeKeptMS + 1, 0));

        Zon.game.realTimeUpdateActions.add(this.update);
    }
    static clamp(value) {
        return Math.max(-1, Math.min(1, value));
    }
    getDominantFrequency() {
        //TODO: This isn't detecting below 90 hz well.  I can sing to about 75 hz. and notes should be registered down to and including 27.5 hz
        

        // Get the time-domain waveform
        const buffer = new Float32Array(this.analyserNotes.fftSize);
        this.analyserNotes.getFloatTimeDomainData(buffer);

        const gain = this.micGainVariable.value;
        const noiseThreshold = this.micNoiseThresholdVariable.value;
        // for (let i = 0; i < buffer.length; i++) {
        //     buffer[i] = Math.max(-1, Math.min(1, buffer[i] * gain));
        // }

        let size = buffer.length;
        let maxCorr = 0;
        let bestLag = -1;

        // Autocorrelation
        for (let lag = 40; lag <= 551; lag++) { // ignore very small/large lags
            let sum = 0;
            for (let i = 0; i < size - lag; i++) {
                const sample1 = Zon.MicManager.clamp(buffer[i] * gain);
                if (Math.abs(sample1) < noiseThreshold)
                    continue;

                const sample2 = Zon.MicManager.clamp(buffer[i + lag] * gain);
                if (Math.abs(sample2) < noiseThreshold)
                    continue;

                sum += sample1 * sample2;
                //sum += buffer[i] * buffer[i + lag];
            }

            if (sum > maxCorr) {
                maxCorr = sum;
                bestLag = lag;
            }
        }

        if (bestLag <= 0)
            return 0;

        // Frequency = sampleRate / lag
        const freq = Zon.audioContext.sampleRate / bestLag;
        return freq;
    }
    update = () => {
        this.analyserLoudness.getByteTimeDomainData(this.dataArrayLoudness);

        let sumOfSquares = 0;
        const halfLength = this.halfFftSizeLoudness;
        for (let i = 0; i < this.dataArrayLoudness.length; i++) {
            const normalized = (this.dataArrayLoudness[i] - halfLength) * this.halfFftSizeInvLoudness;
            sumOfSquares += normalized * normalized;
        }

        const rms = Math.sqrt(sumOfSquares / this.dataArrayLoudness.length);

        const now = performance.now();
        this.loudnessDeque.add(new this.LoudnessPoint(now, rms));

        if (this.lastBeatTime + this.beatDelay > now)
            return;

        while(true) {
            const first = this.loudnessDeque.first;
            if (!first)
                throw new Error("No loudness data available");

            const second = this.loudnessDeque.second;
            if (!second)
                throw new Error("No second loudness data available");

            if (second.timeMS + this.loudnessTimeKeptMS < now) {
                if (!this.loudnessDeque.next())
                    break;
            } else {
                break;
            }
        }

        let previousPoint = undefined;
        let loudnessSum = 0;
        let timeSum = 0;
        for (const point of this.loudnessDeque.reverseIterator()) {
            if (previousPoint) {
                const timeDiff = previousPoint.timeMS - point.timeMS;
                timeSum += timeDiff;
                if (timeSum > this.loudnessTimeKeptMS) {
                    const t = this.loudnessTimeKeptMS - (timeSum - timeDiff);
                    const l = point.loudnessRMS + (previousPoint.loudnessRMS - point.loudnessRMS) * ((timeDiff - t) / timeDiff);
                    loudnessSum += (l + previousPoint.loudnessRMS) * 0.5 * t;
                }
                else {
                    loudnessSum += (point.loudnessRMS + previousPoint.loudnessRMS) * 0.5 * timeDiff;
                }
            }

            previousPoint = point;
        }

        const avgLoudness = loudnessSum * this.loudnessTimeKeptMSInv;
        
        if (avgLoudness * this.beatLoudnessChangeVariable.value <= rms) {
            this.onDetectBeat(now);
        }
    }
    onDetectBeat(now) {
        this.lastBeatTime = now;
        //console.log("Beat detected!");
        Zon.abilityController.onBeatDetected();
    }

    LoudnessPoint = class LoudnessPoint {
        constructor(timeMS, loudnessRMS) {
            this.timeMS = timeMS;
            this.loudnessRMS = loudnessRMS;
        }
    }
}

Zon.micManager = new Zon.MicManager();