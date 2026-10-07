"use strict";

const Actions = {};

Actions.Action = class {
    constructor(name) {
        if (typeof name !== 'string' || name === '')
            throw new Error('Action name must be a non-empty string');

        this.name = name;
        this.callbacks = new Set();
    }

    add(callback) {
        if (typeof callback !== 'function')
            throw new Error('Callback must be a function');
            
        this.callbacks.add(callback);
    }

    remove(callback) {
        if (typeof callback !== 'function')
            throw new Error('Callback must be a function');

        const existed = this.callbacks.delete(callback);
        if (zonDebug && !existed) {
            throw new Error('Callback not found in action callbacks');
        }
    }

    call(...args) {
        for (const callback of this.callbacks) {
            callback(...args);
        }
    }

    has(callback) {
        return this.callbacks.has(callback);
    }

    clear() {
        this.callbacks.clear();
    }

    callAndClear(...args) {
        while (this.callbacks.size > 0) {
            const callbacks = this.callbacks;
            this.callbacks = new Set();
            for (const callback of callbacks) {
                callback(...args);
            }
        }
    }
}

Actions.VarOnChangedAction = class extends Actions.Action {
    constructor(name, variable) {
        super(name);
        if (!(variable instanceof Variable.Base))
            throw new Error('variable must be an instance of Variable.Base');

        this.variable = variable;
    }

    transferToNewVariable(newVariable) {
        if (!(newVariable instanceof Variable.Base))
            throw new Error('newVariable must be an instance of Variable.Base');

        this.name = newVariable.onChangedAction.name;
        this.variable = newVariable;
        this.variable.onChangedAction = this;
    }
}

// Actions.DebugAction = class DebugAction {
//     constructor(name) {
//         if (typeof name !== 'string' || name === '')
//             throw new Error('Action name must be a non-empty string');

//         this.name = name;
//         this.callbacks = new Map();//map of callback function, set of caller names
//     }

//     add(callback, caller) {
//         if (typeof callback !== 'function')
//             throw new Error('Callback must be a function');
            
//         if (!this.callbacks.has(callback)) {
//             this.callbacks.set(callback, new Set());
//         }

//         if (caller !== undefined) {
//             if (typeof caller !== 'string' || caller === '')
//                 throw new Error('Caller must be a non-empty string when provided');

//             this.callbacks.get(callback).add(caller);
//         }
//     }

//     remove(callback) {
//         throw new Error('Cannot remove callbacks from DebugAction');
//     }

//     call(...args) {
//         // for (const [callback, callers] of this.callbacks) {
//         //     console.log(`${callback} called by: ${[...callers].join(', ')}`);
//         //     callback(...args);
//         // }

//         throw new Error('Cannot call DebugAction directly. Use callAndClear to call and clear callbacks, which will log caller information.');
//     }

//     has(callback) {
//         throw new Error('Cannot check for callbacks in DebugAction');
//     }

//     clear() {
//         throw new Error('Cannot clear callbacks from DebugAction');
//     }

//     callAndClear(...args) {
//         while (this.callbacks.size > 0) {
//             const callbacks = this.callbacks;
//             this.callbacks = new Map();
//             for (const [callback, callers] of callbacks) {
//                 console.log(`${callback} called by: ${[...callers].join(', ')}`);
//                 callback(...args);
//             }
//         }
//     }
// }