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
        this.endAction(false);
    }
    /**
     * On Action Cancel
     */
    onActionCancel() {
        this.controller.popCommand();
        this.endAction(true);
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
    endAction(cancelled) {

    }
}

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
        this.onActionOK();

        this.commandWindow.setHandler('cancel', this.onActionCancel.bind(this));
    }

    onActionCancel() {
        this.commandWindow.visible = false;
        TacticalBattleSystem.inst().cursorOnPlayerTurnCallback();
        this.commandWindow.setHandler('cancel', null);
    }

}

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
            this.onActionOK({x, y});
            
        })
        this.cursor.setOnCancelCallback(() => {
            this.onActionCancel();
        })
    }

    onActionOK({x, y}) {
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
        if (!this.waitForMovement) return;
        if (this.unit.isBusy()) return;
        this.waitForMovement = false;
        super.onActionOK();

        this.controller.popCommand();
    }

    onActionCancel() {
        TacticalRangeManager.inst().hideTileSprites(this.unit);
        super.onActionCancel();
    }
}

class Tactical_PlayerWaitCommand extends Tactical_PlayerCommand {
    
    startAction() {
        this.commandWindow.visible = false;
        this.controller.chooseFaceDirection(() => {
            this.onActionOK();
        }, () => {
            this.onActionCancel();
        });
    }

    onActionOK() {
        this.unit.wait();
        super.onActionOK();

        this.controller.popCommand();
    }

    onActionCancel() {
        this.cursor.deactivate();
        super.onActionCancel();
    }
    
}

class Tactical_PlayerSkillCommand extends Tactical_PlayerCommand {
    /**
     * Set Skill
     * @param {number} skillId 
     * @param {string} type 
     */
    setSkill(skillId, type = 'skill') {
        this.skillId = skillId;
        this.skillType = type;
    }

    startAction() {
        const skillId = this.skillId;
        const skill = $dataSkills[skillId];
        /** @type {TBS_SkillData} */
        const tbsSkill = skill.tbsSkill;

        this.battleSystem = TacticalBattleSystem.inst();

        this.cursor.activate();
        this.commandWindow.visible = false;

        let actionTileImg = tbsSkill.getTileImage();
        if (tbsSkill.range.selection) {
            TacticalRangeManager.inst().showSelectionTileAtCursor(tbsSkill.range.selection, actionTileImg);
            actionTileImg = 'BlueSquare';
        }
        TacticalRangeManager.inst().showActionTileSprites(this.unit, this.skillId, actionTileImg);
        // Directional button callback
        this.cursor.setDirectionalCallback((direction, x, y) => {
            if (!this.unit.canUseActionAt(x, y)) {
                console.log("Cant use skill here");
                return;
            }
        }, false)
        // OK Callback
        this.cursor.setOnOKCallback((x, y) => {

            if (!this.unit.canUseActionAt(x, y)) {
                SoundManager.playBuzzer();
                return;
            }

            this.onActionOK({x, y});
            
        });

        this.cursor.setOnCancelCallback(() => {
            TacticalRangeManager.inst().hideTileSprites(this.unit);
            TacticalRangeManager.inst().hideTileSprites(this.cursor);

            onCancelCallback && onCancelCallback();
            SoundManager.playCancel();
        })
    }

    onActionOK({x, y}) {

        this.cursor.deactivate();
        this.cursor.hide();
        TacticalRangeManager.inst().hideTileSprites(this.unit);
        TacticalRangeManager.inst().hideTileSprites(this.cursor);

        switch (this.skillType) {
            case 'attack':
                this.unit.attack(x, y);
                break;
            case 'skill':
                this.unit.useSkill(x, y);
                break;
        }

        this.waitForSkill = true;
    }

    onActionCancel() {

        this.cursor.deactivate();
        this.cursor.hide();
        TacticalRangeManager.inst().hideTileSprites(this.unit);
        TacticalRangeManager.inst().hideTileSprites(this.cursor);

        super.onActionCancel();
    }

    update() {
        super.update();
        this.updateSkill();
    }

    updateSkill() {
        if (!this.waitForSkill) return;
        if (this.battleSystem.isBusy()) return;
        if (this.unit.actionPoints > 1) {
            this.endAction(false);
        } else {
            this.controller.chooseFaceDirection(() => {
                this.endAction(false);
            });
        }
        this.waitForSkill = false;
    }

    endAction(cancelled) {
        if (!cancelled) {
            this.unit.onActionEnd();
            this.controller.popCommand();
        }
        super.endAction();
    }

}