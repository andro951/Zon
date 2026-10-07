"use strict";

Zon.UI.SlideAnimation = class SlideAnimation {
    constructor(uiState) {
        this.uiState = uiState;
        if (this.constructor === Zon.UI.SlideAnimation) {
            throw new Error("Cannot instantiate abstract class SlideAnimation");
        }

        this.showing = false;
        this.hiding = false;
        this.firstShow = true;
        this._calledForceShow = false;
        this.uiState.postConstructorActions.add(() => {
            this.uiState.shown.onChangedAction.add(() => {
                const shown = this.uiState.shown.value;
                if (shown) {
                    if (!this._calledForceShow) {
                        this.tryRemoveShowing();
                        this.tryRemoveHiding();
                    }
                }
                else {
                    this.tryRemoveShowing();
                    this.tryRemoveHiding();
                }
            });
        });
    }

    tryRemoveShowing() {
        if (this.showing) {
            this.showing = false;
            Zon.game.preDrawActions.remove(this._updateShowPosition);
        }
    }

    tryRemoveHiding() {
        if (this.hiding) {
            this.hiding = false;
            Zon.game.preDrawActions.remove(this._updateHidePosition);
        }
    }

    onFinishShowing() {
        if (zonDebug && !this.showing)
            throw new Error("onFinishShowing called while not showing");

        this.tryRemoveShowing();
    }

    postLinkDependentVariables() {
        if (!this.firstShow)
            return;

        if (this._calledForceShow)
            this._moveToShowAnimationStartPosition();

        delete this.firstShow;
    }

    _moveToShowAnimationStartPosition() {
        throw new Error("Method _moveToShowAnimationStartPosition must be implemented in subclass of SlideAnimation");
    }

    show() {
        if (this.showing)
            return;

        this._calledForceShow = true;
        this.uiState.forceShow(this);
        this._calledForceShow = false;

        this.tryRemoveHiding();
        this.showing = true;
        Zon.game.preDrawActions.add(this._updateShowPosition);
    }

    hide() {
        if (this.hiding)
            return;

        this.tryRemoveShowing();
        this.hiding = true;
        Zon.game.preDrawActions.add(this._updateHidePosition);
    }

    _updateShowPosition() {
        throw new Error("Method _updateShowPosition must be implemented in subclass of SlideAnimation");
    }

    _updateHidePosition() {
        throw new Error("Method _updateHidePosition must be implemented in subclass of SlideAnimation");
    }
}