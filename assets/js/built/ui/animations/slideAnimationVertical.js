"use strict";

Zon.UI.SlideAnimationVertical = class SlideAnimationVertical {
    constructor(uiState, fromTop = true, { slideInTime = 0.25, slideOutTime = 0.1 } = {}) {
        this.uiState = uiState;
        this.slideInTime = slideInTime * 1000;
        this.slideOutTime = slideOutTime * 1000;
        this.fromTop = fromTop;
        this.hiding = false;
        this.bindAll();
        Zon.Setup.postLinkAndFinalizeUiSetupActions.add(this._moveToInitialPosition);
    }

    _moveToInitialPosition() {
        if (this.uiState.shown.value) {
            this.uiState.topOffset = 0;
        }
        else {
            this.uiState.topOffset = this.fromTop ? -this.uiState.height : this.uiState.height;
        }
    }

    show() {
        this.uiState.forceShow();
        Zon.game.preDrawActions.remove(this._updateHidePosition);
        Zon.game.preDrawActions.add(this._updateShowPosition);
    }

    hide() {
        if (this.hiding)
            return;

        this.hiding = true;
        Zon.game.preDrawActions.remove(this._updateShowPosition);
        Zon.game.preDrawActions.add(this._updateHidePosition);
    }

    _updateShowPosition = () => {
        const topOffset = this.uiState.topOffset;
        const amountToMove = Zon.timeController.deltaTimeMilliseconds / this.slideInTime * this.uiState.height;
        if (Math.abs(topOffset) < amountToMove) {
            this.uiState.topOffset = 0;
            Zon.game.preDrawActions.remove(this._updateShowPosition);
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
            Zon.game.preDrawActions.remove(this._updateHidePosition);
            this.hiding = false;
            this.uiState.forceHide();
        } else {
            this.uiState.topOffset += diff > 0 ? amountToMove : -amountToMove;
        }
    }
}