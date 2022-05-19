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
    /**
     * Set Item
     * @param {object} item 
     */
    setItem(item) {
        this.item = item;
    }
    /**
     * Start Action
     */
    startAction() {
        const skillId = this.skillId;
        const skill = $dataSkills[skillId];
        /** @type {TBS_SkillData} */
        const tbsSkill = skill.tbsSkill;
        this.battleSystem = TacticalBattleSystem.inst();
        this.commandWindow.visible = false;

        this.cursor.show();
        this.cursor.activate();
        this.cursor.clearAllCallbacks();
        this.cursor.move(this.unit.position.x, this.unit.position.y);

        const isSelectable = tbsSkill.range.isSelectable();

        let actionTileImg = tbsSkill.getTileImage();
        let showSelection = tbsSkill.range.canShowSelection();
        TacticalRangeManager.inst().showActionTileSprites(this.unit, this.skillId, showSelection ? "BlackSquare" : actionTileImg);
        if (tbsSkill.range.canShowSelection()) {
            if (this.unit.isInActionRange(this.cursor.position.x, this.cursor.position.y)) {
                TacticalRangeManager.inst().showSelectionTileAtCursor(this.unit, tbsSkill.range, actionTileImg);
            }
        }
        // Directional button callback
        if (isSelectable) {
            this.cursor.enableMoveInput();
        } else {
            this.cursor.disableMoveInput();
        }
        this.cursor.setOnPositionChangedCallback((x, y) => {
            TacticalRangeManager.inst().hideTileSprites(this.cursor);
            if (!this.unit.isInActionRange(x, y)) {
                return;
            }
            TacticalRangeManager.inst().showSelectionTileAtCursor(this.unit, tbsSkill.range, tbsSkill.getTileImage());
        });
        // OK Callback
        this.cursor.setOnOKCallback((x, y) => {
            if (isSelectable) {
                if (!this.unit.canUseActionAt(skillId, x, y)) {
                    SoundManager.playBuzzer();
                    return;
                }
            }
            this.onActionOK({ x, y });
        });
        // Cancel Callback
        this.cursor.setOnCancelCallback(() => {
            TacticalRangeManager.inst().hideTileSprites(this.unit);
            TacticalRangeManager.inst().hideTileSprites(this.cursor);

            this.onActionCancel();
        });
    }
    /**
     * On Action OK
     */
    onActionOK({ x, y }) {
        this.cursor.clearAllCallbacks();
        this.cursor.deactivate();
        this.cursor.hide();

        TacticalRangeManager.inst().hideTileSprites(this.unit);
        TacticalRangeManager.inst().hideTileSprites(this.cursor);

        switch (this.skillType) {
            case 'attack':
                this.unit.attack(x, y);
                break;
            case 'defend':
                this.unit.defend(x, y);
                break;
            case 'skill':
                this.unit.useSkill(this.skillId, x, y);
                break;
            case 'item':
                this.unit.useSkill(this.skillId, x, y);
                this.unit.useItem(this.item);
                break;
        }

        this.waitForSkill = true;
    }

    onActionCancel() {
        SoundManager.playCancel();

        this.cursor.clearAllCallbacks();
        this.cursor.deactivate();

        TacticalRangeManager.inst().hideTileSprites(this.unit);
        TacticalRangeManager.inst().hideTileSprites(this.cursor);

        super.onActionCancel();
    }

    update() {
        super.update();
        this.updateSkill();
    }

    updateSkill() {
        if (!this.waitForSkill)
            return;
        if (this.battleSystem.isBusy())
            return;
        if (this.unit.actionPoints > 1) {
            this.onActionEnd(false);
            this.controller.onInitCommand();
        } else {
            this.controller.chooseFaceDirectionForUnit(false).then(() => {
                this.onActionEnd(false);
                TacticalBattleSystem.inst().cursorOnPlayerTurn();
            });
        }
        this.waitForSkill = false;
    }

    onActionEnd(cancelled) {
        if (!cancelled) {
            this.unit.onActionEnd();
            this.controller.clearCommands();
        }
        super.onActionEnd(cancelled);
    }

}
