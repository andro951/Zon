"use strict";

Zon.Equation_BN = class Equation_BN {
    constructor() {}
    static create(name, equationString, argsArr, constantsMap) {
        const equation = new this();
        equation.name = name;
        equation.equationString = equationString;
        equation.argsArr = argsArr;
        equation.constantsMap = constantsMap;
        equation._equationFunction = Zon.Equation.createEquationFunction(equationString, argsArr, constantsMap);
        return equation;
    }
}

{

    class EquationTreeBuilder {
        static operations = new Map([
            ['+', this.OperationID.ADD],
            ['-', this.OperationID.SUBTRACT],
            ['*', this.OperationID.MULTIPLY],
            ['/', this.OperationID.DIVIDE],
            ['^', this.OperationID.POWER],
            //['>', this.OperationID.GREATER_THAN],
            //['<', this.OperationID.LESS_THAN],
            //['==', this.OperationID.EQUAL_TO],
            //['!=', this.OperationID.NOT_EQUAL_TO],
            //['>=', this.OperationID.GREATER_THAN_OR_EQUAL_TO],
            //['<=', this.OperationID.LESS_THAN_OR_EQUAL_TO],
            //['&&', this.OperationID.AND],
            //['||', this.OperationID.OR],
        ]);
        static singleOperations = new Map([
            ['abs', this.SingleOperationID.ABS],
            ['-', this.SingleOperationID.NEGATE],
            ['round', this.SingleOperationID.ROUND],
            ['trunc', this.SingleOperationID.TRUNC],
            //['!', this.SingleOperationID.NOT],
        ]);
        static precursorOperations = new Map([
            ['log', this.PrecursorOperationID.LOG],
        ]);
        static OperationID = {
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
        static SingleOperationID = {
            NONE: 0,
            ABS: 1,
            NEGATE: 2,
            ROUND: 3,
            TRUNC: 4,
            //NOT: 5,
        }
        static PrecursorOperationID = {
            NONE: 0,
            LOG: 1,
        }
        static operationString(operationID, left, right) {
            switch (operationID) {
                case this.OperationID.ADD:
                    return `${left} + ${right}`;
                case this.OperationID.SUBTRACT:
                    return `${left} - ${right}`;
                case this.OperationID.MULTIPLY:
                    return `${left} * ${right}`;
                case this.OperationID.DIVIDE:
                    return `${left} / ${right}`;
                case this.OperationID.POWER:
                    return `${left}^${right}`;
                // case this.OperationID.GREATER_THAN:
                //     return `${left} > ${right}`;
                // case this.OperationID.LESS_THAN:
                //     return `${left} < ${right}`;
                // case this.OperationID.EQUAL_TO:
                //     return `${left} == ${right}`;
                // case this.OperationID.NOT_EQUAL_TO:
                //     return `${left} != ${right}`;
                // case this.OperationID.GREATER_THAN_OR_EQUAL_TO:
                //     return `${left} >= ${right}`;
                // case this.OperationID.LESS_THAN_OR_EQUAL_TO:
                //     return `${left} <= ${right}`;
                // case this.OperationID.AND:
                //     return `${left} && ${right}`;
                // case this.OperationID.OR:
                //     return `${left} || ${right}`;
            }

            throw new Error(`Unknown operation ID: ${operationID}`);
        }
        static precursorOperationString(precursorOperationID, left, right) {
            switch (precursorOperationID) {
                case this.PrecursorOperationID.LOG:
                    return `log(${left}, ${right})`;
            }

            throw new Error(`Unknown precursor operation ID: ${precursorOperationID}`);
        }
        static singleOperationString(singleOperationID, variable) {
            switch (singleOperationID) {
                case this.SingleOperationID.ABS:
                    return `abs(${variable})`;
                case this.SingleOperationID.NEGATE:
                    return `-${variable}`;
                case this.SingleOperationID.ROUND:
                    return `round(${variable})`;
                case this.SingleOperationID.TRUNC:
                    return `trunc(${variable})`;
                // case this.SingleOperationID.NOT:
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
        /*
        public static EquationVariable<T> GetStaticEquation<T>(this string s, Equation<T> equation, OperationsSet<T> operationsSet, bool makeIVariableReferences = true) {
            EquationVariable<T>? tree = null;
            PrecursorOperationID precursorOperation = PrecursorOperationID.None;
            SingleVariableOperationID singleVariableOperation = SingleVariableOperationID.None;
            bool needToCloseNonParentheseSingleVariableOperation = false;
            HashSet<char> notAllowedInVariableName = new(StringToOperation.Keys.SelectMany(s => s).Concat(operationsSet.SymbolConstants.Keys).Append('(').Append(')').Append(' ').Append(','));
            for (int i = 0; i < s.Length;) {
                char c = s[i];
                switch (c) {
                    case ' ':
                        i++;
                        continue;
                    case ',':
                        //Need to create 2 fake parentheses for precursor operators and check when a comma is used to swap between the 2 fake inner parentheses.
                        //It will return the left value instead of itself and swap to the right value on a comma.
                        if (tree == null)
                            throw new Exception("Failed to parse string.  The tree was null at a comma.");

                        tree = tree.OnComma();
                        i++;
                        continue;
                    case '(':
                        if (precursorOperation != PrecursorOperationID.None) {
                            ApplyPrecursorOperation(ref tree, precursorOperation, operationsSet);
                            precursorOperation = PrecursorOperationID.None;
                        }
                        else if (singleVariableOperation != SingleVariableOperationID.None) {
                            ApplySingleVariableOperation(ref tree, singleVariableOperation, operationsSet);
                            singleVariableOperation = SingleVariableOperationID.None;
                        }
                        else {
                            Parenthesis<T> parenthesis = new Parenthesis<T>();
                            if (tree == null) {
                                tree = parenthesis;
                            }
                            else {
                                tree = tree.Join(parenthesis);
                            }
                        }

                        i++;
                        continue;
                    case ')':
                        if (tree == null)
                            throw new Exception("Failed to close parenthesis.  The tree was null.");

                        tree = tree.CloseParenthesis();
                        i++;
                        continue;
                }


                if (singleVariableOperation != SingleVariableOperationID.None) {
                    if (!singleVariableOperation.UsesParentheses()) {
                        needToCloseNonParentheseSingleVariableOperation = true;
                        ApplyPrecursorOperation(ref tree, precursorOperation, operationsSet);
                        precursorOperation = PrecursorOperationID.None;
                    }
                }

                if (TryGetOperator(s, ref i, ref tree, operationsSet)) {
                    continue;
                }

                if (TryGetConstant(s, ref i, ref tree, operationsSet)) {
                    if (needToCloseNonParentheseSingleVariableOperation) {
                        needToCloseNonParentheseSingleVariableOperation = false;
                        if (tree == null)
                            throw new Exception("Failed to close non parentheses single variable operation.  The tree was null.");

                        tree = tree.CloseParenthesis();
                    }

                    continue;
                }

                if (CheckStringForWords(s, ref i, ref tree, ref precursorOperation, ref singleVariableOperation, equation, notAllowedInVariableName, operationsSet, makeIVariableReferences)) {
                    if (needToCloseNonParentheseSingleVariableOperation) {
                        needToCloseNonParentheseSingleVariableOperation = false;
                        if (tree == null)
                            throw new Exception("Failed to close non parentheses single variable operation.  The tree was null.");

                        tree = tree.CloseParenthesis();
                    }

                    continue;
                }

                throw new Exception($"Failed to parse string at index {i}: {s} (remaining: {s.Substring(i)})");
            }

            if (tree == null)
                throw new Exception("Failed to parse string.  The tree was null.");

            return tree.GetTreeHead();
        }
        private static bool CheckStringForWords<T>(string s, ref int i, ref EquationVariable<T>? tree, ref PrecursorOperationID precursorOperation, ref SingleVariableOperationID singleVariableOperation, Equation<T> equation, HashSet<char> notAllowedInVariableName, OperationsSet<T> operationsSet, bool makeIVariableReferences) {
            char firstChar = s[i];
            if (operationsSet.SymbolConstants.TryGetValue(firstChar, out T symbolConstant)) {
                PlaceConstantOrVariable(ref tree, new NamedConstant<T>(firstChar.ToString(), symbolConstant));
                i++;
                return true;
            }

            string word = "";
            while (i < s.Length) {
                char c = s[i];
                if (c == ' ') {
                    i++;
                    continue;
                }

                if (Char.IsLetter(c)) {
                    word += c;
                    i++;
                }
                else {
                    break;
                }
            }

            string lowerWord = word.ToLower();
            if (operationsSet.Constants.TryGetValue(lowerWord, out T value)) {
                PlaceConstantOrVariable(ref tree, new NamedConstant<T>(word, value));
                return true;
            }

            if (StringToPrecursorOperation.TryGetValue(lowerWord, out PrecursorOperationID operationID)) {
                if (precursorOperation != PrecursorOperationID.None)
                    throw new Exception("Failed to parse string.  There was already a precursor operation.");

                precursorOperation = operationID;
                return true;
            }

            if (StringToSingleVariableOperation.TryGetValue(lowerWord, out SingleVariableOperationID singleVariableOperationID)) {
                if (singleVariableOperation != SingleVariableOperationID.None)
                    throw new Exception("Failed to parse string.  There was already a single variable operation.");

                singleVariableOperation = singleVariableOperationID;
                return true;
            }

            while (i < s.Length) {
                char c = s[i];
                if (c == ' ') {
                    i++;
                    continue;
                }

                if (!notAllowedInVariableName.Contains(c)) {
                    word += c;
                    i++;
                }
                else {
                    break;
                }
            }

            if (word.Length == 0) {
                throw new Exception($"Failed to Extract a value from the string: {s}");
            }

            VariableGetter<T> variable = makeIVariableReferences ? new VariableReference<T>(equation, word) : new ArgumentGetter<T>(equation, word);
            PlaceConstantOrVariable(ref tree, variable);
            return true;
        }
        private static bool TryGetConstant<T>(string s, ref int i, ref EquationVariable<T>? tree, OperationsSet<T> operationsSet) {
            int start = i;
            int end = i;
            while (end < s.Length) {
                char c = s[end];
                if (Char.IsDigit(c) || c == '.' || c == '-') {
                    end++;
                }
                else {
                    break;
                }
            }

            string valueString = s.Substring(start, end - start);
            if (valueString.Length == 0)
                return false;

            if (operationsSet.TryParse(valueString, out T value)) {
                Constant<T> constant = new(value);
                PlaceConstantOrVariable(ref tree, constant);
                i = end;
                return true;
            }

            return false;
        }
        private static bool TryGetOperator<T>(string s, ref int i, ref EquationVariable<T>? tree, OperationsSet<T> operationsSet) {
            char first = s[i];
            int sLengthRemaining = s.Length - i;
            int index = i;
            IEnumerator<KeyValuePair<string, OperationID>> operations = StringToOperation.GetEnumerator();
            Func<string, bool> match = (string key) => key[0] == first && sLengthRemaining >= key.Length && s.AsSpan(index, key.Length).SequenceEqual(key);
            while (operations.MoveNext()) {
                KeyValuePair<string, OperationID> operation = operations.Current;
                if (match(operation.Key)) {
                    while (operations.MoveNext()) {
                        KeyValuePair<string, OperationID> nextOperation = operations.Current;
                        if (nextOperation.Key.Length > operation.Key.Length && match(nextOperation.Key)) {
                            operation = nextOperation;
                        }
                    }

                    if (operation.Value == OperationID.Subtract) {
                        if (tree == null || !tree.ReadyForOperation())
                            return false;
                    }

                    i += operation.Key.Length;
                    ApplyOperation(ref tree, operation.Value, operationsSet);
                    return true;
                }
            }

            return false;
        }
        private static void ApplyOperation<T>(ref EquationVariable<T>? tree, OperationID operationID, OperationsSet<T> operationsSet) {
            if (operationID == OperationID.None)
                throw new Exception("Failed to apply operation.  The operationID is None.");

            if (tree == null)
                throw new Exception("Failed to apply operation.  The last Value is null.");

            Operation<T> operation = new Operation<T>(operationsSet, operationID);
            tree = tree.Join(operation);
        }
        private static void ApplyPrecursorOperation<T>(ref EquationVariable<T>? tree, PrecursorOperationID operationID, OperationsSet<T> operationsSet) {
            if (operationID == PrecursorOperationID.None)
                throw new Exception("Failed to apply precursor operation.  The PrecursorOperationID is None.");

            PrecursorOperation<T> operation = new(operationsSet, operationID);
            if (tree == null) {
                tree = operation.Setup();
            }
            else {
                tree = tree.Join(operation);
            }
        }
        private static void ApplySingleVariableOperation<T>(ref EquationVariable<T>? tree, SingleVariableOperationID operationID, OperationsSet<T> operationsSet) {
            if (operationID == SingleVariableOperationID.None)
                throw new Exception("Failed to apply single variable operation.  The SingleVariableOperationID is None.");

            //if (tree == null)
            //	throw new Exception($"Failed to apply single variable operation.  The last Value is null.  operationID: {operationID}, T: {typeof(T).Name}");

            SingleVariableOperation<T> operation = new(operationsSet, operationID);
            if (tree == null) {
                tree = operation.Setup();
            }
            else {
                tree = tree.Join(operation);
            }
        }
        private static void PlaceConstantOrVariable<T>(ref EquationVariable<T>? tree, VariableGetter<T> constant) {
            if (tree == null) {
                tree = constant;
            }
            else {
                tree = tree.Join(constant);
            }
        }
        */
        static createTree(equationString, argsArr, constantsMap) {
            
        }
    }
    Zon.Equation_BN.EquationTreeBuilder = EquationTreeBuilder;

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
    class ValueNode extends TreeNode {
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
    class Constant extends ValueNode {
        constructor(value, parent = null) {
            if (parent && !(parent instanceof Operation))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected Operation.`);

            super(parent);
            this._value = value;
        }
        get value() {
            return this._value;
        }
    }
    class NamedConstant extends ValueNode {
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
    //class VariableReference extends ValueNode {}//Used for saving a variable from the original arguments.
    //class ArgumentGetter extends ValueNode {}//Used for getting an argument from the currenct arguments.
    class Operation extends ParentNode {
        constructor(operationID, left = null, right = null, parent = null) {
            if (parent && !(parent instanceof Operation))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected Operation.`);

            super(parent);
            this.left = left;
            this.right = right;
            this.operationID = operationID;
            if (this.left)
                this.left.parent = this;
                
            if (this.right)
                this.right.parent = this;
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
        constructor(singleOperationID, variable = null, parent = null) {
            if (parent && !(parent instanceof Operation))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected Operation.`);

            super(parent);
            this.singleOperationID = singleOperationID;
            this.variable = variable;
            this.variable.parent = this;
        }
        // get value() {
        //     
        // }
        toString() {
            return EquationTreeBuilder.singleOperationString(this.singleOperationID, this.variable.toString());
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
        constructor(precursorOperationID, left = null, right = null, parent = null) {
            if (parent && !(parent instanceof Operation))
                throw new Error(`Invalid parent type: ${parent.constructor.name}. Expected Operation.`);

            super(parent);
            this.left = left;
            this.right = right;
            this.precursorOperationID = precursorOperationID;
            if (this.left)
                this.left.parent = this;
                
            if (this.right)
                this.right.parent = this;
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
}