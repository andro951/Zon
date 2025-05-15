"use strict";

const DataTypes = {}

DataTypes.VariableBase = class {
    constructor() {
        this.onChangedAction = new Actions.Action();
    }

    valueOf() {
        return this.value;
    }

    get value() {
        throw new Error("value getter not implemented");
    }

    onChanged() {
        if (DataTypes.VariableBase.paused) {
            this.onChangedAction.callbacks.forEach((callback, key) => DataTypes.VariableBase.pausedCallbacks.add(key, callback));
            return;
        }

        this.onChangedAction.call();
    }

    copyData(newVariable) {
        if (!(newVariable instanceof DataTypes.VariableBase))
            throw new Error("newVariable must be a VariableBase", newVariable);

        newVariable.onChangedAction.setCallbacks(this.onChangedAction.callbacks);
        
        return newVariable;
    }

    static paused = false;
    static pausedCallbacks = new Actions.Action();

    static pause() {
        DataTypes.VariableBase.paused = true;
    }

    static resume() {
        DataTypes.VariableBase.paused = false;
        DataTypes.VariableBase.pausedCallbacks.callAndClear();
    }
}

DataTypes.Variable = class extends DataTypes.VariableBase {
    constructor(initialValue) {
        super();
        this._value = initialValue;
    }

    set(value) {
        if (this._value === value)
            return;

        this._value = value;
        this.onChanged();
    }

    get value() {
        return this._value;
    }
}

DataTypes.DependentVariable = class extends DataTypes.VariableBase {
    constructor(getValue, ...args) {
        super();
        this.getValue = getValue;
        this.needsRecalculate = true;
        args.forEach(arg => {
            if (arg instanceof DataTypes.VariableBase) {
                arg.onChangedAction.add(this, () => this.onChanged());
            }
            else {
                throw new Error("DependentVariable can only depend on VariableBase instances", arg);
            }
        });

        this._value = undefined;
    }
    set(value) {
        throw new Error("Cannot set value of DependentVariable");
    }
    get value() {
        if (this.needsRecalculate) {
            this._value = this.getValue();
            this.needsRecalculate = false;
        }

        return this._value;
    }
    onChanged() {
        this.needsRecalculate = true;
        super.onChanged();
    }
}