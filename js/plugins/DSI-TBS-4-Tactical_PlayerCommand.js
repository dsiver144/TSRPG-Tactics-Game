class Tactical_PlayerCommand {
    /**
     * Tactical_PlayerCommand
     * @param {TacticalPlayerController} controller
     */
    constructor(controller) {
        this.controller = controller;

        this.commandWindow = this.controller.commandWindow;
        this.unit = this.controller.unit;
        this.cursor = this.controller.cursor;
    }
    /**
     * Start Action
     */
    startAction() {
        
    }
    /**
     * On Action OK
     * @param {object} params
     */
    onActionOK(params) {
        this.onActionEnd(false);
    }
    /**
     * On Action Cancel
     */
    onActionCancel() {
        this.controller.popCommand();
        this.onActionEnd(true);
    }
    /**
     * Update
     */
    update() {
        
    }
    /**
     * End Action
     * @param {boolean} cancelled
     */
    onActionEnd(cancelled) {

    }
}


