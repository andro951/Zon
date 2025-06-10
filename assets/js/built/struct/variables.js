"use strict";

const Variable = {}

Variable.Base = class VariableBase {
    constructor(name) {
        if (new.target === Variable.Base)
            throw new Error("Variable.Base is an abstract class and cannot be instantiated directly.");

        if (!name)
            throw new Error("Variable name is required.");

        this.onChanged = this.onChanged.bind(this);
        this.onChangedAction = new Actions.Action();
        this.name = name;
    }

    valueOf() {
        return this.value;
    }

    get value() {
        throw new Error("value getter not implemented");
    }

    onChanged() {
        if (Variable.Base.paused) {
            for (const callback of this.onChangedAction.callbacks) {
                Variable.Base.pausedCallbacks.add(callback);
            }
            
            return;
        }

        this.onChangedAction.call();
    }

    transferDataToNewVariable(newVariable) {
        if (!(newVariable instanceof Variable.Base))
            throw new Error("newVariable must be a VariableBase", newVariable);

        newVariable.onChangedAction = this.onChangedAction;
        
        return newVariable;
    }

    static paused = false;
    static pausedCallbacks = new Actions.Action();

    static pause() {
        Variable.Base.paused = true;
    }

    static resume() {
        Variable.Base.paused = false;
        Variable.Base.pausedCallbacks.callAndClear();
    }

    addOnChangedDrawAction(funct) {
        if (typeof funct !== 'function')
            throw new Error(`funct must be a function, got ${typeof funct}: ${funct}`);

        this.onChangedAction.add(() => Zon.game.onNextDrawActions.add(funct));
    }
}

Variable.Value = class VariableValue extends Variable.Base {
    constructor(defaultValue, name) {
        super(name);
        if (zonDebug && typeof defaultValue === 'object')
            throw new Error(`Variable.Value is not suitable for objects, got: ${defaultValue}`);

        this._defaultValue = defaultValue;
        this._value = defaultValue;
    }

    set value(newValue) {
        if (zonDebug && typeof newValue === 'object')
            throw new Error(`Variable.Value is not suitable for objects, got: ${newValue}`);

        if (this._value === newValue)
            return;

        this._value = newValue;
        this.onChanged();
    }
    get value() {
        return this._value;
    }

    reset() {
        this.value = this._defaultValue;
    }

    resetSkipActions() {
        this._value = this._defaultValue;
    }
}

Variable.BigNumberVar = class BigNumberVar extends Variable.Base {
    constructor(defaultValue, name) {
        super(name);
        this._defaultValue = defaultValue;
        this._value = defaultValue.clone;
        this.value.addOnChangedAction(this.onChanged);
    }
    static ZERO(name) {
        return new Variable.BigNumberVar(Struct.BigNumber.ZERO, name);
    }
    static ONE(name) {
        return new Variable.BigNumberVar(Struct.BigNumber.ONE, name);
    }
    static create(name, significand, exponent = 0) {
        return new Variable.BigNumberVar(Struct.BigNumber.create(significand, exponent), name);
    }

    set value(newValue) {
        if (this._value.equals(newValue))
            return;

        this._value.set(newValue);
        this.onChanged();
    }

    get value() {
        return this._value;
    }

    reset() {
        this.value = this._defaultValue.clone;
    }
    
    resetSkipActions() {
        this._value = this._defaultValue.clone;
    }
}

Variable.ColorVar = class ColorVar extends Variable.Base {
    constructor(name, defaultColor = 0) {
        super(name);
        this._defaultValue = defaultColor;
        this._value = Struct.Color.fromUInt(defaultColor);
    }

    set value(newValue) {
        if (this._value.uint === newValue.uint)
            return;

        this._value.uint = newValue.uint;
        this.onChanged();
    }
    get r() {
        return this._value.r;
    }
    set r(value) {
        if (this._value.r === value)
            return;

        this._value.r = value;
        this.onChanged();
    }
    get g() {
        return this._value.g;
    }
    set g(value) {
        if (this._value.g === value)
            return;

        this._value.g = value;
        this.onChanged();
    }
    get b() {
        return this._value.b;
    }
    set b(value) {
        if (this._value.b === value)
            return;
        
        this._value.b = value;
        this.onChanged();
    }
    get a() {
        return this._value.a;
    }
    set a(value) {
        if (this._value.a === value)
            return;

        this._value.a = value;
        this.onChanged();
    }
    get uint() {
        return this._value.uint;
    }
    set uint(value) {
        if (this._value.uint === value)
            return;

        this._value.uint = value;
        this.onChanged();
    }
    get value() {
        return this._value;
    }

    reset() {
        this.uint = this._defaultValue;
    }
    
    resetSkipActions() {
        this.uint = this._defaultValue;
    }
}

Variable.Dependent = class DependentVariable extends Variable.Base {
    constructor(getValue, name, thisObj = undefined, linkDependentActions = true) {
        super(name);
        if (typeof getValue !== 'function')
            throw new Error(`getValue must be a function, got ${typeof getValue}: ${getValue}`);

        this.dependentActions = new Set();
        this._dependentActionsLinked = linkDependentActions;
        this._thisObj = thisObj;
        this.replaceEquation(getValue, thisObj);
    }
    static empty = (name, thisObj = undefined, linkDependentActions = false) => {
        return new Variable.Dependent(Variable.Dependent.defaultEquation, name, thisObj, linkDependentActions);
    }
    static defaultEquation = () => { throw new Error("Dependent variable has no equation set"); };
    replaceEquation(newGetValue, thisObj = undefined) {
        if (typeof newGetValue !== 'function')
            throw new Error(`newGetValue must be a function, got ${typeof newGetValue}: ${newGetValue}`);

        if (zonDebug) {
            //console.log(`Replacing equation of DependentVariable with: ${newGetValue}, thisObj: ${thisObj}, thisObj name: ${thisObj ? thisObj.constructor.name : 'undefined'}`);
        }
        
        this.getValue = newGetValue;
        this.needsRecalculate = true;
        const linked = this._dependentActionsLinked;
        if (linked)
            this.unlinkDependentActions();

        if (newGetValue === Variable.Dependent.defaultEquation)
            return;

        this.dependentActions.clear();
        this.extractVariables(newGetValue, thisObj ?? this._thisObj);
        this._dependentActionsLinked = false;
        if (linked)
            this.linkDependentActions();
    }
    linkDependentActions() {
        if (this._dependentActionsLinked) {
            if (zonDebug)
                throw new Error("DependentVariable: linkDependentActions called, but already linked.  Skipping.");

            return;
        }

        this._dependentActionsLinked = true;
        for (const action of this.dependentActions) {
            action.add(this.onChanged);
        }

        this.onChanged();
    }
    unlinkDependentActions() {
        if (!this._dependentActionsLinked) {
            if (zonDebug)
                throw new Error("DependentVariable: unlinkDependentActions called, but not linked.  Skipping.");

            return;
        }

        this.needsRecalculate = true;
        this._value = undefined;
        this._dependentActionsLinked = false;
        for (const action of this.dependentActions) {
            action.remove(this.onChanged);
        }
    }
    static debuggExtractVariables = zonDebug && false;
    extractVariables(fn, thisContext = undefined) {
        if (Variable.Dependent.debuggExtractVariables) console.log(`Extracting variables from function: ${fn}`);
        const fnStr = fn.toString();
        this._extractVariablesFromString(fnStr, thisContext);
    }
    _extractVariablesFromString(fnStr, thisContext = undefined) {
        const matches = [...new Set(fnStr.match(/\b(?:\w+\.)+\w+\b/g))];
        if (!matches) {
            if (Variable.Dependent.debuggExtractVariables) console.warn(`No matches found in function: ${fnStr}`);
            return;
        }

        for (const match of matches) {
            if (Variable.Dependent.debuggExtractVariables) console.log(`Found match: ${match}`);
            const parts = match.split('.');
            if (parts.length === 1) {
                if (Variable.Dependent.debuggExtractVariables) console.warn(`Match '${match}' only has 1 part, so it is not a valid path: ${parts}`);
                continue;
            }

            let current = Zon;
            let i = 0;
            const firstPart = parts[0];
            if (firstPart === 'Zon') {
                i = 1;
            }
            else if (firstPart === 'this') {
                if (!thisContext) {
                    if (Variable.Dependent.debuggExtractVariables) console.warn(`'this' context is not defined, cannot resolve path: ${match}`);
                    continue;
                }

                current = thisContext;
                i = 1;
            }

            for (; i < parts.length - 1; i++) {
                current = this.trygetPart(current, parts[i]);
                if (!current)
                    break;

                if (current instanceof Variable.Base)
                    break;
            }

            if (!current) {
                if (Variable.Dependent.debuggExtractVariables) console.warn(`Failed to find second in ${match}.  ((Zon/this).###...###.second.last)  Current is null or undefined: ${current}`);
                continue;
            }

            const second = current;

            //(Zon/this).###...###.second.last; Check if second is an object such as Zon.topUI.rect._left.value
            const secondType = typeof second;
            if (secondType === "object") {
                if (this.tryExtractVariablesFromObject(second)) {
                    //console.log(`Extracted variables from: ${match} (fnStr: ${fnStr})`);
                    continue;
                }
            }

            //Check type of last part
            const lastStr = parts[i];
            const lastDesc = this.getDescription(second, lastStr);
            if (!lastDesc) {
                if (Variable.Dependent.debuggExtractVariables) console.warn(`Failed to get a description for ${lastStr} on ${second}`);
                continue;
            }

            if (lastDesc.value) {
                const lastType = typeof lastDesc.value;
                if (lastType === 'object') {
                    const last = this.trygetPart(second, lastStr);
                    if (this.tryExtractVariablesFromObject(last)) {
                        //console.log(`Extracted variables from: ${match} (fnStr: ${fnStr})`);
                        continue;
                    }

                    if (Variable.Dependent.debuggExtractVariables) console.warn(`last is an object, but tryExtractVariablesFromObject failed. ${second}[${lastStr}] -> ${last}`);
                    continue;
                }

                if (Variable.Dependent.debuggExtractVariables) console.warn(`lastDesc.value exists, but last is not an object.  ${second}[${lastStr}], lastDesc.value: ${lastDesc.value}`);
                continue;
            }
            else if (lastDesc.get) {
                //Check for my standard organization of Variable getters/setters such as .left => this._left.value
                if (lastStr[0] !== '_') {
                    let lastPrivStr = `_${lastStr}`;
                    let lastPrivDesc = this.getDescription(second, lastPrivStr);
                    if (lastPrivDesc) {
                        const lastPriv = this.trygetPart(second, lastPrivStr);
                        if (typeof lastPriv === 'object') {
                            if (this.tryExtractVariablesFromObject(lastPriv)) {
                                //console.log(`Extracted variables from: ${match} (fnStr: ${fnStr})`);
                                continue;
                            }
                        }
                        else {
                            if (Variable.Dependent.debuggExtractVariables) console.warn(`${lastPrivStr} is not an object.  ${second}[${lastPrivStr}] -> ${lastPriv}`);
                            continue;
                        }
                    }

                    if (Variable.Dependent.debuggExtractVariables) console.warn(`${lastStr} exists on ${second}, but lastPrivDesc is null.`);
                }

                if (Variable.Dependent.debuggExtractVariables) console.warn(`last is a getter.  Not possible for a Variable to be directly used in a math function, so not accessing it.  ${second}[${lastStr}]`);
                continue;
            }

            console.warn(`Failed to find a variable for ${match}`);
        }
    }
    trygetPart(current, part) {
        try {
            const newObj = current[part];
            const type = typeof newObj;
            if (newObj === null || newObj === undefined || type !== "object" && type !== "function")
                throw new Error(`newObj is null, undefined, or not an object/function.  newObj: ${newObj}, type: ${type}`);

            return newObj;
        }
        catch (e) {
            if (Variable.Dependent.debuggExtractVariables) console.warn(`Error accessing ${current}[${part}]: ${e}`);
            return null;
        }
    }
    getDescription(current, part) {
        let obj = current;
        while (obj) {
            const desc = Object.getOwnPropertyDescriptor(obj, part);
            if (desc)
                return desc;

            obj = Object.getPrototypeOf(obj);
        }

        return null;
    }
    tryExtractVariablesFromObject(current) {
        if (current instanceof Variable.Base) {
            if (Variable.Dependent.debuggExtractVariables) console.log(`Adding onChangedAction to object: ${current}`);
            //current.onChangedAction.add(this.onChanged);
            this.dependentActions.add(current.onChangedAction);
            return true;
        }
        else if (current instanceof Actions.Action) {
            if (Variable.Dependent.debuggExtractVariables) console.warn(`Adding onChangedAction to Action object: ${current}`);
            this.dependentActions.add(current);
            //current.add(this.onChanged);
            return true;
        }
        else {
            return false;
        }
    }
    set value(newValue) {
        throw new Error("Cannot set value of DependentVariable");
    }
    get value() {
        if (this.needsRecalculate) {
            this._value = this.getValue();
            if (this._dependentActionsLinked) {
                this.needsRecalculate = false;
            }
            else if (zonDebug) {
                console.warn(`DependentVariable get value() when _dependentActionsLinked is false.  This shouldn't happen frequently.  name: ${this._thisObj ? this._thisObj.constructor.name : 'undefined'}, this.getValue: ${this.getValue}, this._value: ${this._value}`);
            }
        }

        return this._value;
    }
    onChanged = () => {
        this.needsRecalculate = true;
        super.onChanged();
    }
    reset() {
        this.needsRecalculate = true;
        this.onChanged();
    }
    
    resetSkipActions() {
        this.needsRecalculate = true;
    }
}

Variable.EquationVar = class EquationVariable extends Variable.Base {
    constructor(equationClass, variables, equationString, name) {
        throw new Error(`EquationVar isn't finished.`);
        super(name);
        const variablesSet = new Set(variables);
        this._extractGlobalVariables(equationString, variables, variablesSet);
        this.equation = equationClass.create(name, equationString, variables);
    }

    _extractGlobalVariables(equationString, variables, variablesSet) {
        const matches = [];
        let startIndex = -1;
        let i = 0;
        for (; i < equationString.length; i++) {
            const char = equationString[i];
            if (startIndex === -1) {
                if (char >= 'A' && char <= 'Z')
                    startIndex = i;
            }
            else if (char < '0' || char > 'z' || (char > '9' && char < 'A') || (char > 'Z' && char < 'a' && char !== '_')) {
                const variableName = equationString.substring(startIndex, i);
                startIndex = -1;
                matches.push(variableName);
            }
        }

        if (startIndex !== -1) {
            const variableName = equationString.substring(startIndex, i);
            matches.push(variableName);
        }

        for (const match of matches) {
            if (variablesSet.has(match))
                throw new Error(`Variable ${match} already exists in the variables list, cannot add it again.`);

            if (!Zon.GlobalVariables.has(match))
                throw new Error(`Variable ${match} not found in Zon.GlobalVariables.  Make sure it is registered before using it in an equation.`);

            variables.push(match);
            variablesSet.add(match);
        }
    }

    get value() {
        return this.equation.value;
    }
    getValueNewVariables(newVariables) {
        return this.equation.getValueNewVariables(newVariables);
    }
}

Variable.EquationVar_N = class EquationVariable_N extends Variable.EquationVar {
    constructor(equationString, name, variables = []) {
        super(Zon.Equation_N, variables, equationString, name);
    }
}

Variable.EquationVar_BN = class EquationVariable_BN extends Variable.EquationVar {
    constructor(equationString, name, variables = []) {
        super(Zon.Equation.BigNumberOperationSet, variables, equationString, name);
    }
}

Variable.EquationVar_B = class EquationVariable_B extends Variable.EquationVar {
    constructor(equationString, name, variables = []) {
        super(Zon.Equation.BoolOperationSet, variables, equationString, name);
    }
}