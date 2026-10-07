"use strict";

Zon.ScriptIO = {};

Zon.ScriptIO.scriptPrefix = "script/";
Zon.ScriptIO.scriptFileExtension = ".zs";

Zon.ScriptIO.loadAllScripts = () => {
    const scripts = new Map();

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(Zon.ScriptIO.scriptPrefix)) {
            scripts.set(key, localStorage.getItem(key));
        }
    }

    return scripts;
}

Zon.ScriptIO.removeExtensions = (fileName) => {
    const index = fileName.indexOf('.');
    return index === -1 ? fileName : fileName.slice(0, index);
}

Zon.ScriptIO.getKeyFromName = (name) => {
    return Zon.ScriptIO.scriptPrefix + Zon.ScriptIO.removeExtensions(name) + Zon.ScriptIO.scriptFileExtension;
}

Zon.ScriptIO.getNameFromKey = (key) => {
    //return key.substring(Zon.ScriptIO.scriptPrefix.length, key.length - Zon.ScriptIO.scriptFileExtension.length);
    return key.substring(Zon.ScriptIO.scriptPrefix.length);
}

Zon.ScriptIO.tryImportNewScript = (name, text) => {
    const key = Zon.ScriptIO.getKeyFromName(name);
    if (localStorage.getItem(key) !== null) {
        Zon.warn(`Script with name ${name} already exists. Choose a different name or delete the existing script.`);
        return false;
    }

    const script = ZonScript.registerScriptFromText(key, text, true);
    if (script !== null) {
        localStorage.setItem(key, text);
        console.log(`Imported script: ${key}`);
        return true;
    }
    else {
        Zon.error(`Failed to import script: ${key}`);
        return false;
    }
}

Zon.ScriptIO.deleteScript = (name) => {
    const key = Zon.ScriptIO.getKeyFromName(name);
    const existingScript = localStorage.getItem(key);
    if (existingScript === null)
        return;

    localStorage.removeItem(key);
    ZonScript.sf.unregisterScript(key);
    Zon.UI.scriptsUIState.onDeleteScript();
    console.log(`Deleted script: ${key}`);
}

Zon.ScriptIO.deleteAllScripts = () => {
    const keysToDelete = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(Zon.ScriptIO.scriptPrefix)) {
            keysToDelete.push(key);
        }
    }

    for (const key of keysToDelete) {
        localStorage.removeItem(key);
        ZonScript.sf.unregisterScript(key);
    }
    
    Zon.UI.scriptsUIState.onDeleteScript();
    console.log(`Deleted all scripts.`);
}