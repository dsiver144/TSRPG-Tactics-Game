class Tactical_PlayerWaitCommand extends Tactical_PlayerCommand {

    startAction() {
        this.commandWindow.visible = false;
        this.controller.chooseFaceDirectionForUnit(true).then((result) => {
            if (result === 'ok') {
                this.onActionOK();
            } else {
                this.onActionCancel();

            }
        });
    }

    onActionOK() {
        this.unit.wait();
        super.onActionOK();
        this.controller.clearCommands();
        TacticalBattleSystem.inst().cursorOnPlayerTurn();
    }

    onActionCancel() {
        this.cursor.deactivate();
        super.onActionCancel();
    }

}
