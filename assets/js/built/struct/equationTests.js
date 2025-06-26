"use strict";

Struct.EquationTests = {};

Struct.EquationTests.runTests = () => {
    if (Zon.Equation.debug) {
        //Struct.EquationTests.equationTests_N(Zon.Equation_N);
        Struct.EquationTests.equationTests_BN(Zon.Equation_BN);
    }
    
    // Struct.EquationTests.exampleWithLevelToXP();
    // Struct.EquationTests.exampleWithLevelToXP_BN();
}

Struct.EquationTests.equationTests_N = (testClass) => {
    class EquationTest_N {
        constructor(equationStr, expectedFunc, variables = [], args = [], constants = new Map(), testArgs = [], variableOverrides = [], subEquations = []) {
            this.equationStr = equationStr;
            this.expectedFunc = expectedFunc;
            this.variables = variables;
            this.args = args;
            this.constants = constants;
            this.testArgs = testArgs;
            this.variableOverrides = variableOverrides;
            this.subEquations = subEquations;
        }
    }
    const testCases = [
        new EquationTest_N(`0.25`, (args, variables) => 0.25, [], [], new Map(), [], []),
        new EquationTest_N(`2.5e-1`, (args, variables) => 2.5e-1, [], [], new Map(), [], []),
        new EquationTest_N(`2.5e5`, (args, variables) => 2.5e5, [], [], new Map(), [], []),
        new EquationTest_N(`trunc(0.25)`, (args, variables) => Math.trunc(0.25), [], [], new Map(), [], []),
        new EquationTest_N(`0.25 * 100`, (args, variables) => 0.25 * 100, [], [], new Map(), [], []),
        new EquationTest_N(`pi`, (args, variables) => Math.PI, [], [], new Map(), [], []),
        new EquationTest_N(`π`, (args, variables) => Math.PI, [], [], new Map(), [], []),
        new EquationTest_N(`log2(8)`, (args, variables) => Math.log(8) / Math.log(2), [], [], new Map(), [], []),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`pi * ${level}`, (args, variables) => Math.PI * args[0], [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`π * ${level}`, (args, variables) => Math.PI * args[0], [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`0.25 * ${level}`, (args, variables) => 0.25 * args[0], [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`0.25 * ${level} * (${level} + 1) * 0.5`, (args, variables) => 0.25 * args[0] * (args[0] + 1) * 0.5, [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`0.25 * (${level} * (${level} + 1) * 0.5)`, (args, variables) => 0.25 * (args[0] * (args[0] + 1) * 0.5), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`trunc(${level})`, (args, variables) => Math.trunc(args[0]), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`floor(${level})`, (args, variables) => Math.floor(args[0]), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`0.25 * trunc(${level})`, (args, variables) => 0.25 * Math.trunc(args[0]), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`0.25 * trunc(${level} * (${level} + 1) * 0.5)`, (args, variables) => 0.25 * Math.trunc(args[0] * (args[0] + 1) * 0.5), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`trunc(trunc(${level}))`, (args, variables) => Math.trunc(Math.trunc(args[0])), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`0.25 * trunc(trunc(${level}) * (${level} + 1) * 0.5)`, (args, variables) => 0.25 * Math.trunc(args[0] * (args[0] + 1) * 0.5), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [8],
                [10]
            ];
            return new EquationTest_N(`log(${level}, 2)`, (args, variables) => Math.log(args[0]) / Math.log(2), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [8],
                [10]
            ];
            return new EquationTest_N(`log(log(${level}, 2), 3)`, (args, variables) => Math.log(Math.log(args[0]) / Math.log(2)) / Math.log(3), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [8],
                [10]
            ];
            return new EquationTest_N(`5 * log(${level}, 2)`, (args, variables) => 5 * (Math.log(args[0]) / Math.log(2)), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [8],
                [10]
            ];
            return new EquationTest_N(`trunc(log(${level}, 2))`, (args, variables) => Math.trunc(Math.log(args[0]) / Math.log(2)), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const r = `r`;
            const constants = new Map([
                [r, `2^(1 / 7)`]
            ]);
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`level - r^2`, (args, variables) => args[0] - (2 ** (1 / 7)) ** 2, [], args, constants, testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`-level`, (args, variables) => -args[0], [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const r = `r`;
            const constants = new Map([
                [r, `2^(1 / 7)`]
            ]);
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`(-level - --r)^2`, (args, variables) => (-args[0] - 2 ** (1 / 7)) ** 2, [], args, constants, testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const r = `r`;
            const constants = new Map([
                [r, `2^(1 / 7)`]
            ]);
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`(-level - r)^2`, (args, variables) => (-args[0] - 2 ** (1 / 7)) ** 2, [], args, constants, testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level)
            ];
            const r = `r`;
            const constants = new Map([
                [r, `2^(1 / 7)`]
            ]);
            const testArgs = [
                [10],
                [20]
            ];
            const testVar = new Variable.Value(3, `TestVar`);
            const variables = [testVar];
            return new EquationTest_N(`(-level - r)^${testVar.name}`, (args, variables) => (-args[0] - 2 ** (1 / 7)) ** variables[0].value, variables, args, constants, testArgs, []);
        })(),
        (() => {
            const a = 'a';
            const b = 'b';
            const constants = new Map([
                [a, `-2^2`],
                [b, `(-2)^2`]
            ]);
            return new EquationTest_N(`${a} + ${b}`, (args, variables) => 0, [], [], constants);
        })(),
        (() => {
            const a = 'a';
            const b = 'b';
            const constants = new Map([
                [a, `1 + 2 * 3`],
                [b, `2 * 3 + 1`]
            ]);
            return new EquationTest_N(`${a} - ${b}`, (args, variables) => 0, [], [], constants);
        })(),
        (() => {
            const a = 'a';
            const b = 'b';
            const constants = new Map([
                [a, `1 + 2 + 3 * 4`],
                [b, `1 + 3 * 4 + 2`]
            ]);
            return new EquationTest_N(`${a} - ${b}`, (args, variables) => 0, [], [], constants);
        })(),
        (() => {
            const stageNum = `stageNum`;
            const maxStageNum = `maxStageNum`;
            const constants = [
                [maxStageNum, `${Zon.LevelData.maxStageDisplayedNum}`]
            ];
            const args = [
                new Zon.Type_N(stageNum),
            ];
            const effStageNum = `effStageNum`;
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`${stageNum} + ${Zon.GlobalVarNames.PRESTIGE_COUNT} * ${maxStageNum}`, (args, variables) => args[0] + Zon.GlobalVariables.get(Zon.GlobalVarNames.PRESTIGE_COUNT).value * Zon.LevelData.maxStageDisplayedNum, [], args, constants, testArgs, [], []);
        })(),
        (() => {
            const stageNum = `stageNum`;
            const maxStageNum = `maxStageNum`;
            const constants = [
                [maxStageNum, `${Zon.LevelData.maxStageDisplayedNum}`]
            ];
            const args = [
                new Zon.Type_N(stageNum),
            ];
            const effStageNum = `effStageNum`;
            const effStageNumEquation = Zon.Equation_N.create(effStageNum, `${stageNum} + ${Zon.GlobalVarNames.PRESTIGE_COUNT} * ${maxStageNum}`, [], args, constants);
            const healthPow = `healthPow`;
            const subEquations = [
                effStageNumEquation,
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_N(`3 * (2^(${effStageNum} / 10) - 1)`, (args, variables) => 3 * (2 ** ((args[0] + Zon.GlobalVariables.get(Zon.GlobalVarNames.PRESTIGE_COUNT).value * Zon.LevelData.maxStageDisplayedNum) / 10) - 1), [], args, constants, testArgs, [], subEquations);
        })(),
    ];

    for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i];
        const name = `e${i + 1}`;
        const equation = testClass.create(name, test.equationStr, test.variables, test.args, test.constants, test.subEquations);
        const equation2 = testClass.create(name, test.equationStr, test.variables, test.args, test.constants, test.subEquations);
        equation2._equationTreeHead = Zon.Equation.EquationTreeBuilder.simplifyEquation(equation2._equationTreeHeadNotCondensed);
        const end = Math.max(test.variableOverrides.length, test.testArgs.length);
        if (end === undefined || end === null)
            throw new Error(`Test ${i + 1} has no testArgs or variableOverrides defined.`);

        if (end > 0) {
            for (let j = 0; j < end; j++) {
                const testArgs = test.testArgs[j];
                const variableOverrides = test.variableOverrides[j];
                const value = variableOverrides ? equation.getValueNewVariables(variableOverrides, ...testArgs) : equation.getValue(...testArgs);
                const value2 = variableOverrides ? equation2.getValueNewVariables(variableOverrides, ...testArgs) : equation2.getValue(...testArgs);
                const value3 = variableOverrides ? equation.getTreeValueNewVariables(variableOverrides, ...testArgs) : equation.getTreeValue(...testArgs);
                const expectedValue = test.expectedFunc(testArgs, variableOverrides ?? test.variables);
                console.log(`  equation getValue(${testArgs}, ${variableOverrides}): ${value} (v2: ${value2}) (tree: ${value3})`);
                if (value !== expectedValue)
                    console.error(`  equation getValue(${testArgs}, ${variableOverrides}) mismatch: expected ${expectedValue}, got ${value}`);

                if (value2 !== expectedValue)
                    console.error(`  equation2 getValue(${testArgs}, ${variableOverrides}) mismatch: expected ${expectedValue}, got ${value2}`);

                if (value3 !== expectedValue)
                    console.error(`  equation getTreeValue(${testArgs}, ${variableOverrides}) mismatch: expected ${expectedValue}, got ${value3}`);
            }
        }
        else {
            const value = equation.value;
            const value2 = equation2.value;
            const value3 = equation.treeValue;
            const expectedValue = test.expectedFunc([], []);
            console.log(`  equation.value: ${value} (v2: ${value2}) (tree: ${value3})`);
            if (value !== expectedValue)
                console.error(`  equation getValue() mismatch: expected ${expectedValue}, got ${value}`);

            if (value2 !== expectedValue)
                console.error(`  equation2 getValue() mismatch: expected ${expectedValue}, got ${value2}`);

            if (value3 !== expectedValue)
                console.error(`  equation getTreeValue() mismatch: expected ${expectedValue}, got ${value3}`);
        }

        console.log(`\n`);
    }
}
Struct.EquationTests.equationTests_BN = (testClass) => {
    class EquationTest_BN {
        constructor(equationStr, expectedFunc, variables = [], args = [], constants = new Map(), testArgs = [], variableOverrides = [], subEquations = []) {
            this.equationStr = equationStr;
            this.expectedFunc = expectedFunc;
            this.variables = variables;
            this.args = args;
            this.constants = constants;
            this.testArgs = testArgs;
            this.variableOverrides = variableOverrides;
            this.subEquations = subEquations;
        }
    }
    const testCases = [
        new EquationTest_BN(`0.25`, (args, variables) => Struct.BigNumber.create(0.25), [], [], new Map(), [], []),
        new EquationTest_BN(`2.5e-1`, (args, variables) => Struct.BigNumber.create(2.5e-1), [], [], new Map(), [], []),
        new EquationTest_BN(`2.5e5`, (args, variables) => Struct.BigNumber.create(2.5e5), [], [], new Map(), [], []),
        new EquationTest_BN(`trunc(0.25)`, (args, variables) => Struct.BigNumber.create(0.25).trunc(), [], [], new Map(), [], []),
        new EquationTest_BN(`0.25 * 100`, (args, variables) => Struct.BigNumber.create(0.25).multiply(Struct.BigNumber.create(100)), [], [], new Map(), [], []),
        new EquationTest_BN(`pi`, (args, variables) => Struct.BigNumber.create(Math.PI), [], [], new Map(), [], []),
        new EquationTest_BN(`π`, (args, variables) => Struct.BigNumber.create(Math.PI), [], [], new Map(), [], []),
        new EquationTest_BN(`log2(8)`, (args, variables) => Struct.BigNumber.create(8).log(Struct.BigNumber.create(2)), [], [], new Map(), [], []),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`pi * ${level}`, (args, variables) => Struct.BigNumber.create(Math.PI).multiply(args[0]), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`π * ${level}`, (args, variables) => Struct.BigNumber.create(Math.PI).multiply(args[0]), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`0.25 * ${level}`, (args, variables) => Struct.BigNumber.create(0.25).multiply(args[0]), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`0.25 * ${level} * (${level} + 1) * 0.5`, (args, variables) => Struct.BigNumber.create(0.25).multiply(args[0]).multiply(args[0].add(Struct.BigNumber.create(1))).multiply(Struct.BigNumber.create(0.5)), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`0.25 * (${level} * (${level} + 1) * 0.5)`, (args, variables) => Struct.BigNumber.create(0.25).multiply(args[0]).multiply(args[0].add(Struct.BigNumber.create(1))).multiply(Struct.BigNumber.create(0.5)), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`trunc(${level})`, (args, variables) => args[0].trunc(), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`floor(${level})`, (args, variables) => args[0].floor(), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`0.25 * trunc(${level})`, (args, variables) => Struct.BigNumber.create(0.25).multiply(args[0].trunc()), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`0.25 * trunc(${level} * (${level} + 1) * 0.5)`, (args, variables) => Struct.BigNumber.create(0.25).multiply(args[0].multiply(args[0].add(Struct.BigNumber.create(1))).multiply(Struct.BigNumber.create(0.5))), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`trunc(trunc(${level}))`, (args, variables) => args[0].trunc().trunc(), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`0.25 * trunc(trunc(${level}) * (${level} + 1) * 0.5)`, (args, variables) => Struct.BigNumber.create(0.25).multiply(args[0].multiply(args[0].add(Struct.BigNumber.create(1))).multiply(Struct.BigNumber.create(0.5))), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(8)],
                [Struct.BigNumber.create(10)]
            ];
            return new EquationTest_BN(`log(${level}, 2)`, (args, variables) => args[0].log(2), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(8)],
                [Struct.BigNumber.create(10)]
            ];
            return new EquationTest_BN(`log(log(${level}, 2), 3)`, (args, variables) => args[0].log(2).log(3), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(8)],
                [Struct.BigNumber.create(10)]
            ];
            return new EquationTest_BN(`5 * log(${level}, 2)`, (args, variables) => Struct.BigNumber.create(5).multiply(args[0].log(2)), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(8)],
                [Struct.BigNumber.create(10)]
            ];
            return new EquationTest_BN(`trunc(log(${level}, 2))`, (args, variables) => args[0].log(2).trunc(), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const r = `r`;
            const constants = new Map([
                [r, `2^(1 / 7)`]
            ]);
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            const rV = Struct.BigNumber.create(2).pow(Struct.BigNumber.create(1).divide(Struct.BigNumber.create(7)));
            return new EquationTest_BN(`level - r^2`, (args, variables) => args[0].subtract(rV.pow(Struct.BigNumber.create(2))), [], args, constants, testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`-level`, (args, variables) => args[0].negative(), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const r = `r`;
            const constants = new Map([
                [r, `2^(1 / 7)`]
            ]);
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`(-level - --r)^2`, (args, variables) => (args[0].negative().subtract(Struct.BigNumber.create(2).pow(Struct.BigNumber.create(1).divide(Struct.BigNumber.create(7)))).pow(Struct.BigNumber.create(2))), [], args, constants, testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const r = `r`;
            const constants = new Map([
                [r, `2^(1 / 7)`]
            ]);
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            return new EquationTest_BN(`(-level - r)^2`, (args, variables) => (args[0].negative().subtract(Struct.BigNumber.create(2).pow(Struct.BigNumber.create(1).divide(Struct.BigNumber.create(7)))).pow(Struct.BigNumber.create(2))), [], args, constants, testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const r = `r`;
            const constants = new Map([
                [r, `2^(1 / 7)`]
            ]);
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            const testVar = new Variable.BigNumberVar(Struct.BigNumber.create(3), `TestVar`);
            const variables = [testVar];
            return new EquationTest_BN(`(-level - r)^${testVar.name}`, (args, variables) => (args[0].negative().subtract(Struct.BigNumber.create(2).pow(Struct.BigNumber.create(1).divide(Struct.BigNumber.create(7)))).pow(variables[0].value)), variables, args, constants, testArgs, []);
        })(),
        (() => {
            const a = 'a';
            const b = 'b';
            const constants = new Map([
                [a, `-2^2`],
                [b, `(-2)^2`]
            ]);
            return new EquationTest_BN(`${a} + ${b}`, (args, variables) => Struct.BigNumber.ZERO, [], [], constants);
        })(),
        (() => {
            const a = 'a';
            const b = 'b';
            const constants = new Map([
                [a, `1 + 2 * 3`],
                [b, `2 * 3 + 1`]
            ]);
            return new EquationTest_BN(`${a} - ${b}`, (args, variables) => Struct.BigNumber.ZERO, [], [], constants);
        })(),
        (() => {
            const a = 'a';
            const b = 'b';
            const constants = new Map([
                [a, `1 + 2 + 3 * 4`],
                [b, `1 + 3 * 4 + 2`]
            ]);
            return new EquationTest_BN(`${a} - ${b}`, (args, variables) => Struct.BigNumber.ZERO, [], [], constants);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level),
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_BN(`0.25 * trunc(${level} * (${level} + 1) * 0.5)`, (args, variables) => Struct.BigNumber.create(0.25).multiply(Struct.BigNumber.create(args[0]).multiply(Struct.BigNumber.create(args[0]).add(Struct.BigNumber.create(1))).multiply(Struct.BigNumber.create(0.5))), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_BN(level)
            ];
            const r = `r`;
            const constants = new Map([
                [r, `2^(1 / 7)`]
            ]);
            const testArgs = [
                [Struct.BigNumber.create(10)],
                [Struct.BigNumber.create(20)]
            ];
            const testVar = new Variable.Value(3, `TestVar`);
            const testVar2 = new Variable.BigNumberVar(Struct.BigNumber.create(4), `TestVar2`);
            const variables = [testVar, testVar2];
            return new EquationTest_BN(`(-level - r)^${testVar.name} + ${testVar2.name}`, (args, variables) => (args[0].negative().subtract(Struct.BigNumber.create(2).pow(Struct.BigNumber.create(1).divide(Struct.BigNumber.create(7)))).pow(Struct.BigNumber.create(variables[0].value))).add(variables[1].value), variables, args, constants, testArgs, []);
        })(),
        (() => {
            const level = `level`;
            const args = [
                new Zon.Type_N(level),
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_BN(`${level} + 1`, (args, variables) => Struct.BigNumber.create(args[0]).add(Struct.BigNumber.ONE_), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const mult = `mult`;
            const args = [
                new Zon.Type_N(mult),
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_BN(`${Zon.GlobalVarNames.PLAYER_LEVEL} * ${mult}`, (args, variables) => Struct.BigNumber.create(args[0]).multiplyI(Struct.BigNumber.create(Zon.GlobalVariables.get(Zon.GlobalVarNames.PLAYER_LEVEL).value)), [], args, new Map(), testArgs, []);
        })(),
        (() => {
            const healthPow = `healthPow`;
            const args = [
                new Zon.Type_N(healthPow),
            ];
            const testArgs = [
                [10],
                [20]
            ];
            return new EquationTest_BN(`10^${healthPow}`, (args, variables) => Struct.BigNumber.create(10).pow(Struct.BigNumber.create(args[0])), [], args, [], testArgs, [], []);
        })(),
        (() => {
            const stageNum = `stageNum`;
            const maxStageNum = `maxStageNum`;
            const constants = [
                [maxStageNum, `${Zon.LevelData.maxStageDisplayedNum}`]
            ];
            const args = [
                new Zon.Type_N(stageNum),
            ];
            const effStageNum = `effStageNum`;
            const effStageNumEquation = Zon.Equation_N.create(effStageNum, `${stageNum} + ${Zon.GlobalVarNames.PRESTIGE_COUNT} * ${maxStageNum}`, [], args, constants);
            const healthPow = `healthPow`;
            const testArgs = [
                [10],
                [20]
            ];
            const healthPowEquation = Zon.Equation_N.create(healthPow, `3 * (2^(${effStageNum} / 10) - 1)`, [], args, constants, [effStageNumEquation]);
            const subEquations = [
                effStageNumEquation,
                healthPowEquation
            ];
            return new EquationTest_BN(`10^${healthPow}`, (args, variables) => Struct.BigNumber.create(10).pow(Struct.BigNumber.create(3 * (2 ** ((args[0] + Zon.GlobalVariables.get(Zon.GlobalVarNames.PRESTIGE_COUNT).value * Zon.LevelData.maxStageDisplayedNum) / 10) - 1))), [], args, constants, testArgs, [], subEquations);
        })(),
    ];

    for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i];
        const name = `e${i + 1}`;
        const equation = testClass.create(name, test.equationStr, test.variables, test.args, test.constants, test.subEquations);
        const equation2 = testClass.create(name, test.equationStr, test.variables, test.args, test.constants, test.subEquations);
        equation2._equationTreeHead = Zon.Equation.EquationTreeBuilder.simplifyEquation(equation2._equationTreeHeadNotCondensed);
        const end = Math.max(test.variableOverrides.length, test.testArgs.length);
        if (end === undefined || end === null)
            throw new Error(`Test ${i + 1} has no testArgs or variableOverrides defined.`);

        if (end > 0) {
            for (let j = 0; j < end; j++) {
                const testArgs = test.testArgs[j];
                const variableOverrides = test.variableOverrides[j];
                const value = variableOverrides ? equation.getValueNewVariables(variableOverrides, ...testArgs) : equation.getValue(...testArgs);
                const value2 = variableOverrides ? equation2.getValueNewVariables(variableOverrides, ...testArgs) : equation2.getValue(...testArgs);
                const value3 = variableOverrides ? equation.getTreeValueNewVariables(variableOverrides, ...testArgs) : equation.getTreeValue(...testArgs);
                const expectedValue = test.expectedFunc(testArgs, variableOverrides ?? test.variables);
                console.log(`  equation getValue(${testArgs}, ${variableOverrides}): ${value} (v2: ${value2}) (tree: ${value3})`);
                if (value.notEquals(expectedValue))
                    console.error(`  equation getValue(${testArgs}, ${variableOverrides}) mismatch: expected ${expectedValue.toBinaryFullString()}, got ${value.toBinaryFullString()}`);

                if (value2.notEquals(expectedValue))
                    console.error(`  equation2 getValue(${testArgs}, ${variableOverrides}) mismatch: expected ${expectedValue.toBinaryFullString()}, got ${value2.toBinaryFullString()}`);

                if (value3.notEquals(expectedValue))
                    console.error(`  equation getTreeValue(${testArgs}, ${variableOverrides}) mismatch: expected ${expectedValue.toBinaryFullString()}, got ${value3.toBinaryFullString()}`);
            }
        }
        else {
            const value = equation.value;
            const value2 = equation2.value;
            const value3 = equation.treeValue;
            const expectedValue = test.expectedFunc([], []);
            console.log(`  equation.value: ${value} (v2: ${value2}) (tree: ${value3})`);
            if (value.notEquals(expectedValue))
                console.error(`  equation getValue() mismatch: expected ${expectedValue.toBinaryFullString()}, got ${value.toBinaryFullString()}`);

            if (value2.notEquals(expectedValue))
                console.error(`  equation2 getValue() mismatch: expected ${expectedValue.toBinaryFullString()}, got ${value2.toBinaryFullString()}`);

            if (value3.notEquals(expectedValue))
                console.error(`  equation getTreeValue() mismatch: expected ${expectedValue.toBinaryFullString()}, got ${value3.toBinaryFullString()}`);
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
    const levelToXP = (level) => {
        const r = 2 ** (1 / 7);
        return Math.trunc(0.25 * (level * (level + 1) * 0.5 + 300 / (r - 1) * (r ** level - r)) - Math.round((level - 1) * (42.2425 / 120)));
    };
    for (let i = 1; i <= 120; i++) {
        const xp = levelToXP(i);
        const equationXP = levelToXPEquation.getValue(i);
        if (xp !== equationXP) {
            console.warn(`Level ${i}: XP = ${xp}, Equation XP: ${equationXP} (${xp === equationXP ? '' : `Fail, diff: ${equationXP - xp}`})`);
        } else {
            console.log(`Level ${i}: XP = ${xp}, Equation XP: ${equationXP}`);
        }
    }
}
Struct.EquationTests.exampleWithLevelToXP_BN = () => {
    const constants = new Map();
    const r = `r`;
    constants.set(r, `2^(1 / 7)`);
    const level = `level`;
    const args = [level];
    const levelToXPStr = `trunc(0.25 * (${level} * (${level} + 1) * 0.5 + 300 / (${r} - 1) * (${r}^${level} - ${r})) - round((${level} - 1) * (42.2425 / 120)))`;

    const levelToXPEquation = Zon.Equation_BN.create(`LevelToXP`, levelToXPStr, [], args, constants);
    console.log(levelToXPEquation.toString());
    const levelToXP = Zon.playerLevel.levelToXP;
    for (let i = 1; i <= 120; i++) {
        const level = Struct.BigNumber.create(i);
        const xp = levelToXP(level);
        const equationXP = levelToXPEquation.getValue(level);
        if (xp.notEquals(equationXP)) {
            console.warn(`Level ${i}: XP = ${xp}, Equation XP: ${equationXP} (${xp === equationXP ? '' : `Fail, diff: ${equationXP - xp}`})`);
        } else {
            console.log(`Level ${i}: XP = ${xp}, Equation XP: ${equationXP}`);
        }
    }
}