"use strict";

Zon.UI.SlideAnimationHorizontal = class SlideAnimationHorizontal extends Zon.UI.SlideAnimation {
    constructor(uiState, fromLeft = true, { slideInTime = 0.25, slideOutTime = 0.1 } = {}) {
        super(uiState);
        this.slideInTime = slideInTime * 1000;
        this.slideOutTime = slideOutTime * 1000;
        this.fromLeft = fromLeft;
        this.bindAll();
    }

    _moveToShowAnimationStartPosition() {
        this.uiState.leftOffset = this.fromLeft ? -this.uiState.width : this.uiState.width;
    }

    _updateShowPosition = () => {
        const leftOffset = this.uiState.leftOffset;
        const amountToMove = Zon.timeController.deltaTimeMilliseconds / this.slideInTime * this.uiState.width;
        if (Math.abs(leftOffset) < amountToMove) {
            this.uiState.leftOffset = 0;
            this.onFinishShowing();
        } else {
            this.uiState.leftOffset += leftOffset > 0 ? -amountToMove : amountToMove;
        }
    }

    _updateHidePosition = () => {
        const hiddenPosition = this.fromLeft ? -this.uiState.width : this.uiState.width;
        const diff = hiddenPosition - this.uiState.leftOffset;
        const amountToMove = Zon.timeController.deltaTimeMilliseconds / this.slideOutTime * this.uiState.width;
        if (Math.abs(diff) < amountToMove) {
            this.uiState.leftOffset = hiddenPosition;
            this.uiState.forceHide();
        } else {
            this.uiState.leftOffset += diff > 0 ? amountToMove : -amountToMove;
        }
    }
}