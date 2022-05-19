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
    /**
     * On Attack Command
     */
    onAttackCommand() {
        const command = new Tactical_PlayerSkillCommand(this);
        command.setSkill(this.unit.attackSkillId(), 'attack');
        this.pushCommand(command);
    }
    /**
     * On Defend Command
     */
    onDefendCommand() {
        const command = new Tactical_PlayerSkillCommand(this);
        command.setSkill(this.unit.defendSkillId(), 'defend');
        this.pushCommand(command);
    }
    /**
     * On Skill Command
     */
    onSkillCommand() {
        const skillType = this.commandWindow.currentExt();
        console.log(skillType);
        const command = new Tactical_PlayerOpenWindowSkillListCommand(this);
        command.setStypeId(skillType);
        this.pushCommand(command);
    }
    /**
     * On Item Command
     */
    onItemCommand() {
        const command = new Tactical_PlayerOpenWindowItemListCommand(this);
        this.pushCommand(command);
    }
    /**
     * On Wait Command
     */
    onWaitCommand() {
        this.pushCommand(new Tactical_PlayerWaitCommand(this));
    }
    /**
     * Choose Face Direction For Unit
     * @param {boolean} canBeCancelled 
     * @returns {Promise<"ok"|"cancel">}
     */
    chooseFaceDirectionForUnit(canBeCancelled) {
        return new Promise((resolve, reject) => {

            this.unit.setFaceChoosingStatus(true);

            const cursor = TacticalBattleSystem.inst().cursor;

            TacticalBattleSystem.inst().unitDirectionIndicatorSprite.setUnit(this.unit);

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
                this.unit.setFaceChoosingStatus(false);
                cursor.deactivate();
                resolve('ok');
            })
            if (canBeCancelled) {
                cursor.setOnCancelCallback(() => {
                    SoundManager.playCancel();

                    this.unit.setFaceChoosingStatus(false);
                    cursor.clearAllCallbacks();
                    resolve('cancel');
                })
            }
        })
    }
}

