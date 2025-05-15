"use strict";

const Binary = {};

//internal static string ToBinaryString(this long l, int length = longNum) => l > 0 ? "0" + Convert.ToString(l, 2).PadLeft(length, '0') : "1" + Convert.ToString(l, 2).Substring(1).PadLeft(length, '0');
BigInt.prototype.ToBinaryString = function (length = null) {
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
Number.prototype.ToUInt32BinaryString = function (length = null) {
    const value = this >>> 0; // Convert to unsigned 32-bit integer
    if (length === null) {
        length = Binary.BitExtractor.UINT_32_BITS; // Default to 32 bits
    }

    const binary = value.toString(2).padStart(length, '0');
    return binary;
};

Number.prototype.bitsToBytes = function () {
    return (this + 7) >> 3;//Acts as Math.Ceiling(this / 8)
}

BigInt.prototype.bitsToDoubleWord = function () {
    return (this + 31n) >> 5n;//Acts as Math.Ceiling(this / 32)
}

Number.prototype.bitLength = function () {
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

Binary.BitExtractor = class {
    constructor() {
        this.buffer = new ArrayBuffer(8);
        this.dataView = new DataView(this.buffer);
        this.uint8Array = new Uint8Array(this.buffer);
    }

    convertNumber(num) {
        this.dataView.setFloat64(0, num, true);
        return [ this.dataView.getUint32(0, true), this.dataView.getUint32(4, true) ];
    }

    convertToNumber(low, high) {
        this.dataView.setUint32(0, low, true);
        this.dataView.setUint32(4, high, true);
        return this.dataView.getFloat64(0, true);
    }
    
    static BIG_UINT_32_BITS = 32n;
    static BIG_UINT_32_MULT_SHIFT = 5n;
    static BIG_UINT_32_MASK = 0xFFFFFFFFn;

    static UINT_32_BITS = 32;
    static INT_32_BITS = 31;
    static INT_32_PREFIX_BITS = 5;
    static uint32MaxValue = 0xFFFFFFFF;
    static INT_32_MAX_VALUE = 0x7FFFFFFF;
}
Binary.extractor = new Binary.BitExtractor();

Binary.Stream = class {
    constructor(buffer) {
        this.buffer = buffer;
        this.dataView = new DataView(this.buffer);
        this.uint8Array = new Uint8Array(this.buffer);
        this.currentByte = 0;
    }

    static makeEmptyStream(size) {
        const buffer = new ArrayBuffer(size);
        return new Binary.Stream(buffer);
    }

    resize(newBytes) {
        if (this.buffer.byteLength > newBytes)
            throw new Error("Cannot resize to a smaller size");

        const newBuffer = new ArrayBuffer(newBytes);
        const newUint8Array = new Uint8Array(newBuffer);
        newUint8Array.set(this.uint8Array);
        this.buffer = newBuffer;
        this.dataView = new DataView(this.buffer);
        this.uint8Array = newUint8Array;
    }

    slice() {
        this.buffer = this.buffer.slice(0, this.currentByte);
        this.dataView = new DataView(this.buffer);
        this.uint8Array = new Uint8Array(this.buffer);
    }
}

Binary.Writer = class {
    constructor() {
        this.numBuffer = 0;
        this.currentBit = 0;
    }

    createStream(initialSize = 128) {
        this.stream = Binary.Stream.makeEmptyStream(initialSize << 1);//initialSize * 2
        this.numBuffer = 0;
        this.currentBit = 0;
    }

    get bytesRemaining() {
        return this.stream.buffer.byteLength - this.stream.currentByte;
    }

    getFinishedStream() {
        this._writeBufferToStream();
        this.stream.slice();
        return this.stream;
    }

    convertBufferToCompressedString() {
        const finishedStream = this.getFinishedStream();
        // return finishedStream.uint8Array;
        const compressedData = fflate.strFromU8(fflate.zlibSync(finishedStream.uint8Array), true);
        return btoa(compressedData);
    }

    saveToLocalStorage(key) {
        const saveString = this.convertBufferToCompressedString();
        localStorage.setItem(key, saveString);
    }

    _writeBufferToStream() {
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
        else {
            console.log("No bits to write");
        }
    }

    _checkSpace(bytes) {
        if (this.bytesRemaining < bytes) {
            const neededBytes = this.stream.buffer.byteLength + bytes;
            let newBytes = neededBytes.ceilPow2();

            //If the new size will be >= 75% full, double the size
            if (neededBytes / newBytes >= 0.75)
                newBytes <<= 1;//newBytes * 2

            this.stream.resize(newBytes);
        }
    }

    writeBool(b) {
        if (b)
            this.numBuffer |= 1 << this.currentBit;

        this.currentBit++;
        if (this.currentBit === Binary.BitExtractor.UINT_32_BITS) {
            this._writeBufferToStream();
            this.currentBit = 0;
        }
    }

    writeUInt(num, length = Binary.BitExtractor.UINT_32_BITS) {
        if (num > Binary.BitExtractor.uint32MaxValue)
            throw new Error(`Number exceeds maximum value for uint32.  Value: ${num}, Length: ${length}`);

        this.numBuffer |= (num << this.currentBit);
        this.currentBit += length;
        if (this.currentBit >= Binary.BitExtractor.UINT_32_BITS) {
            this._writeBufferToStream();
            this.currentBit -= Binary.BitExtractor.UINT_32_BITS;
            if (this.currentBit > 0)
                this.numBuffer = (num << Binary.BitExtractor.UINT_32_BITS - length) >>> (Binary.BitExtractor.UINT_32_BITS - this.currentBit);
        }
    }

    writeUIntAutoLength(num) {
        const length = num.bitLength();
        this.writeUInt(length - 1, Binary.BitExtractor.INT_32_PREFIX_BITS);
        this.writeUInt(num, length);
    }

    writeInt(num, length = Binary.BitExtractor.INT_32_BITS) {
        const negative = num < 0;
        const abs = negative ? -num : num;
        if (abs > Binary.BitExtractor.INT_32_MAX_VALUE)
            throw new Error(`Number exceeds maximum value for int32.  Value: ${num}, Length: ${length}`);

        this.writeUInt(abs, length);
        if (abs !== 0)
            this.writeBool(negative);
    }

    writeIntAutoLength(num) {
        const negative = num < 0;
        const abs = negative ? -num : num;
        const length = abs.bitLength();
        //console.log(`writeIntAutoLength: num: ${num}, negative: ${negative}, abs: ${abs}, length: ${length}`);
        this.writeUInt(length - 1, Binary.BitExtractor.INT_32_PREFIX_BITS);
        this.writeUInt(abs, length);
        if (abs !== 0)
            this.writeBool(negative);
    }

    writeNumber(num) {
        const [ low, high ] = Binary.extractor.convertNumber(num);
        this.writeUInt(low, Binary.extractor.UINT_32_BITS);
        this.writeUInt(high, Binary.extractor.UINT_32_BITS);
    }

    writeBigUInt(bigUInt, length) {
        const doubleWords = length.bitsToDoubleWord();
        for (let i = 0n; i < doubleWords - 1n; i++) {
            const num = Number(bigUInt & Binary.BitExtractor.BIG_UINT_32_MASK) >>> 0;
            //console.log(`writeBigUInt: i: ${i}, num: ${num}, bigUInt: ${bigUInt.ToBinaryString()}`);
            this.writeUInt(num, Binary.extractor.UINT_32_BITS);
            bigUInt >>= Binary.BitExtractor.BIG_UINT_32_BITS;
        }

        const lastBits = length - ((doubleWords - 1n) << Binary.BitExtractor.BIG_UINT_32_MULT_SHIFT);
        const mask = Binary.BitExtractor.BIG_UINT_32_MASK >> (Binary.BitExtractor.BIG_UINT_32_BITS - lastBits);
        const number = Number(bigUInt & mask);
        //console.log(`writeBigUInt: lastBits: ${lastBits}, mask: ${mask.ToBinaryString()}, number: ${number}, bigUInt: ${bigUInt.ToBinaryString()}`);
        this.writeUInt(number, Number(lastBits));
    }

    writeBigUIntAutoLength(bigUInt) {
        const length = bigUInt.bitLength();
        this.writeUIntAutoLength(length - 1);
        this.writeBigUInt(bigUInt, BigInt(length));
    }

    writeBigInt(bigInt, length) {
        const negative = bigInt < 0n;
        const abs = negative ? -bigInt : bigInt;
        this.writeBigUInt(abs, length);
        if (abs !== 0n)
            this.writeBool(negative);
    }

    writeBigIntAutoLength(bigInt) {
        const negative = bigInt < 0n;
        const abs = negative ? -bigInt : bigInt;
        const length = abs.bitLength();
        this.writeUIntAutoLength(length - 1);
        this.writeBigUInt(abs, BigInt(length));
        if (abs !== 0n)
            this.writeBool(negative);
    }
}

Binary.Reader = class {
    constructor() {
        this.numBuffer = 0;
        this.currentBit = Binary.BitExtractor.UINT_32_BITS;
    }

    loadFromLocalStorage(key) {
        const string = localStorage.getItem(key);
        if (!string)
            throw new Error(`No data found for key: ${key}`);

        this.setStreamFromString(string);
    }

    get bytesRemaining() {
        return this.stream.buffer.byteLength - this.stream.currentByte;
    }

    setStreamFromString(string) {
        this.stream = new Binary.Stream(fflate.unzlibSync(fflate.strToU8(atob(string), true)).buffer);
        if (this.stream.buffer.byteLength > 0 && this.stream.buffer.byteLength < 4)
            this.stream.resize(4);

        this.numBuffer = 0;
        this.currentBit = Binary.BitExtractor.UINT_32_BITS;
    }

    _readStreamIntoBuffer() {
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

    checkEmptyBuffer() {
        if (this.currentBit === Binary.BitExtractor.UINT_32_BITS) {
            this._readStreamIntoBuffer();
            this.currentBit = 0;
        }
    }

    readBool() {
        this.checkEmptyBuffer();

        const bit = (this.numBuffer >> this.currentBit) & 1;
        this.currentBit++;
        //console.log(`readBool: numBuffer: ${this.numBuffer.ToUInt32BinaryString()}, currentBit: ${this.currentBit}, bit: ${bit}`);
        return bit === 1;
    }

    readUInt(length = Binary.BitExtractor.UINT_32_BITS) {
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
            console.log(`readUInt: length: ${length}, originalNumBuffer: ${originalNumBuffer.ToUInt32BinaryString()}, originalBit: ${originalBit}, numBuffer: ${this.numBuffer.ToUInt32BinaryString()}, leftShift: ${leftShift}, result: ${result}`);
        }
        else {
            const leftShift = Binary.BitExtractor.UINT_32_BITS - this.currentBit;
            result = ((this.numBuffer << leftShift) >>> (leftShift + originalBit)) >>> 0;
            console.log(`readUInt: length: ${length}, numBuffer: ${this.numBuffer.ToUInt32BinaryString()}, originalBit: ${originalBit}, leftShift: ${leftShift}, result: ${result}`);
        }

        return result; // Convert to unsigned 32-bit integer
    }

    readUIntAutoLength() {
        const length = this.readUInt(Binary.BitExtractor.INT_32_PREFIX_BITS) + 1;
        return this.readUInt(length);
    }

    readInt(length = Binary.BitExtractor.INT_32_BITS) {
        let result = this.readUInt(length);
        if (result === 0)
            return 0;

        if (this.readBool())
            result = -result;
        
        return result;
    }

    readIntAutoLength() {
        const length = this.readUInt(Binary.BitExtractor.INT_32_PREFIX_BITS) + 1;
        //console.log(`readIntAutoLength: length: ${length}`);
        return this.readInt(length);
    }

    readNumber() {
        const low = this.readUInt(Binary.BitExtractor.UINT_32_BITS);
        const high = this.readUInt(Binary.BitExtractor.UINT_32_BITS);
        return Binary.extractor.convertToNumber(low, high);
    }

    readBigUInt(length) {
        const doubleWords = length.bitsToDoubleWord();
        //console.log(`readBigUInt: length: ${length}, doubleWords: ${doubleWords}`);
        let result = 0n;
        for (let i = 0n; i < doubleWords - 1n; i++) {
            result |= BigInt(this.readUInt(Binary.BitExtractor.UINT_32_BITS)) << (i << Binary.BitExtractor.BIG_UINT_32_MULT_SHIFT);
        }

        const lastBits = length - ((doubleWords - 1n) << Binary.BitExtractor.BIG_UINT_32_MULT_SHIFT);
        result |= (BigInt(this.readUInt(Number(lastBits))) & (Binary.BitExtractor.BIG_UINT_32_MASK >> (Binary.BitExtractor.BIG_UINT_32_BITS - lastBits))) << ((doubleWords - 1n) << Binary.BitExtractor.BIG_UINT_32_MULT_SHIFT);
        return result;
    }

    readBigUIntAutoLength() {
        const length = this.readUIntAutoLength() + 1;
        return this.readBigUInt(BigInt(length));
    }

    readBigInt(length) {
        let result = this.readBigUInt(length);
        if (result === 0n)
            return 0n;

        if (this.readBool())
            result = -result;

        return result;
    }

    readBigIntAutoLength() {
        const length = this.readUIntAutoLength() + 1;
        //console.log(`readBigIntAutoLength: length: ${length}`);
        return this.readBigInt(BigInt(length));
    }
}