"use strict";

Zon.UI.AbilityUIState = class extends Zon.MainDisplayUIState {
    constructor() {
        super('abilityUI', {
            postConstructorFunc: Zon.UI.AbilityUIState._postConstructorFunc,
        });
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }
    static _postConstructorFunc(d) {
        //Page label
        const borderWidth = 2;
        d.label = Zon.UI.UIElementDiv2.create('abilitiesLabel', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
            constructorFunc: (d) => {
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                d.element.style.fontWeight = `bold`;
                d.element.textContent = `Abilities`;
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

        //Abilities
        class AbilityContainer extends Zon.UI.UIElementDiv {
            constructor(parent, lastChild, padding, abilityName, iconName, price) {
                super(`abilityContainer_${abilityName}`, Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, parent);
                this.name = abilityName;
                this.iconPath = () =>Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.ICONS, iconName + 'Icon');
                this.price = price;
                this.element.style.backgroundColor = Struct.Color.fromUInt(0x303030FF).cssString;
                this.element.style.borderWidth = `1px`;
                this.element.style.borderStyle = 'solid';
                this.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                //this.element.textContent = `${this.name}`;
                this.element.style.display = 'flex';
                this.element.style.justifyContent = 'center';
                this.element.style.alignItems = 'center';
                this.element.style.whiteSpace = 'nowrap';
                this.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;

                this.isChild = true;

                //TODO: Check if purchased
                // this.newShownEquation = new Variable.DependentFunction(() => {
                //     return this.parent.shown.value && Zon.game.highestDisplayedStageAvailable.value >= this.displayedStageNum;
                // }, { this: this });
            }
            postConstructor() {
                super.postConstructor();
                let options = {
                    leftFunc: () => this.left + 2,
                    topFunc: () => this.top + 2,
                    widthFunc: () => this.height - 4,
                    heightFunc: () => this.height - 4,
                };
                //if (this.isColumn) {
                // //Column
                // options.topFunc ??= lastChild ? new Variable.DependentFunction(() => lastChild.bottom + this.childrenPadding.value, { lastChild }) : () => this.childrenPadding.value;
                // }
                // else {
                //     //Row
                //     options.leftFunc ??= lastChild ? new Variable.DependentFunction(() => lastChild.right + this.childrenPadding.value, { lastChild }) : () => this.childrenPadding.value;
                // }
                this.icon = Zon.UI.SimpleIcon.create(this.name, this.iconPath, this, options);
            }
            setup() {
                super.setup();
                
                this.replaceLeft(() => this.parent.childrenPadding.value);
                this.replaceWidth(() => this.parent.innerWidth);
                this.replaceHeight(() => this.parent.innerHeight * 0.1);

                this.element.addOnClick(this.onClick);
            }
            onClick() {
                //Zon.UI.stageUIState.onClickStageSelectButton(this.displayedStageNum, this.selectStage);
                //Zon.ProgressionManager.onClickStageSelectButton(this.stageID, this.stageNum);

                console.log(`Clicked ability: ${this.name}`);
            }
            // selectStage() {
            //     if (Zon.game.stageID !== this.stageID || Zon.game.stageNum !== this.stageNum) {
            //         Zon.game.switchStages(this.stageID, this.stageNum);
            //         Zon.UI.stageUIState.hide();
            //         Zon.UI.sideBar.hide();

            //         Zon.ProgressionManager.onPlayerSwitchToStage(this.stageID, this.stageNum);
            //     }
            // }
        }
        class AbilityContainerInfo {
            constructor(name, iconName, price) {
                this.name = name;
                this.iconName = iconName;
                this.price = price;
            }
        }
        d.abilitiesContainer = Zon.UI.UIElementDiv2.create('abilitiesContainer', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, d, {
            constructorFunc: (d) => {
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x080808FF).cssString;
                d.makeScrollableColumn();
            },
            postConstructorFunc: (d) => {

            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.label.left, { d });
                d.replaceTop(() => d.parent.label.bottom + 2, { d });
                d.replaceWidth(() => d.parent.label.width, { d });
                d.replaceHeight(() => d.parent.innerHeight - d.top - d.parent.parent.outerBorderWidth.value, { d });

                const abilities = [
                    new AbilityContainerInfo('Basic Attack', 'BasicAttack', 0),
                ];
                
                for (const abilityInfo of abilities) {
                    d.addChildByClass(AbilityContainer, abilityInfo.name, abilityInfo.iconName, abilityInfo.price);
                }
            }
        });
    }
    postLoadSetup() {
        
    }
}

Zon.UI.abilityUIState = Zon.UI.AbilityUIState.create();