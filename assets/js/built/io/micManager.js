"use strict";

Zon.MicManager = class MicManager {
    constructor() {
        this.micAvailable = false;
        this.micReady = false;
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

        this.analyser = Zon.audioContext.createAnalyser();
        this.analyser.fftSize = 8192;

        source.connect(this.analyser);

        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        const sampleRate = Zon.audioContext.sampleRate;
        this.binSize = sampleRate / this.analyser.fftSize;
        this.micReady = true;
        Zon.UI.micTestUIState.onMicReady();

        this.micGainVariable = Zon.Settings.getPreferenceVariable(Zon.PreferenceSettingsID.MicrophoneGain);
        this.micNoiseThresholdVariable = Zon.Settings.getPreferenceVariable(Zon.PreferenceSettingsID.MicrophoneNoiseThreshold);

        if (Zon.audioContext.state === "suspended") {
            await Zon.audioContext.resume();
        }
    }
    
    // getDominantFrequency() {
    //     this.analyser.getByteFrequencyData(this.dataArray);

    //     let maxIndex = 0;
    //     let maxValue = 0;

    //     for (let i = 0; i < this.bufferLength; i++) {
    //         if (this.dataArray[i] > maxValue) {
    //             maxValue = this.dataArray[i];
    //             maxIndex = i;
    //         }
    //     }

    //     const dominantFrequency = maxIndex * this.binSize;
    //     return dominantFrequency;
    // }
    // getDominantFrequency() {
    //     this.analyser.getByteFrequencyData(this.dataArray);

    //     let maxIndex = 0;
    //     let maxValue = -Infinity;

    //     for (let i = 0; i < this.bufferLength; i++) {
    //         if (this.dataArray[i] > maxValue) {
    //             maxValue = this.dataArray[i];
    //             maxIndex = i;
    //         }
    //     }

    //     // Parabolic interpolation
    //     const left = this.dataArray[maxIndex - 1] || 0;
    //     const right = this.dataArray[maxIndex + 1] || 0;
    //     const denom = 2 * maxValue - left - right;
    //     if (denom === 0) {
    //         // If the denominator is zero, we can't do the interpolation
    //         return maxIndex * this.binSize;
    //     }

    //     const correction = 0.5 * (right - left) / denom;

    //     const trueIndex = maxIndex + correction;
    //     return trueIndex * this.binSize;
    // }
    static clamp(value) {
        return Math.max(-1, Math.min(1, value));
    }
    getDominantFrequency() {
        // Get the time-domain waveform
        const buffer = new Float32Array(this.analyser.fftSize);
        this.analyser.getFloatTimeDomainData(buffer);

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
}

Zon.micManager = new Zon.MicManager();