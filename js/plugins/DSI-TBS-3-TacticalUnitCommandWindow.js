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
        this.onUseSkill(this.unit.attackSkillId(), () => {
            
        }, () => {

        });
    }

    onDefendCommand() {

    }

    onSkillCommand() {

    }

    onItemCommand() {

    }

    onWaitCommand() {
        const cursor = TacticalBattleSystem.inst().cursor;
        this.visible = false;
        this.chooseFaceDirection(() => {
            this.unit.wait();
        }, () => {
            this.visible = true;
            cursor.deactivate();
            this.activate();
        })
    }
    /**
     * On Turn End
     * @param {Function} onFinishCallback
     * @param {Function} onCancelCallback
     */
    onTurnEnd(onFinishCallback = null, onCancelCallback = null) {
        this.visible = false;
        this.chooseFaceDirection(onFinishCallback, onCancelCallback);
    }
    /**
     * On Use Skill
     * @param {number} skillId 
     * @param {Function} onFinishCallback 
     * @param {Function} onCancelCallback 
     */
    onUseSkill(skillId, onFinishCallback = null, onCancelCallback = null) {
        const skill = $dataSkills[skillId];
        /** @type {TBS_SkillData} */
        const tbsSkill = skill.tbsSkill;

        const unit = this.unit;
        const battleSystem = TacticalBattleSystem.inst();
        const cursor = battleSystem.cursor;
        cursor.activate();
        this.visible = false;

        let actionTileImg = 'RedSquare';
        if (tbsSkill.range.aoe) {
            TacticalRangeManager.inst().showAOETilesAtCursor(tbsSkill.range.aoe);
            actionTileImg = 'BlueSquare';
        }
        TacticalRangeManager.inst().showActionTileSprites(unit, skillId, actionTileImg);
        // Directional button callback
        cursor.setDirectionalCallback((direction, x, y) => {
            if (!unit.canUseActionAt(x, y)) {
                console.log("Cant use skill here");
                return;
            }
            return false;
        }, false)
        // OK Callback
        cursor.setOnOKCallback((x, y) => {

            if (!unit.canUseActionAt(x, y)) {
                SoundManager.playBuzzer();
                return;
            }
            
            cursor.deactivate();
            cursor.hide();
            TacticalRangeManager.inst().hideTileSprites(unit);
            TacticalRangeManager.inst().hideTileSprites(cursor);

            unit.attack(x, y);

            const waitToFinishInterval = setInterval(() => {
                if (!battleSystem.isBusy()) {
                    this.chooseFaceDirection(() => {
                        unit.onActionEnd();
                        cursor.show();
                        cursor.activate();
                        onFinishCallback && onFinishCallback();
                    });
                    clearInterval(waitToFinishInterval);
                }
            }, 1000/60);
            
        });
        // Cancel Callback
        cursor.setOnCancelCallback(() => {
            TacticalRangeManager.inst().hideTileSprites(unit);
            TacticalRangeManager.inst().hideTileSprites(cursor);

            onCancelCallback && onCancelCallback();
            SoundManager.playCancel();
        })

        this.visible = false;
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