"use strict";

Struct.BigNumber = class BigNumber {
    constructor(significand, exponent) {
        this.significand = significand;//Number
        this.exponent = exponent;//Number
        this._normalize();
    }

    static _buffer = new ArrayBuffer(8);
    static _view = new DataView(this._buffer);
    static _float64Arr = new Float64Array(this._buffer);//TODO: use this for binary helper!
    static _uint32Arr = new Uint32Array(this._buffer);

    _normalize() {
        if (Object.is(this.significand, -0) || this.significand === 0) {
            this.significand = 0;
            this.exponent = 0;
            return;
        }

        if (!Number.isFinite(this.significand) || !Number.isFinite(this.exponent))
            throw new Error("Significand or exponent is not finite: " + this.significand + ", " + this.exponent);

        const bigNumber = Struct.BigNumber;
        const float64Arr = bigNumber._float64Arr;
        const uint32Arr = bigNumber._uint32Arr;

        const intExp = this.exponent | 0;
        const frac = this.exponent - intExp;
        if (frac !== 0) {
            this.significand *= 2 ** frac;
            this.exponent = intExp;
        }

        float64Arr[0] = this.significand;
        let significandExp = ((uint32Arr[1] >> 20) & 0x7FF) - 1023;// Extract exponent bits
        if (significandExp === 0)
            return;// Already normalized

        uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | 0x3FF00000;// Set exponent to 1023 (bias for double precision)
        this.significand = float64Arr[0];
        this.exponent += significandExp;

        if (this.exponent > Number.MAX_SAFE_INTEGER || this.exponent < Number.MIN_SAFE_INTEGER) {
            throw new Error("Exponent out of bounds: " + this.exponent);
        }

        if (zonDebug) {
            if (!Number.isFinite(this.significand) || !Number.isFinite(this.exponent))
                throw new Error("Significand or exponent is not finite: " + this.significand + ", " + this.exponent);
        }
    }
}