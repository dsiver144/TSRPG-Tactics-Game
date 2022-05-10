class Window_TacticalUnitCommand extends Window_Command {
    /**
     * Window_TacticalUnitCommand
     * @param {Rectangle} rect 
     */
    constructor(rect) {
        super(rect);
    }
    /**
     * Set Unit
     * @param {TacticalUnit} unit 
     */
    setUnit(unit) {
        this.unit = unit;
        this.refresh();
    }
    /**
     * Make Command List
     * @returns {void}
     */
    makeCommandList() {
        if (!this.unit) return;
        this.addCommand("Move", 'move', this.unit.isMoved == false);
        this.addCommand("Attack", 'attack', true);
        this.addCommand("Defend", 'defend', true);
        this.addCommand("Skill", 'skill', true);
        this.addCommand("Magic", 'skill', true);
        this.addCommand("Use Item", 'item', true);
        this.addCommand("Wait", 'wait', true);

        this.setHandler('move', this.onMoveCommand.bind(this));
        this.setHandler('attack', this.onAttackCommand.bind(this));
        this.setHandler('defend', this.onDefendCommand.bind(this));
        this.setHandler('skill', this.onSkillCommand.bind(this));
        this.setHandler('item', this.onItemCommand.bind(this));
        this.setHandler('wait', this.onWaitCommand.bind(this));
    }

    onMoveCommand() {
        const unit = this.unit;
        const cursor = TacticalBattleSystem.inst().cursor;
        TacticalRangeManager.inst().showMoveTileSprites(unit);
        cursor.activate();
        this.visible = false;

        cursor.setOnOKCallback((x, y) => {
            if (!unit.canMoveTo(x, y)) {
                SoundManager.playBuzzer();
                return;
            }
            
            cursor.deactivate();
            TacticalRangeManager.inst().hideTileSprites(unit);
            unit.move(x, y);

            const waitForMoveInterval = setInterval(() => {
                if (!unit.isBusy()) {
                    this.refresh();
                    this.activate();
                    this.visible = true;
                    clearInterval(waitForMoveInterval);
                }
            }, 1000/60);
        })
    }

    onAttackCommand() {
        const unit = this.unit;
        const cursor = TacticalBattleSystem.inst().cursor;
        cursor.activate();
        this.visible = false;
        
        TacticalRangeManager.inst().showActionTileSprites(unit, unit.attackSkillId());
        cursor.setOnOKCallback((x, y) => {
            if (!unit.canUseActionAt(x, y)) {
                SoundManager.playBuzzer();
                return;
            }
            
            cursor.deactivate();
            TacticalRangeManager.inst().hideTileSprites(unit);
            unit.attack(x, y);
            console.log("Unit attack at", x, y);

            // const waitForMoveInterval = setInterval(() => {
            //     if (!unit.isBusy()) {
            //         this.refresh();
            //         this.activate();
            //         this.visible = true;
            //         clearInterval(waitForMoveInterval);
            //     }
            // }, 1000/60);
        });

        this.visible = false;

    }

    onDefendCommand() {

    }

    onSkillCommand() {

    }

    onItemCommand() {

    }

    onWaitCommand() {
        this.unit.wait();
        this.visible = false;
    }
}