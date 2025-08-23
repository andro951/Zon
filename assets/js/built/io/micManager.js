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
        this.analyser.fftSize = 2048;

        source.connect(this.analyser);

        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        const sampleRate = Zon.audioContext.sampleRate;
        this.binSize = sampleRate / this.analyser.fftSize;
        this.micReady = true;
        Zon.UI.micTestUIState.onMicReady();

        if (Zon.audioContext.state === "suspended") {
            await Zon.audioContext.resume();
        }
    }
    
    getDominantFrequency() {
        this.analyser.getByteFrequencyData(this.dataArray);

        let maxIndex = 0;
        let maxValue = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            if (this.dataArray[i] > maxValue) {
                maxValue = this.dataArray[i];
                maxIndex = i;
            }
        }

        const dominantFrequency = maxIndex * this.binSize;
        return dominantFrequency;
    }
}

Zon.micManager = new Zon.MicManager();