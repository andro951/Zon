"use strict";

Zon.UI.MicTestUIState = class MicTestUIState extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('micTestUI', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU, Zon.device, {
            postConstructorFunc: Zon.UI.MicTestUIState._postConstructorFunc,
        });
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
        this.micFrequency = new Variable.Value(0, 'micFrequency');
    }
    static _postConstructorFunc(d) {
        d.frequencyDisplay = Zon.UI.UIElementDiv2.create('frequencyDisplay', d.element.zIndex, d, {
            constructorFunc: (d) => {
                d.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
                d.element.style.color = Struct.Color.fromUInt(0xFFFFFFFF).cssString;
            },
            postConstructorFunc: (d) => {
                d.text.replaceEquation(() => d.parent.parent.micFrequency.value.toFixed(2).padStart(7, '0'), {d});
            },
            setupFunc: (d) => {
                d.replaceLeft(() => Zon.UI.micTestUIState.useableSpace.width * 0.1);
                d.replaceTop(() => d.left, {d});
                d.replaceWidth(() => Zon.UI.micTestUIState.useableSpace.width - d.left * 2, {d});
                d.replaceHeight(() => d.width, {d});
            }
        });
    }
    onMicReady = () => {
        Zon.game.preDrawActions.add(this.preDraw);
    }
    preDraw = () => {
        this.micFrequency.value = Zon.micManager.getDominantFrequency();
    }
}

Zon.UI.micTestUIState = Zon.UI.MicTestUIState.create();