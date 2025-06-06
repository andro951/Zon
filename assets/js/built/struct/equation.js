"use strict";

//TODO: arguments will be actual values provided to an equation function which aren't variables.  The old 'arguments' will be called variables.

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
        this.constantsMap = new Map();
        this.constantsArr = [];
        this.constantsArrLookupMap = new Map();
        this._equationTreeHead = null;
        this._equationFunction = null;
    }
    static create(equation, name, equationString, operationsSet, variablesArr = [], argsArr = [], constantsMap = new Map()) {
        equation.name = name;
        equation.equationString = equationString;
        equation.defaultVariablesArr = Array.from(variablesArr);
        equation.variablesArr = equation.defaultVariablesArr;
        equation.defaultArgsArr = Array.from(argsArr);
        equation.argsArr = equation.defaultArgsArr;
        equation.constantsMap = constantsMap;
        equation.constantsArr = Array.from(constantsMap.values());
        equation.constantsArrLookupMap = new Map(Array.from(constantsMap.keys()).map((key, index) => [key, index]));
        equation._equationTreeHead = Zon.Equation.createTree(equationString, equation, operationsSet, variablesArr, argsArr, equation.constantsArrLookupMap);
        equation._equationFunction = null;//TODO
        if (zonDebug) {
            const equationString = equation._equationTreeHead.toString();
            console.log(`  equationString: ${equationString}`);
            console.log(`equationTreeHead: ${equation._equationTreeHead.toString()}`);
            if (equationString !== equation.equationString) {
                console.error(`Equation string mismatch: expected "${equation.equationString}", got "${equationString}"`);
            }
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

    get value() {
        return this._equationTreeHead.value;
    }
    getValue(variablesArr = this.defaultVariablesArr, argsArr = this.defaultArgsArr) {
        this.variablesArr = variablesArr;
        this.argsArr = argsArr;
        const result = this._equationTreeHead.value;
        this.variablesArr = this.defaultVariablesArr;
        this.argsArr = this.defaultArgsArr;
        return result;
    }
    toString() {
        return `${this.name}${(this.defaultArgsArr.length > 0 ? `(${this.defaultArgsArr.join(', ')})` : '')} = ${this.equationString}`;
    }
}

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

Zon.GlobalVariables = new Map();

{
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
        //NOT: 5,
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
            ['-', SingleVariableOperationID.NEGATE],
            ['round', SingleVariableOperationID.ROUND],
            ['trunc', SingleVariableOperationID.TRUNC],
            //['!', SingleOperationID.NOT],
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
        static precursorOperationString(precursorOperationID, left, right) {
            switch (precursorOperationID) {
                case PrecursorOperationID.LOG:
                    return `log(${left}, ${right})`;
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
                // case SingleOperationID.NOT:
                //     return `!${variable}`;
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
            //600,//NOT
        ];
        static singleVariableOperationUsesParentheses = [
            false,//NONE
            true,//ABS
            false,//NEGATE
            true,//ROUND
            true,//TRUNC
            //false,//NOT
        ];
        static createTree(s, equation, operationsSet, variablesArr, argsArr, constantsArrLookupMap) {
            const argsSet = new Set(argsArr);
            const variablesMap = new Map(variablesArr.map((v, i) => [v.name, i]));

            let tree = null;
            let precursorOperation = PrecursorOperationID.NONE;
            let singleVariableOperation = SingleVariableOperationID.NONE;
            let needToCloseNonParentheseSingleVariableOperation = false;
            const notAllowedInVariableName = new Set([...this.operations.keys()].flatMap(s => [...s]).concat([...operationsSet.symbolConstants.keys()]).concat(['(', ')', ' ', ',']));
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

                //const lowerWord = word.toLowerCase();//Intentionally removed
                const constant = operationsSet.constants.get(word);
                if (constant !== undefined) {
                    placeConstantOrVariable(new NamedConstant(word, constant));
                    return true;
                }

                const precursorOperationID = this.precursorOperations.get(word);
                if (precursorOperationID !== undefined) {
                    if (precursorOperation !== PrecursorOperationID.NONE)
                        throw new Error("Failed to parse string.  There was already a precursor operation.");

                    precursorOperation = precursorOperationID;
                    return true;
                }

                const singleVariableOperationID = this.singleVariableOperations.get(word);
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
                    throw new Error(`Failed to Extract a value from the string: ${s}`);
                }

                const variableIndex = variablesMap.get(word);
                if (variableIndex !== undefined) {
                    placeConstantOrVariable(new Zon.Equation.VariableReference(equation, word, variableIndex));//TODO
                    return true;
                }

                const argIndex = argsSet.has(word) ? argsArr.indexOf(word) : -1;
                if (argIndex !== -1) {
                    placeConstantOrVariable(new Zon.Equation.ArgReference(equation, word, argIndex));//TODO
                    return true;
                }

                const constantIndex = constantsArrLookupMap.get(word);
                if (constantIndex !== undefined) {
                    placeConstantOrVariable(new Zon.Equation.EquationConstantReference(equation, word, constantIndex));//TODO
                    return true;
                }

                throw new Error(`Failed to parse string.  The word "${word}" was not found in the variables, arguments, constants, or operations.`);
            }
            function tryGetConstant() {
                const start = i;
                let end = i;
                while (end < s.length) {
                    const c = s[end];
                    if ((c >= '0' && c <= '9') || c === '.' || c === '-') {
                        end++;
                    }
                    else {
                        break;
                    }
                }

                const valueString = s.substring(start, end - start);
                if (valueString.length === 0)
                    return false;

                const value = operationsSet.parse(valueString);
                if (value !== undefined) {
                    const constant = new Constant(value);
                    placeConstantOrVariable(constant);
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
                for (const [key, operationID] of this.operations) {
                    if ((operation === null || key.length > operation.key.length) && match(key))
                        operation = { key, operationID };
                }

                if (operation !== null) {
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

                const operation = new Operation(operationsSet, operationID);
                tree = tree.joinOperation(operation);
            }
            function applyPrecursorOperation(precursorOperationID) {
                if (precursorOperationID === PrecursorOperationID.NONE)
                    throw new Error("Failed to apply precursor operation.  The precursorOperationID is NONE.");
                
                const operation = new PrecursorOperation(operationsSet, precursorOperationID);
                if (tree == null) {
                    tree = operation.setup();
                }
                else {
                    tree = tree.joinPrecursorOperation(operation);
                }
            }
            function applySingleVariableOperation(singleVariableOperationID) {
                if (singleVariableOperationID === SingleVariableOperationID.NONE)
                    throw new Error("Failed to apply single variable operation.  The singleVariableOperationID is NONE.");

                const operation = new SingleVariableOperation(operationsSet, singleVariableOperationID);
                if (tree == null) {
                    tree = operation.setup();
                }
                else {
                    tree = tree.joinSingleVariableOperation(operation);
                }
            }
            function placeConstantOrVariable(constantOrVariable) {
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
                            const parenthesis = new Parenthesis(null, tree);
                            if (tree == null) {
                                tree = parenthesis;
                            }
                            else {
                                tree = tree.joinParenthesis(parenthesis);
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
                    if (!this.singleVariableOperationUsesParentheses[singleVariableOperation]) {
                        needToCloseNonParentheseSingleVariableOperation = true;
                        applyPrecursorOperation(precursorOperation);
                        precursorOperation = PrecursorOperationID.NONE;
                    }
                }

                if (tryGetOperator()) {
                    continue;
                }

                if (tryGetConstant()) {
                    if (needToCloseNonParentheseSingleVariableOperation) {
                        needToCloseNonParentheseSingleVariableOperation = false;
                        if (tree == null)
                            throw new Error("Failed to close non parentheses single variable operation.  The tree was null.");

                        tree = tree.closeParenthesis();
                    }

                    continue;
                }

                if (checkStringForWords()) {
                    if (needToCloseNonParentheseSingleVariableOperation) {
                        needToCloseNonParentheseSingleVariableOperation = false;
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

            return tree.getTreeHead();
        }
    }
    Zon.Equation.EquationTreeBuilder = EquationTreeBuilder;

    //#region Equation Nodes

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
        joinParenthesis(parenthesis) {
            throw new Error(`Cannot join Parenthesis onto ${this.toString()}.`);
        }
        joinOperation(operation) {
            throw new Error(`Cannot join Operation onto ${this.toString()}.`);
        }
        joinNode(node) {
            throw new Error(`Cannot join Variable onto ${this.toString()}.`);
        }
        joinPrecursorOperation(precursorOperation) {
            throw new Error(`Cannot join PrecursorOperation onto ${this.toString()}.`);
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
        *traverse() {
            return null;
        }
    }
    class VariableGetter extends TreeNode {
        constructor(parent = null) {
            super(parent);
        }
        joinOperation(operation) {
            return this.myselfAsLeftInputForOperation(operation);
        }
        readyForOperation() {
            return true;
        }
        toString() {
            return `${this.value}`;
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
        constructor(value, parent = null) {
            if (parent && !(parent instanceof Operation))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected Operation.`);

            super(parent);
            this._value = value;
        }
        get value() {
            return this._value;
        }
    }//TODO: make sure this is only used when extracting constants from the equation string to cache them in equation.constantsMap/arr.
    class NamedConstant extends VariableGetter {
        constructor(name, value, parent = null) {
            if (parent && !(parent instanceof Operation))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected Operation.`);

            super(parent);
            this.name = name;
            this._value = value;
        }
        get value() {
            return this._value;
        }
        toString() {
            return this.name;
        }
    }
    class VariableReference extends VariableGetter {
        constructor(equation, name, index, parent = null) {
            if (parent && !(parent instanceof Operation))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected Operation.`);

            super(parent);
            this.equation = equation;
            this.name = name;
            this.index = index;
        }
        get value() {
            const variable = this.equation.variablesArr[this.index];
            if (!variable)
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
        *traverse() {
            yield this;
        }
    }
    class ArgReference extends VariableGetter {
        constructor(equation, name, index, parent = null) {
            if (parent && !(parent instanceof Operation))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected Operation.`);

            super(parent);
            this.equation = equation;
            this.name = name;
            this.index = index;
        }
        get value() {
            const arg = this.equation.argsArr[this.index];
            if (arg === undefined)
                throw new Error(`Argument not found in equation: ${this.name} at index ${this.index}.`);

            return arg;
        }
        toString() {
            return this.name;
        }
        *traverse() {
            yield this;
        }
    }
    class ConstantReference extends VariableGetter {
        constructor(equation, name, index, parent = null) {
            if (parent && !(parent instanceof Operation))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected Operation.`);

            super(parent);
            this.equation = equation;
            this.name = name;
            this.index = index;
        }
        get value() {
            const constant = this.equation.constantsArr[this.index];
            if (!constant)
                throw new Error(`Constant not found in equation: ${this.name} at index ${this.index}.`);

            return constant.value;
        }
        toString() {
            return this.name;
        }
        *traverse() {
            yield this;
        }
    }
    class Operation extends ParentNode {
        constructor(operationsSet, operationID, left = null, right = null, parent = null) {
            if (parent && !(parent instanceof Operation))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected Operation.`);

            super(parent);
            this.left = left;
            this.right = right;
            this.operationID = operationID;
            this.func = operationsSet.getOperation(operationID);
            if (this.left)
                this.left.parent = this;
                
            if (this.right)
                this.right.parent = this;
        }
        get value() {
            if (this.left === null || this.right === null)
                throw new Error(`Operation value cannot be calculated because Left or Right is null.  ${this.toString()}`);

            return this.func(this.left.value, this.right.value);
        }
        toString() {
            return EquationTreeBuilder.operationString(this.operationID, this.left ? this.left.toString() : 'none', this.right ? this.right.toString() : 'none');
        }
        joinParenthesis(parenthesis) {
            if (!(parenthesis instanceof Parenthesis))
                throw new Error(`Invalid parenthesis type: ${parenthesis.constructor.name}. Expected Parenthesis.`);

            this.right = parenthesis;
            parenthesis.parent = this;
            return parenthesis;
        }
        joinOperation(operation) {
            if (!(operation instanceof Operation))
                throw new Error(`Invalid operation type: ${operation.constructor.name}. Expected Operation.`);

            if (this.right !== null && EquationTreeBuilder.oppPrecedence[this.operationID] < EquationTreeBuilder.oppPrecedence[operation.operationID]) {
                //Set new operation as child (right)
                operation.left = this.right;
                this.right = operation;
                operation.parent = this;
                return operation;
            }
            else {
                //Swap this operation with the new operation.  This becomes the left of the new operation.
                operation.left = this;
                operation.parent = this.parent;
                this.parent = operation;
                if (this.parent)
                    this.parent.swap(this, operation);

                return operation;
            }
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
        joinPrecursorOperation(precursorOperation) {
            if (!(precursorOperation instanceof PrecursorOperation))
                throw new Error(`Invalid precursor operation type: ${precursorOperation.constructor.name}. Expected PrecursorOperation.`);

            if (this.right !== null)
                throw new Error(`Failed to join precursor operation onto Operation because Operation.Right wasn't null`);

            this.right = precursorOperation;
            precursorOperation.parent = this;
            return precursorOperation;
        }
        swap(existing, newOp) {
            if (this.left === existing) {
                this.left = newOp;
            }
            else if (this.right === existing) {
                this.right = newOp;
            }
            else {
                throw new Error(`Failed to swap operation.  Existing operation not found in this operation: ${this.toString()}`);
            }
        }
        readyForOperation() {
            return this.right !== null;
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
        constructor(operationsSet, singleOperationID, variable = null, parent = null) {
            if (parent && !(parent instanceof Operation))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected Operation.`);

            super(parent);
            this.singleOperationID = singleOperationID;
            this.variable = variable;
            this.variable.parent = this;
            this.func = operationsSet.getSingleVariableOperation(singleOperationID);
        }
        get value() {
            if (this.variable === null)
                throw new Error(`SingleVariableOperation value cannot be calculated because variable is null.  ${this.toString()}`);

            return this.func(this.variable.value);
        }
        toString() {
            return EquationTreeBuilder.singleVariableOperationstring(this.singleOperationID, this.variable.toString());
        }
        joinOperation(operation) {
            if (this.variable === null)
                throw new Error(`Failed to join operation onto SingleVariableOperation because variable is null.  ${this.toString()}`);

            return this.myselfAsLeftInputForOperation(operation);
        }
        setup() {
            this.variable = new FakeParenthesis();
            this.variable.parent = this;
            return this.variable;
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
        constructor(operationsSet, precursorOperationID, left = null, right = null, parent = null) {
            if (parent && !(parent instanceof Operation))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected Operation.`);

            super(parent);
            this.left = left;
            this.right = right;
            this.precursorOperationID = precursorOperationID;
            this.func = operationsSet.getPrecursorOperation(precursorOperationID);
            if (this.left)
                this.left.parent = this;
                
            if (this.right)
                this.right.parent = this;
        }
        get value() {
            if (this.left === null || this.right === null)
                throw new Error(`PrecursorOperation value cannot be calculated because Left or Right is null.  ${this.toString()}`);

            return this.func(this.left.value, this.right.value);
        }
        toString() {
            return EquationTreeBuilder.precursorOperationString(this.precursorOperationID, this.left ? this.left.toString() : 'none', this.right ? this.right.toString() : 'none');
        }
        joinOperation(operation) {
            if (!(operation instanceof Operation))
                throw new Error(`Invalid operation type: ${operation.constructor.name}. Expected Operation.`);

            if (this.left === null || this.right === null)
                throw new Error(`Failed to join operation onto ${this.toString()} because Left or Right was null.`);

            return this.myselfAsLeftInputForOperation(operation);
        }
        setup() {
            if (this.left !== null || this.right !== null)
                throw new Error(`Failed to setup PrecursorOperation because Left or Right wasnt null.  ${this.toString()}`);

            this.left = new FakeParenthesis();
            this.left.parent = this;
            return this.left;
        }
        transferToRight() {
            if (this.left === null)
                throw new Error(`Failed to transfer to right side of PrecursorOperation because Left was null.  ${this.toString()}`);

            if (this.right !== null)
                throw new Error(`Failed to transfer to right side of PrecursorOperation because Right wasn't null.  ${this.toString()}`);

            this.right = new FakeParenthesis();
            this.right.parent = this;
            return this.right;
        }
        swap(existing, newOp) {
            if (this.left === existing) {
                this.left = newOp;
            }
            else if (this.right === existing) {
                this.right = newOp;
            }
            else {
                throw new Error(`Failed to swap operation.  Existing operation not found in this operation: ${this.toString()}`);
            }
        }
        readyForOperation() {
            return this.left !== null && this.right !== null;
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
        constructor(innerValue = null, parent = null) {
            if (parent && !(parent instanceof Operation))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected Operation.`);

            super(parent);
            this.innerValue = innerValue;
        }
        get value() {
            if (this.innerValue === null)
                throw new Error(`Parenthesis value cannot be calculated because InnerValue is null.  ${this.toString()}`);

            return this.innerValue.value;
        }
        toString() {
            return `(${this.innerValue ? this.innerValue.toString() : 'none'})`;
        }
        joinOperation(operation) {
            if (!(operation instanceof Operation))
                throw new Error(`Invalid operation type: ${operation.constructor.name}. Expected Operation.`);

            if (this.innerValue === null)
                throw new Error(`Can't treat Parenthesis as a constant value input to the operation ${operation.toString()} because InnerValue is null.`);

            return this.myselfAsLeftInputForOperation(operation);
        }
        joinPrecursorOperation(precursorOperation) {
            if (!(precursorOperation instanceof PrecursorOperation))
                throw new Error(`Invalid precursor operation type: ${precursorOperation.constructor.name}. Expected PrecursorOperation.`);

            precursorOperation.parent = this;
            return precursorOperation.setup();
        }
        joinParenthesis(node) {
            if (!(node instanceof Parenthesis))
                throw new Error(`Invalid parenthesis type: ${node.constructor.name}. Expected Parenthesis.`);

            return this._joinCommon(node);
        }
        joinNode(node) {
            if (!(node instanceof TreeNode))
                throw new Error(`Invalid variable type: ${node.constructor.name}. Expected TreeNode.`);

            return this._joinCommon(node);
        }
        _joinCommon(node) {
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
    }

    //#endregion Equation Nodes





    //#region OperationSets

    class OperationsSet {
        constructor() {
            if (new.target === OperationsSet)
                throw new TypeError("Cannot construct OperationsSet instances directly.");
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
        round(t) {
            throw new Error("Round operation must be implemented by subclasses.");
        }
        trunc(t) {
            throw new Error("Truncate operation must be implemented by subclasses.");
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
        tryGetCommonOperation(operationID) {
            switch (operationID) {
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
                //case OperationID.NOT:
                //	return this.not;
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
            throw new Error(`GetPrecursorOperation must be implemented by subclasses.  PrecursorOperationID: ${precursorOperationID}`);
        }
        tryGetCommonSingleVariableOperation(operationID) {
            switch (operationID) {
                case SingleVariableOperationID.NOT:
                    return this.not;
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
    }

    class NumberOperationSet extends OperationsSet {
        constructor() {
            super();
        }

        static instance = null;

        getUniqueOperation(operationID) {
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
                default:
                    throw new Error(`No operation found for ${operationID}`);
            }
        }
        add = (a, b) => a + b;
        subtract = (a, b) => a - b;
        multiply = (a, b) => a * b;
        divide = (a, b) => a / b;
        pow = (a, b) => Math.pow(a, b);
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
        round = (t) => Math.round(t);
        trunc = (t) => Math.trunc(t);
        getPrecursorOperation(precursorOperationID) {
            switch (precursorOperationID) {
                case PrecursorOperationID.LOG:
                    return this.log;
                default:
                    throw new Error(`No precursor operation found for ${precursorOperationID}`);
            }
        }
        getUniqueSingleVariableOperation(operationID) {
            switch (operationID) {
                case SingleVariableOperationID.ABS:
                    return this.abs;
                case SingleVariableOperationID.ROUND:
                    return this.round;
                case SingleVariableOperationID.TRUNC:
                    return this.trunc;
                default:
                    throw new Error(`No single variable operation found for ${operationID}`);
            }
        }
        parse(valueString) {
            const parsedValue = parseFloat(valueString);
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
    }
    NumberOperationSet.instance = new NumberOperationSet();
    Zon.Equation.NumberOperationSet = NumberOperationSet;
    
    class BigNumberOperationSet extends OperationsSet {
        constructor() {
            super();
        }

        static instance = null;

        getUniqueOperation(operationID) {
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
        round = (t) => t.round();
        trunc = (t) => t.trunc();
        getPrecursorOperation(precursorOperationID) {
            switch (precursorOperationID) {
                case PrecursorOperationID.LOG:
                    return this.log;
                default:
                    throw new Error(`No precursor operation found for ${precursorOperationID}`);
            }
        }
        getUniqueSingleVariableOperation(operationID) {
            switch (operationID) {
                case SingleVariableOperationID.ABS:
                    return this.abs;
                case SingleVariableOperationID.ROUND:
                    return this.round;
                case SingleVariableOperationID.TRUNC:
                    return this.trunc;
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
        static _constants = [...NumberOperationSet._constants].map(([key, value]) => [key, Struct.BigNumber.create(value)])
        get symbolConstants() {
            return BigNumberOperationSet._symbolConstants;
        }
        static _symbolConstants = [...NumberOperationSet._symbolConstants].map(([key, value]) => [key, Struct.BigNumber.create(value)]);
    }
    BigNumberOperationSet.instance = new BigNumberOperationSet();
    Zon.Equation.BigNumberOperationSet = BigNumberOperationSet;

    class BoolOperationSet extends OperationsSet {
        constructor() {
            super();
        }

        static instance = null;

        getUniqueOperation(operationID) {
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
        round = (t) => t;
        trunc = (t) => t;
        getPrecursorOperation(precursorOperationID) {
            switch (precursorOperationID) {
                case PrecursorOperationID.LOG:
                    return this.log;
                default:
                    throw new Error(`No precursor operation found for ${precursorOperationID}`);
            }
        }
        getUniqueSingleVariableOperation(operationID) {
            switch (operationID) {
                case SingleVariableOperationID.ABS:
                    return this.abs;
                case SingleVariableOperationID.ROUND:
                    return this.round;
                case SingleVariableOperationID.TRUNC:
                    return this.trunc;
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
    }
    BoolOperationSet.instance = new BoolOperationSet();
    Zon.Equation.BoolOperationSet = BoolOperationSet;

    //#endregion OperationSets
}