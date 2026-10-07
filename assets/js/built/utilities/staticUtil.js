"use strict";

Zon.classID = (obj) => {
    if (!obj || !obj.constructor || !obj.constructor.name)
        throw new Error("Invalid object");
    
    return `${Zon.name}:${obj.constructor.name}`;
};

Zon.Util.isSimpleType = (value) => {
    return (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean');
}

Number.prototype.toBigNumber = function() {
    return Struct.BigNumber.create(this);
}

Number.prototype.BN = function() {
    return Struct.BigNumber.create(this);
}

Number.prototype.equals = function(other) {
    return this.valueOf() === other;
}

Number.prototype.notEquals = function(other) {
    return this.valueOf() !== other;
}

String.prototype.equals = function(other) {
    return this.valueOf() === other;
}

String.prototype.notEquals = function(other) {
    return this.valueOf() !== other;
}

Boolean.prototype.equals = function(other) {
    return this.valueOf() === other;
}

Boolean.prototype.notEquals = function(other) {
    return this.valueOf() !== other;
}

Zon.Util.getTypeStr = (obj) => {
    const type = typeof obj;
    if (type === "object")
        return obj.constructor.name;

    return type;
}

Zon.log = (message, uiElement = Zon.device) => {
    if (typeof message !== "string")
        throw new Error("Message must be a string");

    if (!(uiElement instanceof Zon.UI.UIElementBase))
        throw new Error("UI element must be an instance of Zon.UI.UIElementBase");

    console.log(message);
    Zon.UI.Popup.makePopup(`System Message`, message, [
        new Zon.UI.PopupButtonInfo(`Close`),
    ], uiElement);
}

Zon.warn = (message, uiElement = Zon.device) => {
    if (typeof message !== "string")
        throw new Error("Message must be a string");

    if (!(uiElement instanceof Zon.UI.UIElementBase))
        throw new Error("UI element must be an instance of Zon.UI.UIElementBase");

    console.warn(message);
    const modifyFunc = (panel) => {
        panel.borderColor.value = Struct.Color.fromUInt(0xAAAA00FF);
    }
    
    Zon.UI.Popup.makePopup(`Warning!`, message, [
        new Zon.UI.PopupButtonInfo(`Copy`, Struct.Color.fromUInt(0x00AAAAFF), () => {
            navigator.clipboard.writeText(message).catch((err) => {
                console.error("Failed to copy text: ", err);
            });
        }, false),
        new Zon.UI.PopupButtonInfo(`Close`),
    ], uiElement, modifyFunc);
}

Zon.error = (message, uiElement = Zon.device) => {
    if (typeof message !== "string")
        throw new Error("Message must be a string");

    if (!(uiElement instanceof Zon.UI.UIElementBase))
        throw new Error("UI element must be an instance of Zon.UI.UIElementBase");

    console.error(message);
    const modifyFunc = (panel) => {
        panel.borderColor.value = Struct.Color.fromUInt(0xAA0000FF);
    }
    
    Zon.UI.Popup.makePopup(`Error!`, message, [
        new Zon.UI.PopupButtonInfo(`Copy`, Struct.Color.fromUInt(0x00AAAAFF), () => {
            navigator.clipboard.writeText(message).catch((err) => {
                console.error("Failed to copy text: ", err);
            });
        }, false),
        new Zon.UI.PopupButtonInfo(`Close`),
    ], uiElement, modifyFunc);
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