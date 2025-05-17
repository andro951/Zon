"use strict";

Zon.classID = (obj) => {
    if (!obj || !obj.constructor || !obj.constructor.name)
        throw new Error("Invalid object");
    
    return `${Zon.name}:${obj.constructor.name}`;
};