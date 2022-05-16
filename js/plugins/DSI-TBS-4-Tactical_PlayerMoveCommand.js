class Tactical_PlayerMoveCommand extends Tactical_PlayerCommand {

    startAction() {
        TacticalRangeManager.inst().showMoveTileSprites(this.unit);
        this.cursor.activate();

        this.commandWindow.visible = false;

        this.cursor.setOnOKCallback((x, y) => {
            if (!this.unit.canMoveTo(x, y)) {
                SoundManager.playBuzzer();
                return;
            }
            this.onActionOK({ x, y });

        });
        this.cursor.setOnCancelCallback(() => {
            this.onActionCancel();
        });
    }

    onActionOK({ x, y }) {
        this.cursor.deactivate();
        TacticalRangeManager.inst().hideTileSprites(this.unit);
        this.unit.move(x, y);

        this.waitForMovement = true;
    }

    update() {
        super.update();
        this.updateMovement();
    }

    updateMovement() {
        if (!this.waitForMovement)
            return;
        if (this.unit.isBusy())
            return;
        this.waitForMovement = false;
        super.onActionOK();

        this.controller.popCommand();
    }

    onActionCancel() {
        TacticalRangeManager.inst().hideTileSprites(this.unit);
        super.onActionCancel();
    }
}
