"use strict";

Struct.EquationTests = {};

Struct.EquationTests.runTests = () => {
    //Struct.EquationTests.equationTests(Zon.Equation_N);
    Struct.EquationTests.exampleWithLevelToXP();
}

Struct.EquationTests.equationTests = (testClass) => {
    class EquationTest {
        constructor(equationStr, expectedFunc, variables = [], args = [], constants = new Map(), testArgs = [], variableOverrides = []) {
            this.equationStr = equationStr;
            this.expectedFunc = expectedFunc;
            this.variables = variables;
            this.args = args;
            this.constants = constants;
            this.testArgs = testArgs;
            this.variableOverrides = variableOverrides;
        }
    }
    const testCases = [
        new EquationTest(`0.25`, (args, variables) => 0.25, [], [], new Map(), [], []),
        new EquationTest(`trunc(0.25)`, (args, variables) => Math.trunc(0.25), [], [], new Map(), [], []),
        new EquationTest(`0.25 * 100`, (args, variables) => 0.25 * 100, [], [], new Map(), [], []),
        (() => {
            const level = `level`;
            const args = [level];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest(`0.25 * ${level}`, (args, variables) => 0.25 * args[0], [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest(`0.25 * ${level} * (${level} + 1) * 0.5`, (args, variables) => 0.25 * args[0] * (args[0] + 1) * 0.5, [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest(`0.25 * (${level} * (${level} + 1) * 0.5)`, (args, variables) => 0.25 * (args[0] * (args[0] + 1) * 0.5), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest(`trunc(${level})`, (args, variables) => Math.trunc(args[0]), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest(`0.25 * trunc(${level})`, (args, variables) => 0.25 * Math.trunc(args[0]), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest(`0.25 * trunc(${level} * (${level} + 1) * 0.5)`, (args, variables) => 0.25 * Math.trunc(args[0] * (args[0] + 1) * 0.5), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest(`trunc(trunc(${level}))`, (args, variables) => Math.trunc(Math.trunc(args[0])), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest(`0.25 * trunc(trunc(${level}) * (${level} + 1) * 0.5)`, (args, variables) => 0.25 * Math.trunc(args[0] * (args[0] + 1) * 0.5), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const testArgs = [
                [8],
                [10]
            ];
            return new EquationTest(`log(${level}, 2)`, (args, variables) => Math.log(args[0]) / Math.log(2), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const testArgs = [
                [8],
                [10]
            ];
            return new EquationTest(`log(log(${level}, 2), 3)`, (args, variables) => Math.log(Math.log(args[0]) / Math.log(2)) / Math.log(3), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const testArgs = [
                [8],
                [10]
            ];
            return new EquationTest(`5 * log(${level}, 2)`, (args, variables) => 5 * (Math.log(args[0]) / Math.log(2)), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const testArgs = [
                [8],
                [10]
            ];
            return new EquationTest(`trunc(log(${level}, 2))`, (args, variables) => Math.trunc(Math.log(args[0]) / Math.log(2)), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const r = `r`;
            const constants = new Map([
                [r, `2^(1 / 7)`]
            ]);
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest(`level - r^2`, (args, variables) => args[0] - (2 ** (1 / 7)) ** 2, [], args, constants, testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest(`-level`, (args, variables) => -args[0], [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const r = `r`;
            const constants = new Map([
                [r, `2^(1 / 7)`]
            ]);
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest(`(-level - --r)^2`, (args, variables) => (-args[0] - 2 ** (1 / 7)) ** 2, [], args, constants, testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const r = `r`;
            const constants = new Map([
                [r, `2^(1 / 7)`]
            ]);
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest(`(-level - r)^2`, (args, variables) => (-args[0] - 2 ** (1 / 7)) ** 2, [], args, constants, testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [level];
            const r = `r`;
            const constants = new Map([
                [r, `2^(1 / 7)`]
            ]);
            const testArgs = [
                [10],
                [20]
            ];
            const testVar = new Variable.Value(3, `testVar`);
            const variables = [testVar];
            return new EquationTest(`(-level - r)^${testVar.name}`, (args, variables) => (-args[0] - 2 ** (1 / 7)) ** variables[0].value, variables, args, constants, testArgs, []);
        })(),
        (() => {
            const a = 'a';
            const b = 'b';
            const constants = new Map([
                [a, `-2^2`],
                [b, `(-2)^2`]
            ]);
            return new EquationTest(`${a} + ${b}`, (args, variables) => 0, [], [], constants);
        })(),
        (() => {
            const a = 'a';
            const b = 'b';
            const constants = new Map([
                [a, `1 + 2 * 3`],
                [b, `2 * 3 + 1`]
            ]);
            return new EquationTest(`${a} - ${b}`, (args, variables) => 0, [], [], constants);
        })(),
        (() => {
            const a = 'a';
            const b = 'b';
            const constants = new Map([
                [a, `1 + 2 + 3 * 4`],
                [b, `1 + 3 * 4 + 2`]
            ]);
            return new EquationTest(`${a} - ${b}`, (args, variables) => 0, [], [], constants);
        })(),
    ];

    for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i];
        const name = `e${i + 1}`;
        const equation = testClass.create(name, test.equationStr, test.variables, test.args, test.constants);
        const equation2 = testClass.create(name, test.equationStr, test.variables, test.args, test.constants);
        equation2._equationTreeHead = Zon.Equation.EquationTreeBuilder.simplifyEquation(equation2._equationTreeHeadNotCondensed);
        const end = Math.max(test.variableOverrides.length, test.testArgs.length);
        for (let j = 0; j < end; j++) {
            const testArgs = test.testArgs[j];
            const variableOverrides = test.variableOverrides[j];
            const value = variableOverrides ? equation.getValueNewVariables(variableOverrides, ...testArgs) : equation.getValue(...testArgs);
            const value2 = variableOverrides ? equation2.getValueNewVariables(variableOverrides, ...testArgs) : equation2.getValue(...testArgs);
            const expectedValue = test.expectedFunc(testArgs, variableOverrides ?? test.variables);
            console.log(`  equation getValue(${testArgs}, ${variableOverrides}): ${value} (v2: ${value2})`);
            if (value !== expectedValue)
                console.error(`  equation getValue(${testArgs}, ${variableOverrides}) mismatch: expected ${expectedValue}, got ${value}`);

            if (value2 !== expectedValue)
                console.error(`  equation2 getValue(${testArgs}, ${variableOverrides}) mismatch: expected ${expectedValue}, got ${value2}`);
        }

        console.log(`\n`);
    }
}

Struct.EquationTests.exampleWithLevelToXP = () => {
    const constants = new Map();
    const r = `r`;
    constants.set(r, `2^(1 / 7)`);
    const level = `level`;
    const args = [level];
    const levelToXPStr = `trunc(0.25 * (${level} * (${level} + 1) * 0.5 + 300 / (${r} - 1) * (${r}^${level} - ${r})) - round((${level} - 1) * (42.2425 / 120)))`;

    const levelToXPEquation = Zon.Equation_N.create(`LevelToXP`, levelToXPStr, [], args, constants);
    console.log(levelToXPEquation.toString());
    const xpToLevelNum = (level) => {
        const r = 2 ** (1 / 7);
        return Math.trunc(0.25 * (level * (level + 1) * 0.5 + 300 / (r - 1) * (r ** level - r)) - Math.round((level - 1) * (42.2425 / 120)));
    };
    for (let i = 1; i <= 120; i++) {
        const xp = xpToLevelNum(i);
        const equationXP = levelToXPEquation.getValue(i);
        if (xp !== equationXP) {
            console.warn(`Level ${i}: XP = ${xp}, Equation XP: ${equationXP} (${xp === equationXP ? '' : `Fail, diff: ${equationXP - xp}`})`);
        } else {
            console.log(`Level ${i}: XP = ${xp}, Equation XP: ${equationXP}`);
        }
    }
}

//Simplify could use a lot of work such as combining multiplications that aren't directly connected.
//Look at my dynamic number class in Matrix Operations if I even want to bother with this.

//Try to use in place math operations?

//Test BigNumber

//Check numbers with e/E

//Check invalid numbers like:
//Multiple e/E
//Starting or ending with e/E
//Multiple decimal points
//Starting or ending with decimal point

//Populate variable names for ALL variables.  Give them some name to identify them for troubleshooting.