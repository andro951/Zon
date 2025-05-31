"use strict";

const Actions = {};

Actions.Action = class {
    constructor() {
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

        this.callbacks.delete(callback);
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
        this.call(...args);
        this.clear();
    }
}