"use strict";

Zon.UI.ScriptsUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('scriptsUI', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, Zon.device, {
            postConstructorFunc: Zon.UI.ScriptsUIState._postConstructorFunc,
        });
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;

        this.scriptPannelsMap = new Map();
    }

    static _postConstructorFunc(d) {
        //Page label
        const borderWidth = 2;
        const spacing = 2;
        d.label = Zon.UI.UIElementDiv2.create('scriptsLabel', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Scripts`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.parent.outerBorderWidth.value, { d });
                d.replaceTop(() => d.parent.parent.outerBorderWidth.value, { d });
                d.replaceWidth(() => d.parent.width - d.left * 2, { d });
                d.replaceHeight(() => d.parent.height * 0.08, { d });
            }
        });

        //Upload New Script Button
        d.fileInput = Zon.UI.ScriptsUIState.TextFileInput.create(d, (text, file) => {
            Zon.ScriptIO.tryImportNewScript(file.name, text);
        }, () => Zon.UI.scriptsUIState.onImportScript());

        //Delete All Scripts Button
        d.deleteAllButton = Zon.UI.UIElementDiv2.create('deleteAllScriptsButton', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0xAA0000FF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Delete All Scripts`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
                d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
            },
            onClick: () => {
                Zon.UI.Popup.makePopup(`Delete All Scripts`, `Are you sure you want to delete all scripts?\nThis action cannot be undone.`, [
                    new Zon.UI.PopupButtonInfo(`Cancel`, Struct.Color.fromUInt(0x00AA00FF)),
                    new Zon.UI.PopupButtonInfo(`Delete All`, Struct.Color.fromUInt(0xAA0000FF), Zon.ScriptIO.deleteAllScripts)
                ], Zon.UI.scriptsUIState);
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.fileInput.right + spacing, { d });
                d.replaceTop(() => d.parent.fileInput.top, { d });
                d.replaceWidth(() => (d.parent.fileInput.width - spacing) / 2, { d });
                d.replaceHeight(() => d.parent.fileInput.height, { d });
            }
        });

        //Open Documentation Button
        d.documentationButton = Zon.UI.UIElementDiv2.create('openDocumentationButton', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0x00AAAAFF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Documentation`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
                d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
            },
            onClick: () => {
                // Zon.UI.Popup.makePopup(`Delete All Scripts`, `Are you sure you want to delete all scripts?\nThis action cannot be undone.`, [
                //     new Zon.UI.PopupButtonInfo(`Cancel`, Struct.Color.fromUInt(0x00AA00FF)),
                //     new Zon.UI.PopupButtonInfo(`Delete All`, Struct.Color.fromUInt(0xAA0000FF), Zon.ScriptIO.deleteAllScripts)
                // ], Zon.UI.scriptsUIState);
                ZonScript.Documentation.openInNewTab();
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.deleteAllButton.right + spacing, { d });
                d.replaceTop(() => d.parent.deleteAllButton.top, { d });
                d.replaceWidth(() => d.parent.deleteAllButton.width, { d });
                d.replaceHeight(() => d.parent.deleteAllButton.height, { d });
            }
        });

        //Script Panels List
        d.scriptPanelsList = Zon.UI.ScriptsUIState.ScriptPanelsList.create(d);
    }
    onDeleteScript = () => {
        this.useableSpace.scriptPanelsList.addAllPanels();
    }
    onImportScript = () => {
        this.useableSpace.scriptPanelsList.addAllPanels();
    }
    onLoadAllScripts = () => {
        //this.useableSpace.scriptPanelsList.addAllPanels();
    }
    static TextFileInput = class TextFileInput extends Zon.UI.UIElementDiv {
        constructor(parent, onFileLoaded, onFinishedLoadingAllFiles) {
            super('textFileInput', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, parent);

            if (typeof onFileLoaded !== 'function')
                throw new Error("onFileLoaded callback function is required for TextFileInput.");

            if (typeof onFinishedLoadingAllFiles !== 'function')
                throw new Error("onFinishedLoadingAllFiles callback function is required for TextFileInput.");

            const borderWidth = 2;

            this.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
            this.element.style.backgroundColor = Struct.Color.fromUInt(0x202020FF).cssString;
            this.element.style.borderWidth = `${borderWidth}px`;
            this.element.style.borderStyle = 'solid';
            this.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
            this.element.textContent = `Upload New Script`;
            this.element.style.display = "flex";
            this.element.style.justifyContent = 'center';
            this.element.style.alignItems = 'center';
            this.element.style.cursor = "pointer";
            this.element.style.whiteSpace = 'nowrap';
            this.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;

            // Hidden real file input
            this.fileInput = document.createElement('input');
            this.fileInput.type = 'file';
            this.fileInput.accept = '.txt,.zs';
            this.fileInput.style.display = 'none';
            this.fileInput.multiple = true;

            const tryFunc = async (file) => {
                const text = await file.text();
                onFileLoaded(text, file);
            }

            this.fileInput.addEventListener('change', async (event) => {
                const files = event.target.files;
                if (!files?.length)
                    return;

                let count = 0;
                if (ZonScript.removeTryCatch) {
                    for (const file of files) {
                        await tryFunc(file);
                        count++;
                    }
                }
                else {
                    for (const file of files) {
                        try {
                            await tryFunc(file);
                            count++;
                        } catch (err) {
                            console.error("Failed to read text file:", err);
                        }
                    }
                }

                if (count > 0)
                    onFinishedLoadingAllFiles();

                // Reset input to allow re-selecting the same files
                this.fileInput.value = "";
            });

            document.body.appendChild(this.fileInput);

            // Clicking the div opens picker
            this.element.addEventListener('click', () => {
                this.fileInput.click();
            });
        }

        setup() {
            super.setup();

            const spacing = 2;

            this.replaceLeft(() => this.parent.label.left);
            this.replaceTop(() => this.parent.label.bottom + spacing);
            this.replaceWidth(() => this.parent.label.width * 0.5 - spacing * 0.5);
            this.replaceHeight(() => 20);
        }
    }
    static ScriptPanelsList = class ScriptPanelsList extends Zon.UI.UIElementDiv {
        constructor(parent) {
            super(`ScriptPanelsList`, Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, parent);
            //this.element.style.backgroundColor = Struct.Color.fromUInt(0xFF0000FF).cssString;
            this.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
            
            this.makeScrollableColumn();
        }
        setup() {
            super.setup();
            
            this.replaceLeft(() => this.parent.parent.outerBorderWidth.value);
            this.replaceTop(() => Zon.UI.scriptsUIState.useableSpace.fileInput.bottom + 4);
            this.replaceWidth(() => this.parent.width - this.left * 2);
            this.replaceHeight(() => Zon.UI.scriptsUIState.useableSpace.height - this.top);

            this.addAllPanels();
        }
        static ScriptPanel = class ScriptPanel extends Zon.UI.UIElementDiv {
            constructor(parent, key, script) {
                if (new.target === Zon.UI.ScriptsUIState.ScriptPanel)
                    throw new TypeError("Cannot construct ScriptPanel instances directly");

                if (typeof key !== 'string')
                    throw new Error("Key must be a string");

                if (!(script instanceof ScriptForge.Script))
                    throw new Error("ScriptPanel must be constructed with a valid script");

                const name = Zon.ScriptIO.getNameFromKey(key);

                super(`scriptPanel_${name}`, Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, parent);

                this.name = name;
                this.key = key;
                this.script = script;
                this.element.style.backgroundColor = Struct.Color.fromUInt(0x303030FF).cssString;
                this.element.style.borderWidth = `1px`;
                this.element.style.borderStyle = 'solid';
                this.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                this.element.style.display = 'flex';
                this.element.style.justifyContent = 'center';
                this.element.style.alignItems = 'center';
                this.element.style.whiteSpace = 'nowrap';

                this.isChild = true;
            }
            static borderWidth = 2;
            static padding = 2;
            postConstructor() {
                super.postConstructor();

                const borderWidth = Zon.UI.ScriptsUIState.ScriptPanelsList.ScriptPanel.borderWidth;
                const padding = Zon.UI.ScriptsUIState.ScriptPanelsList.ScriptPanel.padding;
                const pannelRows = 3;
                const totalHeightPadding = (pannelRows + 1) * padding;
                const leftTextPadding = 4;

                //Title
                this.scriptTitle = Zon.UI.UIElementDiv2.create(`${this.name}ScriptTitle`, this.element.style.zIndex, this, {
                    constructorFunc: (d) => {
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                        d.element.style.fontWeight = `bold`;
                        d.element.textContent = d.parent.script.title;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'flex-start';
                        d.element.style.alignItems = 'center';
                        d.element.style.whiteSpace = 'nowrap';
                        d.element.style.paddingLeft = `${leftTextPadding}px`;
                    },
                    postConstructorFunc: (d) => {
                        const green = Struct.Color.fromUInt(0x003300FF);
                        const gray = Struct.Color.fromUInt(0x333333FF);
                        const red = Struct.Color.fromUInt(0x330000FF);
                        const script = d.parent.script;
                        d.backgroundColor = new Variable.Dependent(() => 
                            script.enabledDependent.value ? green : script._error.value ? red : gray, `${d.element.id}BackGroundColor`, {script});
                        d.backgroundColor.onChangedAction.add(() => d.element.style.backgroundColor = d.backgroundColor.value.cssString);
                        d.backgroundColor.reset();
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(() => (d.parent.innerWidth - padding * 2) * 1, { d });
                        d.replaceHeight(() => (d.parent.innerHeight  - totalHeightPadding) * 0.4, { d });
                    }
                });

                //File Name
                this.scriptName = Zon.UI.UIElementDiv2.create(`${this.name}ScriptName`, this.element.style.zIndex, this, {
                    constructorFunc: (d) => {
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                        d.element.style.fontWeight = `bold`;
                        d.element.textContent = d.parent.name;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'flex-start';
                        d.element.style.alignItems = 'center';
                        d.element.style.whiteSpace = 'nowrap';
                        d.element.style.paddingLeft = `${leftTextPadding}px`;
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.scriptTitle.left, { d });
                        d.replaceTop(() => d.parent.scriptTitle.bottom + padding, { d });
                        d.replaceWidth(() => d.parent.scriptTitle.width, { d });
                        d.replaceHeight(() => (d.parent.innerHeight  - totalHeightPadding) * 0.2, { d });
                    }
                });

                const buttonsCount = 4;
                const totalButtonWidthPadding = (buttonsCount + 1) * padding;

                const fontSize = 28;

                //Delete button
                this.deleteButton = Zon.UI.UIElementDiv2.create(`${this.name}DeleteButton`, this.element.style.zIndex, this, {
                    constructorFunc: (d) => {
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = Struct.Color.fromUInt(0xAA0000FF).cssString;
                        d.element.style.fontWeight = `bold`;
                        d.element.textContent = `Delete`;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.whiteSpace = 'nowrap';
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        d.element.style.fontSize = `${fontSize}px`;
                    },
                    onClick: () => {
                        Zon.UI.Popup.makePopup(`Delete Script`, `Are you sure you want to delete the script:\n"${this.script.title}"\n\nThis action cannot be undone.`, [
                            new Zon.UI.PopupButtonInfo(`Cancel`, Struct.Color.fromUInt(0x00AA00FF)),
                            new Zon.UI.PopupButtonInfo(`Delete`, Struct.Color.fromUInt(0xAA0000FF), () => {
                                Zon.ScriptIO.deleteScript(this.name);
                            })
                        ], Zon.UI.scriptsUIState);
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.scriptTitle.left, { d });
                        d.replaceTop(() => d.parent.scriptName.bottom + padding, { d });
                        d.replaceWidth(() => (d.parent.innerWidth - totalButtonWidthPadding) / buttonsCount, { d });
                        d.replaceHeight(() => (d.parent.innerHeight  - totalHeightPadding) * 0.4, { d });
                    }
                });

                //Edit button
                this.editButton = Zon.UI.UIElementDiv2.create(`${this.name}EditButton`, this.element.style.zIndex, this, {
                    constructorFunc: (d) => {
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = Struct.Color.fromUInt(0x0000AAFF).cssString;
                        d.element.style.fontWeight = `bold`;
                        d.element.textContent = `Edit`;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.whiteSpace = 'nowrap';
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        d.element.style.fontSize = `${fontSize}px`;
                    },
                    onClick: () => {
                        Zon.warn(`Edit functionality is not implemented yet.`);
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.deleteButton.right + padding, { d });
                        d.replaceTop(() => d.parent.deleteButton.top, { d });
                        d.replaceWidth(() => d.parent.deleteButton.width, { d });
                        d.replaceHeight(() => d.parent.deleteButton.height, { d });
                    }
                });

                //Info button
                this.infoButton = Zon.UI.UIElementDiv2.create(`${this.name}InfoButton`, this.element.style.zIndex, this, {
                    constructorFunc: (d) => {
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = Struct.Color.fromUInt(0x00AAAAFF).cssString;
                        d.element.style.fontWeight = `bold`;
                        d.element.textContent = `Info`;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.whiteSpace = 'nowrap';
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        d.element.style.fontSize = `${fontSize}px`;
                    },
                    onClick: () => {
                        //Zon.warn(`Info functionality is not implemented yet.`);
                        const script = this.script;
                        const topText = 
                            `Title: ${script.title || `(None)`}\n` +
                            `Author: ${script.author || '(Unknown)'}\n` +
                            `Version: ${script.version || '(Unknown)'}\n` +
                            `Max Execution Time: ${script.maxExecutionTime}ms\n` +
                            `Description: ${script.description || '(None)'}\n\n` +
                            `Triggers: ${script.triggers.length > 0 ? script.triggers.join(', ') : '(None)'}\n\n`;
                        const textFunc = new Variable.DependentFunction(() =>
                            topText +
                            `Error: ${script._error.value || '(None)'}`
                            , { script });
                        Zon.UI.InfoPopup.makePopup('Script Info', textFunc, Zon.UI.scriptsUIState);
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.editButton.right + padding, { d });
                        d.replaceTop(() => d.parent.editButton.top, { d });
                        d.replaceWidth(() => d.parent.editButton.width, { d });
                        d.replaceHeight(() => d.parent.editButton.height, { d });
                    }
                });

                //Enable/Disable/Run button
                this.middleButton = Zon.UI.UIElementDiv2.create(`${this.name}MiddleButton`, this.element.style.zIndex, this, {
                    constructorFunc: (d) => {
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.fontWeight = `bold`;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.whiteSpace = 'nowrap';
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        d.element.style.fontSize = `${fontSize}px`;
                    },
                    postConstructorFunc: (d) => {
                        const script = d.parent.script;
                        d.text.replaceEquation(() => script.enabledDependent.value ? script.manuallyTriggered ? 'Run' : `Disable` : script.manuallyTriggered || script._error.value !== null ? '(Disabled)' : `Enable`, { script });

                        const green = Struct.Color.fromUInt(0x003300FF);
                        const purple = Struct.Color.fromUInt(0x330033FF);
                        const red = Struct.Color.fromUInt(0x330000FF);
                        const darkGray = Struct.Color.fromUInt(0x202020FF);
                        d.borderColor = new Variable.Dependent(() => script.enabledDependent.value ? script.manuallyTriggered ? purple : red : script.manuallyTriggered || script._error.value !== null ? darkGray : green, `${d.element.id}BorderColor`, { script });
                        d.borderColor.onChangedAction.add(() => d.element.style.borderColor = d.borderColor.value.cssString);
                        d.borderColor.reset();
                    },
                    onClick: () => {
                        if (this.script.manuallyTriggered) {
                            if (this.script.enabled)
                                ZonScript.sf.manuallyRunScript(this.script);
                        }
                        else {
                            if (this.script.error === null)
                                this.script._enabled = !this.script._enabled;
                        }
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.infoButton.right + padding, { d });
                        d.replaceTop(() => d.parent.infoButton.top, { d });
                        d.replaceWidth(() => d.parent.infoButton.width, { d });
                        d.replaceHeight(() => d.parent.infoButton.height, { d });
                    }
                });
            }
            setup() {
                super.setup();

                this.replaceLeft(() => this.parent.childrenPadding.value);
                this.replaceWidth(() => this.parent.innerWidth);
                const scriptsShownOnScreen = 4;
                this.replaceHeight(() => this.parent.innerHeight / scriptsShownOnScreen - this.parent.childrenPadding.value * ((scriptsShownOnScreen + 1) / scriptsShownOnScreen));
            }
            onError() {
                this.scriptTitle.backgroundColor.reset();
            }
        }
        _addPanel(key, script) {
            const scriptPanel = Zon.UI.ScriptsUIState.ScriptPanelsList.ScriptPanel.create(this, key, script);
            return this.addChild(scriptPanel);
        }
        addAllPanels() {
            this.removeAllChildren();
            const scripts = ZonScript.sf.registeredScripts;
            Zon.UI.scriptsUIState.scriptPannelsMap.clear();
            for (const [key, script] of scripts) {
                const panel = this._addPanel(key, script);
                Zon.UI.scriptsUIState.scriptPannelsMap.set(key, panel);
            }
        }
    }
    postLoadSetup() {
        
    }
}

Zon.UI.scriptsUIState = Zon.UI.ScriptsUIState.create();