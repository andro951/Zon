"use strict";

const Variable = {}

Variable.Base = class {
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
        if (Variable.Base.paused) {
            for (const callback of this.onChangedAction.callbacks) {
                Variable.Base.pausedCallbacks.add(callback);
            }
            
            return;
        }

        this.onChangedAction.call();
    }

    copyData(newVariable) {
        if (!(newVariable instanceof Variable.Base))
            throw new Error("newVariable must be a VariableBase", newVariable);

        newVariable.onChangedAction.setCallbacks(this.onChangedAction.callbacks);
        
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
}

Variable.Value = class extends Variable.Base {
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

Variable.Dependent = class extends Variable.Base {
    constructor(getValue, ...args) {
        super();
        ///\b(?:\w+\.)+\w+\b/g
        ///\b(?:\w+\.)+\w+\.value\b/g
        this.getValue = getValue;
        this.needsRecalculate = true;
        args.forEach(arg => {
            if (arg instanceof Variable.Base) {
                arg.onChangedAction.add(this.onChanged);
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
    onChanged = () => {
        this.needsRecalculate = true;
        super.onChanged();
    }
}