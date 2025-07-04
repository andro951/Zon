"use strict";

const Binary = {};

//internal static string toBinaryString(this long l, int length = longNum) => l > 0 ? "0" + Convert.ToString(l, 2).PadLeft(length, '0') : "1" + Convert.ToString(l, 2).Substring(1).PadLeft(length, '0');
BigInt.prototype.toBinaryString = function (length = null) {
    const value = this;
    if (length === null) {
        // Default to minimal required length
        length = value >= 0n ? value.toString(2).length : BigInt.asUintN(64, value).toString(2).length; // Default to 64-bit two's complement
    }

    const isNegative = value < 0n;
    const binary = isNegative ? BigInt.asUintN(length, value).toString(2).padStart(length, '0') : value.toString(2).padStart(length, '0');
    const prefix = isNegative ? '1' : '0';
    return prefix + binary;
};
Number.prototype.toUInt32BinaryString = function (length = null) {
    const value = this >>> 0; // Convert to unsigned 32-bit integer
    if (length === null) {
        length = Binary.BitExtractor.UINT_32_BITS; // Default to 32 bits
    }

    const binary = value.toString(2).padStart(length, '0');
    return binary;
};
Number.prototype.toBinaryString = function () {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setFloat64(0, this, false); // Big endian for standard layout

    let binary = '';
    for (let i = 0; i < 8; i++) {
        const byte = view.getUint8(i);
        binary += byte.toString(2).padStart(8, '0');
    }

    return binary;
};

Number.prototype.bitsToBytes = function () {
    return (this + 7) >> 3;//Acts as Math.Ceiling(this / 8)
}

BigInt.prototype.bitsToDoubleWord = function () {
    return (this + 31n) >> 5n;//Acts as Math.Ceiling(this / 32)
}

Number.prototype.bitLength32 = function () {
    //Math.ceil(Math.log2(this));

    let n = this;
    if (n < 0)
        throw new Error("bitLength is undefined for negative values.");

    let log = 0;
    if (n >> 16) { n >>= 16; log += 16; }
    if (n >> 8)  { n >>= 8;  log += 8;  }
    if (n >> 4)  { n >>= 4;  log += 4;  }
    if (n >> 2)  { n >>= 2;  log += 2;  }
    if (n >> 1)  {           log += 1;  }

    return log + 1;
};

Number.prototype.bitLength53 = function () {
    //Math.ceil(Math.log2(this));
    return this.toString(2).length;
}

BigInt.prototype.bitLength = function () {
    if (this < 0n)
        throw new Error("bitLength is undefined for values < 0.");

    return this.toString(2).length;//Tested, this is faster than looping.
}

Number.prototype.ceilPow2 = function () {
    //Returns the next power of 2 greater than or equal to this
    //Acts as  Math.Pow(2, Math.ceil(Math.log2(this)));
    
    let n = this >>> 0;// force to unsigned 32-bit
    if (this <= 0) {
        if (this == 0) {
            return 1;
        }
        else {
            throw new Error("Can't perform ceilPow2 on negative numbers.");
        }
    }

    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    return n + 1;
}

Binary.BitExtractor = class BitExtractor {
    constructor() {
        this.buffer = new ArrayBuffer(8);
        this.dataView = new DataView(this.buffer);
        this.uint8Array = new Uint8Array(this.buffer);
    }

    convertNumber = (num) => {
        this.dataView.setFloat64(0, num, true);
        return [ this.dataView.getUint32(0, true), this.dataView.getUint32(4, true) ];
    }

    convertToNumber = (low, high) => {
        this.dataView.setUint32(0, low, true);
        this.dataView.setUint32(4, high, true);
        return this.dataView.getFloat64(0, true);
    }

    convertInt53 = (num) => {
        this.dataView.setFloat64(0, num, true);
        const low = this.dataView.getUint32(0, true);
        const high = this.dataView.getUint32(4, true);
        const exp = ((high & Binary.BitExtractor.INT_53_EXP_MASK) >>> Binary.BitExtractor.INT_53_UPPER_BITS) - Binary.BitExtractor.INT_53_EXP_BIAS;
        const expShift = Binary.BitExtractor.INT_53_BITS - exp - 1 - Binary.BitExtractor.UINT_32_BITS;
        let intHigh;
        let intLow;
        if (exp <= Binary.BitExtractor.INT_53_UPPER_BITS) {
            intHigh = 0;
            intLow = ((high & Binary.BitExtractor.INT_53_UPPER_32_MASK) | Binary.BitExtractor.INT_53_UPPER_32_HIDDEN_1_MASK) >>> expShift;
        }
        else {
            const leftShift = Binary.BitExtractor.UINT_32_BITS + expShift;
            intHigh = (high & Binary.BitExtractor.INT_53_UPPER_32_MASK) | Binary.BitExtractor.INT_53_UPPER_32_HIDDEN_1_MASK;
            intLow = (intHigh << -expShift) | (low >>> leftShift);
            intHigh = intHigh >>> leftShift;
            //console.log(`intHigh: ${intHigh.toUInt32BinaryString()}, intLow: ${intLow.toUInt32BinaryString()}`);
        }

        //const numString = `${num.toBinaryString()}`;
        //const splitString = `${intHigh.toUInt32BinaryString()} ${intLow.toUInt32BinaryString()}`;
        // console.log(`Num String: ${numString}`);
        // console.log(`Split String: ${splitString}`);
        // console.log(`exp: ${exp} + 1023 = ${exp + Binary.BitExtractor.INT_53_EXP_BIAS} (${(exp + Binary.BitExtractor.INT_53_EXP_BIAS).toUInt32BinaryString(11)})`);

        return [ intLow, intHigh ];
    }

    convertToInt53 = (intLow, intHigh) => {
        let exp = intHigh > 0 ? intHigh.bitLength32() - 1 + Binary.BitExtractor.UINT_32_BITS : intLow.bitLength32() - 1;
        const expShift = Binary.BitExtractor.INT_53_BITS - exp - 1 - Binary.BitExtractor.UINT_32_BITS;
        let high;
        let low;
        if (exp <= Binary.BitExtractor.INT_53_UPPER_BITS) {
            high = intLow << expShift;
            low = 0;
        }
        else {
            const leftShift = Binary.BitExtractor.UINT_32_BITS + expShift;
            high = ((intHigh << leftShift) | (intLow >>> -expShift)) & Binary.BitExtractor.INT_53_UPPER_32_MASK;
            low = intLow << leftShift;
        }

        high |= ((exp + Binary.BitExtractor.INT_53_EXP_BIAS) << Binary.BitExtractor.INT_53_UPPER_BITS);

        this.dataView.setUint32(0, low, true);
        this.dataView.setUint32(4, high, true);

        //const result = this.dataView.getFloat64(0, true);

        //const inString = `${intHigh.toUInt32BinaryString()} ${intLow.toUInt32BinaryString()}`;
        //const outString = `${result.toBinaryString()}`;
        // console.log(`In String: ${inString}`);
        // console.log(`Out String: ${outString}`);
        // console.log(`exp: ${exp} + 1023 = ${exp + Binary.BitExtractor.INT_53_EXP_BIAS} (${(exp + Binary.BitExtractor.INT_53_EXP_BIAS).toUInt32BinaryString(11)})`);

        return this.dataView.getFloat64(0, true);
    }
    
    static BIG_UINT_32_BITS = 32n;
    static BIG_UINT_32_MULT_SHIFT = 5n;
    static BIG_UINT_32_MASK = 0xFFFFFFFFn;

    static UINT_32_BITS = 32;
    static INT_32_BITS = 31;
    static INT_32_PREFIX_BITS = 5;
    static UINT_32_MAX_VALUE = 0xFFFFFFFF;
    static INT_32_MAX_VALUE = 0x7FFFFFFF;

    static INT_53_BITS = 53;
    static INT_53_PREFIX_BITS = 6;
    static INT_53_MAX_VALUE = 0x001FFFFFFFFFFFFFF;
    static INT_53_UPPER_32_MASK = 0x000FFFFF;
    static INT_53_UPPER_32_HIDDEN_1_MASK = 0x00100000;
    static INT_53_EXP_MASK = 0x7FF00000;
    static INT_53_UPPER_BITS = 20;
    static INT_53_EXP_BIAS = 1023;
}
Binary.extractor = new Binary.BitExtractor();

Binary.Stream = class Stream {
    constructor(buffer) {
        this.buffer = buffer;
        this.dataView = new DataView(this.buffer);
        this.uint8Array = new Uint8Array(this.buffer);
        this.currentByte = 0;
    }

    static makeEmptyStream = (size) => {
        const buffer = new ArrayBuffer(size);
        return new Binary.Stream(buffer);
    }

    resize = (newBytes) => {
        if (this.buffer.byteLength > newBytes)
            throw new Error("Cannot resize to a smaller size");

        const newBuffer = new ArrayBuffer(newBytes);
        const newUint8Array = new Uint8Array(newBuffer);
        newUint8Array.set(this.uint8Array);
        this.buffer = newBuffer;
        this.dataView = new DataView(this.buffer);
        this.uint8Array = newUint8Array;
    }

    slice = () => {
        this.buffer = this.buffer.slice(0, this.currentByte);
        this.dataView = new DataView(this.buffer);
        this.uint8Array = new Uint8Array(this.buffer);
    }
}

Binary.Writer = class Writer {
    constructor() {
        this.numBuffer = 0;
        this.currentBit = 0;
        this.encoder = new TextEncoder();
    }

    createStream = (initialSize = 128) => {
        this.stream = Binary.Stream.makeEmptyStream(initialSize << 1);//initialSize * 2
        this.numBuffer = 0;
        this.currentBit = 0;
        return this;
    }

    get bytesRemaining() {
        return this.stream.buffer.byteLength - this.stream.currentByte;
    }

    getFinishedStream = () => {
        this._writeBufferToStream();
        this.stream.slice();
        return this.stream;
    }

    convertBufferToCompressedString = () => {
        const finishedStream = this.getFinishedStream();
        // return finishedStream.uint8Array;
        const compressedData = fflate.strFromU8(fflate.zlibSync(finishedStream.uint8Array), true);
        return btoa(compressedData);
    }

    saveToLocalStorage = (key) => {
        const saveString = this.convertBufferToCompressedString();
        localStorage.setItem(key, saveString);
    }

    _writeBufferToStream = () => {
        if (this.currentBit > 0) {
            const bytes = this.currentBit >= Binary.BitExtractor.UINT_32_BITS ? 4 : this.currentBit.bitsToBytes();
            this._checkSpace(4);
            if (bytes === 4) {
                this.stream.dataView.setUint32(this.stream.currentByte, this.numBuffer, true);
            }
            else {
                const mask = 0xFFFFFFFF >>> (Binary.BitExtractor.UINT_32_BITS - (bytes << 3));
                this.stream.dataView.setUint32(this.stream.currentByte, this.numBuffer & mask, true);
            }

            this.stream.currentByte += bytes;
            this.numBuffer = 0;
        }
    }

    _checkSpace = (bytes) => {
        if (this.bytesRemaining < bytes) {
            const neededBytes = this.stream.buffer.byteLength + bytes;
            let newBytes = neededBytes.ceilPow2();

            //If the new size will be >= 75% full, double the size
            if (neededBytes / newBytes >= 0.75)
                newBytes <<= 1;//newBytes * 2

            this.stream.resize(newBytes);
        }
    }

    writeBool = (b) => {
        if (b)
            this.numBuffer |= 1 << this.currentBit;

        this.currentBit++;
        if (this.currentBit === Binary.BitExtractor.UINT_32_BITS) {
            this._writeBufferToStream();
            this.currentBit = 0;
        }
    }

    writeUInt32 = (num, length = Binary.BitExtractor.UINT_32_BITS) => {
        if (num > Binary.BitExtractor.UINT_32_MAX_VALUE)
            throw new Error(`Number exceeds maximum value for uint32.  Value: ${num}, Length: ${length}`);

        if (length < 1)
            throw new Error(`Length must be at least 1.  Value: ${num}, Length: ${length}`);

        this.numBuffer |= (num << this.currentBit);
        this.currentBit += length;
        if (this.currentBit >= Binary.BitExtractor.UINT_32_BITS) {
            this._writeBufferToStream();
            this.currentBit -= Binary.BitExtractor.UINT_32_BITS;
            if (this.currentBit > 0)
                this.numBuffer = (num << Binary.BitExtractor.UINT_32_BITS - length) >>> (Binary.BitExtractor.UINT_32_BITS - this.currentBit);
        }
    }

    writeUInt32AutoLength = (num) => {
        const length = num.bitLength32();
        this.writeUInt32(length - 1, Binary.BitExtractor.INT_32_PREFIX_BITS);
        this.writeUInt32(num, length);
    }

    writeInt32 = (num, length = Binary.BitExtractor.INT_32_BITS) => {
        const negative = num < 0;
        const abs = negative ? -(num + 1) : num;
        if (abs > Binary.BitExtractor.INT_32_MAX_VALUE)
            throw new Error(`Number exceeds maximum value for int32.  Value: ${num}, Length: ${length}`);

        this.writeUInt32(abs, length);
        this.writeBool(negative);
    }

    writeInt32AutoLength = (num) => {
        const negative = num < 0;
        const abs = negative ? -(num + 1) : num;
        const length = abs.bitLength32();
        //console.log(`writeIntAutoLength: num: ${num}, negative: ${negative}, abs: ${abs}, length: ${length}`);
        this.writeUInt32(length - 1, Binary.BitExtractor.INT_32_PREFIX_BITS);
        this.writeUInt32(abs, length);
        this.writeBool(negative);
    }

    writeUInt53 = (num, length = Binary.BitExtractor.INT_53_BITS) => {
        if (num > Binary.BitExtractor.INT_53_MAX_VALUE)
            throw new Error(`Number exceeds maximum value for uint53.  Value: ${num}, Length: ${length}`);

        // if (length <= Binary.BitExtractor.UINT_32_BITS) {
        //     this.writeUInt32(num, length);
        //     return;
        // }

        const [ low, high ] = Binary.extractor.convertInt53(num);
        const small = length <= Binary.BitExtractor.UINT_32_BITS;
        this.writeUInt32(low, small ? length : Binary.BitExtractor.UINT_32_BITS);
        if (small)
            return;

        this.writeUInt32(high, length - Binary.BitExtractor.UINT_32_BITS);
    }

    writeUInt53AutoLength = (num) => {
        const length = num.bitLength53();
        this.writeUInt32(length - 1, Binary.BitExtractor.INT_53_PREFIX_BITS);
        this.writeUInt53(num, length);
    }

    writeInt53 = (num, length = Binary.BitExtractor.INT_53_BITS) => {
        const negative = num < 0;
        const abs = negative ? -num : num;
        this.writeUInt53(abs, length);
        this.writeBool(negative);
    }

    writeInt53AutoLength = (num) => {
        const negative = num < 0;
        const abs = negative ? -num : num;
        const length = abs.bitLength53();
        this.writeUInt32(length - 1, Binary.BitExtractor.INT_53_PREFIX_BITS);
        this.writeUInt53(abs, length);
        this.writeBool(negative);
    }

    writeNumber = (num) => {
        const [ low, high ] = Binary.extractor.convertNumber(num);
        this.writeUInt32(low, Binary.extractor.UINT_32_BITS);
        this.writeUInt32(high, Binary.extractor.UINT_32_BITS);
    }

    writeBigUInt = (bigUInt, length) => {
        const doubleWords = length.bitsToDoubleWord();
        for (let i = 0n; i < doubleWords - 1n; i++) {
            const num = Number(bigUInt & Binary.BitExtractor.BIG_UINT_32_MASK) >>> 0;
            //console.log(`writeBigUInt: i: ${i}, num: ${num}, bigUInt: ${bigUInt.toBinaryString()}`);
            this.writeUInt32(num, Binary.extractor.UINT_32_BITS);
            bigUInt >>= Binary.BitExtractor.BIG_UINT_32_BITS;
        }

        const lastBits = length - ((doubleWords - 1n) << Binary.BitExtractor.BIG_UINT_32_MULT_SHIFT);
        const mask = Binary.BitExtractor.BIG_UINT_32_MASK >> (Binary.BitExtractor.BIG_UINT_32_BITS - lastBits);
        const number = Number(bigUInt & mask);
        //console.log(`writeBigUInt: lastBits: ${lastBits}, mask: ${mask.toBinaryString()}, number: ${number}, bigUInt: ${bigUInt.toBinaryString()}`);
        this.writeUInt32(number, Number(lastBits));
    }

    writeBigUIntAutoLength = (bigUInt) => {
        const length = bigUInt.bitLength();
        this.writeUInt32AutoLength(length - 1);
        this.writeBigUInt(bigUInt, BigInt(length));
    }

    writeBigInt = (bigInt, length) => {
        const negative = bigInt < 0n;
        const abs = negative ? -bigInt : bigInt;
        this.writeBigUInt(abs, length);
        if (abs !== 0n)
            this.writeBool(negative);
    }

    writeBigIntAutoLength = (bigInt) => {
        const negative = bigInt < 0n;
        const abs = negative ? -bigInt : bigInt;
        const length = abs.bitLength();
        this.writeUInt32AutoLength(length - 1);
        this.writeBigUInt(abs, BigInt(length));
        if (abs !== 0n)
            this.writeBool(negative);
    }

    writeString = (string) => {
        const encoded = this.encoder.encode(string);
        this.writeUInt32AutoLength(encoded.length);

        const fullWords = encoded.length >>> 2; // floor(encoded.length / 4)
        const uint32Array = new Uint32Array(encoded.buffer, encoded.byteOffset, fullWords);
        for (let w = 0; w < fullWords; w++) {
            this.writeUInt32(uint32Array[w]);
        }

        // Write remaining 1–3 bytes
        for (let i = fullWords << 2; i < encoded.length; i++) {//i = fullWords * 4
            this.writeUInt32(encoded[i], 8);
        }
    }
}

Binary.Reader = class Reader {
    constructor() {
        this.numBuffer = 0;
        this.currentBit = Binary.BitExtractor.UINT_32_BITS;
        this.decoder = new TextDecoder();
    }

    loadFromLocalStorage = (key) => {
        const string = localStorage.getItem(key);
        if (!string)
            throw new Error(`No data found for key: ${key}`);

        this.setStreamFromString(string);
    }

    get bytesRemaining() {
        return this.stream.buffer.byteLength - this.stream.currentByte;
    }

    setStreamFromString = (string) => {
        this.stream = new Binary.Stream(fflate.unzlibSync(fflate.strToU8(atob(string), true)).buffer);
        if (this.stream.buffer.byteLength > 0 && this.stream.buffer.byteLength < 4)
            this.stream.resize(4);

        this.numBuffer = 0;
        this.currentBit = Binary.BitExtractor.UINT_32_BITS;
    }

    _readStreamIntoBuffer = () => {
        const bytesRemaining = this.bytesRemaining;
        if (bytesRemaining < 4) {
            if (bytesRemaining === 0)
                throw new Error("No bytes remaining in stream");

            this.numBuffer = this.stream.dataView.getUint32(this.stream.currentByte + bytesRemaining - 4, true) >>> ((4 - bytesRemaining) << 3);
            this.stream.currentByte += bytesRemaining;
        }
        else {
            this.numBuffer = this.stream.dataView.getUint32(this.stream.currentByte, true);
            this.stream.currentByte += 4;
        }
    }

    verifyFullyRead = () => {
        if (this.bytesRemaining > 0) {
            const error = `Stream not fully read — ${this.bytesRemaining} bytes remaining.`;
            console.error(error);
            throw new Error(error);
        }   
        
        if (this.currentBit === Binary.BitExtractor.UINT_32_BITS)
            return;

        const remainingBits = this.numBuffer >>> this.currentBit;
        if (remainingBits !== 0) {
            const error = `Bit buffer not fully read — currentBit is at ${this.currentBit}/32.  buffer: ${this.numBuffer.toUInt32BinaryString()}`;
            console.error(error);
            throw new Error(error);
        }
    };

    checkEmptyBuffer = () => {
        if (this.currentBit === Binary.BitExtractor.UINT_32_BITS) {
            this._readStreamIntoBuffer();
            this.currentBit = 0;
        }
    }

    readBool = () => {
        this.checkEmptyBuffer();

        const bit = (this.numBuffer >> this.currentBit) & 1;
        this.currentBit++;
        //console.log(`readBool: numBuffer: ${this.numBuffer.toUInt32BinaryString()}, currentBit: ${this.currentBit}, bit: ${bit}`);
        return bit === 1;
    }

    readUInt32 = (length = Binary.BitExtractor.UINT_32_BITS) => {
        this.checkEmptyBuffer();

        const originalBit = this.currentBit;
        this.currentBit += length;
        let result;
        if (this.currentBit > Binary.BitExtractor.UINT_32_BITS) {
            this.currentBit -= Binary.BitExtractor.UINT_32_BITS;
            const originalNumBuffer = this.numBuffer;
            this._readStreamIntoBuffer();
            const leftShift = Binary.BitExtractor.UINT_32_BITS - this.currentBit;
            const left = originalNumBuffer >>> originalBit;
            const right1 = this.numBuffer << leftShift;
            const right2 = leftShift - (Binary.BitExtractor.UINT_32_BITS - originalBit);
            const right = right1 >>> right2;
            const result2 = left | right;
            result = ((originalNumBuffer >>> originalBit) | ((this.numBuffer << leftShift) >>> (leftShift - (Binary.BitExtractor.UINT_32_BITS - originalBit)))) >>> 0;
            //console.log(`readUInt: length: ${length}, originalNumBuffer: ${originalNumBuffer.toUInt32BinaryString()}, originalBit: ${originalBit}, numBuffer: ${this.numBuffer.toUInt32BinaryString()}, leftShift: ${leftShift}, result: ${result}`);
        }
        else {
            const leftShift = Binary.BitExtractor.UINT_32_BITS - this.currentBit;
            result = ((this.numBuffer << leftShift) >>> (leftShift + originalBit)) >>> 0;
            //console.log(`readUInt: length: ${length}, numBuffer: ${this.numBuffer.toUInt32BinaryString()}, originalBit: ${originalBit}, leftShift: ${leftShift}, result: ${result}`);
        }

        return result; // Convert to unsigned 32-bit integer
    }

    readUInt32AutoLength = () => {
        const length = this.readUInt32(Binary.BitExtractor.INT_32_PREFIX_BITS) + 1;
        return this.readUInt32(length);
    }

    readInt32 = (length = Binary.BitExtractor.INT_32_BITS) => {
        let result = this.readUInt32(length);
        if (this.readBool())
            result = -result - 1;
        
        return result;
    }

    readInt32AutoLength = () => {
        const length = this.readUInt32(Binary.BitExtractor.INT_32_PREFIX_BITS) + 1;
        //console.log(`readIntAutoLength: length: ${length}`);
        return this.readInt32(length);
    }

    readUInt53 = (length = Binary.BitExtractor.INT_53_BITS) => {
        const small = length <= Binary.BitExtractor.UINT_32_BITS;
        const low = this.readUInt32(small ? length : Binary.BitExtractor.UINT_32_BITS);
        if (length <= Binary.BitExtractor.UINT_32_BITS)
            return low;

        const high = this.readUInt32(length - Binary.BitExtractor.UINT_32_BITS);
        return Binary.extractor.convertToInt53(low, high);
    }

    readUInt53AutoLength = () => {
        const length = this.readUInt32(Binary.BitExtractor.INT_53_PREFIX_BITS) + 1;
        return this.readUInt53(length);
    }

    readInt53 = (length = Binary.BitExtractor.INT_53_BITS) => {
        let result = this.readUInt53(length);
        if (this.readBool())
            result = -result;

        return result;
    }

    readInt53AutoLength = () => {
        const length = this.readUInt32(Binary.BitExtractor.INT_53_PREFIX_BITS) + 1;
        return this.readInt53(length);
    }

    readNumber = () => {
        const low = this.readUInt32(Binary.BitExtractor.UINT_32_BITS);
        const high = this.readUInt32(Binary.BitExtractor.UINT_32_BITS);
        return Binary.extractor.convertToNumber(low, high);
    }

    readBigUInt = (length) => {
        const doubleWords = length.bitsToDoubleWord();
        //console.log(`readBigUInt: length: ${length}, doubleWords: ${doubleWords}`);
        let result = 0n;
        for (let i = 0n; i < doubleWords - 1n; i++) {
            result |= BigInt(this.readUInt32(Binary.BitExtractor.UINT_32_BITS)) << (i << Binary.BitExtractor.BIG_UINT_32_MULT_SHIFT);
        }

        const lastBits = length - ((doubleWords - 1n) << Binary.BitExtractor.BIG_UINT_32_MULT_SHIFT);
        result |= (BigInt(this.readUInt32(Number(lastBits))) & (Binary.BitExtractor.BIG_UINT_32_MASK >> (Binary.BitExtractor.BIG_UINT_32_BITS - lastBits))) << ((doubleWords - 1n) << Binary.BitExtractor.BIG_UINT_32_MULT_SHIFT);
        return result;
    }

    readBigUIntAutoLength = () => {
        const length = this.readUInt32AutoLength() + 1;
        return this.readBigUInt(BigInt(length));
    }

    readBigInt = (length) => {
        let result = this.readBigUInt(length);
        if (result === 0n)
            return 0n;

        if (this.readBool())
            result = -result;

        return result;
    }

    readBigIntAutoLength = () => {
        const length = this.readUInt32AutoLength() + 1;
        //console.log(`readBigIntAutoLength: length: ${length}`);
        return this.readBigInt(BigInt(length));
    }

    readString = () => {
        const length = this.readUInt32AutoLength();
        if (length === 0)
            return '';
        
        const uint8Array = new Uint8Array(length);
        const uint32Array = new Uint32Array(uint8Array.buffer, uint8Array.byteOffset, length >>> 2); // floor(length / 4)
        for (let w = 0; w < uint32Array.length; w++) {
            uint32Array[w] = this.readUInt32();
        }

        // Read remaining 1–3 bytes
        for (let i = uint32Array.length << 2; i < length; i++) {//i = uint32Array.length * 4
            uint8Array[i] = this.readUInt32(8);
        }

        return this.decoder.decode(uint8Array);
    }
}