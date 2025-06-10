"use strict";

Struct.BigNumber = class BigNumber {
    constructor(significand, exponent) {
        //Only use this constructor if you know for certain that the values are already normalized.
        this._significand = significand;
        this._exponent = exponent;
    }

    static create(significand, exponent = 0) {
        return new Struct.BigNumber(significand, exponent)._normalize();
    }
    static LOG2_OF_10 = Math.log2(10);//3.321928094887362
    static LOG10_OF_2 = Math.log10(2);//0.301029995664
    static {
        this.MAX_NUMBER_EXPONENT_B10 = Math.trunc(Math.log10(Number.MAX_VALUE));
        this.MAX_NUMBER_SIGNIFICAND_B10 = Number.MAX_VALUE / (10 ** this.MAX_NUMBER_EXPONENT_B10);

        const error = (name) => { throw new Error(`BigNumber static constant changed: ${name}`); }
        this.ZERO_ = new this(0, 0);
        this.ZERO_.addOnChangedAction(() => { error("ZERO_"); });
        this.ONE_ = new this(1, 0);
        this.ONE_.addOnChangedAction(() => { error("ONE_"); });
        this.NEGATIVE_ONE_ = new this(-1, 0);
        this.NEGATIVE_ONE_.addOnChangedAction(() => { error("NEGATIVE_ONE_"); });
        this.HALF_ = new this(1, -1);
        this.HALF_.addOnChangedAction(() => { error("HALF_"); });
        this.HUNDRED_ = new this(25, 2);
        this.HUNDRED_.addOnChangedAction(() => { error("HUNDRED_"); });
    }
    static fromBase10Exp(significand, exponentBase10) {
        if (significand === 0)
            return Struct.BigNumber.ZERO;

        if (exponentBase10 === 0)
            return Struct.BigNumber.create(significand, 0);

        const absExponentBase10 = Math.abs(exponentBase10);
        const absSignificand = Math.abs(significand);
        if (absExponentBase10 < Struct.BigNumber.MAX_NUMBER_EXPONENT_B10 ||
            absExponentBase10 === Struct.BigNumber.MAX_NUMBER_EXPONENT_B10 &&
            absSignificand <= Struct.BigNumber.MAX_NUMBER_SIGNIFICAND_B10
        ) {
            const smallSignificand = significand * (10 ** exponentBase10);
            if (Number.isFinite(smallSignificand))
                return Struct.BigNumber.create(smallSignificand, 0);
        }

        return Struct.BigNumber.create(significand, exponentBase10 * Struct.BigNumber.LOG2_OF_10);
    }
    
    static get ZERO() {
        return new Struct.BigNumber(0, 0);
    }
    static get ONE() {
        return new Struct.BigNumber(1, 0);
    }
    static get NEGATIVE_ONE() {
        return new Struct.BigNumber(-1, 0);
    }
    static get HALF() {
        return new Struct.BigNumber(1, -1);
    }
    static get HUNDRED() {
        return new Struct.BigNumber(25, 2);
    }

    static _buffer = new ArrayBuffer(8);
    static _view = new DataView(this._buffer);
    static _float64Arr = new Float64Array(this._buffer);
    static _uint32Arr = new Uint32Array(this._buffer);

    _normalize() {
        if (this._significand === 0) {
            this._significand = 0;
            this._exponent = 0;
            return this;
        }

        if (!Number.isFinite(this._significand) || !Number.isFinite(this._exponent))
            throw new Error("Significand or exponent is not finite: " + this._significand + ", " + this._exponent);

        const bigNumber = Struct.BigNumber;
        const float64Arr = bigNumber._float64Arr;
        const uint32Arr = bigNumber._uint32Arr;

        const intExp = Math.trunc(this._exponent);
        const frac = this._exponent - intExp;
        if (frac !== 0) {
            this._significand *= 2 ** frac;
            this._exponent = intExp;
        }

        float64Arr[0] = this._significand;
        let significandExp = ((uint32Arr[1] >> 20) & 0x7FF) - 1023;// Extract exponent bits
        if (significandExp === 0)
            return this;// Already normalized

        if (significandExp === -1023){
            this._significand *= 2 ** 53;//Force denormalized to normalized
            float64Arr[0] = this._significand;
            significandExp = ((uint32Arr[1] >> 20) & 0x7FF) - 1023;// Extract exponent bits
            this._exponent -= 53;
        }

        uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | 0x3FF00000;// Set exponent to 1023 (bias for double precision)
        this._significand = float64Arr[0];
        this._exponent += significandExp;

        const significandAbs = Math.abs(this._significand);
        if (significandAbs >= 2) {
            this._significand *= 0.5;
            this._exponent += 1;
            if (this._significand >= 2)
                throw new Error("Significand out of bounds: " + this._significand);
        }
        else if (significandAbs < 1) {
            this._significand *= 2;
            this._exponent -= 1;
            if (this._significand < 1)
                throw new Error("Significand out of bounds: " + this._significand);
        }

        if (this._exponent > Number.MAX_SAFE_INTEGER || this._exponent < Number.MIN_SAFE_INTEGER) {
            throw new Error("Exponent out of bounds: " + this._exponent);
        }

        if (zonDebug) {
            if (!Number.isFinite(this._significand) || !Number.isFinite(this._exponent))
                throw new Error("Significand or exponent is not finite: " + this._significand + ", " + this._exponent);

            float64Arr[0] = this._significand;
            const significandExp = ((uint32Arr[1] >> 20) & 0x7FF) - 1023;// Extract exponent bits
            if (significandExp !== 0)
                throw new Error(`Significand exponent should always be zero after normalization.  ${significandExp} != 0`);
        }

        return this;
    }
    addOnChangedAction(action) {
        if (this._onChangedAction === undefined)
            this._onChangedAction = new Actions.Action();

        this._onChangedAction.add(action);
    }
    set(otherBigNumber) {
        if (this._onChangedAction !== undefined) {
            const oldSignificand = this._significand;
            const oldExponent = this._exponent;
            this._significand = otherBigNumber._significand;
            this._exponent = otherBigNumber._exponent;
            if (oldSignificand !== this._significand || oldExponent !== this._exponent) {
                this._onChangedAction.call(this);
            }
        }
        else {
            this._significand = otherBigNumber._significand;
            this._exponent = otherBigNumber._exponent;
        }
    }
    _set(significand, exponent) {
        if (this._onChangedAction !== undefined) {
            const oldSignificand = this._significand;
            const oldExponent = this._exponent;
            this._significand = significand;
            this._exponent = exponent;
            if (oldSignificand !== this._significand || oldExponent !== this._exponent) {
                this._onChangedAction.call(this);
            }
        }
        else {
            this._significand = significand;
            this._exponent = exponent;
        }
    }
    get exponent() {
        return this._exponent;
    }
    set exponent(value) {
        if (this._exponent === value)
            return;

        this._exponent = value;
        this._normalize();
        if (this._onChangedAction !== undefined)
            this._onChangedAction.call(this);
    }
    get significand() {
        return this._significand;
    }
    set significand(value) {
        if (this._significand === value)
            return;

        this._significand = value;
        this._normalize();
        if (this._onChangedAction !== undefined)
            this._onChangedAction.call(this);
    }
    get clone() {
        return new Struct.BigNumber(this._significand, this._exponent);
    }
    get isPositive() {
        return this._significand > 0;
    }
    get isZero() {
        return this._significand === 0;
    }
    get isNegative() {
        return this._significand < 0;
    }
    negativeI() {
        if (this._significand === 0)
            return this;

        this._significand = -this._significand;
        if (this._onChangedAction !== undefined)
            this._onChangedAction.call(this);

        return this;
    }
    negative() {
        if (this._significand === 0)
            return this.clone;

        return new Struct.BigNumber(-this._significand, this._exponent);
    }
    equals(other) {
        return this._significand === other._significand && this._exponent === other._exponent;
    }
    notEquals(other) {
        return !this.equals(other);
    }
    lessThan(other) {
        if (this._significand < 0) {
            //this is negative, other is anything
            
            if (other._significand >= 0)
                return true;

            //this is negative, other is negative

            if (this._exponent > other._exponent)
                return true;

            if (this._exponent < other._exponent)
                return false;

            return this._significand < other._significand;
        }
        
        if (this._significand > 0) {
            //this is positive, other is anything
            
            if (other._significand <= 0)
                return false;

            //this is positive, other is positive

            if (this._exponent < other._exponent)
                return true;

            if (this._exponent > other._exponent)
                return false;

            return this._significand < other._significand;
        }
        
        //this is zero, other is anything

        return other._significand < 0;
    }
    greaterThan(other) {
        return other.lessThan(this);
    }
    lessThanOrEqual(other) {
        return !other.lessThan(this);
    }
    greaterThanOrEqual(other) {
        return !this.lessThan(other);
    }
    _setExponentI(newExponent) {
        if (this._significand === 0)
            throw new Error("Cannot set exponent of zero BigNumber");

        if (this._exponent === newExponent)
            return this;

        const diff = this._exponent - newExponent;
        if (diff < -53) {
            this._significand = 0;
            this._exponent = 0;
            return this;
        }
        
        if (zonDebug) {
            if (diff > 0)
                throw new Error(`_setExpenentI() is only meant to decrease the exponent of a BigNumber.  this._exponent should always be less than newExponent: ${this._exponent} > ${newExponent}`);
        }

        const bigNumber = Struct.BigNumber;
        const float64Arr = bigNumber._float64Arr;
        const uint32Arr = bigNumber._uint32Arr;

        this._exponent = newExponent;
        float64Arr[0] = this._significand;
        const upper32 = uint32Arr[1];
        if (zonDebug) {
            const significandExp = ((upper32 >> 20) & 0x7FF) - 1023;// Extract exponent bits
            if (significandExp !== 0)
                throw new Error(`Significand exponent should always be zero.  ${significandExp} != 0`);
        }
        
        uint32Arr[1] = (upper32 & 0x800FFFFF) | ((1023 + diff) << 20);// Set exponent to new value
        this._significand = float64Arr[0];

        return this;
    }
    _setExponent(newExponent) {
        return this.clone._setExponentI(newExponent);
    }
    addI(other) {
        if (this._significand === 0) {
            this.set(other);
            return this;
        }

        if (other._significand === 0)
            return this;

        if (zonDebug) {
            let otherSignificand2;
            let thisCopy = this.clone;
            if (this._exponent > other._exponent) {
                otherSignificand2 = other.clone._setExponentI(this._exponent)._significand;
            } else {
                if (this._exponent < other._exponent)
                    thisCopy._setExponentI(other._exponent);

                otherSignificand2 = other._significand;
            }

            if (Math.abs(otherSignificand2 + thisCopy._significand) >= 4)
                console.error(`Significand out of bounds: ${this._significand} + ${otherSignificand2}`);
        }

        let otherSignificand;
        if (this._exponent > other._exponent) {
            otherSignificand = other.clone._setExponentI(this._exponent)._significand;
        } else {
            if (this._exponent < other._exponent)
                this._setExponentI(other._exponent);

            otherSignificand = other._significand;
        }

        this._significand += otherSignificand;
        if (this._significand === 0) {
            this._significand = 0;
            this._exponent = 0;
            if (this._onChangedAction !== undefined)
                this._onChangedAction.call(this);

            return this;
        }

        if (this._significand >= 0 && otherSignificand >= 0) {
            //Both are positive
            if (this._significand >= 2) {
                this._significand *= 0.5;
                this._exponent += 1;
                if (this._significand >= 2)
                    throw new Error(`Significand out of bounds: ${this._significand}`);
            }

            if (this._onChangedAction !== undefined)
                this._onChangedAction.call(this);

            return this;
        }
        else if (this._significand <= 0 && otherSignificand <= 0) {
            //Both are negative
            if (this._significand <= -2) {
                this._significand *= 0.5;
                this._exponent += 1;
                if (this._significand <= -2)
                    throw new Error(`Significand out of bounds: ${this._significand}`);
            }

            if (this._onChangedAction !== undefined)
                this._onChangedAction.call(this);

            return this;
        }
        else {
            //added values were different signs, so the result could be a lot less than +/-0.5
            const result = this._normalize();
            
            if (this._onChangedAction !== undefined)
                this._onChangedAction.call(this);

            return result;
        }
    }
    add(other) {
        return this.clone.addI(other);
    }
    subtractI(other) {
        return this.addI(other.negative());
    }
    subtract(other) {
        return this.clone.addI(other.negative());
    }
    multiplyI(other) {
        if (this._significand === 0 || other._significand === 0) {
            this._significand = 0;
            this._exponent = 0;
            this._set(0, 0);
            return this;
        }

        this._significand *= other._significand;
        this._exponent += other._exponent;
        const result = this._normalize();
        if (this._onChangedAction !== undefined)
            this._onChangedAction.call(this);

        return result;
    }
    multiply(other) {
        return this.clone.multiplyI(other);
    }
    divideI(other) {
        if (other._significand === 0)
            throw new Error("Cannot divide by zero");

        if (this._significand === 0) {
            this._set(0, 0);
            return this;
        }

        this._significand /= other._significand;
        this._exponent -= other._exponent;
        const result = this._normalize();
        if (this._onChangedAction !== undefined)
            this._onChangedAction.call(this);

        return result;
    }
    divide(other) {
        return this.clone.divideI(other);
    }
    toNumber() {
        if (this._significand === 0)
            return 0;

        //const bumped = this._tryBumpUp();//Wasn't being used before.  Try using it if toNumber() is giving fractions close to whole numbers.
        if (this._exponent >= 1023 || this._exponent <= -1022) {
            throw new Error(`This number is too large or too small to fit into a Number: ${this._significand} * 2^${this._exponent}`);
        }

        const bigNumber = Struct.BigNumber;
        const float64Arr = bigNumber._float64Arr;
        const uint32Arr = bigNumber._uint32Arr;

        float64Arr[0] = this._significand;
        //uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | ((bumped._exponent + 1023) << 20);
        uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | ((this._exponent + 1023) << 20);
        return float64Arr[0];
    }
    multiplyByPow10(pow10Exponent) {
        return this.multiply(Struct.BigNumber.fromBase10Exp(1, pow10Exponent));
    }
    toBase10() {
        if (this._significand === 0) {
            return {
                significand: 0,
                exponent: 0
            };
        }

        const sign = this._significand < 0 ? -1 : 1;
        const base10Exp = Math.log10(this._significand * sign) + this._exponent * Struct.BigNumber.LOG10_OF_2;//log(2) + 9007199254740991 * 0.301029995664 = 2711437152600000
        const exponent = Math.floor(base10Exp);//roughly 2e2,711,437,153,777,064  Point being, there is no reason to use BigInt for the exponent.
        const significand = Math.pow(10, base10Exp - exponent) * sign;
        return {
            significand,
            exponent
        };
    }
    toBase2() {
        throw new Error(`BigNumber is already in base 2.  This method should not be used.`);
    }
    truncI() {
        if (this._significand === 0) {
            this._set(0, 0);
            return this;
        }

        //this._tryBumpUpI();
        if (this._exponent >= 53)
            return this;

        if (this._exponent < 0) {
            this._set(0, 0);
            return this;
        }

        const bigNumber = Struct.BigNumber;
        const float64Arr = bigNumber._float64Arr;
        const uint32Arr = bigNumber._uint32Arr;

        float64Arr[0] = this._significand;
        //uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | ((bumped._exponent + 1023) << 20);
        uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | ((this._exponent + 1023) << 20);
        if (this._onChangedAction !== undefined) {
            let significand = Math.trunc(float64Arr[0]);
            float64Arr[0] = significand;
            uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | 0x3FF00000;// Set exponent to 1023 (bias for double precision)
            significand = float64Arr[0];
            if (this._significand !== significand) {
                this._significand = significand;
                this._onChangedAction.call(this);
            }
        }
        else {
            this._significand = Math.trunc(float64Arr[0]);
            float64Arr[0] = this._significand;
            uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | 0x3FF00000;// Set exponent to 1023 (bias for double precision)
            this._significand = float64Arr[0];
        }

        return this;
    }
    trunc() {
        return this.clone.truncI();
    }
    floorI() {
        if (this._significand === 0) {
            this._set(0, 0);
            return this;
        }

        if (this._exponent >= 53)
            return this;

        if (this._exponent < 0) {
            // If exponent is negative, value is between -1 and 1, so floor is:
            this._set(this._significand < 0 ? -1 : 0, 0);
            return this;
        }

        const bigNumber = Struct.BigNumber;
        const float64Arr = bigNumber._float64Arr;
        const uint32Arr = bigNumber._uint32Arr;

        float64Arr[0] = this._significand;
        uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | ((this._exponent + 1023) << 20);
        if (this._onChangedAction !== undefined) {
            let significand = Math.floor(float64Arr[0]);
            float64Arr[0] = significand;
            uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | 0x3FF00000;// Set exponent to 1023 (bias for double precision)
            significand = float64Arr[0];
            if (this._significand !== significand) {
                this._significand = significand;
                this._onChangedAction.call(this);
            }
        }
        else {
            this._significand = Math.floor(float64Arr[0]);
            float64Arr[0] = this._significand;
            uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | 0x3FF00000;// Set exponent to 1023 (bias for double precision)
            this._significand = float64Arr[0];
        }

        return this;
    }
    floor() {
        return this.clone.floorI();
    }
    roundI() {
        if (this._significand === 0) {
            this._set(0, 0);
            return this;
        }

        //this._tryBumpUpI();
        if (this._exponent >= 53)
            return this;

        if (this._exponent < -1) {
            this._set(0, 0);
            return this;
        }

        const bigNumber = Struct.BigNumber;
        const float64Arr = bigNumber._float64Arr;
        const uint32Arr = bigNumber._uint32Arr;

        float64Arr[0] = this._significand;
        //uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | ((bumped._exponent + 1023) << 20);
        uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | ((this._exponent + 1023) << 20);
        if (this._onChangedAction !== undefined) {
            let significand = Math.round(float64Arr[0]);
            float64Arr[0] = significand;
            const exponent = ((uint32Arr[1] >> 20) & 0x7FF) - 1023;// Extract exponent bits
            uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | 0x3FF00000;// Set exponent to 1023 (bias for double precision)
            significand = float64Arr[0];
            const changed = this._significand !== significand || this._exponent !== exponent;
            if (changed) {
                this._significand = significand;
                this._exponent = exponent;
                this._onChangedAction.call(this);
            }
        }
        else {
            this._significand = Math.round(float64Arr[0]);
            float64Arr[0] = this._significand;
            this._exponent = ((uint32Arr[1] >> 20) & 0x7FF) - 1023;// Extract exponent bits

            uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | 0x3FF00000;// Set exponent to 1023 (bias for double precision)
            this._significand = float64Arr[0];
        }

        return this;
    }
    round() {
        return this.clone.roundI();
    }
    toWholeNumber() {
        if (this._significand === 0)
            return { wholeNumber: Struct.BigNumber.ZERO, remainder: Struct.BigNumber.ZERO };

        if (this._exponent >= 53)
            return { wholeNumber: this.clone, remainder: Struct.BigNumber.ZERO };

        // const bumped = this._tryBumpUp();
        // if (bumped._exponent >= 53)
        //     return { wholeNumber: bumped, remainder: Struct.BigNumber.ZERO };

        // if (bumped._exponent < 0)
        //     return { wholeNumber: Struct.BigNumber.ZERO, remainder: bumped };

        if (this._exponent < 0)
            return { wholeNumber: Struct.BigNumber.ZERO, remainder: this.clone };

        const bigNumber = Struct.BigNumber;
        const float64Arr = bigNumber._float64Arr;
        const uint32Arr = bigNumber._uint32Arr;

        let remainder = this._significand;
        float64Arr[0] = this._significand;
        //uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | ((bumped._exponent + 1023) << 20);
        uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | ((this._exponent + 1023) << 20);
        let significand = Math.trunc(float64Arr[0]);
        float64Arr[0] = significand;
        uint32Arr[1] = (uint32Arr[1] & 0x800FFFFF) | 0x3FF00000;// Set exponent to 1023 (bias for double precision)
        significand = float64Arr[0];
        remainder -= significand;

        return {
            wholeNumber: new Struct.BigNumber(significand, this._exponent),
            remainder: Struct.BigNumber.create(remainder, this._exponent)
        }
    }
    static min(left, right) {
        return left.min(right);
    }
    min(other) {
        return this.lessThan(other) ? this.clone : other.clone;
    }
    static max(left, right) {
        return left.max(right);
    }
    max(other) {
        return this.greaterThan(other) ? this.clone : other.clone;
    }
    absI() {
        if (this._onChangedAction !== undefined) {
            const significand = Math.abs(this._significand);
            if (this._significand !== significand) {
                this._significand = significand;
                this._onChangedAction.call(this);
            }
        }
        else {
            this._significand = Math.abs(this._significand);
        }

        return this;
    }
    abs() {
        return this.clone.absI();
    }
    // _tryBumpUpI() {
    //     if (this._significand === 0)
    //         return this;

    //     //const threshold = 1.99999999999999;
    //     const threshold = 1.99999;
    //     if (this._significand >= threshold) {
    //         this._significand = 1;
    //         this._exponent += 1;
    //     }

    //     return this;
    // }
    // _tryBumpUp() {
    //     return this.clone._tryBumpUpI();
    // }
    // _tryBumpDown(bits = 20) {
    //     if (this._significand === 0)
    //         return this.clone;

    //     const factor = 2 ** bits;
    //     const reducedSignificand = Math.floor(this._significand * factor) / factor;
    //     return Struct.BigNumber.create(reducedSignificand, this._exponent)._normalize();
    // }
    linearProgress(start, end) {
        if (start.greaterThanOrEqual(end))
            return Struct.BigNumber.ZERO;

        if (this.lessThanOrEqual(start))
            return Struct.BigNumber.ZERO;

        if (this.greaterThanOrEqual(end))
            return Struct.BigNumber.ONE;

        return this.subtract(start).divideI(end.subtract(start));
    }
    logarithmicProgress(start, end) {
        if (start.greaterThanOrEqual(end))
            return Struct.BigNumber.ZERO;

        if (this.lessThanOrEqual(start))
            return Struct.BigNumber.ZERO;

        if (this.greaterThanOrEqual(end))
            return Struct.BigNumber.ONE;

        const startLog10 = start.log10Number();
        return (this.log10Number() - startLog10) / (end.log10Number() - startLog10);
    }
    log10Number() {
        if (this._significand <= 0)
            throw new Error("Cannot take logarithm of zero or negative number");

        //Max this can be: log(2) + 9007199254740991 * 3.32193 which still fits fine in Number.
        //If converting exponenet to BigInt, what is the max value of exponent and what would that be in base 10?
        //Number.MAX_VALUE is 1.79E+308
        //log(2) + exp * 3.32193 = 1.79E+308
        //exp = (1.79E+308 - log(2)) / 3.32193
        //exp = 5.39E+307
        //This means the max value of BigNumber that wouldn't break this function is 2 * 2^5.39E+307
        //From there, just need to convert to base ten which gives 10^1.62E+307 which is way larger than I could ever use.  No reason for BigInt.
        return Math.log10(this._significand) + this._exponent * Struct.BigNumber.LOG10_OF_2;
    }
    log10() {
        return Struct.BigNumber.create(this.log10Number(), 0);
    }
    log2Number() {
        if (this._significand <= 0)
            throw new Error("Cannot take logarithm of zero or negative number");

        return Math.log2(this._significand) + this._exponent;
    }
    log2I() {
        this._significand = this.log2Number();
        this._exponent = 0;
        const result = this._normalize();
        if (this._onChangedAction !== undefined)
            this._onChangedAction.call(this);

        return result;
    }
    log2() {
        return this.clone.log2I();
    }
    logNumber(base) {
        if (this._significand <= 0)
            throw new Error("Cannot take logarithm of zero or negative number");

        if (base <= 1)
            throw new Error("Base must be greater than 1");

        const logBase2 = this.log2Number();
        return logBase2 / Math.log2(base);
    }
    logI(base) {
        this._significand = this.logNumber(base);
        this._exponent = 0;
        const result = this._normalize();
        if (this._onChangedAction !== undefined)
            this._onChangedAction.call(this);

        return result;
    }
    log(base) {
        return this.clone.logI(base);
    }
    powI(bigNumberExponent) {
        if (bigNumberExponent._significand === 0) {
            this._set(1, 0);
            return this;
        }

        if (this._significand === 0) {
            this._set(0, 0);
            return this;
        }

        if (this._significand > 0) {
            const logBase2 = this.log2();
            logBase2.multiplyI(bigNumberExponent);
            this._significand = 1;
            this._exponent = logBase2.toNumber();
            const result = this._normalize();
            if (this._onChangedAction !== undefined)
                this._onChangedAction.call(this);

            return result;
        }
        else {
            if (bigNumberExponent.trunc().notEquals(bigNumberExponent))
                throw new Error(`Exponent must be an integer for negative base.  Given: ${bigNumberExponent.s()}`);

            this._significand = -this._significand;
            const sign = bigNumberExponent._exponent <= 53 ? bigNumberExponent.toNumber() % 2 === 0 ? 1 : -1 : -1;

            const logBase2 = this.log2();
            logBase2.multiplyI(bigNumberExponent);
            this._significand = sign;
            this._exponent = logBase2.toNumber();
            const result = this._normalize();
            if (this._onChangedAction !== undefined)
                this._onChangedAction.call(this);
            
            return result;
        }
    }
    pow(bigNumberExponent) {
        return this.clone.powI(bigNumberExponent);
    }
    powNumberExponentI(exponent) {
        if (exponent === 0) {
            this._set(1, 0);
            return this;
        }

        if (this._significand === 0) {
            this._set(0, 0);
            return this;
        }

        if (this._significand > 0) {
            const logBase2 = this.log2Number();
            if (exponent > Number.MAX_VALUE / logBase2)
                throw new Error(`Exponent is too large: ${exponent} for base: ${this._significand}`);

            this._significand = 1;
            this._exponent = logBase2 * exponent;
            const result = this._normalize();
            if (this._onChangedAction !== undefined)
                this._onChangedAction.call(this);

            return result;
        }
        else {
            if (Math.trunc(exponent) !== exponent)
                throw new Error(`Exponent must be an integer for negative base.  Given: ${exponent}`);

            this._significand = -this._significand;
            const logBase2 = this.log2Number();
            if (exponent > Number.MAX_VALUE / logBase2)
                throw new Error(`Exponent is too large: ${exponent} for base: ${this._significand}`);

            this._significand = (exponent % 2 === 0) ? 1 : -1;
            this._exponent = logBase2 * exponent;
            const result = this._normalize();
            if (this._onChangedAction !== undefined)
                this._onChangedAction.call(this);

            return result;
        }
    }
    powNumberExponent(exponent) {
        return this.clone.powNumberExponentI(exponent);
    }
    toTime(decimals = 2, scientific = false, removeTrailingZeros = true) {
        const days = this.divide(Struct.BigNumber.create(86400));
        const { wholeNumber: daysWholeNumber, remainder: daysRemainder } = days.toWholeNumber();
        const remaining = daysRemainder.toNumber() * 86400;
        return StringHelper.ToTime2(daysWholeNumber, remaining, decimals, scientific, removeTrailingZeros);
    }
    isFinite() {
        const finite = Number.isFinite(this._significand) && Number.isFinite(this._exponent);
        if (!finite)
            throw new Error(`BigNumber is not finite: ${this._significand} * 2^${this._exponent}`);

        return finite;
    }
    write(writer) {
        writer.writeNumber(this._significand);
        writer.writeInt53AutoLength(this._exponent);
    }
    static read(reader) {
        const significand = reader.readNumber();
        const exponent = reader.readInt53AutoLength();
        return new Struct.BigNumber(significand, exponent);
    }
    toString() {
        return this.s();
    }
    toFullString() {
        return `${this.s()} (${this._significand} * 2^${this._exponent})`;
    }
    toBinaryFullString() {
        return `${this.toFullString()} S: ${this.significand.toBinaryString()}, E: ${this.exponent.toBinaryString()}`;
    }
    percentString(decimals = 2) {
        return this.multiply(Struct.BigNumber.HUNDRED).s(decimals, false, true) + "%";
    }
    s(decimals = 2, scientific = false, removeTrailingZeros = true) {
        if (this.significand === 0) {
            return `0${(!removeTrailingZeros && decimals > 0 ? `.${"0".repeat(decimals)}` : "")}`;
        }

        const { significand: base10Significand, exponent: base10CombinedExponentInt } = this.toBase10();
        const negative = base10Significand < 0;
        let s = (negative ? -base10Significand : base10Significand).toString();
        let exp = base10CombinedExponentInt;

        s = s.replace(".", "");
        
        let frontZeros = 0;
        if (exp < 0) {
            const willRoundUp = -exp === decimals + 1 && s[0] >= '5' && s[0] <= '9' && (!scientific || exp > -4);
            const newExp = willRoundUp ? exp + 1 : exp;
            if (exp < 0 && (-newExp <= decimals) && (!scientific || newExp > -3)) {
                frontZeros = -exp;
            }
        }

        const frontSize = exp >= 0 && (!scientific || exp < 3) && exp < 36 ? exp % 3 + 1 : 1;
        s = Struct.BigNumber.roundToSize(s, decimals + frontSize - frontZeros);
        if (s === "") {
            s = "1";
            exp++;
            if (frontZeros !== 0)
                frontZeros = -exp;
        }

        const noExponent = exp >= 0 ? exp < 3 : exp > -3 && -exp <= decimals;

        // Add 0s to front when less than 1
        if (frontZeros > 0)
            s = "0".repeat(frontZeros) + s;

        // Add 0s to the end if fewer significant digits than needed
        if (s.length < 1 + decimals)
            s += "0".repeat(1 + decimals - s.length);

        if (!noExponent && (scientific && exp >= 3 || exp >= 36 || (exp < -decimals ? true : scientific))) {
            // Scientific
            const front = s.substring(0, 1);
            const d = s.substring(1);
            const result = `${(negative ? "-" : "")}${front}${(d.length > 0 ? `.${d}` : "")}`;
            return (removeTrailingZeros ? result.RemoveTrailingZeros() : result) + `e${exp}`;
        } else {
            // Abbreviations
            if (exp > 0) {
                const abrGroup = Math.floor(exp / 3);
                let expAbr;
                switch (abrGroup) {
                    case 0:
                        expAbr = "";
                        break;
                    case 1:
                        expAbr = "k";
                        break;
                    case 2:
                        expAbr = "m";
                        break;
                    case 3:
                        expAbr = "b";
                        break;
                    case 4:
                        expAbr = "t";
                        break;
                    case 5:
                        expAbr = "qa";
                        break;
                    case 6:
                        expAbr = "qu";
                        break;
                    case 7:
                        expAbr = "sx";
                        break;
                    case 8:
                        expAbr = "sp";
                        break;
                    case 9:
                        expAbr = "o";
                        break;
                    case 10:
                        expAbr = "n";
                        break;
                    case 11:
                        expAbr = "d";
                        break;
                    default:
                        expAbr = "error";
                        throw new Error(`s: ${s}, abrGroup: ${abrGroup}, Significand: ${this.significand}, exponent: ${this.exponent}, significandExponent: ${this.significandExponent}`);
                }

                const groupExp = abrGroup * 3;
                const frontExp = exp - groupExp;
                const frontLength = frontExp + 1;
                if (s.length < frontLength) {
                    s += '0'.repeat(frontExp - (s.length - 1));
                }

                if (s.length === frontLength) {
                    if (decimals > 0 && !removeTrailingZeros) {
                        s += `.${'0'.repeat(decimals)}`;
                    }
                } else {
                    s = s.substring(0, frontLength) + (decimals > 0 ? `.${s.substring(frontLength)}` : "");
                    const missingZeros = frontLength + 1 + decimals - s.length;
                    if (missingZeros > 0 && !removeTrailingZeros)
                        s += '0'.repeat(missingZeros);
                }

                return `${(negative ? "-" : "")}${(removeTrailingZeros ? s.RemoveTrailingZeros() : s)}${expAbr}`;
            } else {
                const front = s.substring(0, 1);
                const d = s.substring(1);
                const result = `${(negative ? "-" : "")}${front}${(d.length > 0 ? `.${d}` : "")}`;
                return removeTrailingZeros ? result.RemoveTrailingZeros() : result;
            }
        }
    }
    static roundToSize(s, size) {
        if (s.length < size + 1)
            return s;

        if (s.length !== size + 1)
            s = s.substring(0, size + 1);

        const last = s[size];
        if (last >= '5' && last <= '9') {
            let lastIndex = size - 1;
            while (lastIndex >= 0 && s[lastIndex] === '9') {
                lastIndex--;
            }

            if (lastIndex < 0) {
                return "";//Overflow with carry of 1.
            }
            else {
                s = s.substring(0, lastIndex) + String.fromCharCode(s.charCodeAt(lastIndex) + 1);
                return s;
            }
        }
        else {
            return s.substring(0, size);
        }
    }
    static abbreviationGroups = {
        "k": 1,
        "m": 2,
        "b": 3,
        "t": 4,
        "qa": 5,
        "qu": 6,
        "sx": 7,
        "sp": 8,
        "o": 9,
        "n": 10,
        "d": 11
    };
    static parse(valueString) {
        const smallFloat = parseFloat(valueString);
        if (!isNaN(smallFloat)) {
            return Struct.BigNumber.create(smallFloat);
        }

        let backValue = 0;
        for (const [key, val] of Object.entries(Struct.BigNumber.abbreviationGroups)) {
            const index = valueString.indexOf(key);
            if (index > -1) {
                const abrLength = key.length;
                let newString = valueString.substring(0, index);
                if (valueString.length >= index + abrLength) {
                    const backString = valueString.substring(index + abrLength);
                    newString += backString;
                }

                valueString = newString;
                backValue = val * 3;
                break;
            }
        }

        let e = valueString.indexOf('e');
        if (e < 0)
            e = valueString.indexOf('E');

        if (e >= 0) {
            if (e === 0)
                return null;

            const front = valueString.substring(0, e);
            const frontValue = parseFloat(front);
            if (isNaN(frontValue))
                return null;

            if (e < valueString.length - 1) {
                const back = valueString.substring(e + 1);
                const backValue2 = parseFloat(back);
                if (isNaN(backValue2))
                    return null;

                backValue += backValue2;
            }

            return Struct.BigNumber.fromBase10Exp(frontValue, backValue);
        } else {
            const doubleValue = parseFloat(valueString);
            if (!isNaN(doubleValue)) {
                if (backValue > 0)
                    return Struct.BigNumber.fromBase10Exp(doubleValue, backValue);

                return Struct.BigNumber.create(doubleValue);
            }
        }

        return null;
    }
}