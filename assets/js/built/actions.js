"use strict";

const Actions = {};

Actions.Action = class {
    constructor() {
        this.callbacks = new Map();
    }

    add(key, callback) {
        this.callbacks.set(key, callback);
    }

    remove(key) {
        this.callbacks.delete(key);
    }

    call(...args) {
        this.callbacks.forEach(callback => callback(...args));
    }

    has(key) {
        return this.callbacks.has(key);
    }

    clear() {
        this.callbacks.clear();
    }

    callAndClear(...args) {
        this.call(...args);
        this.clear();
    }

    setCallbacks(callbacks) {
        this.callbacks = new Map(callbacks);
    }
}