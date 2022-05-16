class Tactical_PlayerInitCommand extends Tactical_PlayerCommand {

    startAction() {
        if (this.unit.hasActed()) {
            this.onActionCancel();
            return;
        }
        this.cursor.deactivate();
        this.commandWindow.refresh();
        this.commandWindow.visible = true;
        this.commandWindow.activate();

        this.setCommandWindowPosition();

        this.onActionOK();

        this.commandWindow.setHandler('cancel', this.onActionCancel.bind(this));
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
        this.commandWindow.visible = false;
        TacticalBattleSystem.inst().cursorOnPlayerTurn();
        this.commandWindow.setHandler('cancel', null);
    }

}
