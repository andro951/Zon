"use strict";

/*
//Not actually used.  Just here for easy copy-pasting.
Zon.SaveLoadHelper = class {
    write = (writer) => {
        
    }
    read = (reader) => {
        
    }
    get = () => {
        
    }
    set = () => {
        
    }
}

*/

Zon.PostLoadSetAction = class PostLoadSetAction {
    constructor(action) {
        this.action = action;
    }

    write = (writer) => {}
    read = (reader) => {}
    get = () => {}
    set = () => {
        this.action.call();
    }
    
}

Zon.IHasSaveLoadHelper = class IHasSaveLoadHelper {
    constructor() {
        if (new.target === Zon.IHasSaveLoadHelper) {
            throw new TypeError("Cannot construct IHasSaveLoadHelper instances directly");
        }
    }

    saveLoadHelper = () => {
        throw new Error("SaveLoadHelper() not implemented");
    }
}

Zon.SaveLoadHelper = class SaveLoadHelper {
    constructor(get, set) {
        if (new.target === Zon.SaveLoadHelper) {
            throw new TypeError("Cannot construct SaveLoadHelper instances directly");
        }

        this.value = null;
        this.get = () => this.value = get();
        this.set = () => set(this.value);
    }
    write = (writer) => {
        this._write(writer, this.value);
    }
    _write = (writer, value) => {
        throw new Error("_write() not implemented");
    }
    read = (reader) => {
        this.value = this._read(reader);
    }
    _read = (reader) => {
        throw new Error("_read() not implemented");
    }
}

Zon.SaveLoadHelper_T = class SaveLoadHelper_T extends Zon.SaveLoadHelper {
    constructor(get, set) {
        super(get, set);
    }
    static fromVariable(variable) {
        return new Zon.SaveLoadHelper_T(() => variable.value, (value) => variable.value = value);
    }
    _write = (writer, value) => {
        value.write(writer);
    }
    _read = (reader) => {
        return Numbers.Triple.read(reader);
    }
}

Zon.SaveLoadHelper_I32 = class SaveLoadHelper_I32 extends Zon.SaveLoadHelper {
    constructor(get, set, length = Binary.BitExtractor.INT_32_BITS, includeSign = true) {
        super(get, set);
        this.length = typeof length === "number" ? { value: length } : length; // Ensure length is an object with a value property
        this.includeSign = includeSign;
    }
    static fromVariable(variable, length = Binary.BitExtractor.INT_32_BITS, includeSign = true) {
        return new Zon.SaveLoadHelper_I32(() => variable.value, (value) => variable.value = value, length, includeSign);
    }
    _write = (writer, value) => {
        if (this.includeSign) {
            writer.writeInt32(value, this.length.value);
        } else {
            if (value < 0)
                throw new Error(`SaveLoadHelper_I32; Tried to WriteValue(${value}) not including sign, but it is negative.`);
            writer.writeUInt32(value >>> 0, this.length.value);
        }
    }
    _read = (reader) => {
        if (this.includeSign) {
            return reader.readInt32(this.length.value);
        } else {
            return reader.readUInt32(this.length.value);
        }
    }
}

Zon.SaveLoadHelper_I32_AL = class SaveLoadHelper_I32_AL extends Zon.SaveLoadHelper_I32 {
    constructor(get, set, includeSign = true) {
        super(get, set);
        this.includeSign = includeSign;
    }
    static fromVariable = (variable, includeSign = true) => {
        return new Zon.SaveLoadHelper_I32_AL(() => variable.value, (value) => variable.value = value, includeSign);
    }
    _write = (writer, value) => {
        if (this.includeSign) {
            writer.writeInt32AutoLength(value);
        } else {
            if (value < 0)
                throw new Error(`SaveLoadHelper_I32_AL; Tried to WriteValue(${value}) not including sign, but it is negative.`);

            writer.writeUInt32AutoLength(value >>> 0);
        }
    }
    _read = (reader) => {
        if (this.includeSign) {
            return reader.readInt32AutoLength();
        } else {
            return reader.readUInt32AutoLength();
        }
    }
}

Zon.SaveLoadHelper_UI32 = class SaveLoadHelper_UI32 extends Zon.SaveLoadHelper {
    constructor(get, set, length = Binary.BitExtractor.UINT_32_BITS) {
        super(get, set);
        this.length = typeof length === "number" ? { value: length } : length; // Ensure length is an object with a value property
    }
    static fromVariable(variable, length = Binary.BitExtractor.UINT_32_BITS) {
        return new Zon.SaveLoadHelper_UI32(() => variable.value, (value) => variable.value = value, length);
    }
    _write = (writer, value) => {
        writer.writeUInt32(value >>> 0, this.length.value);
    }
    _read = (reader) => {
        return reader.readUInt32(this.length.value);
    }
}

Zon.SaveLoadHelper_UI32_AL = class SaveLoadHelper_UI32_AL extends Zon.SaveLoadHelper {
    constructor(get, set) {
        super(get, set);
    }
    static fromVariable(variable) {
        return new Zon.SaveLoadHelper_UI32_AL(() => variable.value, (value) => variable.value = value);
    }
    _write = (writer, value) => {
        writer.writeUInt32AutoLength(value >>> 0);
    }
    _read = (reader) => {
        return reader.readUInt32AutoLength();
    }
}

Zon.SaveLoadHelper_Color = class SaveLoadHelper_Color extends Zon.SaveLoadHelper {
    constructor(get, set) {
        super(get, set);
    }
    static fromVariable(variable) {
        return new Zon.SaveLoadHelper_Color(() => variable.value.uint, (value) => variable.value.uint = value);
    }
    _write = (writer, value) => {
        writer.writeUInt32(value.uint >>> 0);
    }
    _read = (reader) => {
        return reader.readUInt32();
    }
}

Zon.SaveLoadHelper_I53 = class SaveLoadHelper_I53 extends Zon.SaveLoadHelper {
    constructor(get, set, length = Binary.BitExtractor.INT_53_PREFIX_BITS, includeSign = true) {
        super(get, set);
        this.length = typeof length === "number" ? { value: length } : length; // Ensure length is an object with a value property
    }
    static fromVariable(variable, length = Binary.BitExtractor.INT_53_PREFIX_BITS, includeSign = true) {
        return new Zon.SaveLoadHelper_I53(() => variable.value, (value) => variable.value = value, length, includeSign);
    }
    _write = (writer, value) => {
        if (this.includeSign) {
            writer.writeInt53(value, this.length.value);
        } else {
            if (value < 0)
                throw new Error(`SaveLoadHelper_I53; Tried to WriteValue(${value}) not including sign, but it is negative.`);

            writer.writeUInt53(value, this.length.value);
        }
    }
    _read = (reader) => {
        if (this.includeSign) {
            return reader.readInt53(this.length.value);
        } else {
            return reader.readUInt53(this.length.value);
        }
    }
}

Zon.SaveLoadHelper_I53_AL = class SaveLoadHelper_I53_AL extends Zon.SaveLoadHelper {
    constructor(get, set, includeSign = true) {
        super(get, set);
        this.includeSign = includeSign;
    }
    static fromVariable = (variable, includeSign = true) => {
        return new Zon.SaveLoadHelper_I53_AL(() => variable.value, (value) => variable.value = value, includeSign);
    }
    _write = (writer, value) => {
        if (this.includeSign) {
            writer.writeInt53AutoLength(value);
        } else {
            if (value < 0)
                throw new Error(`SaveLoadHelper_I53_AL; Tried to WriteValue(${value}) not including sign, but it is negative.`);

            writer.writeUInt53AutoLength(value);
        }
    }
    _read = (reader) => {
        if (this.includeSign) {
            return reader.readInt53AutoLength();
        } else {
            return reader.readUInt53AutoLength();
        }
    }
}

Zon.SaveLoadHelper_UI53 = class SaveLoadHelper_UI53 extends Zon.SaveLoadHelper {
    constructor(get, set, length = Binary.BitExtractor.INT_53_BITS) {
        super(get, set);
        this.length = typeof length === "number" ? { value: length } : length; // Ensure length is an object with a value property
    }
    static fromVariable(variable, length = Binary.BitExtractor.INT_53_BITS) {
        return new Zon.SaveLoadHelper_UI53(() => variable.value, (value) => variable.value = value, length);
    }
    _write = (writer, value) => {
        writer.writeUInt53(value, this.length.value);
    }
    _read = (reader) => {
        return reader.readUInt53(this.length.value);
    }
}

Zon.SaveLoadHelper_UI53_AL = class SaveLoadHelper_UI53_AL extends Zon.SaveLoadHelper {
    constructor(get, set) {
        super(get, set);
    }
    static fromVariable(variable) {
        return new Zon.SaveLoadHelper_UI53_AL(() => variable.value, (value) => variable.value = value);
    }
    _write = (writer, value) => {
        writer.writeUInt53AutoLength(value);
    }
    _read = (reader) => {
        return reader.readUInt53AutoLength();
    }
}

Zon.SaveLoadHelper_N = class SaveLoadHelper_D extends Zon.SaveLoadHelper {
    constructor(get, set) {
        super(get, set);
    }
    static fromVariable(variable) {
        return new Zon.SaveLoadHelper_N(() => variable.value, (value) => variable.value = value);
    }
    _write = (writer, value) => {
        writer.writeNumber(value);
    }
    _read = (reader) => {
        return reader.readNumber();
    }
}

Zon.SaveLoadHelper_B = class SaveLoadHelper_B extends Zon.SaveLoadHelper {
    constructor(get, set) {
        super(get, set);
    }
    static fromVariable(variable) {
        return new Zon.SaveLoadHelper_B(() => variable.value, (value) => variable.value = value);
    }
    _write = (writer, value) => {
        writer.writeBool(value);
    }
    _read = (reader) => {
        return reader.readBool();
    }
}

Zon.SaveLoadHelper_Vector = class SaveLoadHelper_Vector extends Zon.SaveLoadHelper {
    constructor(get, set) {
        super(get, set);
    }
    static fromVariable(variable) {
        return new Zon.SaveLoadHelper_Vector(() => variable.value, (value) => variable.value = value);
    }
    _write = (writer, value) => {
        value.write(writer);
    }
    _read = (reader) => {
        return Vectors.Vector.read(reader);
    }
}

Zon.LoadConstantHelper = class LoadConstantHelper {
    //This is for saving/loading a constant that other SaveLoadHelpers depend on when loading old saves.
    //Using it to store the length of stored values allows the length to be changed in future versions without breaking old saves.
    //These have to be called first when loading, or else the other SaveLoadHelpers will not work correctly.
    constructor(currentVersionValue, length) {
        this._currentVersionValue = currentVersionValue;
        this.value = this._currentVersionValue;
        this.length = length;
    }
    write = (writer) => {
        this.value = this._currentVersionValue;
        writer.writeUInt32(this.value - 1, this.length);
    }
    read = (reader) => {
        this.value = reader.readUInt32(this.length) + 1;
    }
    get = () => {
        this.value = this._currentVersionValue;
    }
    set = () => {
        this.value = this._currentVersionValue;
    }
}

Zon.LoadConstantHelper_UI32 = class LoadConstantHelper_UI32 extends Zon.LoadConstantHelper {
    constructor(currentVersionValue) {
        super(currentVersionValue, Binary.BitExtractor.INT_32_PREFIX_BITS);
    }
}

Zon.LoadConstantHelper_UI53 = class LoadConstantHelper_UI53 extends Zon.LoadConstantHelper {
    constructor(currentVersionValue) {
        super(currentVersionValue, Binary.BitExtractor.INT_53_PREFIX_BITS);
    }
}

Zon.SaveLoadHelper_List = class SaveLoadHelper_List {
    constructor(saveLoadHelpers = null) {
        this.saveLoadHelpers = saveLoadHelpers ?? [];
        this.bindAll();
    }

    add(saveLoadHelper) {
        this.saveLoadHelpers.push(saveLoadHelper);
    }
    write(writer) {
        for (const item of this.saveLoadHelpers) {
            item.write(writer);
        }
    }
    read(reader) {
        for (const item of this.saveLoadHelpers) {
            item.read(reader);
        }
    }
    get() {
        for (const item of this.saveLoadHelpers) {
            item.get();
        }
    }
    set() {
        for (const item of this.saveLoadHelpers) {
            item.set();
        }
    }
}

Zon.SaveLoadInfo = class SaveLoadInfo extends Zon.SaveLoadHelper_List {
    constructor(id, saveLoadHelpers = null) {
        super(saveLoadHelpers);
        this.id = id;
    }

    get ID() {
        return this.id;
    }

    get name() {
        return Zon.SaveLoadIDNames[this.id];
    }

    toString() {
        return this.name;
    }
}

Zon.SaveLoadHelper_KeyValuePair = class SaveLoadHelper_KeyValuePair {
    constructor(map, toSaveLoadHelper, length) {
        this.length = typeof length === "number" ? { value: length } : length; // Ensure length is an object with a value property
        this.map = [...map].map(([item, key]) => [key, toSaveLoadHelper(item)]);
    }

    write(writer) {
        writer.writeUInt32AutoLength(this.map.length);
        const bits = this.length.value;
        for (const [key, item] of this.map) {
            writer.writeUInt32(key, bits);
            item.write(writer);
        }
    }
    read(reader) {
        const length = reader.readUInt32AutoLength();
        const bits = this.length.value;
        for (let i = 0; i < length; i++) {
            const key = reader.readUInt32(bits);
            const item = this.map.get(key);
            if (item === undefined) {
                throw new Error(`SaveLoadHelper_KeyValuePair: Key ${key} not found in dictionary.`);
            }

            item.read(reader);
        }
    }
    get() {
        for (const [key, item] of this.map) {
            item.get();
        }
    }
    set() {
        for (const [key, item] of this.map) {
            item.set();
        }
    }
}

Map.prototype.getSaveLoadHelper = function(toSaveLoadHelper, length) {
    return new Zon.SaveLoadHelper_KeyValuePair(this, toSaveLoadHelper, length);
}