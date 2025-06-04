"use strict";

const NumberTests = {};

NumberTests.logAllInfo = false;
NumberTests.TestData_CalculateSignificandExponent = class {
	constructor(significand, exponent, decimals, expectedToStringScientific, expectedToStringScientificRemoveZeros, expectedToString, expectedToStringRemoveZeros) {
		this.Significand = significand;
		this.Exponent = exponent;
		this.Decimals = decimals;
		this.ExpectedToStringScientific = expectedToStringScientific;
		this.ExpectedToStringScientificRemoveZeros = expectedToStringScientificRemoveZeros;
		this.ExpectedToString = expectedToString;
		this.ExpectedToStringRemoveZeros = expectedToStringRemoveZeros;
	}
	toString() {
		return `(${this.Significand}, ${this.Exponent}, ${this.Decimals}, "${this.ExpectedToStringScientific}", "${this.ExpectedToStringScientificRemoveZeros}", "${this.ExpectedToString}", "${this.ExpectedToStringRemoveZeros}")`;
	}
}

NumberTests.testData_CalculateSignificandExponents = [
	/*
	new(684127, 100, 0, "7e105", "7e105", "7e105", "7e105"),
	new(684127, 100, 1, "6.8e105", "6.8e105", "6.8e105", "6.8e105"),
	new(684127, 100, 2, "6.84e105", "6.84e105", "6.84e105", "6.84e105"),
	new(684127, 100, 3, "6.841e105", "6.841e105", "6.841e105", "6.841e105"),
	new(684127, 100, 4, "6.8413e105", "6.8413e105", "6.8413e105", "6.8413e105"),
	new(684127, 100, 5, "6.84127e105", "6.84127e105", "6.84127e105", "6.84127e105"),
	new(684127, 100, 6, "6.841270e105", "6.84127e105", "6.841270e105", "6.84127e105"),
	new(684127, 100, 7, "6.8412700e105", "6.84127e105", "6.8412700e105", "6.84127e105"),
	*/

	new NumberTests.TestData_CalculateSignificandExponent(684127, 100, 0, "7e105", "7e105", "7e105", "7e105"),
	new NumberTests.TestData_CalculateSignificandExponent(684127, 100, 1, "6.8e105", "6.8e105", "6.8e105", "6.8e105"),
	new NumberTests.TestData_CalculateSignificandExponent(684127, 100, 2, "6.84e105", "6.84e105", "6.84e105", "6.84e105"),
	new NumberTests.TestData_CalculateSignificandExponent(684127, 100, 3, "6.841e105", "6.841e105", "6.841e105", "6.841e105"),
	new NumberTests.TestData_CalculateSignificandExponent(684127, 100, 4, "6.8413e105", "6.8413e105", "6.8413e105", "6.8413e105"),
	new NumberTests.TestData_CalculateSignificandExponent(684127, 100, 5, "6.84127e105", "6.84127e105", "6.84127e105", "6.84127e105"),
	new NumberTests.TestData_CalculateSignificandExponent(684127, 100, 6, "6.841270e105", "6.84127e105", "6.841270e105", "6.84127e105"),
	new NumberTests.TestData_CalculateSignificandExponent(684127, 100, 7, "6.8412700e105", "6.84127e105", "6.8412700e105", "6.84127e105"),

	/*
	new(1, 0, 0, "1", "1", "1", "1"),
	new(1, 0, 1, "1.0", "1", "1.0", "1"),
	new(1, 0, 2, "1.00", "1", "1.00", "1"),
	*/

	new NumberTests.TestData_CalculateSignificandExponent(1, 0, 0, "1", "1", "1", "1"),
	new NumberTests.TestData_CalculateSignificandExponent(1, 0, 1, "1.0", "1", "1.0", "1"),
	new NumberTests.TestData_CalculateSignificandExponent(1, 0, 2, "1.00", "1", "1.00", "1"),

	// new(10, 0, 0, "10", "10", "10", "10"),
	// new(10, 0, 1, "10.0", "10", "10.0", "10"),
	// new(10, 0, 2, "10.00", "10", "10.00", "10"),
	// new(10, 0, 3, "10.000", "10", "10.000", "10"),
	// new(10, 0, 4, "10.0000", "10", "10.0000", "10"),

	new NumberTests.TestData_CalculateSignificandExponent(10, 0, 0, "10", "10", "10", "10"),
	new NumberTests.TestData_CalculateSignificandExponent(10, 0, 1, "10.0", "10", "10.0", "10"),
	new NumberTests.TestData_CalculateSignificandExponent(10, 0, 2, "10.00", "10", "10.00", "10"),
	new NumberTests.TestData_CalculateSignificandExponent(10, 0, 3, "10.000", "10", "10.000", "10"),
	new NumberTests.TestData_CalculateSignificandExponent(10, 0, 4, "10.0000", "10", "10.0000", "10"),

	// new(1, 1000, 0, "1e1000", "1e1000", "1e1000", "1e1000"),
	// new(1, 1000, 1, "1.0e1000", "1e1000", "1.0e1000", "1e1000"),
	// new(1, 1000, 2, "1.00e1000", "1e1000", "1.00e1000", "1e1000"),
	// new(1, 1000, 3, "1.000e1000", "1e1000", "1.000e1000", "1e1000"),
	// new(1, 1000, 4, "1.0000e1000", "1e1000", "1.0000e1000", "1e1000"),

	new NumberTests.TestData_CalculateSignificandExponent(1, 1000, 0, "1e1000", "1e1000", "1e1000", "1e1000"),
	new NumberTests.TestData_CalculateSignificandExponent(1, 1000, 1, "1.0e1000", "1e1000", "1.0e1000", "1e1000"),
	new NumberTests.TestData_CalculateSignificandExponent(1, 1000, 2, "1.00e1000", "1e1000", "1.00e1000", "1e1000"),
	new NumberTests.TestData_CalculateSignificandExponent(1, 1000, 3, "1.000e1000", "1e1000", "1.000e1000", "1e1000"),
	new NumberTests.TestData_CalculateSignificandExponent(1, 1000, 4, "1.0000e1000", "1e1000", "1.0000e1000", "1e1000"),

	// new(0, 0, 0, "0", "0", "0", "0"),
	// new(0, 0, 1, "0.0", "0", "0.0", "0"),
	// new(0, 0, 2, "0.00", "0", "0.00", "0"),
	// new(0, 0, 3, "0.000", "0", "0.000", "0"),

	new NumberTests.TestData_CalculateSignificandExponent(0, 0, 0, "0", "0", "0", "0"),
	new NumberTests.TestData_CalculateSignificandExponent(0, 0, 1, "0.0", "0", "0.0", "0"),
	new NumberTests.TestData_CalculateSignificandExponent(0, 0, 2, "0.00", "0", "0.00", "0"),
	new NumberTests.TestData_CalculateSignificandExponent(0, 0, 3, "0.000", "0", "0.000", "0"),

	// new(0, 100, 0, "0", "0", "0", "0"),
	// new(0, 100, 1, "0.0", "0", "0.0", "0"),
	// new(0, 100, 2, "0.00", "0", "0.00", "0"),
	// new(0, 100, 3, "0.000", "0", "0.000", "0"),

	new NumberTests.TestData_CalculateSignificandExponent(0, 100, 0, "0", "0", "0", "0"),
	new NumberTests.TestData_CalculateSignificandExponent(0, 100, 1, "0.0", "0", "0.0", "0"),
	new NumberTests.TestData_CalculateSignificandExponent(0, 100, 2, "0.00", "0", "0.00", "0"),
	new NumberTests.TestData_CalculateSignificandExponent(0, 100, 3, "0.000", "0", "0.000", "0"),

	// new(-1023, 100, 0, "-1e103", "-1e103", "-1e103", "-1e103"),
	// new(-1023, 100, 1, "-1.0e103", "-1e103", "-1.0e103", "-1e103"),
	// new(-1023, 100, 2, "-1.02e103", "-1.02e103", "-1.02e103", "-1.02e103"),
	// new(-1023, 100, 3, "-1.023e103", "-1.023e103", "-1.023e103", "-1.023e103"),
	// new(-1023, 100, 4, "-1.0230e103", "-1.023e103", "-1.0230e103", "-1.023e103"),
	// new(-1023, 100, 5, "-1.02300e103", "-1.023e103", "-1.02300e103", "-1.023e103"),

	new NumberTests.TestData_CalculateSignificandExponent(-1023, 100, 0, "-1e103", "-1e103", "-1e103", "-1e103"),
	new NumberTests.TestData_CalculateSignificandExponent(-1023, 100, 1, "-1.0e103", "-1e103", "-1.0e103", "-1e103"),
	new NumberTests.TestData_CalculateSignificandExponent(-1023, 100, 2, "-1.02e103", "-1.02e103", "-1.02e103", "-1.02e103"),
	new NumberTests.TestData_CalculateSignificandExponent(-1023, 100, 3, "-1.023e103", "-1.023e103", "-1.023e103", "-1.023e103"),
	new NumberTests.TestData_CalculateSignificandExponent(-1023, 100, 4, "-1.0230e103", "-1.023e103", "-1.0230e103", "-1.023e103"),
	new NumberTests.TestData_CalculateSignificandExponent(-1023, 100, 5, "-1.02300e103", "-1.023e103", "-1.02300e103", "-1.023e103"),

	// new(-1, -4, 0, "-1e-4", "-1e-4", "-1e-4", "-1e-4"),
	// new(-1, -4, 1, "-1.0e-4", "-1e-4", "-1.0e-4", "-1e-4"),
	// new(-1, -4, 2, "-1.00e-4", "-1e-4", "-1.00e-4", "-1e-4"),
	// new(-1, -4, 3, "-1.000e-4", "-1e-4", "-1.000e-4", "-1e-4"),
	// new(-1, -4, 4, "-1.0000e-4", "-1e-4", "-0.0001", "-0.0001"),
	// new(-1, -4, 5, "-1.00000e-4", "-1e-4", "-0.00010", "-0.0001"),

	new NumberTests.TestData_CalculateSignificandExponent(-1, -4, 0, "-1e-4", "-1e-4", "-1e-4", "-1e-4"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -4, 1, "-1.0e-4", "-1e-4", "-1.0e-4", "-1e-4"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -4, 2, "-1.00e-4", "-1e-4", "-1.00e-4", "-1e-4"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -4, 3, "-1.000e-4", "-1e-4", "-1.000e-4", "-1e-4"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -4, 4, "-1.0000e-4", "-1e-4", "-0.0001", "-0.0001"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -4, 5, "-1.00000e-4", "-1e-4", "-0.00010", "-0.0001"),

	new NumberTests.TestData_CalculateSignificandExponent(1, -4, 0, "1e-4", "1e-4", "1e-4", "1e-4"),
	new NumberTests.TestData_CalculateSignificandExponent(1, -4, 1, "1.0e-4", "1e-4", "1.0e-4", "1e-4"),
	new NumberTests.TestData_CalculateSignificandExponent(1, -4, 2, "1.00e-4", "1e-4", "1.00e-4", "1e-4"),
	new NumberTests.TestData_CalculateSignificandExponent(1, -4, 3, "1.000e-4", "1e-4", "1.000e-4", "1e-4"),
	new NumberTests.TestData_CalculateSignificandExponent(1, -4, 4, "1.0000e-4", "1e-4", "0.0001", "0.0001"),
	new NumberTests.TestData_CalculateSignificandExponent(1, -4, 5, "1.00000e-4", "1e-4", "0.00010", "0.0001"),

	// new(-1, -3, 0, "-1e-3", "-1e-3", "-1e-3", "-1e-3"),
	// new(-1, -3, 1, "-1.0e-3", "-1e-3", "-1.0e-3", "-1e-3"),
	// new(-1, -3, 2, "-1.00e-3", "-1e-3", "-1.00e-3", "-1e-3"),
	// new(-1, -3, 3, "-1.000e-3", "-1e-3", "-0.001", "-0.001"),
	// new(-1, -3, 4, "-1.0000e-3", "-1e-3", "-0.0010", "-0.001"),
	// new(-1, -3, 5, "-1.00000e-3", "-1e-3", "-0.00100", "-0.001"),

	new NumberTests.TestData_CalculateSignificandExponent(-1, -3, 0, "-1e-3", "-1e-3", "-1e-3", "-1e-3"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -3, 1, "-1.0e-3", "-1e-3", "-1.0e-3", "-1e-3"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -3, 2, "-1.00e-3", "-1e-3", "-1.00e-3", "-1e-3"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -3, 3, "-1.000e-3", "-1e-3", "-0.001", "-0.001"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -3, 4, "-1.0000e-3", "-1e-3", "-0.0010", "-0.001"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -3, 5, "-1.00000e-3", "-1e-3", "-0.00100", "-0.001"),

	// new(-1, -2, 0, "-1e-2", "-1e-2", "-1e-2", "-1e-2"),
	// new(-1, -2, 1, "-1.0e-2", "-1e-2", "-1.0e-2", "-1e-2"),
	// new(-1, -2, 2, "-0.01", "-0.01", "-0.01", "-0.01"),
	// new(-1, -2, 3, "-0.010", "-0.01", "-0.010", "-0.01"),
	// new(-1, -2, 4, "-0.0100", "-0.01", "-0.0100", "-0.01"),

	new NumberTests.TestData_CalculateSignificandExponent(-1, -2, 0, "-1e-2", "-1e-2", "-1e-2", "-1e-2"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -2, 1, "-1.0e-2", "-1e-2", "-1.0e-2", "-1e-2"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -2, 2, "-0.01", "-0.01", "-0.01", "-0.01"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -2, 3, "-0.010", "-0.01", "-0.010", "-0.01"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -2, 4, "-0.0100", "-0.01", "-0.0100", "-0.01"),

	// new(-1, -1, 0, "-1e-1", "-1e-1", "-1e-1", "-1e-1"),
	// new(-1, -1, 1, "-0.1", "-0.1", "-0.1", "-0.1"),
	// new(-1, -1, 2, "-0.10", "-0.1", "-0.10", "-0.1"),
	// new(-1, -1, 3, "-0.100", "-0.1", "-0.100", "-0.1"),
	// new(-1, -1, 4, "-0.1000", "-0.1", "-0.1000", "-0.1"),

	new NumberTests.TestData_CalculateSignificandExponent(-1, -1, 0, "-1e-1", "-1e-1", "-1e-1", "-1e-1"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -1, 1, "-0.1", "-0.1", "-0.1", "-0.1"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -1, 2, "-0.10", "-0.1", "-0.10", "-0.1"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -1, 3, "-0.100", "-0.1", "-0.100", "-0.1"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, -1, 4, "-0.1000", "-0.1", "-0.1000", "-0.1"),

	// new(-1, 0, 0, "-1", "-1", "-1", "-1"),
	// new(-1, 0, 1, "-1.0", "-1", "-1.0", "-1"),
	// new(-1, 0, 2, "-1.00", "-1", "-1.00", "-1"),
	// new(-1, 0, 3, "-1.000", "-1", "-1.000", "-1"),

	new NumberTests.TestData_CalculateSignificandExponent(-1, 0, 0, "-1", "-1", "-1", "-1"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 0, 1, "-1.0", "-1", "-1.0", "-1"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 0, 2, "-1.00", "-1", "-1.00", "-1"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 0, 3, "-1.000", "-1", "-1.000", "-1"),

	// new(-1, 1, 0, "-10", "-10", "-10", "-10"),
	// new(-1, 1, 1, "-10.0", "-10", "-10.0", "-10"),
	// new(-1, 1, 2, "-10.00", "-10", "-10.00", "-10"),
	// new(-1, 1, 3, "-10.000", "-10", "-10.000", "-10"),

	new NumberTests.TestData_CalculateSignificandExponent(-1, 1, 0, "-10", "-10", "-10", "-10"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 1, 1, "-10.0", "-10", "-10.0", "-10"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 1, 2, "-10.00", "-10", "-10.00", "-10"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 1, 3, "-10.000", "-10", "-10.000", "-10"),

	// new(-1, 2, 0, "-100", "-100", "-100", "-100"),
	// new(-1, 2, 1, "-100.0", "-100", "-100.0", "-100"),
	// new(-1, 2, 2, "-100.00", "-100", "-100.00", "-100"),
	// new(-1, 2, 3, "-100.000", "-100", "-100.000", "-100"),

	new NumberTests.TestData_CalculateSignificandExponent(-1, 2, 0, "-100", "-100", "-100", "-100"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 2, 1, "-100.0", "-100", "-100.0", "-100"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 2, 2, "-100.00", "-100", "-100.00", "-100"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 2, 3, "-100.000", "-100", "-100.000", "-100"),

	// new(-1, 3, 0, "-1e3", "-1e3", "-1k", "-1k"),
	// new(-1, 3, 1, "-1.0e3", "-1e3", "-1.0k", "-1k"),
	// new(-1, 3, 2, "-1.00e3", "-1e3", "-1.00k", "-1k"),
	// new(-1, 3, 3, "-1.000e3", "-1e3", "-1.000k", "-1k"),
	// new(-1, 3, 4, "-1.0000e3", "-1e3", "-1.0000k", "-1k"),

	new NumberTests.TestData_CalculateSignificandExponent(-1, 3, 0, "-1e3", "-1e3", "-1k", "-1k"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 3, 1, "-1.0e3", "-1e3", "-1.0k", "-1k"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 3, 2, "-1.00e3", "-1e3", "-1.00k", "-1k"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 3, 3, "-1.000e3", "-1e3", "-1.000k", "-1k"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 3, 4, "-1.0000e3", "-1e3", "-1.0000k", "-1k"),

	// new(-1, 4, 0, "-1e4", "-1e4", "-10k", "-10k"),
	// new(-1, 4, 1, "-1.0e4", "-1e4", "-10.0k", "-10k"),
	// new(-1, 4, 2, "-1.00e4", "-1e4", "-10.00k", "-10k"),
	// new(-1, 4, 3, "-1.000e4", "-1e4", "-10.000k", "-10k"),
	// new(-1, 4, 4, "-1.0000e4", "-1e4", "-10.0000k", "-10k"),

	new NumberTests.TestData_CalculateSignificandExponent(-1, 4, 0, "-1e4", "-1e4", "-10k", "-10k"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 4, 1, "-1.0e4", "-1e4", "-10.0k", "-10k"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 4, 2, "-1.00e4", "-1e4", "-10.00k", "-10k"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 4, 3, "-1.000e4", "-1e4", "-10.000k", "-10k"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 4, 4, "-1.0000e4", "-1e4", "-10.0000k", "-10k"),

	// new(-1, 5, 0, "-1e5", "-1e5", "-100k", "-100k"),
	// new(-1, 5, 1, "-1.0e5", "-1e5", "-100.0k", "-100k"),
	// new(-1, 5, 2, "-1.00e5", "-1e5", "-100.00k", "-100k"),
	// new(-1, 5, 3, "-1.000e5", "-1e5", "-100.000k", "-100k"),
	// new(-1, 5, 4, "-1.0000e5", "-1e5", "-100.0000k", "-100k"),
	// new(-1, 5, 5, "-1.00000e5", "-1e5", "-100.00000k", "-100k"),

	new NumberTests.TestData_CalculateSignificandExponent(-1, 5, 0, "-1e5", "-1e5", "-100k", "-100k"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 5, 1, "-1.0e5", "-1e5", "-100.0k", "-100k"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 5, 2, "-1.00e5", "-1e5", "-100.00k", "-100k"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 5, 3, "-1.000e5", "-1e5", "-100.000k", "-100k"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 5, 4, "-1.0000e5", "-1e5", "-100.0000k", "-100k"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 5, 5, "-1.00000e5", "-1e5", "-100.00000k", "-100k"),

	// new(-1, 6, 0, "-1e6", "-1e6", "-1m", "-1m"),
	// new(-1, 6, 1, "-1.0e6", "-1e6", "-1.0m", "-1m"),
	// new(-1, 6, 2, "-1.00e6", "-1e6", "-1.00m", "-1m"),
	// new(-1, 6, 3, "-1.000e6", "-1e6", "-1.000m", "-1m"),
	// new(-1, 6, 4, "-1.0000e6", "-1e6", "-1.0000m", "-1m"),
	// new(-1, 6, 5, "-1.00000e6", "-1e6", "-1.00000m", "-1m"),

	new NumberTests.TestData_CalculateSignificandExponent(-1, 6, 0, "-1e6", "-1e6", "-1m", "-1m"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 6, 1, "-1.0e6", "-1e6", "-1.0m", "-1m"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 6, 2, "-1.00e6", "-1e6", "-1.00m", "-1m"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 6, 3, "-1.000e6", "-1e6", "-1.000m", "-1m"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 6, 4, "-1.0000e6", "-1e6", "-1.0000m", "-1m"),
	new NumberTests.TestData_CalculateSignificandExponent(-1, 6, 5, "-1.00000e6", "-1e6", "-1.00000m", "-1m"),

	// new(521, -2, 0, "5", "5", "5", "5"),
	// new(521, -2, 1, "5.2", "5.2", "5.2", "5.2"),
	// new(521, -2, 2, "5.21", "5.21", "5.21", "5.21"),
	// new(521, -2, 3, "5.210", "5.21", "5.210", "5.21"),
	// new(521, -2, 4, "5.2100", "5.21", "5.2100", "5.21"),

	new NumberTests.TestData_CalculateSignificandExponent(521, -2, 0, "5", "5", "5", "5"),
	new NumberTests.TestData_CalculateSignificandExponent(521, -2, 1, "5.2", "5.2", "5.2", "5.2"),
	new NumberTests.TestData_CalculateSignificandExponent(521, -2, 2, "5.21", "5.21", "5.21", "5.21"),
	new NumberTests.TestData_CalculateSignificandExponent(521, -2, 3, "5.210", "5.21", "5.210", "5.21"),
	new NumberTests.TestData_CalculateSignificandExponent(521, -2, 4, "5.2100", "5.21", "5.2100", "5.21"),

	// new(5217, -3, 0, "5", "5", "5", "5"),
	// new(5217, -3, 1, "5.2", "5.2", "5.2", "5.2"),
	// new(5217, -3, 2, "5.22", "5.22", "5.22", "5.22"),
	// new(5217, -3, 3, "5.217", "5.217", "5.217", "5.217"),
	// new(5217, -3, 4, "5.2170", "5.217", "5.2170", "5.217"),
	// new(5217, -3, 5, "5.21700", "5.217", "5.21700", "5.217"),

	new NumberTests.TestData_CalculateSignificandExponent(5217, -3, 0, "5", "5", "5", "5"),
	new NumberTests.TestData_CalculateSignificandExponent(5217, -3, 1, "5.2", "5.2", "5.2", "5.2"),
	new NumberTests.TestData_CalculateSignificandExponent(5217, -3, 2, "5.22", "5.22", "5.22", "5.22"),
	new NumberTests.TestData_CalculateSignificandExponent(5217, -3, 3, "5.217", "5.217", "5.217", "5.217"),
	new NumberTests.TestData_CalculateSignificandExponent(5217, -3, 4, "5.2170", "5.217", "5.2170", "5.217"),
	new NumberTests.TestData_CalculateSignificandExponent(5217, -3, 5, "5.21700", "5.217", "5.21700", "5.217"),

	// new(5299, 4, 0, "5e7", "5e7", "53m", "53m"),
	// new(5299, 4, 1, "5.3e7", "5.3e7", "53.0m", "53m"),
	// new(5299, 4, 2, "5.30e7", "5.3e7", "52.99m", "52.99m"),
	// new(5299, 4, 3, "5.299e7", "5.299e7", "52.990m", "52.99m"),
	// new(5299, 4, 4, "5.2990e7", "5.299e7", "52.9900m", "52.99m"),

	new NumberTests.TestData_CalculateSignificandExponent(5299, 4, 0, "5e7", "5e7", "53m", "53m"),
	new NumberTests.TestData_CalculateSignificandExponent(5299, 4, 1, "5.3e7", "5.3e7", "53.0m", "53m"),
	new NumberTests.TestData_CalculateSignificandExponent(5299, 4, 2, "5.30e7", "5.3e7", "52.99m", "52.99m"),
	new NumberTests.TestData_CalculateSignificandExponent(5299, 4, 3, "5.299e7", "5.299e7", "52.990m", "52.99m"),
	new NumberTests.TestData_CalculateSignificandExponent(5299, 4, 4, "5.2990e7", "5.299e7", "52.9900m", "52.99m"),

	// new(9999, 2, 0, "1e6", "1e6", "1m", "1m"),
	// new(9999, 2, 1, "1.0e6", "1e6", "999.9k", "999.9k"),
	// new(9999, 2, 2, "1.00e6", "1e6", "999.90k", "999.9k"),
	// new(9999, 2, 3, "9.999e5", "9.999e5", "999.900k", "999.9k"),
	// new(9999, 2, 4, "9.9990e5", "9.999e5", "999.9000k", "999.9k"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 2, 0, "1e6", "1e6", "1m", "1m"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 2, 1, "1.0e6", "1e6", "999.9k", "999.9k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 2, 2, "1.00e6", "1e6", "999.90k", "999.9k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 2, 3, "9.999e5", "9.999e5", "999.900k", "999.9k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 2, 4, "9.9990e5", "9.999e5", "999.9000k", "999.9k"),

	// new(599999, 30, 0, "6e35", "6e35", "600d", "600d"),
	// new(599999, 30, 1, "6.0e35", "6e35", "600.0d", "600d"),
	// new(599999, 30, 2, "6.00e35", "6e35", "600.00d", "600d"),
	// new(599999, 30, 3, "6.000e35", "6e35", "599.999d", "599.999d"),
	// new(599999, 30, 4, "6.0000e35", "6e35", "599.9990d", "599.999d"),
	// new(599999, 30, 5, "5.99999e35", "5.99999e35", "599.99900d", "599.999d"),

	new NumberTests.TestData_CalculateSignificandExponent(599999, 30, 0, "6e35", "6e35", "600d", "600d"),
	new NumberTests.TestData_CalculateSignificandExponent(599999, 30, 1, "6.0e35", "6e35", "600.0d", "600d"),
	new NumberTests.TestData_CalculateSignificandExponent(599999, 30, 2, "6.00e35", "6e35", "600.00d", "600d"),
	new NumberTests.TestData_CalculateSignificandExponent(599999, 30, 3, "6.000e35", "6e35", "599.999d", "599.999d"),
	new NumberTests.TestData_CalculateSignificandExponent(599999, 30, 4, "6.0000e35", "6e35", "599.9990d", "599.999d"),
	new NumberTests.TestData_CalculateSignificandExponent(599999, 30, 5, "5.99999e35", "5.99999e35", "599.99900d", "599.999d"),

	// new(999999, 30, 0, "1e36", "1e36", "1e36", "1e36"),
	// new(999999, 30, 1, "1.0e36", "1e36", "1.0e36", "1e36"),
	// new(999999, 30, 2, "1.00e36", "1e36", "1.00e36", "1e36"),
	// new(999999, 30, 3, "1.000e36", "1e36", "999.999d", "999.999d"),
	// new(999999, 30, 4, "1.0000e36", "1e36", "999.9990d", "999.999d"),
	// new(999999, 30, 5, "9.99999e35", "9.99999e35", "999.99900d", "999.999d"),
	// new(999999, 30, 6, "9.999990e35", "9.99999e35", "999.999000d", "999.999d"),

	new NumberTests.TestData_CalculateSignificandExponent(999999, 30, 0, "1e36", "1e36", "1e36", "1e36"),
	new NumberTests.TestData_CalculateSignificandExponent(999999, 30, 1, "1.0e36", "1e36", "1.0e36", "1e36"),
	new NumberTests.TestData_CalculateSignificandExponent(999999, 30, 2, "1.00e36", "1e36", "1.00e36", "1e36"),
	new NumberTests.TestData_CalculateSignificandExponent(999999, 30, 3, "1.000e36", "1e36", "999.999d", "999.999d"),
	new NumberTests.TestData_CalculateSignificandExponent(999999, 30, 4, "1.0000e36", "1e36", "999.9990d", "999.999d"),
	new NumberTests.TestData_CalculateSignificandExponent(999999, 30, 5, "9.99999e35", "9.99999e35", "999.99900d", "999.999d"),
	new NumberTests.TestData_CalculateSignificandExponent(999999, 30, 6, "9.999990e35", "9.99999e35", "999.999000d", "999.999d"),

	// new(9999, -7, 0, "1e-3", "1e-3", "1e-3", "1e-3"),
	// new(9999, -7, 1, "1.0e-3", "1e-3", "1.0e-3", "1e-3"),
	// new(9999, -7, 2, "1.00e-3", "1e-3", "1.00e-3", "1e-3"),
	// new(9999, -7, 3, "9.999e-4", "9.999e-4", "0.001", "0.001"),
	// new(9999, -7, 4, "9.9990e-4", "9.999e-4", "0.0010", "0.001"),
	// new(9999, -7, 5, "9.99900e-4", "9.999e-4", "0.00100", "0.001"),
	// new(9999, -7, 6, "9.999000e-4", "9.999e-4", "0.001000", "0.001"),
	// new(9999, -7, 7, "9.9990000e-4", "9.999e-4", "0.0009999", "0.0009999"),
	// new(9999, -7, 8, "9.99900000e-4", "9.999e-4", "0.00099990", "0.0009999"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, -7, 0, "1e-3", "1e-3", "1e-3", "1e-3"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -7, 1, "1.0e-3", "1e-3", "1.0e-3", "1e-3"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -7, 2, "1.00e-3", "1e-3", "1.00e-3", "1e-3"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -7, 3, "9.999e-4", "9.999e-4", "0.001", "0.001"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -7, 4, "9.9990e-4", "9.999e-4", "0.0010", "0.001"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -7, 5, "9.99900e-4", "9.999e-4", "0.00100", "0.001"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -7, 6, "9.999000e-4", "9.999e-4", "0.001000", "0.001"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -7, 7, "9.9990000e-4", "9.999e-4", "0.0009999", "0.0009999"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -7, 8, "9.99900000e-4", "9.999e-4", "0.00099990", "0.0009999"),

	// new(9999, -6, 0, "1e-2", "1e-2", "1e-2", "1e-2"),
	// new(9999, -6, 1, "1.0e-2", "1e-2", "1.0e-2", "1e-2"),
	// new(9999, -6, 2, "0.01", "0.01", "0.01", "0.01"),
	// new(9999, -6, 3, "9.999e-3", "9.999e-3", "0.010", "0.01"),
	// new(9999, -6, 4, "9.9990e-3", "9.999e-3", "0.0100", "0.01"),
	// new(9999, -6, 5, "9.99900e-3", "9.999e-3", "0.01000", "0.01"),
	// new(9999, -6, 6, "9.999000e-3", "9.999e-3", "0.009999", "0.009999"),
	// new(9999, -6, 7, "9.9990000e-3", "9.999e-3", "0.0099990", "0.009999"),
	// new(9999, -6, 8, "9.99900000e-3", "9.999e-3", "0.00999900", "0.009999"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, -6, 0, "1e-2", "1e-2", "1e-2", "1e-2"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -6, 1, "1.0e-2", "1e-2", "1.0e-2", "1e-2"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -6, 2, "0.01", "0.01", "0.01", "0.01"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -6, 3, "9.999e-3", "9.999e-3", "0.010", "0.01"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -6, 4, "9.9990e-3", "9.999e-3", "0.0100", "0.01"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -6, 5, "9.99900e-3", "9.999e-3", "0.01000", "0.01"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -6, 6, "9.999000e-3", "9.999e-3", "0.009999", "0.009999"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -6, 7, "9.9990000e-3", "9.999e-3", "0.0099990", "0.009999"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -6, 8, "9.99900000e-3", "9.999e-3", "0.00999900", "0.009999"),

	// new(9999, -5, 0, "1e-1", "1e-1", "1e-1", "1e-1"),
	// new(9999, -5, 1, "0.1", "0.1", "0.1", "0.1"),
	// new(9999, -5, 2, "0.10", "0.1", "0.10", "0.1"),
	// new(9999, -5, 3, "0.100", "0.1", "0.100", "0.1"),
	// new(9999, -5, 4, "0.1000", "0.1", "0.1000", "0.1"),
	// new(9999, -5, 5, "0.09999", "0.09999", "0.09999", "0.09999"),
	// new(9999, -5, 6, "0.099990", "0.09999", "0.099990", "0.09999"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, -5, 0, "1e-1", "1e-1", "1e-1", "1e-1"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -5, 1, "0.1", "0.1", "0.1", "0.1"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -5, 2, "0.10", "0.1", "0.10", "0.1"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -5, 3, "0.100", "0.1", "0.100", "0.1"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -5, 4, "0.1000", "0.1", "0.1000", "0.1"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -5, 5, "0.09999", "0.09999", "0.09999", "0.09999"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -5, 6, "0.099990", "0.09999", "0.099990", "0.09999"),

	// new(9999, -4, 0, "1", "1", "1", "1"),
	// new(9999, -4, 1, "1.0", "1", "1.0", "1"),
	// new(9999, -4, 2, "1.00", "1", "1.00", "1"),
	// new(9999, -4, 3, "1.000", "1", "1.000", "1"),
	// new(9999, -4, 4, "0.9999", "0.9999", "0.9999", "0.9999"),
	// new(9999, -4, 5, "0.99990", "0.9999", "0.99990", "0.9999"),
	// new(9999, -4, 6, "0.999900", "0.9999", "0.999900", "0.9999"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, -4, 0, "1", "1", "1", "1"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -4, 1, "1.0", "1", "1.0", "1"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -4, 2, "1.00", "1", "1.00", "1"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -4, 3, "1.000", "1", "1.000", "1"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -4, 4, "0.9999", "0.9999", "0.9999", "0.9999"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -4, 5, "0.99990", "0.9999", "0.99990", "0.9999"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -4, 6, "0.999900", "0.9999", "0.999900", "0.9999"),

	// new(9999, -3, 0, "10", "10", "10", "10"),
	// new(9999, -3, 1, "10.0", "10", "10.0", "10"),
	// new(9999, -3, 2, "10.00", "10", "10.00", "10"),
	// new(9999, -3, 3, "9.999", "9.999", "9.999", "9.999"),
	// new(9999, -3, 4, "9.9990", "9.999", "9.9990", "9.999"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, -3, 0, "10", "10", "10", "10"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -3, 1, "10.0", "10", "10.0", "10"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -3, 2, "10.00", "10", "10.00", "10"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -3, 3, "9.999", "9.999", "9.999", "9.999"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -3, 4, "9.9990", "9.999", "9.9990", "9.999"),

	// new(9999, -2, 0, "100", "100", "100", "100"),
	// new(9999, -2, 1, "100.0", "100", "100.0", "100"),
	// new(9999, -2, 2, "99.99", "99.99", "99.99", "99.99"),
	// new(9999, -2, 3, "99.990", "99.99", "99.990", "99.99"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, -2, 0, "100", "100", "100", "100"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -2, 1, "100.0", "100", "100.0", "100"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -2, 2, "99.99", "99.99", "99.99", "99.99"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -2, 3, "99.990", "99.99", "99.990", "99.99"),

	// new(9999, -1, 0, "1e3", "1e3", "1k", "1k"),
	// new(9999, -1, 1, "999.9", "999.9", "999.9", "999.9"),
	// new(9999, -1, 2, "999.90", "999.9", "999.90", "999.9"),
	// new(9999, -1, 3, "999.900", "999.9", "999.900", "999.9"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, -1, 0, "1e3", "1e3", "1k", "1k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -1, 1, "999.9", "999.9", "999.9", "999.9"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -1, 2, "999.90", "999.9", "999.90", "999.9"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, -1, 3, "999.900", "999.9", "999.900", "999.9"),

	// new(9999, 0, 0, "1e4", "1e4", "10k", "10k"),
	// new(9999, 0, 1, "1.0e4", "1e4", "10.0k", "10k"),
	// new(9999, 0, 2, "1.00e4", "1e4", "10.00k", "10k"),
	// new(9999, 0, 3, "9.999e3", "9.999e3", "9.999k", "9.999k"),
	// new(9999, 0, 4, "9.9990e3", "9.999e3", "9.9990k", "9.999k"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 0, 0, "1e4", "1e4", "10k", "10k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 0, 1, "1.0e4", "1e4", "10.0k", "10k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 0, 2, "1.00e4", "1e4", "10.00k", "10k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 0, 3, "9.999e3", "9.999e3", "9.999k", "9.999k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 0, 4, "9.9990e3", "9.999e3", "9.9990k", "9.999k"),

	// new(9999, 1, 0, "1e5", "1e5", "100k", "100k"),
	// new(9999, 1, 1, "1.0e5", "1e5", "100.0k", "100k"),
	// new(9999, 1, 2, "1.00e5", "1e5", "99.99k", "99.99k"),
	// new(9999, 1, 3, "9.999e4", "9.999e4", "99.990k", "99.99k"),
	// new(9999, 1, 4, "9.9990e4", "9.999e4", "99.9900k", "99.99k"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 1, 0, "1e5", "1e5", "100k", "100k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 1, 1, "1.0e5", "1e5", "100.0k", "100k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 1, 2, "1.00e5", "1e5", "99.99k", "99.99k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 1, 3, "9.999e4", "9.999e4", "99.990k", "99.99k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 1, 4, "9.9990e4", "9.999e4", "99.9900k", "99.99k"),

	// new(9999, 2, 0, "1e6", "1e6", "1m", "1m"),
	// new(9999, 2, 1, "1.0e6", "1e6", "999.9k", "999.9k"),
	// new(9999, 2, 2, "1.00e6", "1e6", "999.90k", "999.9k"),
	// new(9999, 2, 3, "9.999e5", "9.999e5", "999.900k", "999.9k"),
	// new(9999, 2, 4, "9.9990e5", "9.999e5", "999.9000k", "999.9k"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 2, 0, "1e6", "1e6", "1m", "1m"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 2, 1, "1.0e6", "1e6", "999.9k", "999.9k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 2, 2, "1.00e6", "1e6", "999.90k", "999.9k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 2, 3, "9.999e5", "9.999e5", "999.900k", "999.9k"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 2, 4, "9.9990e5", "9.999e5", "999.9000k", "999.9k"),

	// new(9999, 3, 0, "1e7", "1e7", "10m", "10m"),
	// new(9999, 3, 1, "1.0e7", "1e7", "10.0m", "10m"),
	// new(9999, 3, 2, "1.00e7", "1e7", "10.00m", "10m"),
	// new(9999, 3, 3, "9.999e6", "9.999e6", "9.999m", "9.999m"),
	// new(9999, 3, 4, "9.9990e6", "9.999e6", "9.9990m", "9.999m"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 3, 0, "1e7", "1e7", "10m", "10m"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 3, 1, "1.0e7", "1e7", "10.0m", "10m"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 3, 2, "1.00e7", "1e7", "10.00m", "10m"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 3, 3, "9.999e6", "9.999e6", "9.999m", "9.999m"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 3, 4, "9.9990e6", "9.999e6", "9.9990m", "9.999m"),

	// new(9999, 4, 0, "1e8", "1e8", "100m", "100m"),
	// new(9999, 4, 1, "1.0e8", "1e8", "100.0m", "100m"),
	// new(9999, 4, 2, "1.00e8", "1e8", "99.99m", "99.99m"),
	// new(9999, 4, 3, "9.999e7", "9.999e7", "99.990m", "99.99m"),
	// new(9999, 4, 4, "9.9990e7", "9.999e7", "99.9900m", "99.99m"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 4, 0, "1e8", "1e8", "100m", "100m"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 4, 1, "1.0e8", "1e8", "100.0m", "100m"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 4, 2, "1.00e8", "1e8", "99.99m", "99.99m"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 4, 3, "9.999e7", "9.999e7", "99.990m", "99.99m"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 4, 4, "9.9990e7", "9.999e7", "99.9900m", "99.99m"),

	// new(9999, 5, 0, "1e9", "1e9", "1b", "1b"),
	// new(9999, 5, 1, "1.0e9", "1e9", "999.9m", "999.9m"),
	// new(9999, 5, 2, "1.00e9", "1e9", "999.90m", "999.9m"),
	// new(9999, 5, 3, "9.999e8", "9.999e8", "999.900m", "999.9m"),
	// new(9999, 5, 4, "9.9990e8", "9.999e8", "999.9000m", "999.9m"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 5, 0, "1e9", "1e9", "1b", "1b"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 5, 1, "1.0e9", "1e9", "999.9m", "999.9m"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 5, 2, "1.00e9", "1e9", "999.90m", "999.9m"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 5, 3, "9.999e8", "9.999e8", "999.900m", "999.9m"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 5, 4, "9.9990e8", "9.999e8", "999.9000m", "999.9m"),

	// new(9999, 6, 0, "1e10", "1e10", "10b", "10b"),
	// new(9999, 6, 1, "1.0e10", "1e10", "10.0b", "10b"),
	// new(9999, 6, 2, "1.00e10", "1e10", "10.00b", "10b"),
	// new(9999, 6, 3, "9.999e9", "9.999e9", "9.999b", "9.999b"),
	// new(9999, 6, 4, "9.9990e9", "9.999e9", "9.9990b", "9.999b"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 6, 0, "1e10", "1e10", "10b", "10b"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 6, 1, "1.0e10", "1e10", "10.0b", "10b"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 6, 2, "1.00e10", "1e10", "10.00b", "10b"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 6, 3, "9.999e9", "9.999e9", "9.999b", "9.999b"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 6, 4, "9.9990e9", "9.999e9", "9.9990b", "9.999b"),

	// new(9999, 7, 0, "1e11", "1e11", "100b", "100b"),
	// new(9999, 7, 1, "1.0e11", "1e11", "100.0b", "100b"),
	// new(9999, 7, 2, "1.00e11", "1e11", "99.99b", "99.99b"),
	// new(9999, 7, 3, "9.999e10", "9.999e10", "99.990b", "99.99b"),
	// new(9999, 7, 4, "9.9990e10", "9.999e10", "99.9900b", "99.99b"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 7, 0, "1e11", "1e11", "100b", "100b"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 7, 1, "1.0e11", "1e11", "100.0b", "100b"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 7, 2, "1.00e11", "1e11", "99.99b", "99.99b"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 7, 3, "9.999e10", "9.999e10", "99.990b", "99.99b"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 7, 4, "9.9990e10", "9.999e10", "99.9900b", "99.99b"),

	// new(9999, 8, 0, "1e12", "1e12", "1t", "1t"),
	// new(9999, 8, 1, "1.0e12", "1e12", "999.9b", "999.9b"),
	// new(9999, 8, 2, "1.00e12", "1e12", "999.90b", "999.9b"),
	// new(9999, 8, 3, "9.999e11", "9.999e11", "999.900b", "999.9b"),
	// new(9999, 8, 4, "9.9990e11", "9.999e11", "999.9000b", "999.9b"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 8, 0, "1e12", "1e12", "1t", "1t"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 8, 1, "1.0e12", "1e12", "999.9b", "999.9b"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 8, 2, "1.00e12", "1e12", "999.90b", "999.9b"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 8, 3, "9.999e11", "9.999e11", "999.900b", "999.9b"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 8, 4, "9.9990e11", "9.999e11", "999.9000b", "999.9b"),

	// new(9999, 9, 0, "1e13", "1e13", "10t", "10t"),
	// new(9999, 9, 1, "1.0e13", "1e13", "10.0t", "10t"),
	// new(9999, 9, 2, "1.00e13", "1e13", "10.00t", "10t"),
	// new(9999, 9, 3, "9.999e12", "9.999e12", "9.999t", "9.999t"),
	// new(9999, 9, 4, "9.9990e12", "9.999e12", "9.9990t", "9.999t"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 9, 0, "1e13", "1e13", "10t", "10t"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 9, 1, "1.0e13", "1e13", "10.0t", "10t"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 9, 2, "1.00e13", "1e13", "10.00t", "10t"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 9, 3, "9.999e12", "9.999e12", "9.999t", "9.999t"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 9, 4, "9.9990e12", "9.999e12", "9.9990t", "9.999t"),

	// new(9999, 10, 0, "1e14", "1e14", "100t", "100t"),
	// new(9999, 10, 1, "1.0e14", "1e14", "100.0t", "100t"),
	// new(9999, 10, 2, "1.00e14", "1e14", "99.99t", "99.99t"),
	// new(9999, 10, 3, "9.999e13", "9.999e13", "99.990t", "99.99t"),
	// new(9999, 10, 4, "9.9990e13", "9.999e13", "99.9900t", "99.99t"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 10, 0, "1e14", "1e14", "100t", "100t"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 10, 1, "1.0e14", "1e14", "100.0t", "100t"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 10, 2, "1.00e14", "1e14", "99.99t", "99.99t"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 10, 3, "9.999e13", "9.999e13", "99.990t", "99.99t"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 10, 4, "9.9990e13", "9.999e13", "99.9900t", "99.99t"),

	// new(9999, 28, 0, "1e32", "1e32", "100n", "100n"),
	// new(9999, 28, 1, "1.0e32", "1e32", "100.0n", "100n"),
	// new(9999, 28, 2, "1.00e32", "1e32", "99.99n", "99.99n"),
	// new(9999, 28, 3, "9.999e31", "9.999e31", "99.990n", "99.99n"),
	// new(9999, 28, 4, "9.9990e31", "9.999e31", "99.9900n", "99.99n"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 28, 0, "1e32", "1e32", "100n", "100n"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 28, 1, "1.0e32", "1e32", "100.0n", "100n"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 28, 2, "1.00e32", "1e32", "99.99n", "99.99n"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 28, 3, "9.999e31", "9.999e31", "99.990n", "99.99n"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 28, 4, "9.9990e31", "9.999e31", "99.9900n", "99.99n"),

	// new(9999, 29, 0, "1e33", "1e33", "1d", "1d"),
	// new(9999, 29, 1, "1.0e33", "1e33", "999.9n", "999.9n"),
	// new(9999, 29, 2, "1.00e33", "1e33", "999.90n", "999.9n"),
	// new(9999, 29, 3, "9.999e32", "9.999e32", "999.900n", "999.9n"),
	// new(9999, 29, 4, "9.9990e32", "9.999e32", "999.9000n", "999.9n"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 29, 0, "1e33", "1e33", "1d", "1d"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 29, 1, "1.0e33", "1e33", "999.9n", "999.9n"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 29, 2, "1.00e33", "1e33", "999.90n", "999.9n"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 29, 3, "9.999e32", "9.999e32", "999.900n", "999.9n"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 29, 4, "9.9990e32", "9.999e32", "999.9000n", "999.9n"),

	// new(9999, 30, 0, "1e34", "1e34", "10d", "10d"),
	// new(9999, 30, 1, "1.0e34", "1e34", "10.0d", "10d"),
	// new(9999, 30, 2, "1.00e34", "1e34", "10.00d", "10d"),
	// new(9999, 30, 3, "9.999e33", "9.999e33", "9.999d", "9.999d"),
	// new(9999, 30, 4, "9.9990e33", "9.999e33", "9.9990d", "9.999d"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 30, 0, "1e34", "1e34", "10d", "10d"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 30, 1, "1.0e34", "1e34", "10.0d", "10d"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 30, 2, "1.00e34", "1e34", "10.00d", "10d"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 30, 3, "9.999e33", "9.999e33", "9.999d", "9.999d"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 30, 4, "9.9990e33", "9.999e33", "9.9990d", "9.999d"),

	// new(9999, 31, 0, "1e35", "1e35", "100d", "100d"),
	// new(9999, 31, 1, "1.0e35", "1e35", "100.0d", "100d"),
	// new(9999, 31, 2, "1.00e35", "1e35", "99.99d", "99.99d"),
	// new(9999, 31, 3, "9.999e34", "9.999e34", "99.990d", "99.99d"),
	// new(9999, 31, 4, "9.9990e34", "9.999e34", "99.9900d", "99.99d"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 31, 0, "1e35", "1e35", "100d", "100d"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 31, 1, "1.0e35", "1e35", "100.0d", "100d"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 31, 2, "1.00e35", "1e35", "99.99d", "99.99d"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 31, 3, "9.999e34", "9.999e34", "99.990d", "99.99d"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 31, 4, "9.9990e34", "9.999e34", "99.9900d", "99.99d"),

	// new(9999, 32, 0, "1e36", "1e36", "1e36", "1e36"),
	// new(9999, 32, 1, "1.0e36", "1e36", "999.9d", "999.9d"),
	// new(9999, 32, 2, "1.00e36", "1e36", "999.90d", "999.9d"),
	// new(9999, 32, 3, "9.999e35", "9.999e35", "999.900d", "999.9d"),
	// new(9999, 32, 4, "9.9990e35", "9.999e35", "999.9000d", "999.9d"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 32, 0, "1e36", "1e36", "1e36", "1e36"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 32, 1, "1.0e36", "1e36", "999.9d", "999.9d"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 32, 2, "1.00e36", "1e36", "999.90d", "999.9d"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 32, 3, "9.999e35", "9.999e35", "999.900d", "999.9d"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 32, 4, "9.9990e35", "9.999e35", "999.9000d", "999.9d"),

	// new(9999, 33, 0, "1e37", "1e37", "1e37", "1e37"),
	// new(9999, 33, 1, "1.0e37", "1e37", "1.0e37", "1e37"),
	// new(9999, 33, 2, "1.00e37", "1e37", "1.00e37", "1e37"),
	// new(9999, 33, 3, "9.999e36", "9.999e36", "9.999e36", "9.999e36"),
	// new(9999, 33, 4, "9.9990e36", "9.999e36", "9.9990e36", "9.999e36"),

	new NumberTests.TestData_CalculateSignificandExponent(9999, 33, 0, "1e37", "1e37", "1e37", "1e37"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 33, 1, "1.0e37", "1e37", "1.0e37", "1e37"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 33, 2, "1.00e37", "1e37", "1.00e37", "1e37"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 33, 3, "9.999e36", "9.999e36", "9.999e36", "9.999e36"),
	new NumberTests.TestData_CalculateSignificandExponent(9999, 33, 4, "9.9990e36", "9.999e36", "9.9990e36", "9.999e36"),

	// new(-2, -1, 0, "-2e-1", "-2e-1", "-2e-1", "-2e-1"),
	// new(-2, -1, 1, "-0.2", "-0.2", "-0.2", "-0.2"),
	// new(-2, -1, 2, "-0.20", "-0.2", "-0.20", "-0.2"),
	// new(-2, -1, 3, "-0.200", "-0.2", "-0.200", "-0.2"),
	// new(-2, -1, 4, "-0.2000", "-0.2", "-0.2000", "-0.2"),

	new NumberTests.TestData_CalculateSignificandExponent(-2, -1, 0, "-2e-1", "-2e-1", "-2e-1", "-2e-1"),
	new NumberTests.TestData_CalculateSignificandExponent(-2, -1, 1, "-0.2", "-0.2", "-0.2", "-0.2"),
	new NumberTests.TestData_CalculateSignificandExponent(-2, -1, 2, "-0.20", "-0.2", "-0.20", "-0.2"),
	new NumberTests.TestData_CalculateSignificandExponent(-2, -1, 3, "-0.200", "-0.2", "-0.200", "-0.2"),
	new NumberTests.TestData_CalculateSignificandExponent(-2, -1, 4, "-0.2000", "-0.2", "-0.2000", "-0.2"),

	// new(1000, -2, 0, "10", "10", "10", "10"),

	new NumberTests.TestData_CalculateSignificandExponent(1000, -2, 0, "10", "10", "10", "10"),

	// new(123456789012345, -3, 0, "1e11", "1e11", "123b", "123b"),
	// new(123456789012345, -3, 1, "1.2e11", "1.2e11", "123.5b", "123.5b"),
	// new(123456789012345, -3, 2, "1.23e11", "1.23e11", "123.46b", "123.46b"),
	// new(123456789012345, -3, 3, "1.235e11", "1.235e11", "123.457b", "123.457b"),
	// new(123456789012345, -3, 4, "1.2346e11", "1.2346e11", "123.4568b", "123.4568b"),
	// new(123456789012345, -3, 5, "1.23457e11", "1.23457e11", "123.45679b", "123.45679b"),
	// new(123456789012345, -3, 6, "1.234568e11", "1.234568e11", "123.456789b", "123.456789b"),
	// new(123456789012345, -3, 7, "1.2345679e11", "1.2345679e11", "123.4567890b", "123.456789b"),
	// new(123456789012345, -3, 8, "1.23456789e11", "1.23456789e11", "123.45678901b", "123.45678901b"),
	// new(123456789012345, -3, 9, "1.234567890e11", "1.23456789e11", "123.456789012b", "123.456789012b"),
	// new(123456789012345, -3, 10, "1.2345678901e11", "1.2345678901e11", "123.4567890123b", "123.4567890123b"),
	// new(123456789012345, -3, 11, "1.23456789012e11", "1.23456789012e11", "123.45678901235b", "123.45678901235b"),
	// new(123456789012345, -3, 12, "1.234567890123e11", "1.234567890123e11", "123.456789012345b", "123.456789012345b"),

	new NumberTests.TestData_CalculateSignificandExponent(123456789012345, -3, 0, "1e11", "1e11", "123b", "123b"),
	new NumberTests.TestData_CalculateSignificandExponent(123456789012345, -3, 1, "1.2e11", "1.2e11", "123.5b", "123.5b"),
	new NumberTests.TestData_CalculateSignificandExponent(123456789012345, -3, 2, "1.23e11", "1.23e11", "123.46b", "123.46b"),
	new NumberTests.TestData_CalculateSignificandExponent(123456789012345, -3, 3, "1.235e11", "1.235e11", "123.457b", "123.457b"),
	new NumberTests.TestData_CalculateSignificandExponent(123456789012345, -3, 4, "1.2346e11", "1.2346e11", "123.4568b", "123.4568b"),
	new NumberTests.TestData_CalculateSignificandExponent(123456789012345, -3, 5, "1.23457e11", "1.23457e11", "123.45679b", "123.45679b"),
	new NumberTests.TestData_CalculateSignificandExponent(123456789012345, -3, 6, "1.234568e11", "1.234568e11", "123.456789b", "123.456789b"),
	new NumberTests.TestData_CalculateSignificandExponent(123456789012345, -3, 7, "1.2345679e11", "1.2345679e11", "123.4567890b", "123.456789b"),
	new NumberTests.TestData_CalculateSignificandExponent(123456789012345, -3, 8, "1.23456789e11", "1.23456789e11", "123.45678901b", "123.45678901b"),
	new NumberTests.TestData_CalculateSignificandExponent(123456789012345, -3, 9, "1.234567890e11", "1.23456789e11", "123.456789012b", "123.456789012b"),
	new NumberTests.TestData_CalculateSignificandExponent(123456789012345, -3, 10, "1.2345678901e11", "1.2345678901e11", "123.4567890123b", "123.4567890123b"),
	new NumberTests.TestData_CalculateSignificandExponent(123456789012345, -3, 11, "1.23456789012e11", "1.23456789012e11", "123.45678901235b", "123.45678901235b"),
	new NumberTests.TestData_CalculateSignificandExponent(123456789012345, -3, 12, "1.234567890123e11", "1.234567890123e11", "123.456789012345b", "123.456789012345b"),
];

NumberTests.logAllInfo_CalculateSignificandExponent = false || NumberTests.logAllInfo;
NumberTests.Test_CalculateSignificandExponent = function() {
	console.log("Test_CalculateSignificandExponent");
	for (const testData of NumberTests.testData_CalculateSignificandExponents) {
		const testNum = Numbers.Triple.triplePow10(testData.Significand, testData.Exponent);
		
		const scientific = testNum.s(testData.Decimals, true, false);
		if (NumberTests.logAllInfo_CalculateSignificandExponent)
			console.log(`testNum.s(${testData.Decimals}, true, false): ${scientific}, testData.ExpectedToStringScientific: ${testData.ExpectedToStringScientific}`);

		if (scientific != testData.ExpectedToStringScientific) {
			console.error(`testNum.s(${testData.Decimals}, true, false): ${scientific} != testData.ExpectedToStringScientific: ${testData.ExpectedToStringScientific}, ${testData}`);
		}

		const scientificRemoveZeros = testNum.s(testData.Decimals, true, true);
		if (NumberTests.logAllInfo_CalculateSignificandExponent)
			console.log(`testNum.s(${testData.Decimals}, true, false): ${scientificRemoveZeros}, testData.ExpectedToStringScientificRemoveZeros: ${testData.ExpectedToStringScientificRemoveZeros}`);

		if (scientificRemoveZeros != testData.ExpectedToStringScientificRemoveZeros) {
			console.error(`testNum.s(${testData.Decimals}, true, true): ${scientificRemoveZeros} != testData.ExpectedToStringScientificRemoveZeros: ${testData.ExpectedToStringScientificRemoveZeros}, ${testData}`);
		}

		const normal = testNum.s(testData.Decimals, false, false);
		if (NumberTests.logAllInfo_CalculateSignificandExponent)
			console.log(`testNum.s(${testData.Decimals}, false, false): ${normal}, testData.ExpectedToString: ${testData.ExpectedToString}`);

		if (normal != testData.ExpectedToString) {
			console.error(`testNum.s(${testData.Decimals}, false, false): ${normal} != testData.ExpectedToString: ${testData.ExpectedToString}, ${testData}`);
		}

		const normalRemoveZeros = testNum.s(testData.Decimals, false, true);
		if (NumberTests.logAllInfo_CalculateSignificandExponent)
			console.log(`testNum.s(${testData.Decimals}, false, true): ${normalRemoveZeros}, testData.ExpectedToStringRemoveZeros: ${testData.ExpectedToStringRemoveZeros}`);

		if (normalRemoveZeros != testData.ExpectedToStringRemoveZeros) {
			console.error(`testNum.s(${testData.Decimals}, false, true): ${normalRemoveZeros}, testData.ExpectedToStringRemoveZeros: ${testData.ExpectedToStringRemoveZeros}, ${testData}`);
		}

		if (NumberTests.logAllInfo_CalculateSignificandExponent)
			console.log("");//Space
	}
}