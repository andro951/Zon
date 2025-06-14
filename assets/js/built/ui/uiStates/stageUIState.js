"use strict";

Zon.UI.StageUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super('stageSelectUI', Zon.UI.UIElementZID.CLOSE_BUTTON_MENU);
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }
    postConstructor() {
        super.postConstructor();

        // const button = document.createElement('button');
        // button.innerText = 'Shrink Me';
        // button.style.position = 'absolute';
        // button.style.left = '100px';
        // button.style.top = '100px';
        // button.style.width = '40px'; // Small width
        // button.style.height = '40px';
        // button.style.whiteSpace = 'nowrap';
        // button.style.overflow = 'hidden';
        // button.style.padding = '5px';
        // button.style.border = '1px solid black';
        // button.style.fontSize = '20px'; // Start large
        // button.style.lineHeight = '1';
        // button.style.fontFamily = 'sans-serif';
        // button.style.boxSizing = 'border-box';

        // this.element.appendChild(button);

        // // Shrink to fit logic with layout delay
        // function shrinkToFit(btn) {
        //     requestAnimationFrame(() => {
        //         let fontSize = parseFloat(btn.style.fontSize);
        //         const minFontSize = 5;

        //         while (btn.scrollWidth > btn.clientWidth && fontSize > minFontSize) {
        //             fontSize -= 1;
        //             btn.style.fontSize = fontSize + 'px';
        //         }
        //     });
        // }

        // shrinkToFit(button);

        // this.shown.onChangedAction.add(() => shrinkToFit(button));

        // Create button with automatically scaling text using only JS (no measurement, no manual resize)
        function createAutoShrinkButton(textContent, widthPx, heightPx, parent, maxWidthPercent = 0.8) {
            const button = document.createElement('button');
            button.style.width = widthPx + 'px';
            button.style.height = heightPx + 'px';
            button.style.backgroundColor = '#3498db';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.display = 'flex';
            button.style.justifyContent = 'center';
            button.style.alignItems = 'center';
            button.style.padding = '0';
            button.style.overflow = 'hidden';
            button.style.fontFamily = 'sans-serif';

            const span = document.createElement('span');
            span.innerText = textContent;
            span.style.whiteSpace = 'nowrap';
            span.style.textAlign = 'center';
            span.style.display = 'inline-block';
            span.style.maxWidth = (maxWidthPercent * 100) + '%';

            // Use clamp with vw units to auto-scale font size based on viewport width,
            // and allow a min and max font size for sanity.
            span.style.fontSize = `clamp(12px, ${maxWidthPercent * 10}vw, 100px)`;

            button.appendChild(span);
            //document.body.appendChild(button);
            parent.element.appendChild(button);

            return button;
        }

        // Usage:
        createAutoShrinkButton('Auto-scaling button text', 300, 100, this, 0.8);

    }
    postLoadSetup() {
        
    }

    setup = () => {
        super.setup();
        
        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => Zon.device.width);
        this.replaceHeight(() => Zon.device.height * (1 - Zon.UI.CloseButtonUIState.heightScale));
    }
}

Zon.UI.stageUIState = Zon.UI.StageUIState.create();