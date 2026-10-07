"use strict";

Zon.UI.PopupButtonInfo = class PopupButtonInfo {
    constructor(text, color = null, onClick = null, closeWhenClicked = true) {
        if (typeof text !== 'string')
            throw new Error("text must be a string");

        this.text = text;
        if (color === null) {
            this.color = Struct.Color.fromUInt(0xAAAAAAFF);
        }
        else {
            if (Zon.Util.getTypeStr(color) !== 'Color')
                throw new Error("color must be a Color object");

            this.color = color;
        }

        this.onClick = onClick;
        this.closeWhenClicked = closeWhenClicked;
    }
}

Zon.UI.Popup = class Popup extends Zon.UI.UIElementDiv {
    constructor(title, text, buttonInfos, parent, modifyPanelFunc = null) {
        const num = Zon.UI.Popup.popupCounter++;
        super(`popup${num}`, Zon.UI.UIElementZID.POPUP, parent, { inheritShown: true });
        this.title = title;
        this.text = text;
        this.modifyPanelFunc = modifyPanelFunc;
        if (!Array.isArray(buttonInfos) || !buttonInfos.every(info => info instanceof Zon.UI.PopupButtonInfo))
            throw new Error("buttonInfos must be an array of PopupButtonInfo objects");
            
        this.buttonInfos = buttonInfos;
        this.num = num;
        this._clickedChild = false;

        const style = this.element.style;

        style.backgroundColor = Struct.Color.fromUInt(0x00000000).cssString;
        //style.backgroundColor = Struct.Color.fromUInt(0xFF0000FF).cssString;
    }
    static popupCounter = 0;
    static allPopups = new Map();
    static makePopup(...args) {
        const popup = this.create(...args);
        this.allPopups.set(popup.num, popup);
    }
    delete() {
        if (this.shown.value)
            this.shown.unlinkDependentActions();

        this.element.remove();
        Zon.UI.Popup.allPopups.delete(this.num);
    }
    postConstructor() {
        super.postConstructor();

        this.addOnClick(() => {
            if (!this._clickedChild)
                this.delete();

            this._clickedChild = false;
        });

        this.onHideActions.add(this.delete);

        const borderWidth = 2;
        const padding = 1;
        const spacing = 2;

        this.popupPanel = Zon.UI.UIElementDiv2.create(`${this.element.id}PopupPanel`, Zon.UI.UIElementZID.POPUP, this, {
            constructorFunc: (d) => {
                const style = d.element.style;

                style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                //style.backgroundColor = Struct.Color.fromUInt(0x00FF00FF).cssString;
                style.borderWidth = `${borderWidth}px`;
                style.borderStyle = 'solid';
                style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                style.display = 'flex';
            },
            onClick: () => {
                this._clickedChild = true;
            },
            postConstructorFunc: (d) => {
                //Close button
                d.closeButton = Zon.UI.UIElementDiv2.create(`${this.element.id}CloseButton`, Zon.UI.UIElementZID.POPUP, d, {
                    constructorFunc: (d) => {
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x101010FF).cssString;
                        d.element.style.borderWidth = `${borderWidth}px`;
                        d.element.style.borderStyle = 'solid';
                        d.element.style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                        d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                        d.element.textContent = `X`;
                        d.element.style.display = 'flex';
                        d.element.style.justifyContent = 'center';
                        d.element.style.alignItems = 'center';
                        d.element.style.whiteSpace = 'nowrap';
                    },
                    onClick: () => {
                        d.parent.delete();
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => d.parent.innerWidth - d.width - padding, { d });
                        d.replaceTop(() => padding, { d });
                        d.replaceWidth(() => d.parent.innerWidth * 0.12 - padding * 2, { d });
                        d.replaceHeight(() => d.width, { d });
                    }
                });

                //Title
                d.popupTitle = Zon.UI.UIElementDiv2.create(`${this.element.id}Title`, Zon.UI.UIElementZID.POPUP, d, {
                    constructorFunc: (d) => {
                        const style = d.element.style;
                        style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        style.fontWeight = `bold`;
                        d.element.textContent = this.title;
                        style.display = 'flex';
                        style.justifyContent = 'center';
                        style.alignItems = 'center';
                        style.whiteSpace = 'nowrap';
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => padding, { d });
                        d.replaceTop(() => d.parent.closeButton.top, { d });
                        d.replaceWidth(() => d.parent.closeButton.left - d.left - spacing, { d });
                        d.replaceHeight(() => d.parent.closeButton.height, { d });
                    }
                });

                //Text
                d.popupText = Zon.UI.UIElementDiv2.create(`${this.element.id}Text`, Zon.UI.UIElementZID.POPUP, d, {
                    constructorFunc: (d) => {
                        const style = d.element.style;
                        style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.textContent = this.text;
                        style.display = 'block';
                        style.textAlign = 'left';
                        style.paddingLeft = `${8}px`;
                        style.paddingRight = `${8}px`;
                        style.fontSize = `24px`;
                        style.userSelect = "text";
                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => padding, { d });
                        d.replaceTop(() => d.parent.closeButton.bottom + spacing, { d });
                        d.replaceWidth(() => d.parent.closeButton.right - d.parent.popupTitle.left, { d });
                        d.replaceHeight(() => d.parent.innerHeight * 0.8 - d.parent.closeButton.height - spacing, { d });
                    }
                });

                const buttonCount = this.buttonInfos.length;
                this.buttons = [];
                for (let i = 0; i < buttonCount; i++) {
                    const buttonInfo = this.buttonInfos[i];
                    //Button
                    const button = Zon.UI.UIElementDiv2.create(`${this.element.id}Button${i}`, Zon.UI.UIElementZID.POPUP, d, {
                        constructorFunc: (d) => {
                            d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                            d.element.style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
                            d.element.style.borderWidth = `${borderWidth}px`;
                            d.element.style.borderStyle = 'solid';
                            d.element.style.borderColor = buttonInfo.color.cssString;
                            d.element.style.fontWeight = `bold`;
                            d.element.textContent = buttonInfo.text;
                            d.element.style.display = 'flex';
                            d.element.style.justifyContent = 'center';
                            d.element.style.alignItems = 'center';
                            d.element.style.whiteSpace = 'nowrap';
                            d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
                            d.element.style.fontSize = `${28}px`;
                        },
                        onClick: () => {
                            if (buttonInfo.onClick)
                                buttonInfo.onClick();

                            if (buttonInfo.closeWhenClicked)
                                d.parent.delete();
                        },
                        setupFunc: (d) => {
                            if (i === 0) {
                                d.replaceLeft(() => padding, { d });
                                d.replaceTop(() => d.parent.popupText.bottom + spacing, { d });
                                d.replaceWidth(() => (d.parent.innerWidth - padding * 2 - (buttonCount - 1) * spacing) / buttonCount, { d });
                                d.replaceHeight(() => d.parent.innerHeight - d.top - padding, { d });   
                            }
                            else {
                                const previousButton = this.buttons[i - 1];
                                d.replaceLeft(() => previousButton.right + spacing, { previousButton });
                                d.replaceTop(() => previousButton.top, { previousButton });
                                d.replaceWidth(() => previousButton.width, { previousButton });
                                d.replaceHeight(() => previousButton.height, { previousButton });
                            }
                        }
                    });

                    this.buttons.push(button);
                }
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.innerWidth * 0.12, { d });
                d.replaceTop(() => (d.parent.innerHeight - d.height) / 2, { d });
                d.replaceWidth(() => d.parent.innerWidth - d.left * 2, { d });
                d.replaceHeight(() => d.width, { d });

                if (this.modifyPanelFunc)
                    this.modifyPanelFunc(d);
            }
        });
    }
    setup() {
        super.setup();

        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => this.parent.width);
        this.replaceHeight(() => this.parent.height);
    }
}