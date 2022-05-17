class Tactical_PlayerInitCommand extends Tactical_PlayerCommand {

    startAction() {
        /** @type {TacticalPlayerController} */
        const controller = this.unit.controller;

        const command = new Tactical_PlayerOpenWindowCommandListCommand(controller);
        controller.pushCommand(command);
        // Set cancel callback for command window on next action.
        command.setOnCancelCallback(() => {
            this.commandWindow.visible = false;
            TacticalBattleSystem.inst().cursorOnPlayerTurn();
            this.commandWindow.setHandler('cancel', null);
        });
    }

}
