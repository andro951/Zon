const ObjectExtensions = {}

Object.defineProperty(Object.prototype, "forwardMethodsFrom", {
    value:
    /**
     * @description Copies all instance methods from source to this object.
     * @param {Object} source - The source object to copy methods from.
     * @throws {Error} If the source is not an object or if a method with the same name already exists.
     * @returns {void}
     */
    function(source, ignoreDuplicates = false) {
        if (!source || typeof source !== "object")
            throw new Error(`Cannot forward methods from ${source}.  Must be an object.`);

        const sourceInstanceFunctions = Object.prototype.getInstanceFunctions.call(source);
        for (const [functionName, funct] of sourceInstanceFunctions) {
            if (!ignoreDuplicates && functionName in this)
                throw new Error(`this obj already has a function called ${functionName}.  Cannot forward from ${source}.`);

            this[functionName] = funct;
        }

        for (const [functionName, funct] of Object.prototype.getPrototypeFunctions.call(source)) {
            if (sourceInstanceFunctions.has(functionName))
                continue;

            if (!ignoreDuplicates && functionName in this)
                throw new Error(`this obj already has a function called ${functionName}.  Cannot forward from ${source}'s prototype.`);

            this[functionName] = funct.bind(source);
        }
    },
    enumerable: false, // This hides it from for...in and Object.keys
});
Object.defineProperty(Object.prototype, "getInstanceFunctionNames", {
    value: function() {
        const names = new Set();
        for (const key of Object.getOwnPropertyNames(this)) {
            const desc = Object.getOwnPropertyDescriptor(this, key);
            if (!desc) {
                console.warn(`getInstanceFunctionNames: ${key} is not a property descriptor`);
                continue;
            }

            if (typeof desc.value !== "function")
                continue;

            names.add(key);
        }

        return names;
    },
    enumerable: false,
});
Object.defineProperty(Object.prototype, "getPrototypeFunctionNames", {
    value: function(filterConstructor = true) {
        const prototype = Object.getPrototypeOf(this);
        if (!prototype)
            return new Set();

        const names = new Set();
        for (const key of Object.getOwnPropertyNames(prototype)) {
            if (filterConstructor && key === "constructor")
                continue;

            const desc = Object.getOwnPropertyDescriptor(prototype, key);
            if (!desc) {
                console.warn(`getPrototypeFunctionNames: ${key} is not a property descriptor`);
                continue;
            }

            if (typeof desc.value !== "function")
                continue;

            names.add(key);
        }

        return names;
    },
    enumerable: false,
});
Object.defineProperty(Object.prototype, "getAllFunctionNames", {
    value: function(filterConstructor = true) {
        return new Set([...Object.prototype.getInstanceFunctionNames.call(this), ...Object.prototype.getPrototypeFunctionNames.call(this, filterConstructor)]);
    },
    enumerable: false,
});
Object.defineProperty(Object.prototype, "getInstanceFunctions", {
    value: function() {
        return Object.prototype.getPropertiesFromNames.call(this, Object.prototype.getInstanceFunctionNames.call(this));
    },
    enumerable: false,
});
Object.defineProperty(Object.prototype, "getPrototypeFunctions", {
    value: function(filterConstructor = true) {
        return Object.prototype.getPropertiesFromNames.call(this, Object.prototype.getPrototypeFunctionNames.call(this, filterConstructor));
    },
    enumerable: false,
});
Object.defineProperty(Object.prototype, "getAllFunctions", {
    value: function(filterConstructor = true) {
        return Object.prototype.getPropertiesFromNames.call(this, Object.prototype.getAllFunctionNames.call(this, filterConstructor));
    },
    enumerable: false,
});
Object.defineProperty(Object.prototype, "getPropertiesFromNames", {
    value: function(names) {
        const map = new Map();
        for (const name of names) {
            map.set(name, this[name]);
        }

        return map;
    },
    enumerable: false,
});