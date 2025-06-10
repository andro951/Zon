"use strict";

Zon.classID = (obj) => {
    if (!obj || !obj.constructor || !obj.constructor.name)
        throw new Error("Invalid object");
    
    return `${Zon.name}:${obj.constructor.name}`;
};

Number.prototype.toBigNumber = function() {
    return Struct.BigNumber.create(this);
}

Zon.Util.getType = (obj) => {
    const type = typeof obj;
    if (type === "object")
        return obj.constructor.name;

    return type;
}