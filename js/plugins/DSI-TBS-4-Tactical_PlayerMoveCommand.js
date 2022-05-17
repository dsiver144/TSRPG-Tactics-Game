class Tactical_PlayerMoveCommand extends Tactical_PlayerCommand {

    startAction() {
        if (!this.lastUnitPosition) {
            this.lastUnitPosition = new Position(this.unit.position.x, this.unit.position.y);
            this.lastUnitDirection = this.unit.getFaceDirection();
        }
        this.unit.isMoved = false;
        this.unit.setPosition(this.lastUnitPosition.x, this.lastUnitPosition.y);
        this.unit.setFaceDirection(this.lastUnitDirection);

        this.commandWindow.visible = false;

        this.cursor.activate();
        this.cursor.clearAllCallbacks();

        TacticalRangeManager.inst().showMoveTileSprites(this.unit);

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
        this.onFinishMove();
        super.onActionOK();
    }

    onFinishMove() {
        /** @type {TacticalPlayerController} */
        const controller = this.unit.controller;

        const command = new Tactical_PlayerOpenWindowCommandListCommand(controller);
        controller.pushCommand(command);

        command.setOnCancelCallback(() => {
            controller.popCommand();
        });
    }

    onActionCancel() {
        TacticalRangeManager.inst().hideTileSprites(this.unit);
        super.onActionCancel();
    }
}
