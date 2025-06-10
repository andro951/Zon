"use strict";

{
    const debugEquation = zonDebug && true;
    Zon.Equation = class Equation {
        constructor() {
            if (new.target === Zon.Equation)
                throw new TypeError("Cannot construct Equation instances directly.");

            this.name = '';
            this.equationString = '';
            this.defaultVariablesArr = [];
            this.variablesArr = [];
            this.defaultArgsArr = [];
            this.argsArr = [];
            this._constantsMap = new Map();
            this._constantsTrees = [];
            this.constantsArr = [];
            this.constantsArrNames = [];
            this.constantsArrLookupMap = new Map();
            this._cachedConstants = [];
            this._equationTreeHeadNotCondensed = null;
            this._equationTreeHead = null;
            this._equationFunction = null;
        }
        static create(equation, name, equationString, operationsSet, variablesArr = [], argsArr = [], constantsMap = new Map()) {
            equation.name = name;
            equation.equationString = equationString;
            equation.operationsSet = operationsSet;
            equation.defaultVariablesArr = Array.from(variablesArr);
            equation.variablesArr = equation.defaultVariablesArr;
            equation.argsArr = Array.from(argsArr);
            equation.constantsMap = constantsMap;
            for (const [key, constantEquationString] of constantsMap) {
                if (constantEquationString === undefined || constantEquationString === null) {
                    console.error(`Skipping constant "${key}" with undefined or null value.`);
                    continue;
                }

                const constantTree = Zon.Equation.EquationTreeBuilder.createTree(constantEquationString, equation, operationsSet, variablesArr, argsArr, equation.constantsArrLookupMap);
                this.EquationTreeBuilder.checkOnlyContainsConstants(constantTree);
                equation._constantsTrees.push(constantTree);
                const constantValue = constantTree.value;
                equation.constantsArr.push(constantValue);
                equation.constantsArrNames.push(key);
                equation.constantsArrLookupMap.set(key, equation.constantsArr.length - 1);
                if (debugEquation) {
                    console.log(`const: ${constantTree.toString()} = ${constantValue}`);
                }
            }

            equation._equationTreeHeadNotCondensed = Zon.Equation.EquationTreeBuilder.createTree(equationString, equation, operationsSet, variablesArr, argsArr, equation.constantsArrLookupMap);
            if (debugEquation) {
                const treeHeadString = equation._equationTreeHeadNotCondensed.toString();
                console.log(`  equationString: ${equation.equationString}`);
                console.log(`equationTreeHead: ${treeHeadString}`);
                if (equation.equationString !== treeHeadString) {
                    console.error(`Equation string mismatch: expected "${equation.equationString}", got "${treeHeadString}"`);
                }
            }

            equation._equationTreeHead = Zon.Equation.EquationTreeBuilder.simplifyEquation(equation._equationTreeHeadNotCondensed);
            if (debugEquation) {
                console.log(`equationString_s: ${equation._equationTreeHead.toString()}`);
            }

            equation._equationTreeHead = Zon.Equation.EquationTreeBuilder.replaceConstantsWithReferences(equation);
            Zon.Equation.EquationTreeBuilder._checkNoConstants(equation._equationTreeHead);
            if (debugEquation) {
                console.log(`equationString_r: ${equation._equationTreeHead.toString()}`);
            }

            equation._equationFunction = equation.operationsSet.createFunction(equation);
            if (debugEquation) {
                console.log(`Equation created: ${equation._equationFunction.toString()}`);
            }
            
            return equation;
        }
        *traverseNodes() {
            for (const node of this._equationTreeHead.traverse()) {
                if (node === null)
                    continue;

                yield node;
            }
        }
        get treeValue() {
            const result = this._equationTreeHead.value;
            if (!this.operationsSet.isFinite(result))
                throw new Error(`Equation value is not finite: ${result}.  Equation: ${this.toString()}`);

            return result;
        }
        get value() {
            const result = this._equationFunction(this.variablesArr, this.constantsArr, this._cachedConstants, this.argsArr);
            if (!this.operationsSet.isFinite(result))
                throw new Error(`Equation value is not finite: ${result}.  Equation: ${this.toString()}`);

            return result;
        }
        getTreeValue(...args) {
            this.argsArr = args;
            const result = this.treeValue;
            this.argsArr = [];
            return result;
        }
        getTreeValueNewVariables(variablesArr, ...args) {
            this.variablesArr = variablesArr;
            const result = this.getTreeValue(...args);
            this.variablesArr = this.defaultVariablesArr;
            return result;
        }
        getValue(...args) {
            this.argsArr = args;
            const result = this.value;
            this.argsArr = [];
            return result;
        }
        getValueNewVariables(variablesArr, ...args) {
            this.variablesArr = variablesArr;
            const result = this.getValue(...args);
            this.variablesArr = this.defaultVariablesArr;
            return result;
        }
        toString() {
            return `${this.name}${(this.defaultArgsArr.length > 0 ? `(${this.defaultArgsArr.join(', ')})` : '')} = ${this.equationString}`;
        }
    }

    Zon.Equation.debug = debugEquation;
    
    Zon.Equation_BN = class Equation_BN extends Zon.Equation {
        constructor() {
            super();
        }
        static create(name, equationString, variablesArr = [], argsArr = [], constantsMap = new Map()) {
            const equation = new this();
            return Zon.Equation.create(equation, name, equationString, Zon.Equation.BigNumberOperationSet.instance, variablesArr, argsArr, constantsMap);
        }
    }

    Zon.Equation_N = class Equation_N extends Zon.Equation {
        constructor() {
            super();
        }
        static create(name, equationString, variablesArr = [], argsArr = [], constantsMap = new Map()) {
            const equation = new this();
            return Zon.Equation.create(equation, name, equationString, Zon.Equation.NumberOperationSet.instance, variablesArr, argsArr, constantsMap);
        }
    }

    Zon.Equation_B = class Equation_B extends Zon.Equation {
        constructor() {
            super();
        }
        static create(name, equationString, variablesArr = [], argsArr = [], constantsMap = new Map()) {
            const equation = new this();
            return Zon.Equation.create(equation, name, equationString, Zon.Equation.BoolOperationSet.instance, variablesArr, argsArr, constantsMap);
        }
    }

    const OperationID = {
        NONE: 0,

        OR: 1,
        AND: 2,

        GREATER_THAN: 3,
        LESS_THAN: 4,
        EQUAL_TO: 5,
        NOT_EQUAL_TO: 6,
        GREATER_THAN_OR_EQUAL_TO: 7,
        LESS_THAN_OR_EQUAL_TO: 8,

        ADD: 9,
        SUBTRACT: 10,
        MULTIPLY: 11,
        DIVIDE: 12,

        POWER: 13,
    }
    const SingleVariableOperationID = {
        NONE: 0,
        ABS: 1,
        NEGATE: 2,
        ROUND: 3,
        TRUNC: 4,
        NOT: 5,
        FLOOR: 6,
        CONVERT: 7,
    }
    const PrecursorOperationID = {
        NONE: 0,
        LOG: 1,
    }
    class EquationTreeBuilder {
        static operations = new Map([
            ['+', OperationID.ADD],
            ['-', OperationID.SUBTRACT],
            ['*', OperationID.MULTIPLY],
            ['/', OperationID.DIVIDE],
            ['^', OperationID.POWER],
            //['>', OperationID.GREATER_THAN],
            //['<', OperationID.LESS_THAN],
            //['==', OperationID.EQUAL_TO],
            //['!=', OperationID.NOT_EQUAL_TO],
            //['>=', OperationID.GREATER_THAN_OR_EQUAL_TO],
            //['<=', OperationID.LESS_THAN_OR_EQUAL_TO],
            //['&&', OperationID.AND],
            //['||', OperationID.OR],
        ]);
        static singleVariableOperations = new Map([
            ['abs', SingleVariableOperationID.ABS],
            ['round', SingleVariableOperationID.ROUND],
            ['trunc', SingleVariableOperationID.TRUNC],
            ['!', SingleVariableOperationID.NOT],
            ['floor', SingleVariableOperationID.FLOOR],
        ]);
        static precursorOperations = new Map([
            ['log', PrecursorOperationID.LOG],
        ]);
        static operationString(operationID, left, right) {
            switch (operationID) {
                case OperationID.ADD:
                    return `${left} + ${right}`;
                case OperationID.SUBTRACT:
                    return `${left} - ${right}`;
                case OperationID.MULTIPLY:
                    return `${left} * ${right}`;
                case OperationID.DIVIDE:
                    return `${left} / ${right}`;
                case OperationID.POWER:
                    return `${left}^${right}`;
                // case OperationID.GREATER_THAN:
                //     return `${left} > ${right}`;
                // case OperationID.LESS_THAN:
                //     return `${left} < ${right}`;
                // case OperationID.EQUAL_TO:
                //     return `${left} == ${right}`;
                // case OperationID.NOT_EQUAL_TO:
                //     return `${left} != ${right}`;
                // case OperationID.GREATER_THAN_OR_EQUAL_TO:
                //     return `${left} >= ${right}`;
                // case OperationID.LESS_THAN_OR_EQUAL_TO:
                //     return `${left} <= ${right}`;
                // case OperationID.AND:
                //     return `${left} && ${right}`;
                // case OperationID.OR:
                //     return `${left} || ${right}`;
            }

            throw new Error(`Unknown operation ID: ${operationID}`);
        }
        static precursorOperationString(precursorOperationID, left, right, hasPrecursorConstant = false) {
            switch (precursorOperationID) {
                case PrecursorOperationID.LOG:
                    if (hasPrecursorConstant) {
                        return `log${right}(${left})`;
                    }
                    else {
                        return `log(${left}, ${right})`;
                    }
            }

            throw new Error(`Unknown precursor operation ID: ${precursorOperationID}`);
        }
        static singleVariableOperationstring(singleOperationID, variable) {
            switch (singleOperationID) {
                case SingleVariableOperationID.ABS:
                    return `abs(${variable})`;
                case SingleVariableOperationID.NEGATE:
                    return `-${variable}`;
                case SingleVariableOperationID.ROUND:
                    return `round(${variable})`;
                case SingleVariableOperationID.TRUNC:
                    return `trunc(${variable})`;
                case SingleVariableOperationID.NOT:
                    return `!${variable}`;
                case SingleVariableOperationID.FLOOR:
                    return `floor(${variable})`;
                case SingleVariableOperationID.CONVERT:
                    return `${variable}`;
            }

            throw new Error(`Unknown single operation ID: ${singleOperationID}`);
        }
        static oppPrecedence = [
            0,//NONE
            100,//OR
            200,//AND
            300,//GREATER_THAN
            300,//LESS_THAN
            300,//EQUAL_TO
            300,//NOT_EQUAL_TO
            300,//GREATER_THAN_OR_EQUAL_TO
            300,//LESS_THAN_OR_EQUAL_TO
            400,//ADD
            400,//SUBTRACT
            500,//MULTIPLY
            500,//DIVIDE
            //600,//NOT,
            700,//POWER
        ];
        static precursorOperationPrecedence = [
            0,//NONE
            10000,//LOG
        ];
        static singleOperationPrecedence = [
            0,//NONE
            10000,//ABS
            600,//NEGATE
            10000,//ROUND
            10000,//TRUNC
            600,//NOT
            10000,//FLOOR
            10000,//CONVERT
        ];
        static singleVariableOperationUsesParentheses = [
            false,//NONE
            true,//ABS
            false,//NEGATE
            true,//ROUND
            true,//TRUNC
            false,//NOT
            true,//FLOOR
            false,//CONVERT
        ];
        static createTree(s, equation, operationsSet, variablesArr, argsArr, constantsArrLookupMap) {
            if (debugEquation) console.log(`Creating equation tree for:\n${s}`);
            const argsMap = new Map(argsArr.map((arg, index) => [arg.name, index]));
            const variablesMap = new Map(variablesArr.map((v, i) => [v.name, i]));

            let tree = null;
            let precursorOperation = PrecursorOperationID.NONE;
            let precursorConstant = null;
            let singleVariableOperation = SingleVariableOperationID.NONE;
            let needToCloseNonParentheseSingleVariableOperation = false;
            const notAllowedInVariableName = new Set([...EquationTreeBuilder.operations.keys()].flatMap(s => [...s]).concat([...operationsSet.symbolConstants.keys()]).concat(['(', ')', ' ', ',']));
            let i = 0;
            function checkStringForWords() {
                const firstChar = s[i];
                const symbolConstant = operationsSet.symbolConstants.get(firstChar);
                if (symbolConstant !== undefined) {
                    placeConstantOrVariable(new NamedConstant(firstChar.toString(), symbolConstant));
                    i++;
                    return true;
                }

                let word = '';
                while (i < s.length) {
                    const c = s[i];
                    if (c === ' ') {
                        i++;
                        continue;
                    }

                    if (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z') {
                        word += c;
                        i++;
                    }
                    else {
                        break;
                    }
                }

                //if (debugEquation) console.log(`Extracted word: ${word}`);
                const constant = operationsSet.constants.get(word);
                if (constant !== undefined) {
                    placeConstantOrVariable(new NamedConstant(word, constant));
                    return true;
                }

                const precursorOperationID = EquationTreeBuilder.precursorOperations.get(word);
                if (precursorOperationID !== undefined) {
                    if (precursorOperation !== PrecursorOperationID.NONE)
                        throw new Error("Failed to parse string.  There was already a precursor operation.");

                    precursorOperation = precursorOperationID;
                    return true;
                }

                const singleVariableOperationID = EquationTreeBuilder.singleVariableOperations.get(word);
                if (singleVariableOperationID !== undefined) {
                    if (singleVariableOperation !== SingleVariableOperationID.NONE)
                        throw new Error("Failed to parse string.  There was already a single variable operation.");

                    singleVariableOperation = singleVariableOperationID;
                    return true;
                }

                while (i < s.length) {
                    const c = s[i];
                    if (c === ' ') {
                        i++;
                        continue;
                    }

                    if (!notAllowedInVariableName.has(c)) {
                        word += c;
                        i++;
                    }
                    else {
                        break;
                    }
                }

                if (word.length === 0) {
                    if (firstChar === '-' && (tree === null || !tree.readyForOperation())) {
                        i++;
                        if (singleVariableOperation !== SingleVariableOperationID.NONE)
                            throw new Error("Failed to parse string.  There was already a single variable operation.");

                        singleVariableOperation = SingleVariableOperationID.NEGATE;
                        return true;
                    }

                    return false;
                }

                //if (debugEquation) console.log(`Extracted word2: ${word}`);
                const variableIndex = variablesMap.get(word);
                if (variableIndex !== undefined) {
                    const variable = variablesArr[variableIndex];
                    if (Zon.Util.getType(variable.value) !== operationsSet.typeString)
                        applySingleVariableOperation(SingleVariableOperationID.CONVERT);

                    placeConstantOrVariable(new VariableReference(equation, word, variableIndex));
                    return true;
                }

                const argIndex = argsMap.get(word);
                if (argIndex !== undefined) {
                    const arg = argsArr[argIndex];
                    if (arg.typeID !== operationsSet.type)
                        applySingleVariableOperation(SingleVariableOperationID.CONVERT);

                    placeConstantOrVariable(new ArgReference(equation, word, argIndex));
                    return true;
                }

                const constantIndex = constantsArrLookupMap.get(word);
                if (constantIndex !== undefined) {
                    placeConstantOrVariable(new ConstantReference(equation, word, constantIndex));
                    return true;
                }

                return false;
            }
            function tryGetConstant() {
                const start = i;
                let end = i;
                let foundDecimal = -1;
                let eFound = -1;
                while (end < s.length) {
                    const c = s[end];
                    if (c >= '0' && c <= '9'){
                        end++;
                    }
                    else if (c === '.') {
                        if (foundDecimal !== -1)
                            break;

                        foundDecimal = end;
                        end++;
                    }
                    else if (c === 'e' || c === 'E') {
                        if (eFound !== -1)
                            break;

                        eFound = end;
                        end++;
                        if (end < s.length && (s[end] === '-' || s[end] === '+')) {
                            end++;
                        }
                    }
                    else {
                        break;
                    }
                }

                if (eFound === end - 1)
                    end--;

                const valueString = s.substring(start, end);
                if (valueString.length === 0)
                    return false;

                //if (debugEquation) console.log(`Trying to get constant; toString: ${valueString}`);
                const value = operationsSet.parse(valueString);
                if (value !== undefined && value !== null) {
                    const constant = new Constant(value);
                    if (precursorOperation === PrecursorOperationID.LOG) {
                        precursorConstant = constant;
                    }
                    else {
                        placeConstantOrVariable(constant);
                    }
                    
                    i = end;
                    return true;
                }

                return false;
            }
            function tryGetOperator() {
                const first = s[i];
                const sLengthRemaining = s.length - i;
                let index = i;
                let operation = null;
                function match(key) {
                    return key[0] === first && sLengthRemaining >= key.length && s.substring(index, index + key.length) === key;
                }
                for (const [key, operationID] of EquationTreeBuilder.operations) {
                    if ((operation === null || key.length > operation.key.length) && match(key))
                        operation = { key, operationID };
                }

                if (operation !== null) {
                    //if (debugEquation) console.log(`Trying to get operator; key: ${operation.key}`); 
                    if (operation.operationID === OperationID.SUBTRACT) {
                        if (tree == null || !tree.readyForOperation())
                            return false;
                    }

                    i += operation.key.length;
                    applyOperation(operation.operationID);
                    return true;
                }

                return false;
            }
            function applyOperation(operationID) {
                if (operationID === OperationID.NONE)
                    throw new Error("Failed to apply operation.  The operationID is NONE.");

                if (tree == null)
                    throw new Error("Failed to apply operation.  The last Value is null.");

                const operation = new Operation(equation, operationID);
                //if (debugEquation) console.log(`Applying operation: ${operationID}`);
                if (!tree.readyForOperation())
                    throw new Error(`Failed to apply operation: ${operationID}.  The tree is not ready for an operation.  ${tree.toString()}`);

                tree = operation.mergeOntoTree(tree);
            }
            function applyPrecursorOperation(precursorOperationID) {
                if (precursorOperationID === PrecursorOperationID.NONE)
                    throw new Error("Failed to apply precursor operation.  The precursorOperationID is NONE.");
                
                const operation = new PrecursorOperation(equation, precursorOperationID);
                //if (debugEquation) console.log(`Applying precursor operation: ${precursorOperationID}`);
                if (tree == null) {
                    tree = operation.setup(precursorConstant);
                }
                else {
                    tree = tree.joinNode(operation).setup(precursorConstant);
                }

                precursorConstant = null;
            }
            function applySingleVariableOperation(singleVariableOperationID) {
                if (singleVariableOperationID === SingleVariableOperationID.NONE)
                    throw new Error("Failed to apply single variable operation.  The singleVariableOperationID is NONE.");

                const operation = new SingleVariableOperation(equation, singleVariableOperationID);
                //if (debugEquation) console.log(`Applying single variable operation: ${singleVariableOperationID}`);
                if (tree == null) {
                    tree = operation.setup();
                }
                else {
                    tree = tree.joinNode(operation).setup();
                }
            }
            function placeConstantOrVariable(constantOrVariable) {
                //if (debugEquation) console.log(`Placing constant or variable: ${constantOrVariable.toString()}`);
                if (tree === null) {
                    tree = constantOrVariable;
                }
                else {
                    tree = tree.joinNode(constantOrVariable);
                }
            }
            for (; i < s.length;) {
                const c = s[i];
                switch (c) {
                    case ' ':
                    case '\t':
                    case '\n':
                    case '\r':
                        i++;
                        continue;
                    case ',':
                        //Need to create 2 fake parentheses for precursor operators and check when a comma is used to swap between the 2 fake inner parentheses.
                        //It will return the left value instead of itself and swap to the right value on a comma.
                        if (tree == null)
                            throw new Error("Failed to parse string.  The tree was null at a comma.");

                        tree = tree.onComma();
                        i++;
                        continue;
                    case '(':
                        if (precursorOperation !== PrecursorOperationID.NONE) {
                            applyPrecursorOperation(precursorOperation);
                            precursorOperation = PrecursorOperationID.NONE;
                        }
                        else if (singleVariableOperation !== SingleVariableOperationID.NONE) {
                            applySingleVariableOperation(singleVariableOperation);
                            singleVariableOperation = SingleVariableOperationID.NONE;
                        }
                        else {
                            const parenthesis = new Parenthesis(equation, null, tree);
                            if (tree == null) {
                                tree = parenthesis;
                            }
                            else {
                                //if (debugEquation) console.log(`Joining parenthesis to tree: ${tree.toString()}`);
                                tree = tree.joinNode(parenthesis);
                            }
                        }

                        i++;
                        continue;
                    case ')':
                        if (tree == null)
                            throw new Error("Failed to close parenthesis.  The tree was null.");

                        tree = tree.closeParenthesis();
                        i++;
                        continue;
                }

                if (singleVariableOperation !== SingleVariableOperationID.NONE) {
                    if (EquationTreeBuilder.singleVariableOperationUsesParentheses[singleVariableOperation]) {
                        needToCloseNonParentheseSingleVariableOperation = true;
                    }

                    applySingleVariableOperation(singleVariableOperation);
                    singleVariableOperation = SingleVariableOperationID.NONE;
                }

                if (tryGetOperator()) {
                    continue;
                }

                if (tryGetConstant()) {
                    if (needToCloseNonParentheseSingleVariableOperation) {
                        needToCloseNonParentheseSingleVariableOperation = false;//Probably doesn't work.  Just close it immediatly and do precedence.
                        if (tree == null)
                            throw new Error("Failed to close non parentheses single variable operation.  The tree was null.");

                        tree = tree.closeParenthesis();
                    }

                    continue;
                }

                if (checkStringForWords()) {
                    if (needToCloseNonParentheseSingleVariableOperation) {
                        needToCloseNonParentheseSingleVariableOperation = false;//probably doesn't work
                        if (tree == null)
                            throw new Error("Failed to close non parentheses single variable operation.  The tree was null.");

                        tree = tree.closeParenthesis();
                    }

                    continue;
                }

                throw new Error(`Failed to parse string at index ${i}: ${s} (remaining: ${s.substring(i)})`);
            }

            if (tree == null)
                throw new Error("Failed to parse string.  The tree was null.");

            const head = tree.getTreeHead();

            const validationError = head.validate();
            if (validationError)
                throw new Error(`Equation tree validation failed: ${validationError}`);

            return head;
        }
        static checkOnlyContainsConstants(treeHead) {
            for (const node of treeHead.traverse()) {
                if (!node)
                    throw new Error(`Node in constant tree is null.  This should not happen.  Constant: ${key}, Equation: ${constantEquationString}`);

                if (node instanceof VariableReference)
                    throw new Error(`Variables are not allowed in constant definitions.`);

                if (node instanceof ArgReference)
                    throw new Error(`Arguments are not allowed in constant definitions.  Constant: ${key}, Equation: ${constantEquationString}`);
            }
        }
        static _checkNoConstants(treeHead) {
            for (const node of treeHead.traverse()) {
                if (!node)
                    throw new Error(`Node in equation tree is null.  This should not happen.  Equation: ${treeHead.toString()}`);

                if (node instanceof Constant || node instanceof NamedConstant)
                    throw new Error(`Constants should be replaced with ConstantReference by this point.  Equation: ${treeHead.toString()}`);
            }
        }
        static simplifyEquation(treeHead) {
            const simplified = treeHead.simplify();
            const validationError = simplified.validate();
            if (validationError)
                throw new Error(`Equation tree validation failed: ${validationError}`);

            return simplified;
        }
        static replaceConstantsWithReferences(equation) {
            const constantsMap = new Map();
            if (equation._equationTreeHead instanceof Constant || equation._equationTreeHead instanceof NamedConstant) {
                const name = equation._equationTreeHead instanceof NamedConstant ? equation._equationTreeHead.name : null;
                return new CachedConstantReference(equation._equationTreeHead, constantsMap, equation, name);
            }

            const constants = [];
            for (const node of equation._equationTreeHead.traverse()) {
                if (node instanceof Constant || node instanceof NamedConstant) {
                    constants.push(node);
                }
            }

            for (const constant of constants) {
                const name = constant instanceof NamedConstant ? constant.name : null;
                new CachedConstantReference(constant, constantsMap, equation, name);
            }

            const validationError = equation._equationTreeHead.validate();
            if (validationError)
                throw new Error(`Equation tree validation failed: ${validationError}`);

            return equation._equationTreeHead;
        }
    }
    Zon.Equation.EquationTreeBuilder = EquationTreeBuilder;

    //#region Equation Nodes

    const args = `_arguments`;
    const vars = `_variables`;
    const nconsts = `_namedConstants`;//Named constants
    const cconsts = `_cachedConstants`;//Cashed (unnamed) constants
    const cc = `_cc`;

    class TreeNode {
        constructor(parent = null) {
            if (new.target === TreeNode)
                throw new TypeError("Cannot construct TreeNode instances directly.");
            
            if (parent && !(parent instanceof ParentNode))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected ParentNode.`);
                
            this.parent = parent;
        }
        get value() {
            throw new Error(`Value must be implemented by subclasses.  ${this.toString()}`);
        }
        getTreeHead() {
            let current = this;
            while (current.parent) {
                current = current.parent;
            }

            return current;
        }
        closeParenthesis() {
            let node = this;
            while (node.parent && !(node.parent instanceof Parenthesis)) {
                node = node.parent;
            }

            if (node.parent instanceof Parenthesis) {
                node.parent.innerValue = node;
                return node.parent.close();
            }

            throw new Error(`Failed to close parenthesis for ${this.toString()}.  No parent parenthesis found.`);
        }
        joinNode(node) {
            throw new Error(`Cannot join Variable onto ${this.toString()}.`);
        }
        myselfAsLeftInputForOperation(operation) {
            if (operation.left !== null)
                throw new Error(`Failed to join operation onto Parenthesis because operation.left wasn't null`);

            operation.parent = this.parent;
            this.parent = operation;
            operation.left = this;
            if (operation.parent)
                operation.parent.swap(this, operation);

            return operation;
        }
        onComma() {
            let node = this.closeParenthesis();
            if (node == null)
                throw new Error(`OnComma; Failed to close parenthesis for ${this.toString()}.  CloseParenthesis resulted in null.`);

            if (!(node instanceof PrecursorOperation))
                throw new Error(`OnComma failed because tree value isn't a PrecursorOperation.`);

            if (node.right !== null)
                throw new Error(`On Comma failed to move to the right side of precursorOperation: ${node.toString()} because precursorOperation.Right wasn't null`);

            return node.transferToRight();
        }
        readyForOperation() {
            throw new Error(`readyForOperation must be implemented by subclasses.  ${this.toString()}`);
        }
        validate(parent = null) {
            throw new Error(`Validate must be implemented by subclasses.  ${this.toString()}`);
        }
        precedence() {
            throw new Error(`Precedence must be implemented by subclasses.  ${this.toString()}`);
        }
        isConstant() {
            return false;
        }
        collectAndReplaceConstants(thisNode) {
            throw new Error(`collectAndReplaceConstants must be implemented by subclasses.  ${this.toString()}`);
        }
        clone() {
            throw new Error(`Clone must be implemented by subclasses.  ${this.toString()}`);
        }
        writeToString(stringArr) {
            throw new Error(`writeToString must be implemented by subclasses.  ${this.toString()}`);
        }
        toString() {
            throw new Error(`toString must be implemented by subclasses.  ${this.constructor.name}`);
        }
        *traverse() {
            throw new Error(`Traverse must be implemented by subclasses.  ${this.toString()}`);
        }
    }
    class VariableGetter extends TreeNode {
        constructor(parent = null) {
            super(parent);
        }
        readyForOperation() {
            return true;
        }
        toString() {
            return `${this.value}`;
        }
        precedence() {
            return 0;
        }
        simplify() {
            return this.clone();
        }
        populateFunctionReferences(variables, nconstants, cconstants, args) {
            throw new Error(`populateFunctionReferences must be implemented by subclasses.  ${this.toString()}`);
        }
        populateFunctionReferencesCounts(varsCounts, argCounts) {
            throw new Error(`populateFunctionReferencesCounts must be implemented by subclasses.  ${this.toString()}`);
        }
        *traverse() {
            yield this;
        }
    }
    class ParentNode extends TreeNode {
        constructor(parent = null) {
            super(parent);
        }
        swap(existing, newOp) {
            throw new Error(`Swap must be implemented by subclasses.  ${this.toString()}`);
        }
        *traverse() {
            throw new Error(`Traverse must be implemented by subclasses.  ${this.toString()}`);
        }
    }
    class Constant extends VariableGetter {
        constructor(value, parent = null, replacedNode = null) {
            super(parent);
            this._value = value;
            this.replacedNode = replacedNode;
        }
        clone() {
            this.validate(this.parent);
            return new Constant(this._value, null, this.replacedNode);
        }
        get value() {
            return this._value;
        }
        validate(parent = null) {
            if (parent !== this.parent)
                return `Invalid parent for constant: ${this._value}`;

            if (this._value === undefined || this._value === null)
                return `Invalid constant value: ${this._value}`;

            return null;
        }
        writeToString(stringArr) {
            throw new Error(`writeToString should never be called on a constant.  It should be converted to a ConstantReference.  ${this.toString()}`);
        }
        isConstant() {
            return true;
        }
    }
    class NamedConstant extends VariableGetter {
        constructor(name, value, parent = null) {
            super(parent);
            this.name = name;
            this._value = value;
        }
        clone() {
            this.validate(this.parent);
            return new NamedConstant(this.name, this._value);
        }
        get value() {
            return this._value;
        }
        toString() {
            return this.name;
        }
        validate(parent = null) {
            if (parent !== this.parent)
                return `Invalid parent for constant: ${this.name}`;

            if (this._value === undefined || this._value === null)
                return `Invalid constant value: ${this._value}`;

            if (this.name === undefined || this.name === null)
                return `Invalid constant name: ${this.name}`;

            return null;
        }
        writeToString(stringArr) {
            throw new Error(`writeToString should never be called on a constant.  It should be converted to a ConstantReference.  ${this.toString()}`);
        }
        isConstant() {
            return true;
        }
    }
    class VariableReference extends VariableGetter {
        constructor(equation, name, index, parent = null) {
            super(parent);
            this.equation = equation;
            this.name = name;
            this.index = index;
        }
        clone() {
            this.validate(this.parent);
            return new VariableReference(this.equation, this.name, this.index);
        }
        get value() {
            const variable = this.equation.variablesArr[this.index];
            if (variable === undefined || variable === null)
                throw new Error(`Variable not found in equation: ${this.name} at index ${this.index}.`);

            return variable.value;
        }
        // setEquation(equation) {
        //     if (!(equation instanceof Zon.Equation))
        //         throw new Error(`Invalid equation type: ${equation.constructor.name}. Expected Zon.Equation.`);

        //     this.equation = equation;
        //     if (equation.ArgumentIndex.TryGetValue(referenceName, out int foundIndex))
	    //         index = foundIndex;
        // }
        toString() {
            return this.name;
        }
        validate(parent = null) {
            if (parent !== this.parent)
                return `Invalid parent for variable reference: ${this.name}`;

            if (this.equation === undefined || this.equation === null)
                return `Invalid variable reference equation.  Equation is undefined or null on variable reference: ${this.name}`;

            if (this.index < 0 || this.index >= this.equation.defaultVariablesArr.length)
                return `Invalid variable reference index.  Index is out of bounds on variable reference: ${this.name}.  Index: ${this.index}, Length: ${this.equation.defaultVariablesArr.length}`;

            if (this.name === undefined || this.name === null)
                return `Invalid variable reference name: ${this.name}`;

            return null;
        }
        writeToString(stringArr) {
            stringArr.push(`${this.name}`);
        }
        populateFunctionReferences(varsStrings, nconstsStrings, cconstsStrings, argStrings) {
            if (varsStrings[this.index])
                return;
            
            const variable = this.equation.variablesArr[this.index];
            const type = Zon.Util.getType(variable.value);
            const wrongType = type !== this.equation.operationsSet.typeString;
            varsStrings[this.index] = `\tconst ${this.name} = ${(wrongType ? `${this.equation.operationsSet.convertString}${vars}[${this.index}].value);//${type}\n` : `${vars}[${this.index}].value;\n`)}`;
        }
        populateFunctionReferencesCounts(varsCounts, argCounts) {
            varsCounts[this.index]++;
        }
    }
    class ArgReference extends VariableGetter {
        constructor(equation, name, index, parent = null) {
            if (index === undefined || index === null)
                throw new Error(`Invalid index for argument reference: ${name}. Index cannot be undefined or null.`);

            super(parent);
            this.equation = equation;
            this.name = name;
            this.index = index;
        }
        clone() {
            this.validate(this.parent);
            return new ArgReference(this.equation, this.name, this.index);
        }
        get value() {
            const arg = this.equation.argsArr[this.index];
            if (arg === undefined || arg === null)
                throw new Error(`Argument not found in equation: ${this.name} at index ${this.index}.`);

            return arg;
        }
        toString() {
            return this.name;
        }
        validate(parent = null) {
            if (parent !== this.parent)
                return `Invalid parent for argument reference: ${this.name}`;

            if (this.equation === undefined || this.equation === null)
                return `Invalid argument reference equation.  Equation is undefined or null on argument reference: ${this.name}`;

            if (this.index < 0 || this.index >= this.equation.argsArr.length)
                return `Invalid argument reference index.  Index is out of bounds on argument reference: ${this.name}.  Index: ${this.index}, Length: ${this.equation.argsArr.length}`;

            if (this.name === undefined || this.name === null)
                return `Invalid argument reference name: ${this.name}`;

            return null;
        }
        writeToString(stringArr) {
            stringArr.push(this.name);
        }
        populateFunctionReferences(varsStrings, nconstsStrings, cconstsStrings, argStrings) {
            if (argStrings[this.index])
                return;

            const arg = this.equation.argsArr[this.index];
            const wrongType = arg.typeID !== this.equation.operationsSet.type;
            argStrings[this.index] = `\tconst ${this.name} = ${(wrongType ? `${this.equation.operationsSet.convertString}${args}[${this.index}]);//${Zon.TypeNames[arg.typeID]}\n` : `${args}[${this.index}];\n`)}`;
        }
        populateFunctionReferencesCounts(varsCounts, argCounts) {
            argCounts[this.index]++;
        }
    }
    class ConstantReference extends VariableGetter {
        constructor(equation, name, index, parent = null) {
            super(parent);
            this.equation = equation;
            this.name = name;
            this.index = index;
        }
        clone() {
            this.validate(this.parent);
            return new ConstantReference(this.equation, this.name, this.index);
        }
        get value() {
            const constant = this.equation.constantsArr[this.index];
            if (constant === undefined || constant === null)
                throw new Error(`Constant not found in equation: ${this.name} at index ${this.index}.`);

            return constant;
        }
        toString() {
            return this.name;
        }
        validate(parent = null) {
            if (parent !== this.parent)
                return `Invalid parent for constant reference: ${this.name}`;

            if (this.equation === undefined || this.equation === null)
                return `Invalid constant reference equation.  Equation is undefined or null on constant reference: ${this.name}`;

            if (this.index < 0 || this.index >= this.equation.constantsArr.length)
                return `Invalid constant reference index.  Index is out of bounds on constant reference: ${this.name}.  Index: ${this.index}, Length: ${this.equation.constantsArr.length}`;

            if (this.name === undefined || this.name === null)
                return `Invalid constant reference name: ${this.name}`;

            return null;
        }
        isConstant() {
            return true;
        }
        writeToString(stringArr) {
            stringArr.push(this.name);
        }
        populateFunctionReferences(varsStrings, nconstsStrings, cconstsStrings, argStrings) {
            if (!nconstsStrings[this.index])
                nconstsStrings[this.index] = `\tconst ${this.name} = ${nconsts}[${this.index}];\n`;
        }
        populateFunctionReferencesCounts(varsCounts, argCounts) {
            throw new Error(`Not used on ConstantReference.`);
        }
    }
    class CachedConstantReference extends VariableGetter {
        constructor(replacedNode, currentCachedVariablesMapOrIndex, equation, name = null, fromClone = false) {
            super(!fromClone ? replacedNode.parent : null);
            if (fromClone && typeof currentCachedVariablesMapOrIndex === 'number') {
                this.index = currentCachedVariablesMapOrIndex;
            }
            else {
                if (!(replacedNode instanceof Constant) && !(replacedNode instanceof NamedConstant))
                    throw new Error(`Invalid constant type: ${replacedNode.constructor.name}. Expected Constant.`);

                const value = replacedNode.value;
                if (debugEquation) {
                    //console.log(`Creating CachedConstantReference for constant: ${constantOrNull.toString()} with value: ${value}`);
                }
                
                const index = currentCachedVariablesMapOrIndex.get(value);
                if (index !== undefined && index !== null) {
                    this.index = index;
                }
                else {
                    this.index = equation._cachedConstants.length;
                    equation._cachedConstants.push(value);
                    currentCachedVariablesMapOrIndex.set(value, this.index);
                }
            }

            this.equation = equation;
            this.name = name;
            this.replacedNode = replacedNode instanceof Constant ? replacedNode.replacedNode ?? replacedNode : replacedNode;
            if (this.replacedNode === undefined || this.replacedNode === null)
                throw new Error(`Invalid replaced node for constant reference: ${this.toString()}. Replaced node is undefined or null.`);

            if (this.parent)
                this.parent.swap(replacedNode, this);
        }
        clone() {
            this.validate(this.parent);
            return new ConstantReference(this.replacedNode, this.index, this.equation, this.name, true);
        }
        get value() {
            const constant = this.equation._cachedConstants[this.index];
            if (constant === undefined || constant === null)
                throw new Error(`Cached constant not found at index ${this.index}.`, this);

            return constant;
        }
        toString() {
            return this.name ?? `${this.value}`;
        }
        validate(parent = null) {
            if (parent !== this.parent)
                return `Invalid parent for constant reference: ${this.toString()}`;

            if (this.equation === undefined || this.equation === null)
                return `Invalid constant reference equation.  Equation is undefined or null on constant reference: ${this.toString()}`;

            if (this.index < 0 || this.index >= this.equation._cachedConstants.length)
                return `Invalid constant reference index.  Index is out of bounds on constant reference: ${this.toString()}.  Index: ${this.index}, Length: ${this.equation._cachedConstants.length}`;

            if (this.replacedNode === undefined || this.replacedNode === null)
                throw new Error(`Invalid replaced node for constant reference: ${this.toString()}. Replaced node is undefined or null.`);

            return null;
        }
        isConstant() {
            return true;
        }
        writeToString(stringArr) {
            stringArr.push(this.name ?? `${cc}${this.index}`);
        }
        populateFunctionReferences(varsStrings, nconstsStrings, cconstsStrings, argStrings) {
            if (!cconstsStrings[this.index])
                cconstsStrings[this.index] = `\tconst ${(this.name ?? `${cc}${this.index}`)} = ${cconsts}[${this.index}];${(this.name === null ? `//${this.replacedNode.toString()}` : '')}\n`;
        }
        populateFunctionReferencesCounts(varsCounts, argCounts) {
            throw new Error(`Not used on CachedConstants.`);
        }
    }
    class Operation extends ParentNode {
        constructor(equation, operationID, left = null, right = null, parent = null) {
            super(parent);
            this.left = left;
            this.right = right;
            this.operationID = operationID;
            this.equation = equation;
            this.func = equation.operationsSet.getOperation(operationID);
            if (this.left)
                this.left.parent = this;
                
            if (this.right)
                this.right.parent = this;
        }
        clone(left = null, right = null) {
            this.validate(this.parent);
            return new Operation(this.equation, this.operationID, left ?? this.left.clone(), right ?? this.right.clone());
        }
        get value() {
            if (this.left === null || this.right === null)
                throw new Error(`Operation value cannot be calculated because Left or Right is null.  ${this.toString()}`);

            return this.func(this.left.value, this.right.value);
        }
        toString() {
            return EquationTreeBuilder.operationString(this.operationID, this.left ? this.left.toString() : 'none', this.right ? this.right.toString() : 'none');
        }
        mergeOntoTree(currentNode) {
            let node = currentNode;
            while (node.parent && this.precedence() <= node.parent.precedence()) {
                node = node.parent;
            }

            this.parent = node.parent;
            this.left = node;
            node.parent = this;
            if (this.parent)
                this.parent.swap(node, this);
            
            return this;
        }
        joinNode(node) {
            if (!(node instanceof TreeNode))
                throw new Error(`Invalid variable type: ${node.constructor.name}. Expected TreeNode.`);

            if (this.right !== null)
                throw new Error(`Failed to join variable onto Operation because Operation.Right wasn't null`);

            this.right = node;
            node.parent = this;
            return node;
        }
        swap(existing, newOp) {
            if (this.right === existing) {
                this.right = newOp;
            }
            else if (this.left === existing) {
                this.left = newOp;
            }
            else {
                throw new Error(`Failed to swap operation.  Existing operation not found in this operation: ${this.toString()}`);
            }
        }
        readyForOperation() {
            return this.right !== null;
        }
        precedence() {
            return EquationTreeBuilder.oppPrecedence[this.operationID];
        }
        validate(parent = null) {
            if (parent !== this.parent)
                return `Invalid parent for operation: ${this.operationID} in operation: ${this.toString()}`;

            if (this.operationID === OperationID.NONE)
                return `Invalid operation ID: ${this.operationID} in operation: ${this.toString()}`;

            if (this.left === null || this.left === undefined)
                return `Invalid left operand in operation: ${this.toString()}`;
            
            if (this.right === null || this.right === undefined)
                return `Invalid right operand in operation: ${this.toString()}`;

            if (this === this.left)
                return `Invalid operation: ${this.toString()}.  Left operand cannot be the same as the operation itself.`;

            if (this === this.right)
                return `Invalid operation: ${this.toString()}.  Right operand cannot be the same as the operation itself.`;

            const leftValidation = this.left.validate(this);
            if (leftValidation !== null) {
                if (zonDebug) console.error(`Left validation failed.  left:`, this.left, `, this:`, this, `, error: ${leftValidation}`);
                return leftValidation;
            }

            const rightValidation = this.right.validate(this);
            if (rightValidation !== null) {
                if (zonDebug) console.error(`Right validation failed.  right:`, this.right, `, this:`, this, `, error: ${rightValidation}`);
                return rightValidation;
            }

            return null;
        }
        simplify() {
            if (debugEquation) {
                //console.log(`Simplifying operation: ${this.toString()}`);
            }

            const left = this.left.simplify();
            const right = this.right.simplify();

            if (debugEquation) {
                // if (this.left.isConstant() || this.right.isConstant()) {
                //     console.log(`Found constant in operation: ${this.toString()}`);
                // }
                // else {
                //     console.log(`No constants found in operation: ${this.toString()}`);
                // }
            }

            if (left.isConstant() && right.isConstant()) {
                const newValue = this.value;
                const newConstant = new Constant(newValue, null, this);
                return newConstant;
            }

            return this.clone(left, right);
        }
        writeToString(stringArr) {
            this.equation.operationsSet.writeOperationToString(stringArr, this.operationID, this.left, this.right);
        }
        *traverse() {
            if (this.left) {
                for (const item of this.left.traverse()) {
                    if (item === null)
                        continue;

                    yield item;
                }
            }

            if (this.right) {
                for (const item of this.right.traverse()) {
                    if (item === null)
                        continue;

                    yield item;
                }
            }
        }
    }
    //class OperationT2 extends ParentNode {}//Used for type operations that work with different input types.
    class SingleVariableOperation extends ParentNode {
        constructor(equation, singleOperationID, variable = null, parent = null) {
            super(parent);
            this.singleOperationID = singleOperationID;
            this.variable = variable;
            this.equation = equation;
            if (this.variable)
                this.variable.parent = this;

            this.func = equation.operationsSet.getSingleVariableOperation(singleOperationID);
        }
        clone(variable = null) {
            this.validate(this.parent);
            return new SingleVariableOperation(this.equation, this.singleOperationID, variable ?? this.variable.clone());
        }
        get value() {
            if (this.variable === null)
                throw new Error(`SingleVariableOperation value cannot be calculated because variable is null.  ${this.toString()}`);

            return this.func(this.variable.value);
        }
        toString() {
            return EquationTreeBuilder.singleVariableOperationstring(this.singleOperationID, this.variable ? this.variable.toString() : 'none');
        }
        joinNode(node) {
            if (EquationTreeBuilder.singleVariableOperationUsesParentheses[this.singleOperationID])
                throw new Error(`This operation uses fake parentheses.  It should never be joined on directly.  ${this.toString()}`);

            if (!(node instanceof TreeNode))
                throw new Error(`Invalid variable type: ${node.constructor.name}. Expected TreeNode.`);

            if (this.variable !== null)
                throw new Error(`Failed to join variable onto SingleVariableOperation because variable wasn't null.  ${this.toString()}`);

            this.variable = node;
            node.parent = this;
            return node;
        }
        setup() {
            if (EquationTreeBuilder.singleVariableOperationUsesParentheses[this.singleOperationID]) {
                this.variable = new FakeParenthesis();
                this.variable.parent = this;
                return this.variable;
            }
            
            return this;
        }
        swap(existing, newOp) {
            if (this.variable === existing) {
                this.variable = newOp;
            }
            else {
                throw new Error(`Failed to swap operation.  Existing operation not found in this operation: ${this.toString()}`);
            }
        }
        readyForOperation() {
            return this.variable !== null;
        }
        validate(parent = null) {
            if (parent !== this.parent)
                return `Invalid parent for single variable operation: ${this.singleOperationID} in operation: ${this.toString()}`;

            if (this.singleOperationID === SingleVariableOperationID.NONE)
                return `Invalid single variable operation ID: ${this.singleOperationID} in operation: ${this.toString()}`;

            if (this.variable === null || this.variable === undefined)
                return `Invalid variable in single variable operation: ${this.toString()}`;

            if (this === this.variable)
                return `Invalid single variable operation: ${this.toString()}.  Variable cannot be the same as the operation itself.`;

            const variableValidation = this.variable.validate(this);
            if (variableValidation !== null) {
                if (zonDebug) console.error(`Variable validation failed.  variable:`, this.variable, `, this:`, this, `, error: ${variableValidation}`);
                return variableValidation;
            }

            return null;
        }
        precedence() {
            return EquationTreeBuilder.singleOperationPrecedence[this.singleOperationID];
        }
        simplify() {
            if (this.variable instanceof SingleVariableOperation) {
                switch (this.singleOperationID) {
                    case SingleVariableOperationID.NEGATE:
                        if (this.variable.singleOperationID === SingleVariableOperationID.NEGATE) {
                            const newVariable = this.variable.variable.simplify();
                            return newVariable;
                        }
                        break;
                }
            }

            const variable = this.variable.simplify();

            if (variable.isConstant()) {
                const newValue = this.value;
                const newConstant = new Constant(newValue, null, this);
                return newConstant;
            }

            return this.clone(variable);
        }
        writeToString(stringArr) {
            this.equation.operationsSet.writeSingleOperationToString(stringArr, this.singleOperationID, this.variable);
        }
        *traverse() {
            if (this.variable) {
                for (const item of this.variable.traverse()) {
                    if (item === null)
                        continue;

                    yield item;
                }
            }
        }
    }
    //class ConvertOperation extends ParentNode {}//Used for converting between different types.
    class PrecursorOperation extends ParentNode {
        constructor(equation, precursorOperationID, left = null, right = null, parent = null, hasPrecursorConstant = false) {
            super(parent);
            this.left = left;
            this.right = right;
            this.precursorOperationID = precursorOperationID;
            this.equation = equation;
            this.func = equation.operationsSet.getPrecursorOperation(precursorOperationID);
            this.hasPrecursorConstant = hasPrecursorConstant;
            if (this.left)
                this.left.parent = this;
                
            if (this.right)
                this.right.parent = this;
        }
        clone(left = null, right = null) {
            this.validate(this.parent);
            return new PrecursorOperation(this.equation, this.precursorOperationID, left ?? this.left.clone(), right ?? this.right.clone(), null, this.hasPrecursorConstant);
        }
        get value() {
            if (this.left === null || this.right === null)
                throw new Error(`PrecursorOperation value cannot be calculated because Left or Right is null.  ${this.toString()}`);

            return this.func(this.left.value, this.right.value);
        }
        toString() {
            return EquationTreeBuilder.precursorOperationString(this.precursorOperationID, this.left ? this.left.toString() : 'none', this.right ? this.right.toString() : 'none', this.hasPrecursorConstant);
        }
        setup(precursorConstant) {
            if (precursorConstant === undefined)
                throw new Error(`Failed to setup PrecursorOperation because precursorConstant is undefined.  It should be null or a constant. ${this.toString()}`);

            if (this.left !== null || this.right !== null)
                throw new Error(`Failed to setup PrecursorOperation because Left or Right wasnt null.  ${this.toString()}`);

            this.right = precursorConstant;
            if (this.right)
                this.right.parent = this;

            this.hasPrecursorConstant = this.right !== null;
            this.left = new FakeParenthesis();
            this.left.parent = this;
            return this.left;
        }
        transferToRight() {
            if (this.left === null)
                throw new Error(`Failed to transfer to right side of PrecursorOperation because Left was null.  ${this.toString()}`);

            let right = null;
            if (this.hasPrecursorConstant) {
                if (this.right === null)
                    throw new Error(`Failed to transfer to right side of PrecursorOperation because Right was null, but hasPrecursorConstant is true.  ${this.toString()}`);

                right = this.right;
            }
            else {
                if (this.right !== null)
                    throw new Error(`Failed to transfer to right side of PrecursorOperation because Right wasn't null.  ${this.toString()}`);
            }
            

            this.right = new FakeParenthesis();
            this.right.parent = this;
            if (right !== null)
                this.right.joinNode(right);

            return this.right;
        }
        swap(existing, newOp) {
            if (this.right === existing) {
                this.right = newOp;
            }
            else if (this.left === existing) {
                this.left = newOp;
            }
            else {
                throw new Error(`Failed to swap operation.  Existing operation not found in this operation: ${this.toString()}`);
            }
        }
        readyForOperation() {
            return this.left !== null && this.right !== null;
        }
        validate(parent = null) {
            if (parent !== this.parent)
                return `Invalid parent for precursor operation: ${this.precursorOperationID} in operation: ${this.toString()}`;

            if (this.precursorOperationID === PrecursorOperationID.NONE)
                return `Invalid precursor operation ID: ${this.precursorOperationID} in operation: ${this.toString()}`;

            if (this.left === null || this.left === undefined)
                return `Invalid left operand in precursor operation: ${this.toString()}`;

            if (this.right === null || this.right === undefined)
                return `Invalid right operand in precursor operation: ${this.toString()}`;

            if (this === this.left)
                return `Invalid precursor operation: ${this.toString()}.  Left operand cannot be the same as the operation itself.`;

            if (this === this.right)
                return `Invalid precursor operation: ${this.toString()}.  Right operand cannot be the same as the operation itself.`;

            const leftValidation = this.left.validate(this);
            if (leftValidation !== null) {
                if (zonDebug) console.error(`Left validation failed.  left:`, this.left, `, this:`, this, `, error: ${leftValidation}`);
                return leftValidation;
            }

            const rightValidation = this.right.validate(this);
            if (rightValidation !== null) {
                if (zonDebug) console.error(`Right validation failed.  right:`, this.right, `, this:`, this, `, error: ${rightValidation}`);
                return rightValidation;
            }

            return null;
        }
        precedence() {
            return 0;
        }
        simplify() {
            const left = this.left.simplify();
            const right = this.right.simplify();

            if (left.isConstant() && right.isConstant()) {
                const newValue = this.value;
                const newConstant = new Constant(newValue, null, this);
                return newConstant;
            }

            return this.clone(left, right);
        }
        writeToString(stringArr) {
            this.equation.operationsSet.writePrecursorOperationToString(stringArr, this.precursorOperationID, this.left, this.right);
        }
        *traverse() {
            if (this.left) {
                for (const item of this.left.traverse()) {
                    if (item === null)
                        continue;

                    yield item;
                }
            }

            if (this.right) {
                for (const item of this.right.traverse()) {
                    if (item === null)
                        continue;

                    yield item;
                }
            }
        }
    }
    class Parenthesis extends ParentNode {
        constructor(equation, innerValue = null, parent = null) {
            super(parent);
            this.equation = equation;
            this.innerValue = innerValue;
            if (this.innerValue)
                this.innerValue.parent = this;
        }
        clone(innerValue = null) {
            this.validate(this.parent);
            return new Parenthesis(this.equation, innerValue ?? this.innerValue.clone());
        }
        get value() {
            if (this.innerValue === null)
                throw new Error(`Parenthesis value cannot be calculated because InnerValue is null.  ${this.toString()}`);

            return this.innerValue.value;
        }
        toString() {
            return `(${this.innerValue ? this.innerValue.toString() : 'none'})`;
        }
        joinNode(node) {
            if (!(node instanceof TreeNode))
                throw new Error(`Invalid variable type: ${node.constructor.name}. Expected TreeNode.`);

            node.parent = this;
            return node;
        }
        close() {
            if (this.innerValue === null)//Not in original code.
                throw new Error(`Failed to close Parenthesis because innerValue is null.  ${this.toString()}`);

            return this;
        }
        swap(existing, newOp) {
            if (this.innerValue === existing) {
                this.innerValue = newOp;
            }
            else {
                //innerValue is usually not set until parenthesis is closed, so this is not an error.
                //throw new Error(`Parenthesis.Swap; existing value not found in this operation.`);
            }
        }
        readyForOperation() {
            return this.innerValue !== null;
        }
        validate(parent = null) {
            if (parent !== this.parent)
                return `Invalid parent for parenthesis: ${this.toString()}`;

            if (this.innerValue === null)
                return `Invalid inner value in parenthesis: ${this.toString()}`;

            if (this.innerValue === this)
                return `Invalid parenthesis: ${this.toString()}.  Inner value cannot be the same as the parenthesis itself.`;

            const innerValidation = this.innerValue.validate(this);
            if (innerValidation !== null) {
                if (zonDebug) console.error(`Inner value validation failed.  innerValue:`, this.innerValue, `, this:`, this, `, error: ${innerValidation}`);
                return innerValidation;
            }

            return null;
        }
        precedence() {
            return 0;
        }
        simplify() {
            const innerValue = this.innerValue.simplify();

            if (innerValue instanceof VariableGetter || innerValue instanceof Parenthesis || innerValue instanceof SingleVariableOperation && EquationTreeBuilder.singleVariableOperationUsesParentheses[innerValue.singleOperationID]) {
                return innerValue;
            }

            return this.clone(innerValue);
        }
        writeToString(stringArr) {
            this.equation.operationsSet.writeParenthesisToString(stringArr, this.innerValue);
        }
        *traverse() {
            if (this.innerValue) {
                for (const item of this.innerValue.traverse()) {
                    if (item === null)
                        continue;

                    yield item;
                }
            }
        }
    }
    class FakeParenthesis extends Parenthesis {
        constructor() {
            super();
        }
        toString() {
            return `{${this.innerValue ? this.innerValue.toString() : 'none'}}`;
        }
        close() {
            if (this.innerValue === null)
                throw new Error(`Can't close FakeParenthesis because InnerValue is null.`);

            if (this.parent instanceof PrecursorOperation) {
                if (this.parent.left === this) {
                    this.parent.left = this.innerValue;
                }
                else if (this.parent.right === this) {
                    this.parent.right = this.innerValue;
                }
                else {
                    throw new Error(`Can't close FakeParenthesis because Parent doesn't have this as a child.`);
                }
            }
            else if (this.parent instanceof SingleVariableOperation) {
                if (EquationTreeBuilder.singleVariableOperationUsesParentheses[this.parent.singleOperationID]) {
                    if (this.parent.variable === this) {
                        this.parent.variable = this.innerValue;
                    }
                    else {
                        throw new Error(`Can't close FakeParenthesis because Parent doesn't have this as a child.`);
                    }
                }
                else {
                    throw new Error(`Can't close FakeParenthesis because Parent is a SingleVariableOperation that doesn't use parentheses.`);
                }
            }
            else {
                throw new Error(`Can't close FakeParenthesis because Parent is not a PrecursorOperation or SingleVariableOperation.`);
            }

            this.innerValue.parent = this.parent;

            return this.parent;
        }
        validate(parent = null) {
            throw new Error(`FakeParenthesis should never exist at the time of validation.  It is a placeholder for operations that use parentheses.  ${this.toString()}`);
        }
    }

    //#endregion Equation Nodes





    //#region OperationSets

    Zon.TypeID = {
        NONE: 0,
        NUMBER: 1,
        BIG_NUMBER: 2,
        BOOL: 3,
    }
    Enum.freezeObj(Zon.TypeID);
    Zon.TypeNames = {
        0: `None`,
        1: `number`,
        2: `BigNumber`,
        3: `bool`,
    }
    Enum.freezeObj(Zon.TypeNames);

    Zon.Type = class Type {
        constructor(typeID, name) {
            this.typeID = typeID;
            this.name = name;
        }
    }

    Zon.Type_N = class Type_N extends Zon.Type {
        constructor(name) {
            super(Zon.TypeID.NUMBER, name);
        }
    }

    Zon.Type_BN = class Type_BN extends Zon.Type {
        constructor(name) {
            super(Zon.TypeID.BIG_NUMBER, name);
        }
    }

    Zon.Type_B = class Type_B extends Zon.Type {
        constructor(name) {
            super(Zon.TypeID.BOOL, name);
        }
    }

    class OperationsSet {
        constructor() {
            if (new.target === OperationsSet)
                throw new TypeError("Cannot construct OperationsSet instances directly.");
        }

        get type() {
            throw new Error("Type must be implemented by subclasses.");
        }
        get typeString() {
            throw new Error("TypeString must be implemented by subclasses.");
        }

        add(a, b) {
            throw new Error("Add operation must be implemented by subclasses.");
        }
        subtract(a, b) {
            throw new Error("Subtract operation must be implemented by subclasses.");
        }
        multiply(a, b) {
            throw new Error("Multiply operation must be implemented by subclasses.");
        }
        divide(a, b) {
            throw new Error("Divide operation must be implemented by subclasses.");
        }
        pow(a, b) {
            throw new Error("Power operation must be implemented by subclasses.");
        }
        log(a, b) {
            throw new Error("Log operation must be implemented by subclasses.");
        }
        lessThanBool(a, b) {
            throw new Error("LessThanBool operation must be implemented by subclasses.");
        }
        equalToBool(a, b) {
            throw new Error("EqualToBool operation must be implemented by subclasses.");
        }
        toBool(t) {
            throw new Error("ToBool operation must be implemented by subclasses.");
        }
        abs(t) {
            throw new Error("Abs operation must be implemented by subclasses.");
        }
        negate(t) {
            throw new Error("Negate operation must be implemented by subclasses.");
        }
        round(t) {
            throw new Error("Round operation must be implemented by subclasses.");
        }
        trunc(t) {
            throw new Error("Truncate operation must be implemented by subclasses.");
        }
        floor(t) {
            throw new Error("Floor operation must be implemented by subclasses.");
        }
        isFinite(t) {
            throw new Error("IsFinite operation must be implemented by subclasses.");
        }
        valueAsBool(t) {
            return this.toBool(t) ? this.one : this.zero;
        }
        boolToValue(b) {
            return b ? this.one : this.zero;
        }
        get zero() {
            throw new Error("Zero value must be implemented by subclasses.");
        }
        get one() {
            throw new Error("One value must be implemented by subclasses.");
        }
        or(a, b) {
            return this.toBool(a) || this.toBool(b) ? this.one : this.zero;
        }
        and(a, b) {
            return this.toBool(a) && this.toBool(b) ? this.one : this.zero;
        }
        not(a) {
            return this.toBool(a) ? this.zero : this.one;
        }
        greaterThan(a, b) {
            return !this.lessThanBool(a, b) && !this.equalToBool(a, b) ? this.one : this.zero;
        }
        lessThan(a, b) {
            return this.lessThanBool(a, b) ? this.one : this.zero;
        }
        greaterThanOrEqual(a, b) {
            return !this.lessThanBool(a, b) ? this.one : this.zero;
        }
        equalTo(a, b) {
            return this.equalToBool(a, b) ? this.one : this.zero;
        }
        notEqualTo(a, b) {
            return !this.equalToBool(a, b) ? this.one : this.zero;
        }
        convert(t) {
            throw new Error("Convert operation must be implemented by subclasses.");
        }
        tryGetCommonOperation(operationID) {
            switch (operationID) {
                case OperationID.ADD:
                    return this.add;
                case OperationID.SUBTRACT:
                    return this.subtract;
                case OperationID.MULTIPLY:
                    return this.multiply;
                case OperationID.DIVIDE:
                    return this.divide;
                case OperationID.POWER:
                    return this.pow;
                case OperationID.OR:
                    return this.or;
                case OperationID.AND:
                    return this.and;
                case OperationID.LESS_THAN:
                    return this.lessThan;
                case OperationID.GREATER_THAN:
                    return this.greaterThan;
                case OperationID.LESS_THAN_OR_EQUAL_TO:
                    return this.lessThanOrEqual;
                case OperationID.GREATER_THAN_OR_EQUAL_TO:
                    return this.greaterThanOrEqual;
                case OperationID.EQUAL_TO:
                    return this.equalTo;
                case OperationID.NOT_EQUAL_TO:
                    return this.notEqualTo;
            }

            return null;
        }
        getOperation(operationID) {
            const commonOperation = this.tryGetCommonOperation(operationID);
            if (commonOperation)
                return commonOperation;

            return this.getUniqueOperation(operationID);
        }
        getUniqueOperation(operationID) {
            throw new Error(`GetUniqueOperation must be implemented by subclasses.  OperationID: ${operationID}`);
        }
        getPrecursorOperation(precursorOperationID) {
            const commonOperation = this.tryGetCommonPrecursorOperation(precursorOperationID);
            if (commonOperation)
                return commonOperation;

            return this.getUniquePrecursorOperation(precursorOperationID);
        }
        getUniquePrecursorOperation(precursorOperationID) {
            throw new Error(`GetUniquePrecursorOperation must be implemented by subclasses.  PrecursorOperationID: ${precursorOperationID}`);
        }
        tryGetCommonPrecursorOperation(precursorOperationID) {
            switch (precursorOperationID) {
                case PrecursorOperationID.LOG:
                    return this.log;
            }

            return null;
        }
        tryGetCommonSingleVariableOperation(operationID) {
            switch (operationID) {
                case SingleVariableOperationID.ABS:
                    return this.abs;
                case SingleVariableOperationID.NEGATE:
                    return this.negate;
                case SingleVariableOperationID.ROUND:
                    return this.round;
                case SingleVariableOperationID.TRUNC:
                    return this.trunc;
                case SingleVariableOperationID.FLOOR:
                    return this.floor;
                case SingleVariableOperationID.NOT:
                    return this.not;
                case SingleVariableOperationID.CONVERT:
                    return this.convert;
            }

            return null;
        }
        getSingleVariableOperation(operationID) {
            const commonOperation = this.tryGetCommonSingleVariableOperation(operationID);
            if (commonOperation)
                return commonOperation;

            return this.getUniqueSingleVariableOperation(operationID);
        }
        getUniqueSingleVariableOperation(operationID) {
            throw new Error(`GetUniqueSingleVariableOperation must be implemented by subclasses.  SingleVariableOperationID: ${operationID}`);
        }
        parse(valueString) {
            throw new Error(`Parse must be implemented by subclasses.  ValueString: ${valueString}`);
        }
        get constants() {
            throw new Error("Constants must be implemented by subclasses.");
        }
        get symbolConstants() {
            throw new Error("SymbolConstants must be implemented by subclasses.");
        }
        createFunction(equation) {
            throw new Error("CreateFunction must be implemented by subclasses.");
        }
        writeOperationToString(stringArr, operationID, left, right) {
            throw new Error("WriteOperationToString must be implemented by subclasses.");
        }
    }

    class NumberOperationSet extends OperationsSet {
        constructor() {
            super();
        }

        static instance = null;
        
        get type() {
            return Zon.TypeID.NUMBER;
        }
        get typeString() {
            return "number";
        }

        getUniqueOperation(operationID) {
            switch (operationID) {
                default:
                    throw new Error(`No operation found for ${operationID}`);
            }
        }
        add = (a, b) => a + b;
        subtract = (a, b) => a - b;
        multiply = (a, b) => a * b;
        divide = (a, b) => a / b;
        pow = (a, b) => a ** b;
        log = (a, b) => Math.log(a) / Math.log(b);
        toBool = (t) => t === 0 ? false : true;
        get one() {
            return 1;
        }
        get zero() {
            return 0;
        }
        lessThanBool = (a, b) => a < b;
        equalToBool = (a, b) => a === b;
        abs = (t) => Math.abs(t);
        negate = (t) => -t;
        round = (t) => Math.round(t);
        trunc = (t) => Math.trunc(t);
        floor = (t) => Math.floor(t);
        isFinite = (t) => Number.isFinite(t);
        convert = (t) => Number(t);
        convertString = `Number(`;
        getUniquePrecursorOperation(precursorOperationID) {
            switch (precursorOperationID) {
                default:
                    throw new Error(`No precursor operation found for ${precursorOperationID}`);
            }
        }
        getUniqueSingleVariableOperation(operationID) {
            switch (operationID) {
                default:
                    throw new Error(`No single variable operation found for ${operationID}`);
            }
        }
        parse(valueString) {
            const parsedValue = parseFloat(valueString);
            if (isNaN(parsedValue))
                return null;

            if (!isFinite(parsedValue))
                throw new Error(`Failed to parse value: ${valueString}`);

            return parsedValue;
        }
        get constants() {
            return NumberOperationSet._constants;
        }
        static _constants = new Map([
            ['pi', Math.PI],
            ['e', Math.E],
        ]);
        get symbolConstants() {
            return NumberOperationSet._symbolConstants;
        }
        static _symbolConstants = new Map([
            ['π', Math.PI],
        ]);
        createFunction(equation) {
            const stringArr = [];
            
            const variablesArr = equation.variablesArr;
            const constantsArr = equation.constantsArr;
            const cachedConstants = equation._cachedConstants;
            const argsArr = equation.argsArr;

            const varsStrings = new Array(variablesArr.length);
            const nconstsStrings = new Array(constantsArr.length);
            const cconstsStrings = new Array(cachedConstants.length);
            const argStrings = new Array(argsArr.length);

            for (const node of equation.traverseNodes()) {
                if (node instanceof VariableGetter) {
                    node.populateFunctionReferences(varsStrings, nconstsStrings, cconstsStrings, argStrings);
                }
            }

            for (const varsString of varsStrings) {
                if (varsString)
                    stringArr.push(varsString);
            }

            for (const nconstsString of nconstsStrings) {
                if (nconstsString)
                    stringArr.push(nconstsString);
            }

            for (const cconstsString of cconstsStrings) {
                if (cconstsString)
                    stringArr.push(cconstsString);
            }

            for (const argString of argStrings) {
                if (argString)
                    stringArr.push(argString);
            }

            stringArr.push('\treturn ');
            equation._equationTreeHead.writeToString(stringArr);
            stringArr.push(';');
            const equationString = stringArr.join('');
            return new Function(vars, nconsts, cconsts, args, equationString);
        }
        writeOperationToString(stringArr, operationID, left, right) {
            left.writeToString(stringArr);
            let operator;
            switch (operationID) {
                case OperationID.ADD:
                    operator = '+';
                    break;
                case OperationID.SUBTRACT:
                    operator = '-';
                    break;
                case OperationID.MULTIPLY:
                    operator = '*';
                    break;
                case OperationID.DIVIDE:
                    operator = '/';
                    break;
                case OperationID.POWER:
                    operator = '**';
                    break;
                default:
                    throw new Error(`No operator found for ${operationID}`);
            }

            stringArr.push(` ${operator} `);
            right.writeToString(stringArr);
        }
        writeSingleOperationToString(stringArr, singleOperationID, variable) {
            let operator;
            switch (singleOperationID) {
                case SingleVariableOperationID.ABS:
                    operator = 'Math.abs';
                    break;
                case SingleVariableOperationID.NEGATE:
                    operator = '-';
                    break;
                case SingleVariableOperationID.ROUND:
                    operator = 'Math.round';
                    break;
                case SingleVariableOperationID.TRUNC:
                    operator = 'Math.trunc';
                    break;
                case SingleVariableOperationID.FLOOR:
                    operator = 'Math.floor';
                    break;
                case SingleVariableOperationID.CONVERT:
                    variable.writeToString(stringArr);
                    return;
                case SingleVariableOperationID.NOT:
                    operator = '!';
                    break;
                default:
                    throw new Error(`No single variable operation found for ${singleOperationID}`);
            }

            if (EquationTreeBuilder.singleVariableOperationUsesParentheses[singleOperationID]) {
                stringArr.push(operator);
                stringArr.push('(');
                variable.writeToString(stringArr);
                stringArr.push(')');
            }
            else {
                stringArr.push(operator);
                variable.writeToString(stringArr);
            }
        }
        writePrecursorOperationToString(stringArr, precursorOperationID, left, right) {
            let operator;
            switch (precursorOperationID) {
                case PrecursorOperationID.LOG:
                    stringArr.push('(Math.log(');
                    left.writeToString(stringArr);
                    stringArr.push(') / Math.log(');
                    right.writeToString(stringArr);
                    stringArr.push('))');
                    return;
                default:
                    throw new Error(`No precursor operation found for ${precursorOperationID}`);
            }

            stringArr.push(operator);
            stringArr.push('(');
            left.writeToString(stringArr);
            stringArr.push(', ');
            right.writeToString(stringArr);
            stringArr.push(')');
        }
        writeParenthesisToString(stringArr, innerValue) {
            stringArr.push('(');
            innerValue.writeToString(stringArr);
            stringArr.push(')');
        }
    }
    NumberOperationSet.instance = new NumberOperationSet();
    Zon.Equation.NumberOperationSet = NumberOperationSet;
    
    class BigNumberOperationSet extends OperationsSet {
        constructor() {
            super();
        }

        static instance = null;
        
        get type() {
            return Zon.TypeID.BIG_NUMBER;
        }
        get typeString() {
            return "BigNumber";
        }

        getUniqueOperation(operationID) {
            switch (operationID) {
                default:
                    throw new Error(`No operation found for ${operationID}`);
            }
        }
        add = (a, b) => a.add(b);
        subtract = (a, b) => a.subtract(b);
        multiply = (a, b) => a.multiply(b);
        divide = (a, b) => a.divide(b);
        pow = (a, b) => a.pow(b);
        log = (a, b) => a.log(b);
        toBool = (t) => t.isZero ? false : true;
        get one() {
            return Struct.BigNumber.ONE;
        }
        get zero() {
            return Struct.BigNumber.ZERO;
        }
        lessThanBool = (a, b) => a.lessThan(b);
        equalToBool = (a, b) => a.equals(b);
        abs = (t) => t.abs();
        negate = (t) => t.negative();
        round = (t) => t.round();
        trunc = (t) => t.trunc();
        floor = (t) => t.floor();
        isFinite = (t) => t instanceof Struct.BigNumber && t.isFinite();
        convert = (t) => t.toBigNumber();
        convertString = `Struct.BigNumber.create(`;
        getUniquePrecursorOperation(precursorOperationID) {
            switch (precursorOperationID) {
                default:
                    throw new Error(`No precursor operation found for ${precursorOperationID}`);
            }
        }
        getUniqueSingleVariableOperation(operationID) {
            switch (operationID) {
                default:
                    throw new Error(`No single variable operation found for ${operationID}`);
            }
        }
        parse(valueString) {
            return Struct.BigNumber.parse(valueString);
        }
        get constants() {
            return BigNumberOperationSet._constants;
        }
        static _constants = new Map([...NumberOperationSet._constants].map(([key, value]) => [key, Struct.BigNumber.create(value)]));
        get symbolConstants() {
            return BigNumberOperationSet._symbolConstants;
        }
        static _symbolConstants = new Map([...NumberOperationSet._symbolConstants].map(([key, value]) => [key, Struct.BigNumber.create(value)]));
        createFunction(equation) {
            const stringArr = [];
            
            const variablesArr = equation.variablesArr;
            const constantsArr = equation.constantsArr;
            const constantsArrNames = equation.constantsArrNames;
            const cachedConstants = equation._cachedConstants;
            const argsArr = equation.argsArr;

            const varsStrings = new Array(variablesArr.length);
            const nconstsStrings = new Array(constantsArr.length);
            const cconstsStrings = new Array(cachedConstants.length);
            const argStrings = new Array(argsArr.length);

            this.varsCounts = new Array(variablesArr.length).fill(0);
            this.argsCounts = new Array(argsArr.length).fill(0);

            for (const node of equation.traverseNodes()) {
                if (node instanceof VariableGetter) {
                    node.populateFunctionReferences(varsStrings, nconstsStrings, cconstsStrings, argStrings);
                    if (node instanceof VariableReference || node instanceof ArgReference) {
                        node.populateFunctionReferencesCounts(this.varsCounts, this.argsCounts);
                    }
                }
            }

            for (let i = 0; i < varsStrings.length; i++) {
                const varsString = varsStrings[i];
                if (varsString) {
                    stringArr.push(varsString);
                }
                else {
                    const variable = variablesArr[i];
                    stringArr.push(`\t//${variable.name}: ${variable.value} (not used)\n`);
                }
            }

            for (let i = 0; i < nconstsStrings.length; i++) {
                const nconstsString = nconstsStrings[i];
                if (nconstsString) {
                    stringArr.push(nconstsString);
                }
                else {
                    const constant = constantsArr[i];
                    stringArr.push(`\t//${constantsArrNames[i]}: ${constant} (not used directly)\n`);
                }
            }

            for (let i = 0; i < cconstsStrings.length; i++) {
                const cconstsString = cconstsStrings[i];
                if (cconstsString) {
                    stringArr.push(cconstsString);
                }
                else {
                    throw new Error(`A cached constant was not found in the equation.  This should never happen.`);
                }
            }

            for (let i = 0; i < argStrings.length; i++) {
                const argString = argStrings[i];
                if (argString) {
                    stringArr.push(argString);
                }
                else {
                    const arg = argsArr[i];
                    stringArr.push(`\t//${arg.name}: ${arg.value} (not used)\n`);
                }
            }

            stringArr.push('\treturn ');
            equation._equationTreeHead.writeToString(stringArr);
            if (equation._equationTreeHead instanceof VariableGetter)
                stringArr.push('.clone');

            stringArr.push(';');
            const equationString = stringArr.join('');

            this.varsCounts = undefined;
            this.argsCounts = undefined;

            return new Function(vars, nconsts, cconsts, args, equationString);
        }
        writeOperationToString(stringArr, operationID, left, right) {
            left.writeToString(stringArr);
            if (left instanceof VariableGetter)
                stringArr.push('.clone');
                
            let operator;
            switch (operationID) {
                case OperationID.ADD:
                    operator = '.addI(';
                    break;
                case OperationID.SUBTRACT:
                    operator = '.subtractI(';
                    break;
                case OperationID.MULTIPLY:
                    operator = '.multiplyI(';
                    break;
                case OperationID.DIVIDE:
                    operator = '.divideI(';
                    break;
                case OperationID.POWER:
                    operator = '.powI(';
                    break;
                default:
                    throw new Error(`No operator found for ${operationID}`);
            }
            
            stringArr.push(operator);
            right.writeToString(stringArr);
            stringArr.push(')');
        }
        writeSingleOperationToString(stringArr, singleOperationID, variable) {
            let operator;
            switch (singleOperationID) {
                case SingleVariableOperationID.ABS:
                    operator = '.absI()';
                    break;
                case SingleVariableOperationID.NEGATE:
                    operator = '.negativeI()';
                    break;
                case SingleVariableOperationID.ROUND:
                    operator = '.roundI()';
                    break;
                case SingleVariableOperationID.TRUNC:
                    operator = '.truncI()';
                    break;
                case SingleVariableOperationID.FLOOR:
                    operator = '.floorI()';
                    break;
                case SingleVariableOperationID.CONVERT:
                    variable.writeToString(stringArr);
                    if (variable instanceof VariableReference) {
                        if (this.varsCounts[variable.index] !== 1)//Skip clone if only used once.
                            stringArr.push('.clone');
                    }
                    else if (variable instanceof ArgReference) {
                        if (this.argsCounts[variable.index] !== 1)//Skip clone if only used once.
                            stringArr.push('.clone');
                    }
                    else {
                        throw new Error(`Variable type not supported for conversion: ${variable.constructor.name}`);
                    }
                    return;
                default:
                    throw new Error(`No single variable operation found for ${singleOperationID}`);
            }

            variable.writeToString(stringArr);
            if (variable instanceof VariableGetter)
                stringArr.push('.clone');

            stringArr.push(operator);
        }
        writePrecursorOperationToString(stringArr, precursorOperationID, left, right) {
            left.writeToString(stringArr);
            if (left instanceof VariableGetter)
                stringArr.push('.clone');

            let operator;
            switch (precursorOperationID) {
                case PrecursorOperationID.LOG:
                    operator = `.log`;
                    break;
                default:
                    throw new Error(`No precursor operation found for ${precursorOperationID}`);
            }

            stringArr.push(operator);
            stringArr.push('(');
            right.writeToString(stringArr);
            stringArr.push(')');
        }
        writeParenthesisToString(stringArr, innerValue) {
            innerValue.writeToString(stringArr);
            if (innerValue instanceof VariableGetter)
                stringArr.push('.clone');
        }
    }
    BigNumberOperationSet.instance = new BigNumberOperationSet();
    Zon.Equation.BigNumberOperationSet = BigNumberOperationSet;

    class BoolOperationSet extends OperationsSet {
        constructor() {
            super();
        }

        static instance = null;
        
        get type() {
            return Zon.TypeID.BOOL;
        }
        get typeString() {
            return "bool";
        }

        getUniqueOperation(operationID) {
            switch (operationID) {
                default:
                    throw new Error(`No operation found for ${operationID}`);
            }
        }
        xor = (a, b) => a ^ b;
        xnor = (a, b) => !(a ^ b);
        add = (a, b) => a || b;
        subtract = (a, b) => a && !b;
        multiply = (a, b) => a && b;
        divide = (a, b) => a || !b;
        pow = (a, b) => a || !b;
        log = (a, b) => { throw new Error(`BoolOperationSet.Log(${a}, ${b}) is undefined.`); };
        toBool = (t) => t;
        get one() {
            return true;
        }
        get zero() {
            return false;
        }
        lessThanBool = (a, b) => !a && b;
        equalToBool = (a, b) => a === b;
        abs = (t) => t;
        negate = (t) => !t;
        round = (t) => t;
        trunc = (t) => t;
        floor = (t) => t;
        isFinite = (t) => typeof t === 'boolean';
        convert = (t) => !!t;
        convertString = `(!!`;
        getUniquePrecursorOperation(precursorOperationID) {
            switch (precursorOperationID) {
                default:
                    throw new Error(`No precursor operation found for ${precursorOperationID}`);
            }
        }
        getUniqueSingleVariableOperation(operationID) {
            switch (operationID) {
                default:
                    throw new Error(`No single variable operation found for ${operationID}`);
            }
        }
        parse(valueString) {
            throw new Error(`BoolOperationsSet should never be used for parsing.`);
        }
        get constants() {
            return BoolOperationSet._constants;
        }
        static _constants = new Map([
            ['true', true],
            ['false', false],
            ['t', true],
            ['f', false],
        ]);
        get symbolConstants() {
            return BoolOperationSet._symbolConstants;
        }
        static _symbolConstants = new Map([
            
        ]);
        createFunction(equation) {
            throw new Error("Not implemented.");
        }
        writeOperationToString(stringArr, operationID, left, right) {
            throw new Error("Not implemented.");
        }
    }
    BoolOperationSet.instance = new BoolOperationSet();
    Zon.Equation.BoolOperationSet = BoolOperationSet;

    //#endregion OperationSets
}