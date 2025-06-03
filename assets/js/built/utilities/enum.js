"use strict";

Enum.createEnum = (enumObj, namesArr, includeNone = true, includeCount = true) => {
    for (const [key, value] of Object.entries(enumObj)) {
        if (value < 0)
            throw new Error(`Enum value must be >= 0. Found ${value} for ${key}`);

        namesArr[value] = key;
    }

    if (includeCount) {
        enumObj.COUNT = namesArr.length;
    }

    if (includeNone) {
        enumObj.NONE = namesArr.length;
    }

    Enum.freezeEnum(enumObj, namesArr);
}

Enum.freezeEnum = (enumObj, namesArr) => {
    Enum.freezeObj(enumObj);
    Enum.freezeObj(namesArr);
}

Enum.freezeObj = (obj) => {
    Object.freeze(obj);
    return obj;
}