"use strict";

const BinaryTests = {};

BinaryTests.logAllInfo = false;
BinaryTests.TestData_BinaryReadAndWrite = class {
    constructor(value, length = null, type = null) {
        this.value = value;
        this.length = length;
        this.type = type;
        if (length === null) {
            switch (typeof value) {
                case 'bigint':
                    this.length = 0n;
                    break;
                default:
                    this.length = 0;
                    break;
            }
        }
    }
}

BinaryTests.testData1 = [
    new BinaryTests.TestData_BinaryReadAndWrite(0, 1, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(1, 1, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(2, 2, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(3, 3, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(4, 4, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(5, 5, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(6, 6, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(7, 7, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(8, 8, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(9, 9, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(10, 10, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(11, 11, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(12, 12, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(13, 13, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(14, 14, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(15, 15, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(16, 16, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(17, 17, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(18, 18, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(19, 19, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(20, 20, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(21, 21, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(22, 22, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(23, 23, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(24, 24, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(25, 25, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(26, 26, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(27, 27, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(28, 28, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(29, 29, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(30, 30, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(31, 31, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(32, 32, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(33, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(34, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(35, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(36, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(37, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(0, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(0, 1, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(1, 1, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(2, 2, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(3, 3, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(4, 4, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(5, 5, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(6, 6, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(7, 7, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(8, 8, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(9, 9, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(10, 10, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(11, 11, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(12, 12, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(13, 13, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(14, 14, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(15, 15, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(16, 16, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(17, 17, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(18, 18, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(19, 19, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(20, 20, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(21, 21, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(22, 22, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(23, 23, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(24, 24, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(25, 25, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(26, 26, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(27, 27, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(28, 28, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(29, 29, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(30, 30, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(1, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(0, 1, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(1, 1, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(2, 2, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(3, 3, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(4, 4, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(5, 5, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(6, 6, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(7, 7, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(8, 8, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(9, 9, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(10, 10, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(11, 11, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(12, 12, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(13, 13, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(14, 14, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(15, 15, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(16, 16, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(17, 17, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(18, 18, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(19, 19, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(20, 20, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(21, 21, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(22, 22, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(23, 23, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(24, 24, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(25, 25, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(26, 26, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(27, 27, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(28, 28, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(29, 29, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(30, 30, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(2, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(0, 1, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(1, 1, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(2, 2, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(3, 3, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(4, 4, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(5, 5, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(6, 6, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(7, 7, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(8, 8, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(9, 9, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(10, 10, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(11, 11, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(12, 12, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(13, 13, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(14, 14, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(15, 15, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(16, 16, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(17, 17, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(18, 18, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(19, 19, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(20, 20, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(21, 21, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(22, 22, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(23, 23, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(24, 24, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(25, 25, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(26, 26, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(27, 27, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(28, 28, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(29, 29, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(30, 30, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(3, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(4, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(5, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(6, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(745688, 0, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(745688, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(-745689, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(-1, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(-2, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(-3, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(-4, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(-0, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(-0, 31, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(-1, 31, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(2, 31, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(3, 31, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(4, 31, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(0n),
    new BinaryTests.TestData_BinaryReadAndWrite(1n),
    new BinaryTests.TestData_BinaryReadAndWrite(2n),
    new BinaryTests.TestData_BinaryReadAndWrite(3n),
    new BinaryTests.TestData_BinaryReadAndWrite(0n),
    new BinaryTests.TestData_BinaryReadAndWrite(1n),
    new BinaryTests.TestData_BinaryReadAndWrite(2n),
    new BinaryTests.TestData_BinaryReadAndWrite(-3n),
    new BinaryTests.TestData_BinaryReadAndWrite(-4n),
    new BinaryTests.TestData_BinaryReadAndWrite(-5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-0n),
    new BinaryTests.TestData_BinaryReadAndWrite(0n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(1n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(2n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(3n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(4n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(5n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(6n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(7n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(8n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(9n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(10n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(11n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(12n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(13n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(14n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(15n, 4n, 'biguint'),
    new BinaryTests.TestData_BinaryReadAndWrite(6n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(7n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(8n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(9n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(10n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(11n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(12n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(13n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(14n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(15n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(-6n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(-7n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(-8n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(-9n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(-10n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(-11n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(-12n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(-13n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(-14n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(-15n, 4n),
    new BinaryTests.TestData_BinaryReadAndWrite(-31n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-30n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-29n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-28n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-27n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-26n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-25n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-24n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-23n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-22n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-21n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-20n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-19n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-18n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-17n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-16n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-15n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-14n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-13n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-12n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-11n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-10n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-9n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-8n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-7n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-6n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-5n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-4n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-3n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-2n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-1n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(-0n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(0n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(1n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(2n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(3n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(4n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(5n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(6n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(7n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(8n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(9n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(10n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(11n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(12n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(13n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(14n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(15n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(16n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(17n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(18n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(19n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(20n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(21n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(22n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(23n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(24n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(25n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(26n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(27n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(28n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(29n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(30n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(31n, 5n),
    new BinaryTests.TestData_BinaryReadAndWrite(0),
    new BinaryTests.TestData_BinaryReadAndWrite(1),
    new BinaryTests.TestData_BinaryReadAndWrite(2),
    new BinaryTests.TestData_BinaryReadAndWrite(3),
    new BinaryTests.TestData_BinaryReadAndWrite(4),
    new BinaryTests.TestData_BinaryReadAndWrite(5),
    new BinaryTests.TestData_BinaryReadAndWrite(60000),
    new BinaryTests.TestData_BinaryReadAndWrite(26789456),
    new BinaryTests.TestData_BinaryReadAndWrite(-26789456),
    new BinaryTests.TestData_BinaryReadAndWrite(-2e60),
    new BinaryTests.TestData_BinaryReadAndWrite(-3e60),
    new BinaryTests.TestData_BinaryReadAndWrite(-4e60),
    new BinaryTests.TestData_BinaryReadAndWrite(-5e250),
    new BinaryTests.TestData_BinaryReadAndWrite(6e250),

    new BinaryTests.TestData_BinaryReadAndWrite(0, 32, 'uint'),                  // Min 32-bit uint
    new BinaryTests.TestData_BinaryReadAndWrite(1, 1, 'uint'),                   // Single-bit 1
    new BinaryTests.TestData_BinaryReadAndWrite(0xFFFFFFFF >>> 1, 31, 'uint'),   // Max 31-bit uint
    new BinaryTests.TestData_BinaryReadAndWrite(0xFFFFFFFF, 32, 'uint'),         // Max 32-bit uint
    new BinaryTests.TestData_BinaryReadAndWrite(1 << 30, 31, 'uint'),            // 2^30 edge
    new BinaryTests.TestData_BinaryReadAndWrite((1 << 31) >>> 0, 32, 'uint'),    // 2^31 as unsigned

    new BinaryTests.TestData_BinaryReadAndWrite(1, 1, 'int'),                    // Positive 1 in 1 bit
    new BinaryTests.TestData_BinaryReadAndWrite(-1, 2, 'int'),                   // Negative 1 in 2 bits
    new BinaryTests.TestData_BinaryReadAndWrite(-2, 3, 'int'),                   // Negative max in 3 bits
    new BinaryTests.TestData_BinaryReadAndWrite(0x3FFFFFFF, 31, 'int'),          // Max 31-bit int
    new BinaryTests.TestData_BinaryReadAndWrite(-0x3FFFFFFF, 31, 'int'),         // Min 31-bit int
    new BinaryTests.TestData_BinaryReadAndWrite(-0x7FFFFFFF, 31, 'int'),         // Edge of 32-bit int (not full 2's comp)
    new BinaryTests.TestData_BinaryReadAndWrite(-(1 < 31), 31, 'int'),           // Min 32-bit int
    new BinaryTests.TestData_BinaryReadAndWrite(-2147483648, 32, 'int'),

    new BinaryTests.TestData_BinaryReadAndWrite(1n << 32n, 33n, 'biguint'),       // Just past 32-bit boundary
    new BinaryTests.TestData_BinaryReadAndWrite((1n << 63n) - 1n, 63n, 'biguint'),// Max 63-bit
    new BinaryTests.TestData_BinaryReadAndWrite(1n << 63n, 64n, 'biguint'),       // Clean 64-bit value
    new BinaryTests.TestData_BinaryReadAndWrite((1n << 127n) - 1n, 127n, 'biguint'), // Huge near-128-bit
    new BinaryTests.TestData_BinaryReadAndWrite(0n, 64n, 'biguint'),              // All zero but large length

    new BinaryTests.TestData_BinaryReadAndWrite(0, 0, 'uint'),
    new BinaryTests.TestData_BinaryReadAndWrite(127, 0, 'uint'),            // 7-bit boundary
    new BinaryTests.TestData_BinaryReadAndWrite(128, 0, 'uint'),            // 8-bit auto shift
    new BinaryTests.TestData_BinaryReadAndWrite(-127, 0, 'int'),
    new BinaryTests.TestData_BinaryReadAndWrite(-128, 0, 'int'),            // 8-bit negative
    new BinaryTests.TestData_BinaryReadAndWrite(1n << 40n, 0n, 'biguint'),   // Cross 5-byte threshold

    new BinaryTests.TestData_BinaryReadAndWrite(true, 1, 'bool'),
    new BinaryTests.TestData_BinaryReadAndWrite(false, 1, 'bool'),

    new BinaryTests.TestData_BinaryReadAndWrite(Number.MAX_SAFE_INTEGER, 0, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(Number.MIN_SAFE_INTEGER, 0, 'int53'),
    new BinaryTests.TestData_BinaryReadAndWrite(-165486765, 0, 'int53'),
    new BinaryTests.TestData_BinaryReadAndWrite(-165486765, 40, 'int53'),
    new BinaryTests.TestData_BinaryReadAndWrite(-1, 0, 'int53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0, 0, 'int53'),
    new BinaryTests.TestData_BinaryReadAndWrite(1, 0, 'int53'),
    new BinaryTests.TestData_BinaryReadAndWrite(2, 0, 'int53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1, 1, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x3, 2, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x7, 3, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0xF, 4, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1F, 5, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x3F, 6, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x7F, 7, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0xFF, 8, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1FF, 9, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x3FF, 10, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x7FF, 11, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0xFFF, 12, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1FFF, 13, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x3FFF, 14, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x7FFF, 15, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0xFFFF, 16, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1FFFF, 17, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x2FFFF, 18, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x4FFFF, 19, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x8FFFF, 20, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1FFFFF, 21, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x2FFFFF, 22, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x4FFFFF, 23, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x8FFFFF, 24, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1FFFFF, 25, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x2FFFFF, 26, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x4FFFFF, 27, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x8FFFFF, 28, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1FFFFF, 29, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x2FFFFF, 30, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x4FFFFF, 31, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x8FFFFF, 32, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1FFFFF, 33, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x2FFFFF, 34, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x4FFFFF, 35, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x8FFFFF, 36, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1FFFFF, 37, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x2FFFFF, 38, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x4FFFFF, 39, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x8FFFFF, 40, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1FFFFF, 41, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x2FFFFF, 42, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x4FFFFF, 43, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x8FFFFF, 44, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1FFFFF, 45, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x2FFFFF, 46, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x4FFFFF, 47, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x8FFFFF, 48, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1FFFFF, 49, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x2FFFFF, 50, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x4FFFFF, 51, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x8FFFFF, 52, 'uint53'),
    new BinaryTests.TestData_BinaryReadAndWrite(0x1FFFFF, 53, 'uint53'),
];

BinaryTests.logTest1 = BinaryTests.logAllInfo || true;
BinaryTests.test1 = function() {
    const writer = new Binary.Writer();
    writer.createStream(1);
    for (let i = 0; i < BinaryTests.testData1.length; i++) {
        const testData = BinaryTests.testData1[i];
        const value = testData.value;
        const length = testData.length;
        const type = testData.type ?? typeof value;
        switch (type) {
            case 'int':
            case 'uint':
                if (length === 0) {
                    if (type === 'int') {
                        writer.writeInt32AutoLength(value);
                    }
                    else {
                        writer.writeUInt32AutoLength(value);
                    }
                }
                else {
                    if (type === 'int') {
                        writer.writeInt32(value, length);
                    }
                    else {
                        writer.writeUInt32(value, length);
                    }
                }
                break;
            case 'uint53':
            case 'int53':
                if (length === 0) {
                    if (type === 'int53') {
                        writer.writeInt53AutoLength(value);
                    }
                    else {
                        writer.writeUInt53AutoLength(value);
                    }
                }
                else {
                    if (type === 'int53') {
                        writer.writeInt53(value, length);
                    }
                    else {
                        writer.writeUInt53(value, length);
                    }
                }
                break;
            case 'bigint':
            case 'biguint':
                if (length === 0n) {
                    if (type === 'bigint') {
                        writer.writeBigIntAutoLength(value);
                    }
                    else {
                        writer.writeBigUIntAutoLength(value);
                    }
                }
                else {
                    if (type === 'bigint') {
                        writer.writeBigInt(value, length);
                    }
                    else {
                        writer.writeBigUInt(value, length);
                    }
                }
                break;
            case 'number':
                writer.writeNumber(value);
                break;
            case 'bool':
                writer.writeBool(value);
                break;
            default:
                console.error(`Unsupported type: ${typeof value}`);
                break;
        }
    }

    //console.log('test1: writer.stream', writer.stream.uint8Array);
    writer.saveToLocalStorage('testData1');

    let reader = new Binary.Reader();
    reader.loadFromLocalStorage('testData1');
    //console.log('test1: reader.stream', reader.stream.uint8Array);
    for (let i = 0; i < BinaryTests.testData1.length; i++) {
        const testData = BinaryTests.testData1[i];
        const value = testData.value;
        const length = testData.length;
        let readValue;
        const type = testData.type ?? typeof value;
        switch (type) {
            case 'uint':
            case 'int':
                if (length === 0) {
                    if (type === 'int') {
                        readValue = reader.readInt32AutoLength();
                    }
                    else {
                        readValue = reader.readUInt32AutoLength();
                    }
                }
                else {
                    if (type === 'int') {
                        readValue = reader.readInt32(length);
                    }
                    else {
                        readValue = reader.readUInt32(length);
                    }
                }
                break;
            case 'uint53':
            case 'int53':
                if (length === 0) {
                    if (type === 'int53') {
                        readValue = reader.readInt53AutoLength();
                    }
                    else {
                        readValue = reader.readUInt53AutoLength();
                    }
                }
                else {
                    if (type === 'int53') {
                        readValue = reader.readInt53(length);
                    }
                    else {
                        readValue = reader.readUInt53(length);
                    }
                }
                break;
            case 'bigint':
            case 'biguint':
                if (length === 0n) {
                    if (type === 'bigint') {
                        readValue = reader.readBigIntAutoLength();
                    }
                    else {
                        readValue = reader.readBigUIntAutoLength();
                    }
                }
                else {
                    if (type === 'bigint') {
                        readValue = reader.readBigInt(length);
                    }
                    else {
                        readValue = reader.readBigUInt(length);
                    }
                }
                break;
            case 'number':
                readValue = reader.readNumber();
                break;
            case 'bool':
                readValue = reader.readBool();
                break;
            default:
                console.error(`Unsupported type: ${typeof value}`);
                break;
        }
        if (BinaryTests.logTest1)
            console.log(`test1 ${i}: readValue: ${readValue}, value: ${value}, type: ${type}, length: ${length}`);
            
        if (readValue !== value) {
            console.error(`Test failed for value ${value}: expected ${value}, got ${readValue}`);
        }
    }

    console.log('test1 complete.');
}

BinaryTests.allTests = function() {
    BinaryTests.test1();
}

//BinaryTests.allTests();