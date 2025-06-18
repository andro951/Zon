"use strict";

Zon.UI.StageUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('stageSelectUI', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }
    postConstructor() {
        super.postConstructor();

        //Page label
        const borderWidth = 2;
        this.label = Zon.UI.UIElementDiv2.create('stageSelectLabel', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, this, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = `#AAA`;
                d.element.style.borderRadius = `0px`;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Stage Select`;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.whiteSpace = 'nowrap';
            },
            setupFunc: (d) => {
                d.replaceLeft(() => 8, { d });
                d.replaceTop(() => 8, { d });
                d.replaceWidth(() => d.parent.width - d.left * 2, { d });
                d.replaceHeight(() => d.parent.height * 0.08, { d });
            }
        });

        //Aether bonus and settings
        this.aetherBonusAndSettingsContainer = Zon.UI.UIElementDiv2.create('aetherBonusAndSettingsContainer', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, this, {
            // constructorFunc: (d) => {

            // },
            postConstructorFunc: (d) => {
                const xPadding = 1;

                //Aether Bonus
                this.aetherBonus = Zon.UI.UIElementDiv2.create('aetherStageBonus', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x202020FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                        d.element.style.borderRadius = `0px`;
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => 0, { d });
                        d.replaceTop(() => 0, { d });
                        d.replaceWidth(() => d.parent.width * 0.5 - xPadding, { d });
                        d.replaceHeight(() => d.parent.height, { d });
                    }
                });

                //Stage Settings
                this.stageSettings = Zon.UI.UIElementDiv2.create('stageSettings', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x808080FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                        d.element.style.borderRadius = `8px`;
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.width * 0.5 + xPadding, { d });
                        d.replaceTop(() => 0, { d });
                        d.replaceWidth(() => d.parent.width * 0.5 - xPadding, { d });
                        d.replaceHeight(() => d.parent.height, { d });
                    }
                });
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.label.left, { d });
                d.replaceTop(() => d.parent.label.bottom + 2);
                d.replaceWidth(() => d.parent.label.width, { d });
                d.replaceHeight(() => d.parent.height * 0.08, { d });
            }
        });

        //Stages
        class StageButton extends Zon.UI.UIElementDiv {
            constructor(parent, lastChild, padding, applyDefaultTopOrLeft, stageID, stageNum) {
                const displayedStageNum = Zon.LevelData.getDisplayedStageNum(stageID, stageNum);
                super(`stageButton_${displayedStageNum}`, Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, parent);
                this.stageID = stageID;
                this.stageNum = stageNum;
                this.displayedStageNum = displayedStageNum;
                this.element.style.backgroundColor = Struct.Color.fromUInt(0x303030FF).cssString;
                this.element.style.borderWidth = `1px`;
                this.element.style.borderStyle = 'solid';
                this.element.style.borderColor = `#AAA`;
                this.element.style.borderRadius = `4px`;
                this.element.textContent = `${this.displayedStageNum}`;
                this.element.style.display = 'flex';
                this.element.style.justifyContent = 'center';
                this.element.style.alignItems = 'center';
                this.element.style.whiteSpace = 'nowrap';
                this.applyDefaultTopOrLeft = applyDefaultTopOrLeft;
            }
            postConstructor() {
                super.postConstructor();
                
                this.shown.replaceEquation(() => {
                    return this.parent.shown.value && Zon.LevelData.getDisplayedStageNum(Zon.game.highestStageAvailable, Zon.game.highestStageNumAvailable) >= this.displayedStageNum;
                }, { this: this });
            }
            setup() {
                super.setup();
                
                const xPadding = 2;
                this.replaceLeft(() => xPadding);
                this.applyDefaultTopOrLeft(this);
                delete this.applyDefaultTopOrLeft;
                this.replaceWidth(() => {
                    return this.parent.width - 2 * xPadding;
                });
                this.replaceHeight(() => this.parent.height * 0.1);

                this.element.addOnClick(this.onClick);
            }
            onClick() {
                Zon.UI.stageUIState.onClickStageSelectButton(this.displayedStageNum, this.selectStage);
                Zon.ProgressionManager.onClickStageSelectButton(this.stageID, this.stageNum);
            }
            selectStage() {
                if (Zon.game.stageID !== this.stageID || Zon.game.stageNum !== this.stageNum) {
                    Zon.game.switchStages(this.stageID, this.stageNum);
                    Zon.UI.stageUIState.hide();
                    Zon.UI.sideBar.hide();

                    Zon.ProgressionManager.onPlayerSwitchToStage(this.stageID, this.stageNum);
                }
            }
        }
        this.stagesContainer = Zon.UI.UIElementDiv2.create('stagesContainer', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, this, {
            constructorFunc: (d) => {
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x080808FF).cssString;
                d.element.style.borderRadius = `4px`;
                d.makeScrollableColumn();
            },
            postConstructorFunc: (d) => {
                for (let stageID = Zon.LevelData.startingStage; stageID <= Zon.LevelData.maxStage; stageID++) {
                    for (let stageNum = Zon.LevelData.startingStageNum; stageNum <= Zon.LevelData.maxStageNum; stageNum++) {
                        d.addChild(StageButton, stageID, stageNum);
                    }
                }
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.label.left, { d });
                d.replaceTop(() => d.parent.aetherBonusAndSettingsContainer.bottom + 2, { d });
                d.replaceWidth(() => d.parent.label.width, { d });
                d.replaceHeight(() => d.parent.height - d.top - 8, { d });
            }
        });

        //Stage Swap Popup
        this.stageSwapPopup = Zon.UI.UIElementDiv2.create('stageSwapPopup', Zon.UI.UIElementZID.POPUP, this, {
            inheritShown: false,
            constructorFunc: (d) => {
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = `#AAA`;
                d.element.style.borderRadius = `0px`;
                d.element.style.display = 'flex';

                d.showPopup = (displayedStageNum, selectStage) => {
                    d.textElement.text.value = `Stage ${displayedStageNum}`;
                    d.selectStage = selectStage;
                    d.show();
                }
            },
            postConstructorFunc: (d) => {
                //Close button
                d.closeButton = Zon.UI.UIElementDiv2.create('stageSwapPopupCloseButton', Zon.UI.UIElementZID.POPUP, d, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x101010FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                        d.element.style.borderRadius = `4px`;
                        d.element.textContent = `x`;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.whiteSpace = 'nowrap';
                    },
                    postConstructorFunc: (d) => {
                        d.element.addOnClick(() => {
                            d.parent.hide();
                        });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.width - d.width - d.parent.borderWidth.value - 1, { d });
                        d.replaceTop(() => d.parent.borderWidth.value + 1, { d });
                        d.replaceWidth(() => d.parent.width * 0.16, { d });
                        d.replaceHeight(() => d.width, { d });
                    }
                });

                d.textElement = Zon.UI.UIElementDiv2.create('stageSwapPopupText', Zon.UI.UIElementZID.POPUP, d, {
                    constructorFunc: (d) => {
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.fontWeight = `bold`;
                        d.element.textContent = `Stage -1`;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.whiteSpace = 'nowrap';
                    },
                    postConstructorFunc: (d) => {
                        d.element.addOnClick(() => {
                            d.parent.selectStage();
                            d.parent.hide();
                        });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.borderWidth.value + 1, { d });
                        d.replaceTop(() => d.parent.borderWidth.value + 1, { d });
                        d.replaceWidth(() => d.parent.closeButton.left - d.left - 2, { d });
                        d.replaceHeight(() => d.parent.closeButton.height, { d });
                    }
                });

                //Swap Stage Button
                d.swapStageButton = Zon.UI.UIElementDiv2.create('swapStageButton', Zon.UI.UIElementZID.POPUP, d, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x303030FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                        d.element.style.borderRadius = `4px`;
                        d.element.textContent = `Swap To Stage`;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.whiteSpace = 'nowrap';
                    },
                    postConstructorFunc: (d) => {
                        d.element.addOnClick(() => {
                            d.parent.selectStage();
                            d.parent.hide();
                        });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.borderWidth.value + 1, { d });
                        d.replaceTop(() => d.parent.height - d.height - d.parent.borderWidth.value - 1, { d });
                        d.replaceWidth(() => d.parent.width - d.left * 2, { d });
                        d.replaceHeight(() => d.parent.height * 0.16, { d });
                    }
                });
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.width * 0.05, { d });
                d.replaceTop(() => (d.parent.height - d.height) / 2, { d });
                d.replaceWidth(() => d.parent.width - d.left * 2, { d });
                d.replaceHeight(() => d.width, { d });
            }
        });
    }
    postLoadSetup() {
        
    }
    setup() {
        super.setup();
        
        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Zon.device.height * (1 - Zon.UI.CloseButtonUIState.heightScale));
    }
    onClickStageSelectButton(displayedStageNum, selectStage) {
        this.stageSwapPopup.showPopup(displayedStageNum, selectStage);
    }
}

Zon.UI.stageUIState = Zon.UI.StageUIState.create();