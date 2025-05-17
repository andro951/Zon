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