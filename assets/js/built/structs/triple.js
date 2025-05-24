"use strict";

Numbers.Triple = class {
    static get ZERO() {
        return new Numbers.Triple(0n, 0n, 0n);
    }
    static get ONE() {
        return new Numbers.Triple(1n, 0n, 0n);
    }
    static get NEGATIVE_ONE() {
        return new Numbers.Triple(-1n, 0n, 0n);
    }
    static get HALF() {
        return new Numbers.Triple(1n, -1n, 0n);
    }

    constructor(significand, exponent, significandExponent) {
        this._significand = significand;
        this._exponent = exponent;
        this._significandExponent = significandExponent;
    }

    static create(significand, exponent = 0n) {
        const triple = new Numbers.Triple(0n, exponent, 0n);
        triple.significand = significand;
        return triple;
    }
    static fromNumber(num, exponent = 0n) {
        const triple = new Numbers.Triple(0n, 0n, 0n);
        if (num === 0)
            return triple;
        
        if (isNaN(num) || !isFinite(num))
            throw new RangeError(`Value must be a finite number.  num: ${num}, exponent: ${exponent}`);

        const sign = num < 0 ? -1n : 1n;

        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        view.setFloat64(0, num);
        /*
        May need to reverse these because of big endian vs little endian
        const low = view.getUint32(0, true);
        const high = view.getUint32(4, true);
        */
        const high = view.getUint32(0);
        const low = view.getUint32(4);
        const bits = (BigInt(high) << 32n) | BigInt(low);

        const binaryExp = ((bits >> 52n) & 0x7FFn) - 1023n;

        let realSignificand = bits & 0xFFFFFFFFFFFFFn;
        if (binaryExp !== -1023n) {
            realSignificand |= 0x10000000000000n;
        }

        triple._exponent = binaryExp + exponent - 52n;
        triple.significand = realSignificand * sign;

        return triple;
    }
    get exponent() {
        return this._exponent;
    }
    set exponent(value) {
        this._exponent = value;
    }
    get significand() {
        return this._significand;
    }
    set significand(value) {
        if (this._significand === value)
            return;

        this._significand = value;
        this.onSetSignificand();
    }
    get significandExponent() {
        return this._significandExponent;
    }
    get combinedExponent() {
        return this._exponent + this._significandExponent;
    }
    get clone() {
        return new Numbers.Triple(this._significand, this._exponent, this._significandExponent);
    }
    onSetSignificand() {
        this.normalizeSignificand();
        this.calculateSignificandExponent();
    }
    normalizeSignificand() {
        if (this._significand === 0n) {
            this.exponent = 0n;
            return;
        }

        const trailingZeros = Numbers.Triple.trailingZeroCount(this.significand);
        this._significand >>= trailingZeros;
        this._exponent += trailingZeros;
    }
    static trailingZeroCount(value) {
        if (value === 0n)
            return 0n;

        let count = 0n;
        let lowestBit = value & -value;
        while (lowestBit !== 1n) {
            lowestBit >>= 1n;
            count++;
        }

        return count;
    }
    calculateSignificandExponent() {
        if (this._significand === 0n) {
            this._significandExponent = 0n;
            return;
        }

        this._significandExponent = BigInt((this.significand < 0n ? -this.significand : this.significand).bitLength()) - 1n;
    }
    get isPositive() {
        return this.significand > 0n;
    }
    get isZero() {
        return this.significand === 0n;
    }
    get isNegative() {
        return this.significand < 0n;
    }
    padSignificand(forAddition = false) {
        if (this._significand === 0n)
            return this.clone;

        const newSignificandExponent = forAddition ? 61n : 62n;//Adding could cause an overflow, so use 61 instead of full 62.
		const exp = newSignificandExponent - this._significandExponent;

        if (exp > 0) {
            const result = new Numbers.Triple(this._significand << exp, this._exponent - exp, newSignificandExponent);
            if (zonDebug) {
                if (this.isPositive && result.isNegative || this.isNegative && result.isPositive) 
                    console.error("PadSignificand error; this: ", this.toFullString(), "result: ", result.toFullString());
            }

            return result;
        }
        else if (exp < 0) {
            const result = new Numbers.Triple(this._significand >> -exp, this._exponent - exp, newSignificandExponent);
            if (zonDebug) {
                if (this.isPositive && result.isNegative || this.isNegative && result.isPositive) 
                    console.error("PadSignificand error; this: ", this.toFullString(), "result: ", result.toFullString());
            }

            return result;
        }
        else {
            return new Numbers.Triple(this.significand, this._exponent, this._significandExponent);
        }
    }
    setExponent(newExponent) {
        const expDiff = newExponent - this._exponent;
        if (expDiff === 0n)
            return this.clone;

        if (expDiff > 0n) {
            if (expDiff > 63n)
                return Numbers.Triple.ZERO;

            const result = new Numbers.Triple(this._significand >> expDiff, newExponent, this._significandExponent - expDiff);
            if (zonDebug) {
                if (this.isPositive && result.isNegative || this.isNegative && result.isPositive || this.combinedExponent !== result.combinedExponent)
                    console.error("SetExponent error; this: ", this.toFullString(), "result: ", result.toFullString());
            }
            
            return result;
        }
        else {
            const result = new Numbers.Triple(this._significand << -expDiff, newExponent, this._significandExponent - expDiff);
            if (expDiff < -63n)
                throw new RangeError(`Exponent difference is too large, causing a loss in data.  this: ${this.toFullString()}, significand << ${-expDiff} results in zero, causing a loss in data. expDiff: ${expDiff}, result: ${result.toFullString()}`);

            if (zonDebug) {
                if (this.isPositive && result.isNegative || this.isNegative && result.isPositive || this.combinedExponent !== result.combinedExponent)
                    console.error("SetExponent error; this: ", this.toFullString(), "result: ", result.toFullString());
            }

            

            return result;
        }
    }
    negative() {
        return new Numbers.Triple(-this.significand, this.exponent, this.significandExponent);
    }
    lessThan(right) {
        if (!this.isPositive) {
            //left is negative or zero

            if (right.isPositive)
                return true;

            //right is negative or zero

            if (this.isZero)
                return right.isNegative;

            //left is negative

            if (right.isZero)
                return true;

            //right is negative

            if (this.combinedExponent > right.combinedExponent)
                return true;
        }
        else {
            //left is positive

            if (!right.isPositive)
                return false;

            //right is positive

            if (this.combinedExponent < right.combinedExponent)
                return true;
        }

        if (this.exponent != right.exponent) {
            if (this.combinedExponent > right.combinedExponent) {
                const paddedLeft = this.padSignificand();
                const rightNewExponent = right.setExponent(paddedLeft.exponent);
                return paddedLeft.significand < rightNewExponent.significand;
            }
            else if (this.combinedExponent < right.combinedExponent) {
                const paddedRight = right.padSignificand();
                const leftNewExponent = this.setExponent(paddedRight.exponent);
                return leftNewExponent.significand < paddedRight.significand;
            }
            else {
                const paddedLeft = this.padSignificand();
                const paddedRight = right.padSignificand();
                if (paddedLeft.exponent !== paddedRight.exponent) {
                    if (this._exponent > right._exponent) {
                        const rightNewExponent = right.setExponent(paddedLeft.exponent);
                        return paddedLeft.significand < rightNewExponent.significand;
                    }
                    else {
                        const leftNewExponent = this.setExponent(paddedRight.exponent);
                        return leftNewExponent.significand < paddedRight.significand;
                    }
                }

                return paddedLeft.significand < paddedRight.significand;
            }
        }

        return this.significand < right.significand;
    }
    greaterThan(right) {
        return right.lessThan(this);
    }
    lessThanOrEqual(right) {
        return this.equals(right) || this.lessThan(right);
    }
    greaterThanOrEqual(right) {
        return !this.lessThan(right);
    }
    equals(right) {
        return this.exponent === right.exponent && this.significand === right.significand;
    }
    notEquals(right) {
        return !this.equals(right);
    }
    static LONG_MAX_VALUE = 0x7FFFFFFFFFFFFFFFn;
    static LONG_MIN_VALUE = -0x8000000000000000n;
    add(right) {
		if (this.significand === 0n)
			return right.clone;

		if (right.significand === 0n)
			return this.clone;

		if (this.exponent !== right.exponent) {
			if (right.abs() < this.abs()) {
				const paddedLeft = this.padSignificand(true);
				const rightNewExponent = right.setExponent(paddedLeft.exponent);
				return Numbers.Triple.create(paddedLeft.significand + rightNewExponent.significand, paddedLeft.exponent);
			}
			else {
				const paddedRight = right.padSignificand(true);
				const leftNewExponent = this.setExponent(paddedRight.exponent);
				return Numbers.Triple.create(leftNewExponent.significand + paddedRight.significand, paddedRight.exponent);
			}
		}

		if (this.isPositive) {
			if (right.isPositive) {
				const max = Numbers.Triple.LONG_MAX_VALUE - this.significand;
				if (right.significand > max) {
					return Numbers.Triple.create((this.significand >> 1n) + (right.significand >> 1n), this.exponent + 1n);
				}
			}
		}
		else if (right.isNegative) {
			const min = Numbers.Triple.LONG_MIN_VALUE - this.significand;
			if (right.significand < min) {
				return Numbers.Triple.create((this.significand >> 1n) + (right.significand >> 1n), this.exponent + 1n);
			}
		}
        if (zonDebug) {
            const newSignificand = this.significand + right.significand;
            let error;
            if (this._exponent !== right._exponent) {
                error = true;
            }
            else {
                if (newSignificand > 0n) {
                    if (this.isPositive) {
                        if (right.isPositive) {
                            error = false;
                        }
                        else {
                            error = -right.significand > this.significand;
                        }
                    }
                    else {
                        if (right.isPositive) {
                            error = -this.significand > right.significand;
                        }
                        else {
                            error = true;
                        }
                    }
                }
                else if (newSignificand < 0n) {
                    if (this.isNegative) {
                        if (right.isNegative) {
                            error = false;
                        }
                        else {
                            error = -this.significand < right.significand;
                        }
                    }
                    else {
                        if (right.isNegative) {
                            error = -right.significand < this.significand;
                        }
                        else {
                            error = true;
                        }
                    }
                }
                else {
                    if (this.isZero) {
                        error = !right.isZero;
                    }
                    else if (right.isZero) {
                        error = !this.isZero;
                    }
                    else {
                        error = this.significand != -right.significand;
                    }
                }
            }

            if (error)
                console.error(`Triple Addition Error; left: (${this.significand}, ${this._exponent}), right: (${right.significand}, ${right._exponent}), newSignificand: ${newSignificand}`);
        }

		return Numbers.Triple.create(this.significand + right.significand, this.exponent);
    }
    subtract(right) {
        return this.add(right.negative());
    }
    multiply(right) {
        const totalSignificandExponent = this._significandExponent + right._significandExponent;
		const significandExponentToReduceBy = totalSignificandExponent - 61n;
		if (significandExponentToReduceBy <= 0n) {//61 instead of 63 to round the significands up to the next power of 2
            if (zonDebug) {
                const mult = this.significand * right.significand;
                let error;
                if (mult > 0n) {
                    error = this.isPositive ? right.isNegative : right.isPositive;
                }
                else if (mult < 0n) {
                    error = this.isNegative ? right.isNegative : right.isPositive;
                }
                else {
                    error = !this.isZero && !right.isZero;
                }

                if (error)
                    console.error(`Triple Multiplication Error; left: ${this} (${this.significand}, ${this._exponent}), right: ${right} (${right.significand}, ${right._exponent}), newSignificand: ${mult}`);
            }

			return Numbers.Triple.create(this.significand * right.significand, this.exponent + right.exponent);
		}

		const significandExpDiff = this._significandExponent - right._significandExponent;
		if (significandExpDiff >= 0n) {
			//left larger significandExponent
			if (significandExpDiff >= significandExponentToReduceBy) {
				const reducedLeft = this.setExponent(this._exponent + significandExponentToReduceBy);
                if (zonDebug) {
                    const mult = reducedLeft.significand * right.significand;
                    let error;
                    if (mult > 0n) {
                        error = reducedLeft.isPositive ? right.isNegative : right.isPositive;
                    }
                    else if (mult < 0n) {
                        error = reducedLeft.isNegative ? right.isNegative : right.isPositive;
                    }
                    else {
                        error = !reducedLeft.isZero && !right.isZero;
                    }

                    if (error)
                    console.error(`Triple Multiplication Error; left: ${this} (${this.significand}, ${this._exponent}), right: ${right} (${right.significand}, ${right._exponent}), newSignificand: ${mult}`);
                }

				return Numbers.Triple.create(reducedLeft.significand * right.significand, reducedLeft.exponent + right.exponent);
			}
			else {
				significandExponentToReduceBy -= significandExpDiff;
				const newRightSignificandExponentReduction = significandExponentToReduceBy / 2;
				const newLeftSignificandExponentReduction = significandExpDiff + significandExponentToReduceBy - newRightSignificandExponentReduction;
				const reducedLeft = this.setExponent(this._exponent + newLeftSignificandExponentReduction);
				const reducedRight = right.setExponent(right._exponent + newRightSignificandExponentReduction);
                if (zonDebug) {
                    const mult = reducedLeft.significand * reducedRight.significand;
                    let error;
                    if (mult > 0n) {
                        error = reducedLeft.isPositive ? reducedRight.isNegative : reducedRight.isPositive;
                    }
                    else if (mult < 0n) {
                        error = reducedLeft.isNegative ? reducedRight.isNegative : reducedRight.isPositive;
                    }
                    else {
                        error = !reducedLeft.isZero && !reducedRight.isZero;
                    }

                    if (error)
                    console.error(`Triple Multiplication Error; left: ${this} (${this.significand}, ${this._exponent}), right: ${right} (${right.significand}, ${right._exponent}), newSignificand: ${mult}`);
                }

				return Numbers.Triple.create(reducedLeft.significand * reducedRight.significand, reducedLeft.exponent + reducedRight.exponent);
			}
		}
		else {
			significandExpDiff *= -1n;
			//right larger significandExponent
			if (significandExpDiff >= significandExponentToReduceBy) {
				const reducedRight = right.setExponent(right._exponent + significandExponentToReduceBy);
                if (zonDebug) {
                    const mult = this.significand * reducedRight.significand;
                    let error;
                    if (mult > 0n) {
                        error = this.isPositive ? reducedRight.isNegative : reducedRight.isPositive;
                    }
                    else if (mult < 0n) {
                        error = this.isNegative ? reducedRight.isNegative : reducedRight.isPositive;
                    }
                    else {
                        error = !this.isZero && !reducedRight.isZero;
                    }

                    if (error)
                    console.error(`Triple Multiplication Error; left: ${this} (${this.significand}, ${this._exponent}), right: ${right} (${right.significand}, ${right._exponent}), newSignificand: ${mult}`);
                }

				return Numbers.Triple.create(this.significand * reducedRight.significand, this.exponent + reducedRight.exponent);
			}
			else {
				significandExponentToReduceBy -= significandExpDiff;
				const newLeftSignificandExponentReduction = significandExponentToReduceBy / 2;
				const newRightSignificandExponentReduction = significandExpDiff + significandExponentToReduceBy - newLeftSignificandExponentReduction;
				const reducedLeft = this.setExponent(this._exponent + newLeftSignificandExponentReduction);
				const reducedRight = right.setExponent(right._exponent + newRightSignificandExponentReduction);
                if (zonDebug) {
                    const mult = reducedLeft.significand * reducedRight.significand;
                    let error;
                    if (mult > 0n) {
                        error = reducedLeft.isPositive ? reducedRight.isNegative : reducedRight.isPositive;
                    }
                    else if (mult < 0n) {
                        error = reducedLeft.isNegative ? reducedRight.isNegative : reducedRight.isPositive;
                    }
                    else {
                        error = !reducedLeft.isZero && !reducedRight.isZero;
                    }

                    if (error)
                    console.error(`Triple Multiplication Error; left: ${this} (${this.significand}, ${this._exponent}), right: ${right} (${right.significand}, ${right._exponent}), newSignificand: ${mult}`);
                }

                return Numbers.Triple.create(reducedLeft.significand * reducedRight.significand, reducedLeft.exponent + reducedRight.exponent);
			}
		}
    }
    divide(right) {
        if (right.isZero)
            throw new Exception("Division by zero.  left: " + this.toFullString() + " / right: " + right.toFullString());

        if (this.isZero)
            return Zero;

        const paddedLeft = this.padSignificand();
        return Numbers.Triple.fromNumber(Number(paddedLeft.significand) / Number(right.significand), paddedLeft.exponent - right.exponent);
    }
    static toNumber(triple) {
        const bumped = triple.tryBumpUp();
        return triple.exponent === 0n ? Number(triple.significand) : Number(triple.significand) * Math.pow(2, Number(triple.exponent));
    }
    toNumber() {
        return Numbers.Triple.toNumber(this);
    }
    static Log2of10 = Math.log(10) / Math.log(2);
    static Log10of2 = Math.log(2) / Math.log(10);
    static base10ToBase2(exponentBase10) {
        let fraction = exponentBase10 * Numbers.Triple.Log2of10;
        const exponentBase2 = Math.trunc(fraction);
        fraction -= exponentBase2;
        return {
            exponentBase2: BigInt(exponentBase2),
            fraction,
        };
    }
    static triplePow10(significand, exponentBase10) {
        if (significand === 0)
            return Numbers.Triple.ZERO;

        if (exponentBase10 === 0)
            return Numbers.Triple.fromNumber(significand, 0n);

        const { exponentBase2, fraction } = Numbers.Triple.base10ToBase2(exponentBase10);
        const base10FractionMult = Math.pow(2, fraction);
        const number = Number(significand) * base10FractionMult;
        return Numbers.Triple.fromNumber(number, exponentBase2);
    }
    multiplyByPow10(pow10Exponent) {
        return this.multiply(Numbers.Triple.triplePow10(1n, pow10Exponent));
    }
    static toBase10(triple) {
        if (triple.significand === 0n)
            return { significand: 0, exponent: 0 };

        const sign = triple.significand < 0n ? -1 : 1;
        const base10Exp = Math.log10(Number(triple.significand) * sign) + Number(triple.exponent) * Numbers.Triple.Log10of2;
        const exponent = Math.floor(base10Exp);
        const base10ExpFraction = base10Exp - exponent;
        const significand = Math.pow(10, base10ExpFraction);
        return {
            significand: significand * sign,
            exponent: exponent,
        };
    }
    static toBase2(triple) {
        const sig = Number(triple.significand) / Math.pow(2, Number(triple.significandExponent));
        return {
            significand: sig,
            exponent: triple.combinedExponent,
        };
    }
    toBase2() {
        return Numbers.Triple.toBase2(this);
    }
    static truncate(triple) {
        return triple.truncate();
    }
    truncate() {
        if (this.isZero)
            return Numbers.Triple.ZERO;

        const thisBumped = this.tryBumpUp();

        if (thisBumped.exponent >= 0n)
            return thisBumped;

        if (-thisBumped.exponent > thisBumped.significandExponent)
            return Numbers.Triple.ZERO;

        if (thisBumped.isNegative) {
            return new Numbers.Triple.create(-((-thisBumped.significand) >> -thisBumped.exponent));
        }

        const wholeNumberSignificand = thisBumped.significand >> -thisBumped.exponent;
        return new Numbers.Triple.create(wholeNumberSignificand);
    }
    static round(triple) {
        return triple.round();
    }
    round() {
        const { wholeNumber, remainder } = toWholeNumber(this);
        if (remainder.greaterThanOrEqual(Numbers.Triple.HALF))
            return wholeNumber.add(Numbers.Triple.ONE);

        return wholeNumber;
    }
    toWholeNumber() {
        if (this.isZero)
            return { wholeNumber: Numbers.Triple.ZERO, remainder: Numbers.Triple.ZERO };

        const thisBumped = this.tryBumpUp();

        if (thisBumped.exponent >= 0n)
            return { wholeNumber: thisBumped, remainder: Numbers.Triple.ZERO };

        if (-thisBumped.exponent > thisBumped.significandExponent)
            return { wholeNumber: Numbers.Triple.ZERO, remainder: thisBumped };

        const shift = 63n + thisBumped.exponent;

        if (thisBumped.isNegative) {
            const remainder = new Numbers.Triple.create((-thisBumped.significand) & (Numbers.Triple.LONG_MAX_VALUE >> shift), thisBumped.exponent);
            return { wholeNumber: new Numbers.Triple.create(-((-thisBumped.significand) >> -thisBumped.exponent)), remainder };
        }

        const wholeNumberSignificand = thisBumped.significand >> -thisBumped.exponent;
        const remainder = new Numbers.Triple.create(thisBumped.significand & (Numbers.Triple.LONG_MAX_VALUE >> shift), thisBumped.exponent);
        return { wholeNumber: new Numbers.Triple.create(wholeNumberSignificand), remainder };
    }
    static min(left, right) {
        if (left.lessThan(right))
            return left;

        return right;
    }
    static max(left, right) {
        if (left.greaterThan(right))
            return left;

        return right;
    }
    abs() {
        return new Numbers.Triple(this.significand < 0n ? -this.significand : this.significand, this.exponent, this.significandExponent);
    }
    static abs(triple) {
        return triple.abs();
    }
    tryBumpDown(bumpDownExponent = 20n) {
        if (this.significand === 0n)
            return this.clone;

        if (this._significandExponent <= bumpDownExponent)
            return this.clone;

        const result = this.setExponent(this.exponent + this._significandExponent - bumpDownExponent);
        result.onSetSignificand();
        return result;
    }
    tryBumpUp(bumpUpExponent = 5n) {
        if (this.significand === 0n)
            return this.clone;

        if (this._significandExponent <= bumpUpExponent)
            return this.clone;

        const mask = Numbers.Triple.LONG_MAX_VALUE >> (62n - this._significandExponent);
        if ((mask & this.significand) === mask)
            return new Numbers.Triple.create(this.significand + 1n, this.exponent);

        return this.clone;
    }
    toString() {
        return this.s();
    }
    toFullString() {
        return `${this.s()} (${this.significand} * 2^${this.exponent})`;
    }
    toBinaryFullString() {
        return `${this.toFullString()} S: ${this.significand.ToBinaryString()}, E: ${this.exponent.ToBinaryString()}`;
    }
    percentString(decimals = 2) {
        return this.multiply(Numbers.Triple.HUNDRED).s(decimals, false, true) + "%";
    }
    s(decimals = 2, scientific = false, removeTrailingZeros = true) {
        if (this.significand === 0n) {
            return `0${(!removeTrailingZeros && decimals > 0 ? `.${"0".repeat(decimals)}` : "")}`;
        }

        const { significand: base10Significand, exponent: base10CombinedExponentInt } = Numbers.Triple.toBase10(this);
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
        s = Numbers.Triple.roundToSize(s, decimals + frontSize - frontZeros);
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
    static tryParse(valueString) {
        let backValue = 0;
        for (const [key, val] of Object.entries(Numbers.abbreviationGroups)) {
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
                return [false, Numbers.Triple.ZERO];

            const front = valueString.substring(0, e);
            const frontValue = parseFloat(front);
            if (isNaN(frontValue))
                return [false, Numbers.Triple.ZERO];

            if (e < valueString.length - 1) {
                const back = valueString.substring(e + 1);
                const backValue2 = parseFloat(back);
                if (isNaN(backValue2))
                    return [false, Numbers.Triple.ZERO];

                backValue += backValue2;
            }

            return [true, Numbers.Triple.triplePow10(frontValue, backValue)];
        } else {
            const doubleValue = parseFloat(valueString);
            if (!isNaN(doubleValue)) {
                if (backValue > 0)
                    return [true, Numbers.Triple.triplePow10(doubleValue, backValue)];

                return [true, Numbers.Triple.fromNumber(doubleValue)];
            }
        }

        return [false, Numbers.Triple.ZERO];
    };
    static parse(valueString) {
        const [ result, string ] = Numbers.Triple.tryParse(valueString);
        if (result)
            return string;

        throw new Error(`Failed to parse ${valueString} into a Triple.`);
    }
    toTime(decimals = 2, scientific = false, removeTrailingZeros = true) {
        const days = this.divide(Numbers.Triple.create(86400n));
        const { wholeNumber: daysWholeNumber, remainder: daysRemainder } = days.toWholeNumber();
        const remaining = daysRemainder.toNumber() * 86400;
        return StringHelper.ToTime2(daysWholeNumber, remaining, decimals, scientific, removeTrailingZeros);
    }
    log2() {
        return Numbers.Triple.log2(this);
    }
    log2Number() {
        return Numbers.Triple.log2Number(this);
    }
    static log2(triple) {
        return Numbers.Triple.fromNumber(Numbers.Triple.log2Number(triple));
    }
    static log2Number(triple) {
        if (triple.isZero)
            throw new Error("Cannot compute logarithm of zero.");

        return Math.log(Number(triple.significand)) / Math.log(2) + Number(triple.exponent);
    }
    static log10(triple) {
        return Numbers.Triple.fromNumber(log10Number(triple));
    }
    static log10Number(triple) {
        if (triple.isZero)
            throw new Error("Cannot compute logarithm of zero.");

        return Math.log10(Number(triple.significand)) + Number(triple.exponent) / Numbers.Triple.Log2of10;
    }
    log(newBase) {
        return Numbers.Triple.log(this, newBase);
    }
    static log(triple, newBase) {
        if (triple.isZero)
            throw new Error("Logarithm of zero is undefined");

        if (!newBase.isPositive)
            throw new Error("Base must be greater than zero");

        const valueLog = triple.log2();
        const baseLog = newBase.log2();
        if (baseLog.equals(Numbers.Triple.ZERO))
            throw new Error("Base cannot be 1");

        return valueLog.divide(baseLog);
    }
    static pow(triple, tripleExponent) {
        if (tripleExponent.isZero)
            return Numbers.Triple.ONE;

        if (triple.isZero)
            return Numbers.Triple.ZERO;

        if (triple.isPositive) {
            const resultLog2 = triple.log2().multiply(tripleExponent);
            const { wholeNumber, remainder } = resultLog2.toWholeNumber();
            const exp = wholeNumber.significand << wholeNumber.exponent;
            const sigPow2 = Math.pow(2, remainder.toNumber());
            return Numbers.Triple.fromNumber(sigPow2, exp);
        } else {
            const { wholeNumber: wholeNumberExponent, remainder: expRemainder } = tripleExponent.toWholeNumber();
            if (expRemainder.notEquals(Numbers.Triple.ZERO))
                throw new Error("Cannot raise negative number to non-integer power");

            const sign = wholeNumberExponent.significand % 2n === 0n || wholeNumberExponent.exponent > 0n ? 1 : -1;

            const resultLog2 = triple.negative().log2().multiply(tripleExponent);
            const { wholeNumber, remainder } = resultLog2.toWholeNumber();

            const exp = wholeNumber.significand << wholeNumber.exponent;
            const sigPow2 = Math.pow(2, remainder.toNumber());
            return Numbers.Triple.fromNumber(sigPow2 * sign, exp);
        }
    }
    static powNumber(triple, numberExponent) {
        if (numberExponent === 0)
            return Numbers.Triple.ONE;

        if (triple === 0)
            return Numbers.Triple.ZERO;

        if (triple.isPositive) {
            const valueLog2 = triple.log2Number();
            if (numberExponent > Number.MAX_VALUE / valueLog2)
                throw new Error("Exponent too large");

            const resultLog2 = valueLog2 * numberExponent;
            const exp = Math.trunc(resultLog2);
            return Numbers.Triple.fromNumber(Math.pow(2, resultLog2 - exp), BigInt(exp));
        } else {
            if (numberExponent % 1 !== 0)
                throw new Error("Cannot raise a negative number to a non-integer power.");

            const valueLog2 = (-triple).log2Number();
            if (numberExponent > Number.MAX_VALUE / valueLog2)
                throw new Error("Exponent too large");

            const sign = numberExponent % 2 === 0 ? 1 : -1;

            const resultLog2 = valueLog2 * numberExponent;
            const exp = Math.trunc(resultLog2);
            return Numbers.Triple.fromNumber(Math.pow(2, resultLog2 - exp) * sign, BigInt(exp));
        }
    }
    pow(tripleExponent) {
        return Numbers.Triple.pow(this, tripleExponent);
    }
    powNumber(numberExponent) {
        return Numbers.Triple.powNumber(this, numberExponent);
    }
}

Numbers.Triple.HUNDRED = Numbers.Triple.create(100n);