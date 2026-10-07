"use strict";

Zon.UI.SlideAnimationVertical = class SlideAnimationVertical extends Zon.UI.SlideAnimation {
    constructor(uiState, fromTop = true, { slideInTime = 0.25, slideOutTime = 0.1 } = {}) {
        super(uiState);
        this.slideInTime = slideInTime * 1000;
        this.slideOutTime = slideOutTime * 1000;
        this.fromTop = fromTop;
        this.bindAll();
    }

    _moveToShowAnimationStartPosition() {
        this.uiState.topOffset = this.fromTop ? -this.uiState.height : this.uiState.height;
    }

    _updateShowPosition = () => {
        const topOffset = this.uiState.topOffset;
        const amountToMove = Zon.timeController.deltaTimeMilliseconds / this.slideInTime * this.uiState.height;
        if (Math.abs(topOffset) < amountToMove) {
            this.uiState.topOffset = 0;
            this.onFinishShowing();
        } else {
            this.uiState.topOffset += topOffset > 0 ? -amountToMove : amountToMove;
        }
    }

    _updateHidePosition = () => {
        const hiddenPosition = this.fromTop ? -this.uiState.height : this.uiState.height;
        const diff = hiddenPosition - this.uiState.topOffset;
        const amountToMove = Zon.timeController.deltaTimeMilliseconds / this.slideOutTime * this.uiState.height;
        if (Math.abs(diff) < amountToMove) {
            this.uiState.topOffset = hiddenPosition;
            this.uiState.forceHide();
        } else {
            this.uiState.topOffset += diff > 0 ? amountToMove : -amountToMove;
        }
    }
}