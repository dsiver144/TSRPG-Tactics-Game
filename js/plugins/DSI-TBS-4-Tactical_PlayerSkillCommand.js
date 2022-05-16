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
     * Start Action
     */
    startAction() {
        const skillId = this.skillId;
        const skill = $dataSkills[skillId];
        /** @type {TBS_SkillData} */
        const tbsSkill = skill.tbsSkill;

        this.battleSystem = TacticalBattleSystem.inst();

        this.cursor.show();
        this.cursor.activate();
        this.commandWindow.visible = false;

        const isSelectable = tbsSkill.range.isSelectable();

        let actionTileImg = tbsSkill.getTileImage();
        if (tbsSkill.range.canShowSelection()) {
            TacticalRangeManager.inst().showSelectionTileAtCursor(tbsSkill.range.aoe, actionTileImg);
            actionTileImg = 'BlueSquare';
        }
        TacticalRangeManager.inst().showActionTileSprites(this.unit, this.skillId, actionTileImg);
        // Directional button callback
        this.cursor.setDirectionalCallback((direction, x, y) => {
            if (!this.unit.canUseActionAt(x, y)) {
                console.log("Cant use skill here");
                return;
            }
        }, !isSelectable);
        // OK Callback
        this.cursor.setOnOKCallback((x, y) => {
            if (isSelectable) {
                if (!this.unit.canUseActionAt(x, y)) {
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

            onCancelCallback && onCancelCallback();
            SoundManager.playCancel();
        });
    }

    onActionOK({ x, y }) {

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
        if (!this.waitForSkill)
            return;
        if (this.battleSystem.isBusy())
            return;
        if (this.unit.actionPoints > 1) {
            this.onActionEnd(false);
        } else {
            this.controller.chooseFaceDirection(() => {
                this.onActionEnd(false);
            });
        }
        this.waitForSkill = false;
    }

    onActionEnd(cancelled) {
        if (!cancelled) {
            this.unit.onActionEnd();
            this.controller.popCommand();
        }
        super.onActionEnd();
    }

}
