class Window_TacticleUnitCommand extends Window_Command {
    /**
     * Set Unit
     * @param {TacticleUnit} unit 
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
    }
}