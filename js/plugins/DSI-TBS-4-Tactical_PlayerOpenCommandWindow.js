class Tactical_PlayerOpenWindowCommandListCommand extends Tactical_PlayerCommand {

    startAction() {
        this.cursor.clearAllCallbacks();
        this.cursor.deactivate();
        this.commandWindow.refresh();
        this.commandWindow.visible = true;
        this.commandWindow.activate();
        this.commandWindow.select(0);
        this.commandWindow.setHandler('cancel', this.onActionCancel.bind(this));
        this.setCommandWindowPosition();
        this.onActionOK();
    }

    setOnCancelCallback(callback) {
        this.onCancelCallback = callback;
    }

    setCommandWindowPosition() {
        const xSpacing = 64;
        this.commandWindow.x = this.unit.battlerSprite.x + xSpacing;
        this.commandWindow.y = this.unit.battlerSprite.y - this.commandWindow.height / 2;
        if (this.commandWindow.x + this.commandWindow.width >= Graphics.width) {
            this.commandWindow.x = this.unit.battlerSprite.x - this.commandWindow.width - xSpacing;
        }
    }

    onActionCancel() {
        this.onCancelCallback && this.onCancelCallback();
    }

}
