"use strict";

Zon.Music = class Music {
    //Half notes are 440 * 2^(n/12) where n is the number of half steps from A4
    //Or 27.5 * 2^(n/12) where n is the number of half steps from A0
    static noteNames = [
        "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
    ];
    static FrequencyToNote(frequency) {
        const A0 = 27.5;
        if (frequency < A0)
            return "___";

        const halfSteps = Math.round(12 * Math.log2(frequency / A0)) + 9;
        const octave = Math.floor(halfSteps / 12);
        const note = Zon.Music.noteNames[halfSteps % 12];
        return `${note}${octave}`.padEnd(3, '_');
    }
}