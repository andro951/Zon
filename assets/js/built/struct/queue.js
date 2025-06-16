"use strict";

Struct.Queue = class Queue {
    constructor() {
        this._head = null;
        this._tail = null;
        this.size = 0;
    }

    add(value) {
        const newNode = { value, next: null };
        if (!this._head) {
            this._head = newNode;
            this._tail = newNode;
            this.size = 1;
            return;
        }

        this._tail.next = newNode;
        this._tail = newNode;
        this.size++;
    }

    get isEmpty() {
        return this.size === 0;
    }

    get first() {
        return this._head ? this._head.value : undefined;
    }

    //Returns true if Queue is not empty.
    next() {
        if (!this._head)
            return false;
        
        this._head = this._head.next;
        this.size--;
        if (!this._head)
            this._tail = null;

        return this.size > 0;
    }
}

Struct.Deque = class Deque {
    constructor() {
        this._head = null;
        this._tail = null;
        this.size = 0;
    }

    add(value) {
        const newNode = { value, next: null, prev: null };
        if (!this._head) {
            this._head = newNode;
            this._tail = newNode;
            this.size = 1;
            return;
        }

        newNode.prev = this._tail;
        this._tail.next = newNode;
        this._tail = newNode;
        this.size++;
    }
    addToFront(value) {
        const newNode = { value, next: null, prev: null };
        if (!this._head) {
            this._head = newNode;
            this._tail = newNode;
            this.size = 1;
            return;
        }

        newNode.next = this._head;
        this._head.prev = newNode;
        this._head = newNode;
        this.size++;
    }

    get isEmpty() {
        return this.size === 0;
    }

    get first() {
        return this._head ? this._head.value : undefined;
    }

    get last() {
        return this._tail ? this._tail.value : undefined;
    }

    popFirst() {
        if (!this._head)
            return undefined;

        const value = this._head.value;
        this._remove(this._head);
        return value;
    }

    popLast() {
        if (!this._tail)
            return undefined;

        const value = this._tail.value;
        this._remove(this._tail);
        return value;
    }

    //Returns true if Deque is not empty.
    next() {
        this._remove(this._head);

        return this.size > 0;
    }

    //Returns true if Deque is not empty.
    prev() {
        this._remove(this._tail);

        return this.size > 0;
    }

    _remove(node) {
        if (!node)
            throw new Error("Node cannot be null or undefined.");

        if (!this._head)
            return false;

        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this._head = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this._tail = node.prev;
        }

        this.size--;

        return true;
    }

    removeWhere(predicate) {
        let current = this._head;
        let removed = false;
        while (current) {
            const next = current.next;
            if (predicate(current.value))
                removed |= this._remove(current);

            current = next;
        }

        return removed;
    }
}

Struct.NodeArray = class NodeArray {
    constructor(name) {
        this.name = name;
        this._nodes = [];
        this.onChangedAction = new Actions.Action();
    }

    get length() {
        return this._nodes.length;
    }

    onChanged = () => {
        if (Variable.Base.paused) {
            for (const callback of this.onChangedAction.callbacks) {
                Variable.Base.pausedCallbacks.add(callback);
            }

            return;
        }

        this.onChangedAction.call();
    }

    push(value) {
        const node = this._makeNode(value, this._nodes.length);
        this._nodes.push(node);
        this.onChanged();
        return node;
    }

    get(index) {
        if (index < 0 || index >= this._nodes.length)
            return undefined;

        return this._nodes[index];
    }

    pop() {
        const node = this._nodes.pop();
        if (node) {
            this._revertNode(node);
            this.onChanged();
        }

        return node;
    }

    shift() {
        const node = this._nodes.shift();
        this._reindex();
        if (node) {
            this._revertNode(node);
            this.onChanged();
        }

        return node;
    }

    unshift(value) {
        const node = this._makeNode(value, 0);
        this._nodes.unshift(node);
        this._reindex();
        this.onChanged();
        return node;
    }

    splice(start, deleteCount, ...items) {
        const removed = this._nodes.splice(start, deleteCount, ...items.map((v, i) => this._makeNode(v, start + i)));
        this._reindex(start);
        if (removed.length > 0 || items.length > 0)
            this.onChanged();
        
        return removed.map(node => this._revertNode(node));
    }

    map(callback) {
        return this._nodes.map((node, i) => callback(node, i, this));
    }

    reduce(callback, initialValue) {
        if (this._nodes.length === 0 && initialValue === undefined)
            throw new TypeError("Reduce of empty NodeArray with no initial value");

        let accumulator, startIndex;

        if (initialValue !== undefined) {
            accumulator = initialValue;
            startIndex = 0;
        } else {
            accumulator = this._nodes[0];
            startIndex = 1;
        }

        for (let i = startIndex; i < this._nodes.length; i++) {
            accumulator = callback(accumulator, this._nodes[i], i, this);
        }

        return accumulator;
    }

    at(index) {
        if (index < 0) {
            index = this._nodes.length + index;
        }

        if (index < 0 || index >= this._nodes.length) {
            return undefined;
        }

        return this._nodes[index];
    }

    forEach(callback) {
        this._nodes.forEach((node, i) => callback(node, i, this));
    }

    filter(callback) {
        const filtered = this._nodes.filter((node, i) => callback(node, i, this));
        return filtered;
    }

    find(callback) {
        return this._nodes.find((node, i) => callback(node, i, this));
    }

    indexOf(node) {
        return this._nodes.indexOf(node);
    }

    clear() {
        if (this._nodes.length === 0)
            return;

        for (const node of this._nodes) {
            this._revertNode(node);
        }

        this._nodes.length = 0;
        this.onChanged();
    }

    replaceAll(newValues) {
        const newArray = [...newValues].map((value, i) => this._makeNode(value, i));
        if (newArray.length === 0 && this._nodes.length === 0)
            return;

        for (const node of this._nodes) {
            this._revertNode(node);
        }

        this._nodes = newArray;
        this.onChanged();
    }

    _reindex(start = 0) {
        for (let i = start; i < this._nodes.length; i++) {
            this._nodes[i]._index = i;
        }
    }

    _makeNode(value, index) {
        if (typeof value !== "object")
            throw new Error(`Value must be an object: ${value}`);

        if (!value)
            throw new Error(`Value cannot be null or undefined: ${value}`);

        if (value._nodeArray !== undefined)
            throw new Error(`Value already belongs to a NodeArray: ${value._nodeArray.name}`);

        if (value._index !== undefined)
            throw new Error(`Can't convert to node because _index is already defined: ${value._index}`);
        
        if (value.remove !== undefined)
            throw new Error(`Can't convert to node because remove already defined: ${value.remove}`);

        if (value.next !== undefined)
            throw new Error(`Can't convert to node because next already defined: ${value.next}`);

        if (value.prev !== undefined)
            throw new Error(`Can't convert to node because prev already defined: ${value.prev}`);

        if (value.insertBefore !== undefined)
            throw new Error(`Can't convert to node because insertBefore already defined: ${value.insertBefore}`);

        if (value.insertAfter !== undefined)
            throw new Error(`Can't convert to node because insertAfter already defined: ${value.insertAfter}`);

        Object.defineProperty(value, "_nodeArray", {
            value: this,
            writable: false,
            configurable: true,
            enumerable: false
        });

        Object.defineProperty(value, "removeGetNext", {
            value: () => {
                const nextNode = value._index + 1 < value._nodeArray.length ? value._nodeArray.get(value._index + 1) : undefined;
                value._nodeArray.splice(value._index, 1);
                return nextNode;
            },
            writable: false,
            configurable: true,
            enumerable: false
        });

        Object.defineProperty(value, "removeGetPrev", {
            value: () => {
                const prevNode = value._index - 1 >= 0 ? value._nodeArray.get(value._index - 1) : undefined;
                value._nodeArray.splice(value._index, 1);
                return prevNode;
            },
            writable: false,
            configurable: true,
            enumerable: false
        });

        Object.defineProperty(value, "next", {
            value: () => value._nodeArray.get(value._index + 1),
            writable: false,
            configurable: true,
            enumerable: false
        });

        Object.defineProperty(value, "prev", {
            value: () => value._nodeArray.get(value._index - 1),
            writable: false,
            configurable: true,
            enumerable: false
        });

        Object.defineProperty(value, "insertBefore", {
            value: (newValue) => {
                value._nodeArray.splice(value._index, 0, newValue);
                return value._nodeArray.get(value._index);
            },
            writable: false,
            configurable: true,
            enumerable: false
        });

        Object.defineProperty(value, "insertAfter", {
            value: (newValue) => {
                value._nodeArray.splice(value._index + 1, 0, newValue);
                return value._nodeArray.get(value._index + 1);
            },
            writable: false,
            configurable: true,
            enumerable: false
        });

        Object.defineProperty(value, "_index", {
            value: index,
            writable: true,
            configurable: true,
            enumerable: false
        });

        return value;
    }

    _revertNode(value) {
        if (value._nodeArray !== this)
            throw new Error(`Value does not belong to this NodeArray: ${value._nodeArray.name}`);

        delete value._index;
        delete value._nodeArray;

        delete value.removeGetNext;
        delete value.removeGetPrev;
        delete value.next;
        delete value.prev;
        delete value.insertBefore;
        delete value.insertAfter;

        return value;
    }

    [Symbol.iterator]() {
        let index = 0;
        const nodes = this._nodes;
        return {
            next() {
                if (index < nodes.length) {
                    return { value: nodes[index++], done: false };
                } else {
                    return { done: true };
                }
            }
        };
    }
}