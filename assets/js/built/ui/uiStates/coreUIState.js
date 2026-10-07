"use strict";

Zon.UI.CoreUIState = class extends Zon.MainDisplayUIState {
    constructor() {
        super('coreUI', {
            postConstructorFunc: Zon.UI.CoreUIState._postConstructorFunc,
        });
        this.element.style.backgroundColor = Struct.Color.fromUInt(0xFF7130FF).cssString;
    }
    static _postConstructorFunc(d) {
        //Page label
        const borderWidth = 2;
        d.label = Zon.UI.UIElementDiv2.create('aetherCoresLabel', Zon.UI.UIElementZID.MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Aether Cores`;
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

        d.coreName = Zon.UI.UIElementDiv2.create('coreName', Zon.UI.UIElementZID.MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Core Name`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
            },
            postSetupFunc: (d) => {
                d.text.replaceEquation(() => `${Zon.coreManager.getCore(Zon.coreManager.selectedCoreIndex.value).name()}`);
            },
            setupFunc: (d) => {
                d.replaceLeft(() => 
                    d.parent.parent.outerBorderWidth.value + d.parent.parent.width / 2, { d });
                d.replaceTop(() => 
                    d.parent.label.bottom + borderWidth, { d });
                d.replaceWidth(() => 
                    d.parent.width / 2 - d.parent.parent.outerBorderWidth.value * 2, { d });
                d.replaceHeight(() => 
                    d.parent.height * 0.05, { d });
            }
        });

        d.coreImage = Zon.UI.SimpleIcon.create("Core Image", () => Zon.coreManager.getCore(Zon.coreManager.selectedCoreIndex.value).imagePath(), d, {
            leftFunc: () => d.label.left,
            topFunc: () => d.coreName.top,
            widthFunc: () => d.coreName.width,
            heightFunc: () => d.coreName.width,
            refs: { d },
        });

        Zon.coreManager.selectedCoreIndex.onChangedAction.add(() => {
            const selectedCore = Zon.coreManager.getCore(Zon.coreManager.selectedCoreIndex.value);
            if (!selectedCore)
                throw new Error(`Selected core index ${Zon.coreManager.selectedCoreIndex.value} is out of bounds.`);

            d.coreImage.icon.setBackgroundImage(selectedCore.imagePath());
        });

        d.enhancementPoints = Zon.UI.UIElementDiv2.create('enhancementPoints', Zon.UI.UIElementZID.MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Enhancement Points: 0`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
            },
            postSetupFunc: (d) => {
                const updateText = (unlink = true) => {
                    if (unlink)
                        d.text.unlinkDependentActions();

                    const core = Zon.coreManager.getCore(Zon.coreManager.selectedCoreIndex.value);
                    d.text.replaceEquation(() => 
                        `Enhancement Points: ${core.unspentEnhancementPoints.value}`, { core });
                }

                updateText(false);
                Zon.coreManager.selectedCoreIndex.onChangedAction.add(updateText);
                // d.text.onChangedAction.add(() => {
                //     console.log(`Enhancement points text updated: ${d.text.value}`);
                // });
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.parent.outerBorderWidth.value, { d });
                d.replaceTop(() => d.parent.coreImage.bottom + borderWidth, { d });
                d.replaceWidth(() => d.parent.width - d.left * 2, { d });
                d.replaceHeight(() => d.parent.height * 0.08, { d });
            }
        });

        d.empowermentLevel = Zon.UI.UIElementDiv2.create('empowermentLevel', Zon.UI.UIElementZID.MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Empowerment Level: 0`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
            },
            postSetupFunc: (d) => {
                const updateText = (unlink = true) => {
                    if (unlink)
                        d.text.unlinkDependentActions();

                    const core = Zon.coreManager.getCore(Zon.coreManager.selectedCoreIndex.value);
                    d.text.replaceEquation(() => 
                        `Empowerment Level: ${core.totalEmpowermentLevel.value}`, { core });
                }

                updateText(false);
                Zon.coreManager.selectedCoreIndex.onChangedAction.add(updateText);
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.parent.outerBorderWidth.value, { d });
                d.replaceTop(() => d.parent.enhancementPoints.bottom + borderWidth, { d });
                d.replaceWidth(() => d.parent.width - d.left * 2, { d });
                d.replaceHeight(() => d.parent.height * 0.08, { d });
            }
        });

        d.empowermentCost = Zon.UI.UIElementDiv2.create('empowermentCost', Zon.UI.UIElementZID.MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Cost: 0 Aether`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
            },
            postSetupFunc: (d) => {
                const updateText = (unlink = true) => {
                    if (unlink)
                        d.text.unlinkDependentActions();

                    const core = Zon.coreManager.getCore(Zon.coreManager.selectedCoreIndex.value);
                    d.text.replaceEquation(() => `Cost: ${core.empowerLevel.levelCost.value}`, { core });
                }

                updateText(false);
                Zon.coreManager.selectedCoreIndex.onChangedAction.add(updateText);
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.parent.outerBorderWidth.value, { d });
                d.replaceTop(() => d.parent.empowermentLevel.bottom + borderWidth, { d });
                d.replaceWidth(() => d.parent.width - d.left * 2, { d });
                d.replaceHeight(() => d.parent.height * 0.08, { d });
            }
        });

        d.empowermentLevelUpButton = Zon.UI.UIElementDiv2.create('empowermentLevelUpButton', Zon.UI.UIElementZID.MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `+`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
            },
            onClick: () => {
                const core = Zon.coreManager.getCore(Zon.coreManager.selectedCoreIndex.value);
                //console.log(`Level up!  empowerCost: ${core.empowerLevel.levelCost.value}, totalEmpowermentLevel: ${core.totalEmpowermentLevel.value}, empowermentLevel: ${core.empowerLevel.level.value}`);
                core.tryEmpower(1);
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.parent.outerBorderWidth.value, { d });
                d.replaceTop(() => d.parent.empowermentCost.bottom + borderWidth, { d });
                d.replaceWidth(() => d.parent.width - d.left * 2, { d });
                d.replaceHeight(() => d.parent.height * 0.08, { d });
            }
        });

        //Test enhancement
        d.testEnhancementLabel = Zon.UI.UIElementDiv2.create('testEnhancementLabel', Zon.UI.UIElementZID.MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Test Enhancement`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.parent.outerBorderWidth.value, { d });
                d.replaceTop(() => d.parent.empowermentLevelUpButton.bottom + borderWidth, { d });
                d.replaceWidth(() => d.parent.width - d.left * 2, { d });
                d.replaceHeight(() => d.parent.height * 0.06, { d });
            }
        });

        d.testEnhancementLevel = Zon.UI.UIElementDiv2.create('testEnhancementLevel', Zon.UI.UIElementZID.MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Level: 0`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
            },
            postSetupFunc: (d) => {
                d.text.replaceEquation(() => `Level: ${Zon.testEnhancement._costLevelTracker.level.value}`);
            },
            setupFunc: (d) => {
                d.replaceLeft(() => 
                    d.parent.parent.outerBorderWidth.value, { d });
                d.replaceTop(() => 
                    d.parent.testEnhancementLabel.bottom + borderWidth, { d });
                d.replaceWidth(() => 
                    d.parent.width - d.left * 2, { d });
                d.replaceHeight(() => 
                    d.parent.height * 0.05, { d });
            }
        });

        d.testEnhancementCost = Zon.UI.UIElementDiv2.create('testEnhancementCost', Zon.UI.UIElementZID.MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Cost: 0`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
            },
            postSetupFunc: (d) => {
                d.text.replaceEquation(() => `Cost: ${Zon.testEnhancement._costLevelTracker.levelCost.value}`);
            },
            setupFunc: (d) => {
                d.replaceLeft(() => 
                    d.parent.parent.outerBorderWidth.value, { d });
                d.replaceTop(() => 
                    d.parent.testEnhancementLevel.bottom + borderWidth, { d });
                d.replaceWidth(() => 
                    d.parent.width - d.left * 2, { d });
                d.replaceHeight(() => 
                    d.parent.height * 0.05, { d });
            }
        });

        d.testEnhancementLevelUpButton = Zon.UI.UIElementDiv2.create('testEnhancementLevelUpButton', Zon.UI.UIElementZID.MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `+`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
            },
            onClick: () => {
                const core = Zon.coreManager.getCore(Zon.coreManager.selectedCoreIndex.value);
                //console.log(`Level up!  cost: ${Zon.testEnhancement._costLevelTracker.levelCost.value}, level: ${Zon.testEnhancement._costLevelTracker.level.value}, unspent: ${core.unspentEnhancementPoints.value}, attunementLevel: ${core.attunementLevel.value}`);
                Zon.testEnhancement.tryUpgrade(1);
            },
            setupFunc: (d) => {
                d.replaceLeft(() => 
                    d.parent.parent.outerBorderWidth.value, { d });
                d.replaceTop(() => 
                    d.parent.testEnhancementCost.bottom + borderWidth, { d });
                d.replaceWidth(() => 
                    d.parent.width - d.left * 2, { d });
                d.replaceHeight(() => 
                    d.parent.height * 0.05, { d });
            }
        });
    }
    postLoadSetup() {
        
    }
}

Zon.UI.coreUIState = Zon.UI.CoreUIState.create();