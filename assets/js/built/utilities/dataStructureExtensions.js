"use strict";

Set.prototype.getRandom = function() {
    if (this.size === 0)
        return null;
        
    const randomIndex = Math.floor(Math.random() * this.size);
    let index = 0;
    for (const item of this) {
        if (index === randomIndex) {
            return item;
        }

        index++;
    }

    throw new Error(`Random item not found in set.  ${this}, ${this.size}, ${randomIndex}`);
}

Array.prototype.swapPop = function(index) {
    if (index < 0 || index >= this.length)
        return null;

    const item = this[index];
    this[index] = this[this.length - 1];
    this.pop();
    return item;
}