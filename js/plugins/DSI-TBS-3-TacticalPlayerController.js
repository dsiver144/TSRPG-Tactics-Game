class TacticalPlayerController extends TacticalUnitController {
    /**
     * TacticalPlayerController
     * @param {TacticalUnit} unit
     */
    constructor(unit) {
        super(unit);
        /**
         * @type {Tactical_PlayerCommand[]}
         */
        this.playerCommands = [];
    }
    /**
     * Update
     */
    update() {
        this.playerCommands.forEach(command => command.update());
    }
    /**
     * Push Command
     * @param {Tactical_PlayerCommand} command 
     */
    pushCommand(command) {
        this.playerCommands.push(command);
        command.startAction();
    }
    /**
     * Pop Command
     */
    popCommand() {
        this.playerCommands.pop();
        const previousCommand = this.playerCommands[this.playerCommands.length - 1];
        if (previousCommand) {
            previousCommand.startAction();
        }
    }
    /**
     * Clear commands
     */
    clearCommands() {
        this.playerCommands.splice(0, this.playerCommands.length);
    }
    /**
     * On Select
     */
    onSelect() {
        if (this.unit.hasActed()) {
            SoundManager.playBuzzer();
            return;
        }
        
        this.commandWindow = TacticalBattleSystem.inst().actorUnitCommandWindow;
        this.commandWindow.setUnit(this.unit);
        this.cursor = TacticalBattleSystem.inst().cursor;

        this.commandWindow.setHandler('move', this.onMoveCommand.bind(this));
        this.commandWindow.setHandler('attack', this.onAttackCommand.bind(this));
        this.commandWindow.setHandler('defend', this.onDefendCommand.bind(this));
        this.commandWindow.setHandler('skill', this.onSkillCommand.bind(this));
        this.commandWindow.setHandler('item', this.onItemCommand.bind(this));
        this.commandWindow.setHandler('wait', this.onWaitCommand.bind(this));

        this.onInitCommand();
    }
    /**
     * onInitCommand
     */
    onInitCommand() {
        this.pushCommand(new Tactical_PlayerInitCommand(this));
    }
    /**
     * onMoveCommand
     */
    onMoveCommand() {
        this.pushCommand(new Tactical_PlayerMoveCommand(this));
    }

    onAttackCommand() {
        const command = new Tactical_PlayerSkillCommand(this);
        command.setSkill(this.unit.attackSkillId(), 'attack');
        this.pushCommand(command);
    }

    onDefendCommand() {

    }

    onSkillCommand() {

    }

    onItemCommand() {
        const command = new Tactical_PlayerOpenWindowItemListCommand(this);
        this.pushCommand(command);
    }

    onWaitCommand() {
        this.pushCommand(new Tactical_PlayerWaitCommand(this));
        // const cursor = TacticalBattleSystem.inst().cursor;
        // this.commandWindow.visible = false;
        // this.chooseFaceDirection(() => {
        //     this.unit.wait();
        // }, () => {
        //     this.commandWindow.visible = true;
        //     cursor.deactivate();
        //     this.activate();
        // })
    }
    /**
     * On Turn End
     * @param {Function} onFinishCallback
     * @param {Function} onCancelCallback
     */
    onTurnEnd(onFinishCallback = null, onCancelCallback = null) {
        this.commandWindow.visible = false;
        this.chooseFaceDirection(onFinishCallback, onCancelCallback);
    }
    /**
     * Choose face direction
     * @param {Function} onFinishCallback
     * @param {Function} onCancelCallback
     */
    chooseFaceDirection(onFinishCallback, onCancelCallback) {
        this.unit.chooseFaceDirecion(true);

        const cursor = TacticalBattleSystem.inst().cursor;

        cursor.activate();
        cursor.move(this.unit.position.x, this.unit.position.y);
        cursor.show();

        cursor.clearAllCallbacks();
        cursor.setDirectionalCallback((direction) => {
            SoundManager.playCursor();

            this.unit.setFaceDirection(direction);
            return false;
        }, true)
        cursor.setOnOKCallback(() => {
            SoundManager.playOk();

            this.unit.chooseFaceDirecion(false);
            cursor.deactivate();
            onFinishCallback && onFinishCallback();
        })
        if (onCancelCallback) {
            cursor.setOnCancelCallback(() => {
                SoundManager.playCancel();

                this.unit.chooseFaceDirecion(false);
                cursor.clearAllCallbacks();
                onCancelCallback();
            })
        }
    }
}

