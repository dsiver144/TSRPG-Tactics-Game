class Tactical_PlayerOpenWindowSkillListCommand extends Tactical_PlayerCommand {
    /**
     * Set Skill Type ID
     * @param {number} id 
     */
    setStypeId(id) {
        this.sTypeId = id;
    }
    /**
     * Start Action
     */
    startAction() {
        this.cursor.clearAllCallbacks();
        this.cursor.deactivate();

        this.commandWindow.visible = false;

        this.listWindow = new Window_TacticalSkillList(new Rectangle(0, 0, 500, 300));
        this.listWindow.setStypeId(this.sTypeId);
        this.listWindow.setUnit(this.unit);
        this.listWindow.activate();
        GameUtils.addWindow(this.listWindow);
        this.listWindow.setHandler('ok', this.onSkillOK.bind(this));
        this.listWindow.setHandler('cancel', this.onActionCancel.bind(this));
        this.setItemListWindowPosition();
        this.listWindow.show();
    }
    /**
     * Set Item List Window Position
     */
    setItemListWindowPosition() {
        const xSpacing = 64;
        this.listWindow.x = this.unit.battlerSprite.x + xSpacing;
        this.listWindow.y = this.unit.battlerSprite.y - this.listWindow.height / 2;
        if (this.listWindow.x + this.listWindow.width >= Graphics.width) {
            this.listWindow.x = this.unit.battlerSprite.x - this.listWindow.width - xSpacing;
        }
    }
    /**
     * On Item OK
     */
    onSkillOK() {
        const skill = this.listWindow.item();

        const command = new Tactical_PlayerSkillCommand(this.controller);
        command.setSkill(skill.id, 'skill');

        this.controller.pushCommand(command);

        GameUtils.removeWindow(this.listWindow);
    }
    /**
     * On Action Cancel
     */
    onActionCancel() {
        GameUtils.removeWindow(this.listWindow);
        super.onActionCancel();
    }
}

class Window_TacticalSkillList extends Window_BattleSkill {
    /**
     * Set Unit
     * @param {TacticalUnit} unit 
     */
    setUnit(unit) {
        this.unit = unit;
        this.setActor(this.unit.battler);
        this.refresh();
    }

}