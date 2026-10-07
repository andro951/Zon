"use strict";

Zon.UI.InfoPopup = class InfoPopup extends Zon.UI.UIElementDiv {
    constructor(title, textEquation, parent, modifyPanelFunc = null) {
        //TODO: make parent hiding delete this and remove the function from parent's onhide

        const num = Zon.UI.InfoPopup.popupCounter++;
        super(`infoPopup${num}`, Zon.UI.UIElementZID.POPUP, Zon.device, { inheritShown: true });
        this.title = title;
        if (!(textEquation instanceof Variable.DependentFunction))
            throw new Error('textEquation must be a Variable.DependentFunction');

        this.textEquation = textEquation;
        this.modifyPanelFunc = modifyPanelFunc;
        this.num = num;

        const borderWidth = 2;

        const style = this.element.style;

        style.backgroundColor = Struct.Color.fromUInt(0x000000FF).cssString;
        //style.backgroundColor = Struct.Color.fromUInt(0x00FF00FF).cssString;
        style.borderWidth = `${borderWidth}px`;
        style.borderStyle = 'solid';
        style.borderColor = Struct.Color.fromUInt(0xAAAAAAFF).cssString;
        style.display = 'flex';
    }
    static popupCounter = 0;
    static allPopups = new Map();
    static makePopup(...args) {
        const popup = this.create(...args);
        this.allPopups.set(popup.num, popup);
    }
    delete = () => {
        if (this.shown.value)
            this.shown.unlinkDependentActions();

        this.element.remove();
        Zon.UI.InfoPopup.allPopups.delete(this.num);
    }
    postConstructor() {
        super.postConstructor();

        this.onHideActions.add(this.delete);

        const borderWidth = 2;
        const padding = 1;
        const spacing = 2;

        //Close button
        this.closeButton = Zon.UI.UIElementDiv2.create(`${this.element.id}CloseButton`, Zon.UI.UIElementZID.POPUP, this, {
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
                this.delete();
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.innerWidth - d.width - padding, { d });
                d.replaceTop(() => padding, { d });
                d.replaceWidth(() => d.parent.innerWidth * 0.12 - padding * 2, { d });
                d.replaceHeight(() => d.width, { d });
            }
        });

        //Title
        this.popupTitle = Zon.UI.UIElementDiv2.create(`${this.element.id}Title`, Zon.UI.UIElementZID.POPUP, this, {
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

        //X Button
        this.xButton = Zon.UI.UIElementDiv2.create(`${this.element.id}xButton`, Zon.UI.UIElementZID.POPUP, this, {
            constructorFunc: (d) => {
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x101010FF).cssString;
                //d.element.style.backgroundColor = Struct.Color.fromUInt(0xFF0000FF).cssString;
                d.element.style.borderWidth = `${borderWidth}px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor =  Struct.Color.fromUInt(0xAAAAAAFF).cssString;
                d.element.style.display = 'flex';
                d.element.style.justifyContent = 'center';
                d.element.style.alignItems = 'center';
                d.element.style.borderRadius = `${Zon.UI.UIElementBase.defaultButtonBorderRadius}px`;
            },
            onClick: () => {
                this.delete();
            },
            setupFunc: (d) => {
                d.replaceLeft(() => d.parent.innerLeft, { d });
                d.replaceTop(() => d.parent.innerHeight * (1 - Zon.UI.CloseButtonUIState.heightScale), { d });
                d.replaceWidth(() => d.parent.innerWidth - d.parent.innerLeft - 1, { d });
                d.replaceHeight(() => d.parent.innerHeight * Zon.UI.CloseButtonUIState.heightScale, { d });

                d.addEmptyIcon();
                d.icon.setBackgroundImage(Zon.TextureLoader.getUITexturePath(Zon.UITextureFolders.ICONS, 'CloseIcon'), false);
            }
        });

        //Text
        this.popupText = Zon.UI.UIElementDiv2.create(`${this.element.id}Text`, Zon.UI.UIElementZID.POPUP, this, {
            constructorFunc: (d) => {
                const style = d.element.style;
                style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                //style.backgroundColor = Struct.Color.fromUInt(0xFF0000FF).cssString;
                d.element.textContent = `Text`;
                style.display = 'block';
                style.textAlign = 'left';
                style.paddingLeft = `${8}px`;
                style.paddingRight = `${8}px`;
                style.fontSize = `24px`;
                style.userSelect = "text";
                d.element.setScrollableColumnStyle(false);
            },
            postConstructorFunc: (d) => {
                d.text.replaceEquation(this.textEquation);
            },
            setupFunc: (d) => {
                d.replaceLeft(() => padding, { d });
                d.replaceTop(() => d.parent.closeButton.bottom + spacing, { d });
                d.replaceWidth(() => d.parent.closeButton.right - d.parent.popupTitle.left, { d });
                d.replaceHeight(() => d.parent.xButton.top - d.parent.closeButton.bottom - spacing, { d });
            }
        });
    }
    setup() {
        super.setup();

        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => this.parent.width);
        this.replaceHeight(() => this.parent.height);

        if (this.modifyPanelFunc)
            this.modifyPanelFunc(d);
    }
}