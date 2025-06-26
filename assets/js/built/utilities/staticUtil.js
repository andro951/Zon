"use strict";

Zon.classID = (obj) => {
    if (!obj || !obj.constructor || !obj.constructor.name)
        throw new Error("Invalid object");
    
    return `${Zon.name}:${obj.constructor.name}`;
};

Number.prototype.toBigNumber = function() {
    return Struct.BigNumber.create(this);
}

Zon.Util.getTypeStr = (obj) => {
    const type = typeof obj;
    if (type === "object")
        return obj.constructor.name;

    return type;
}

// Zon.Util.getTypeID = (obj) => {
//     const typeStr = Zon.Util.getTypeStr(obj);
//     switch (typeStr) {
//         case `number`:
//             return Zon.TypeID.NUMBER;
//         case `boolean`:
//             return Zon.TypeID.BOOL;
//         case `BigNumber`:
//             return Zon.TypeID.BIG_NUMBER;
//         default:
//             return Zon.TypeID.NONE;
//     }
// }