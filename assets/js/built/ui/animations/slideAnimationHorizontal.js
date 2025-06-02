"use strict";

Zon.UI.SlideAnimationHorizontal = class SlideAnimationHorizontal {
    constructor(uiState, fromLeft = true, { slideInTime = 0.25, slideOutTime = 0.1 } = {}) {
        this.uiState = uiState;
        this.slideInTime = slideInTime * 1000;
        this.slideOutTime = slideOutTime * 1000;
        this.fromLeft = fromLeft;
        this.bindAll();
        Zon.Setup.postLinkAndFinalizeUiSetupActions.add(this._moveToInitialPosition);
    }

    _moveToInitialPosition() {
        if (this.uiState.shown.value) {
            this.uiState.leftOffset = 0;
        }
        else {
            this.uiState.leftOffset = this.fromLeft ? -this.uiState.width : this.uiState.width;
        }
    }

    show() {
        this.uiState.forceShow();
        Zon.game.preDrawActions.remove(this._updateHidePosition);
        Zon.game.preDrawActions.add(this._updateShowPosition);
    }

    hide() {
        Zon.game.preDrawActions.remove(this._updateShowPosition);
        Zon.game.preDrawActions.add(this._updateHidePosition);
    }

    _updateShowPosition = () => {
        const leftOffset = this.uiState.leftOffset;
        const amountToMove = Zon.timeController.deltaTimeMilliseconds / this.slideInTime * this.uiState.width;
        if (Math.abs(leftOffset) < amountToMove) {
            this.uiState.leftOffset = 0;
            Zon.game.preDrawActions.remove(this._updateShowPosition);
            this.uiState._updateLeft();
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
            this.uiState._updateLeft();
            this.uiState.forceHide();
        } else {
            this.uiState.leftOffset += diff > 0 ? amountToMove : -amountToMove;
        }
    }
}