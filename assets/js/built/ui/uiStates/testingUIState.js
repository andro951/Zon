"use strict";

Zon.UI.TestingUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('testingUI', Zon.UI.UIElementZID.CBM_SUB_MENU);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }
    postConstructor() {
        super.postConstructor();

        this.testElement = Zon.UI.UIElementDiv2.create('testingElement', this.element.style.zIndex, this, {
            constructorFunc: (d) => {
                //d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0xFF0000FF).cssString;
                d.element.style.borderWidth = `4px`;
                d.element.style.borderStyle = 'solid';
                d.element.style.borderColor = `#AAA`;
                // d.element.style.borderRadius = `0px`;
                //d.element.style.fontWeight = `bold`;
                //d.element.textContent = `Stage Select`;
                //d.element.style.display = 'flex';
                //d.element.style.justifyContent = 'center';
                //d.element.style.alignItems = 'center';
                //d.element.style.whiteSpace = 'nowrap';
                //d.element.style.boxSizing = 'border-box';
                //d.element.style.border = 'none';
                //d.element.style.padding = '0';

            },
            postConstructorFunc: (d) => {
                d.testElement2 = Zon.UI.UIElementDiv2.create('testingElement2', d.element.style.zIndex, d, {
                    constructorFunc: (d) => {
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x00FF00FF).cssString;
                        // d.element.style.borderWidth = `4px`;
                        // d.element.style.borderStyle = 'solid';
                        // d.element.style.borderColor = `#AAA`;
                        // d.element.style.borderRadius = `0px`;
                        //d.element.style.fontWeight = `bold`;
                        //d.element.textContent = `Stage Select`;
                        //d.element.style.display = 'flex';
                        //d.element.style.justifyContent = 'center';
                        //d.element.style.alignItems = 'center';
                        //d.element.style.whiteSpace = 'nowrap';
                        //d.element.style.boxSizing = 'border-box';
                        //d.element.style.border = 'none';
                        //d.element.style.padding = '0';

                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => 0, { d });
                        d.replaceTop(() => 0, { d });
                        d.replaceWidth(() => d.parent.innerWidth, { d });
                        d.replaceHeight(() => 8, { d });
                    }
                });
            },
            setupFunc: (d) => {
                d.replaceLeft(() => 4, { d });
                d.replaceTop(() => 4, { d });
                d.replaceWidth(() => 40, { d });
                d.replaceHeight(() => 20, { d });
            }
        });

        this.testElement3 = Zon.UI.UIElementDiv2.create('testingElement3', this.element.style.zIndex, this, {
            constructorFunc: (d) => {
                //d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                d.element.style.backgroundColor = Struct.Color.fromUInt(0xFF0000FF).cssString;
                // d.element.style.borderWidth = `4px`;
                // d.element.style.borderStyle = 'solid';
                // d.element.style.borderColor = `#AAA`;
                // d.element.style.borderRadius = `0px`;
                //d.element.style.fontWeight = `bold`;
                //d.element.textContent = `Stage Select`;
                //d.element.style.display = 'flex';
                //d.element.style.justifyContent = 'center';
                //d.element.style.alignItems = 'center';
                //d.element.style.whiteSpace = 'nowrap';
                //d.element.style.boxSizing = 'border-box';
                //d.element.style.border = 'none';
                //d.element.style.padding = '0';

            },
            postConstructorFunc: (d) => {
                d.testElement4 = Zon.UI.UIElementDiv2.create('testingElement4', d.element.style.zIndex, d, {
                    constructorFunc: (d) => {
                        d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
                        d.element.style.backgroundColor = Struct.Color.fromUInt(0x00FF00FF).cssString;
                        // d.element.style.borderWidth = `4px`;
                        // d.element.style.borderStyle = 'solid';
                        // d.element.style.borderColor = `#AAA`;
                        // d.element.style.borderRadius = `0px`;
                        //d.element.style.fontWeight = `bold`;
                        //d.element.textContent = `Stage Select`;
                        //d.element.style.display = 'flex';
                        //d.element.style.justifyContent = 'center';
                        //d.element.style.alignItems = 'center';
                        //d.element.style.whiteSpace = 'nowrap';
                        //d.element.style.boxSizing = 'border-box';
                        //d.element.style.border = 'none';
                        //d.element.style.padding = '0';

                    },
                    setupFunc: (d) => {
                        d.replaceLeft(() => 0, { d });
                        d.replaceTop(() => 0, { d });
                        d.replaceWidth(() => d.parent.innerWidth, { d });
                        d.replaceHeight(() => 8, { d });
                    }
                });
            },
            setupFunc: (d) => {
                d.replaceLeft(() => 4, { d });
                d.replaceTop(() => d.parent.testElement.bottom + 4, { d });
                d.replaceWidth(() => 40, { d });
                d.replaceHeight(() => 20, { d });
            }
        });
    }
    setup() {
        super.setup();
        
        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Zon.device.height * (1 - Zon.UI.CloseButtonUIState.heightScale));
    }
}

Zon.UI.testingUIState = Zon.UI.TestingUIState.create();