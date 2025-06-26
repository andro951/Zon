"use strict";

Zon.UI.StageUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('stageSelectUI', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, Zon.device, {
            postConstructorFunc: Zon.UI.StageUIState._postConstructorFunc,
        });
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }
    static _postConstructorFunc(d) {
        //Page label
        const borderWidth = 2;
        d.label = Zon.UI.UIElementDiv2.create('stageSelectLabel', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = `#AAA`;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Stage Select`;
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

        //Aether bonus and settings
        d.aetherBonusAndSettingsContainer = Zon.UI.UIElementDiv2.create('aetherBonusAndSettingsContainer', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
            // constructorFunc: (d) => {

            // },
            postConstructorFunc: (d) => {
                const xPadding = 1;

                //Aether Bonus
                d.aetherBonus = Zon.UI.UIElementDiv2.create('aetherStageBonus', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x202020FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => 0, { d });
                        d.replaceTop(() => 0, { d });
                        d.replaceWidth(() => d.parent.innerWidth * 0.5 - xPadding, { d });
                        d.replaceHeight(() => d.parent.innerHeight, { d });
                    }
                });

                //Stage Settings
                d.stageSettings = Zon.UI.UIElementDiv2.create('stageSettings', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x808080FF).cssString;
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                        d.element.textContent = `Stage Settings`;
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.whiteSpace = 'nowrap';
                    },
                    postConstructorFunc: (d) => {
                        d.element.addOnClick(() => {
                            Zon.UI.stageSettingsUIState.show();
                        });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.innerWidth * 0.5 + xPadding, { d });
                        d.replaceTop(() => 0, { d });
                        d.replaceWidth(() => d.parent.innerWidth * 0.5 - xPadding, { d });
                        d.replaceHeight(() => d.parent.innerHeight, { d });
                    }
                });
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.label.left, { d });
                d.replaceTop(() => d.parent.label.bottom + d.parent.parent.outerBorderWidth.value / 2, { d });
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
                this.element.textContent = `${this.displayedStageNum}`;
                this.element.style.display = 'flex';
                this.element.style.justifyContent = 'center';
                this.element.style.alignItems = 'center';
                this.element.style.whiteSpace = 'nowrap';
                this.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                this._applyDefaultTopOrLeft = applyDefaultTopOrLeft;
            }
            postConstructor() {
                super.postConstructor();
                
                this.shown.replaceEquation(() => {
                    return this.parent.shown.value && Zon.LevelData.getDisplayedStageNum(Zon.game.highestStageAvailable, Zon.game.highestStageNumAvailable) >= this.displayedStageNum;
                }, { this: this });
            }
            setup() {
                super.setup();
                
                this.replaceLeft(() => this.parent.childrenPadding.value);
                this._applyDefaultTopOrLeft(this);
                delete this._applyDefaultTopOrLeft;
                this.replaceWidth(() => this.parent.innerWidth - 2 * this.parent.childrenPadding.value - Zon.UI.UIElementBase.expectedScrollBarWidth);
                this.replaceHeight(() => this.parent.innerHeight * 0.1);

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
        d.stagesContainer = Zon.UI.UIElementDiv2.create('stagesContainer', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
            constructorFunc: (d) => {
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x080808FF).cssString;
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
                d.replaceHeight(() => d.parent.innerHeight - d.top - d.parent.parent.outerBorderWidth.value, { d });
            }
        });

        //Stage Swap Popup
        d.stageSwapPopup = Zon.UI.UIElementDiv2.create('stageSwapPopup', Zon.UI.UIElementZID.POPUP, d, {
            inheritShown: false,
            constructorFunc: (d) => {
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = `#AAA`;
                d.element.style.display = 'flex';

                d.showPopup = (displayedStageNum, selectStage) => {
                    d.displayedStageNum.value = displayedStageNum;
                    d.selectStage = selectStage;
                    d.show();
                }
            },
            postConstructorFunc: (d) => {
                d.displayedStageNum = new Variable.Value(-1, `StageSwapDisplayedStageNum`);

                //Close button
                const padding = 1;
                d.closeButton = Zon.UI.UIElementDiv2.create('stageSwapPopupCloseButton', Zon.UI.UIElementZID.POPUP, d, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x101010FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = `#AAA`;
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        d.element.textContent = `X`;
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
                        d.replaceLeft(() => d.parent.innerWidth - d.width - padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(() => d.parent.innerWidth * 0.12 - padding * 2, { d });
                        d.replaceHeight(() => d.width, { d });
                    }
                });

                d.popupText = Zon.UI.UIElementDiv2.create('stageSwapPopupText', Zon.UI.UIElementZID.POPUP, d, {
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
                        d.text.replaceEquation(() => `Stage ${d.parent.displayedStageNum.value}`, { d });
                        d.element.addOnClick(() => {
                            d.parent.selectStage();
                            d.parent.hide();
                        });
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(() => d.parent.closeButton.left - d.left - padding * 2, { d });
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
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
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
                        d.replaceLeft(() => padding, { d });
                        d.replaceTop(() => d.parent.innerHeight - d.height - padding, { d });
                        d.replaceWidth(() => d.parent.innerWidth - padding * 2, { d });
                        d.replaceHeight(() => d.parent.innerHeight * 0.16 - padding * 2, { d });
                    }
                });
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.innerWidth * 0.12, { d });
                d.replaceTop(() => (d.parent.innerHeight - d.height) / 2, { d });
                d.replaceWidth(() => d.parent.innerWidth - d.left * 2, { d });
                d.replaceHeight(() => d.width, { d });
            }
        });
    }
    postLoadSetup() {
        
    }
    onClickStageSelectButton(displayedStageNum, selectStage) {
        this.useableSpace.stageSwapPopup.showPopup(displayedStageNum, selectStage);
    }
}

Zon.UI.stageUIState = Zon.UI.StageUIState.create();