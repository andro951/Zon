"use strict";

Struct.Queue = class Queue {
    constructor() {
        this._head = null;
        this._tail = null;
        this.length = 0;
    }

    add(value) {
        const newNode = { value, next: null };
        if (!this._head) {
            this._head = newNode;
            this._tail = newNode;
            this.length = 1;
            return;
        }

        this._tail.next = newNode;
        this._tail = newNode;
        this.length++;
    }

    isEmpty() {
        return this.length === 0;
    }

    get first() {
        return this._head ? this._head.value : undefined;
    }

    //Returns true if Queue is not empty.
    next() {
        if (!this._head)
            return false;
        
        this._head = this._head.next;
        this.length--;
        if (!this._head)
            this._tail = null;

        return true;
    }
}