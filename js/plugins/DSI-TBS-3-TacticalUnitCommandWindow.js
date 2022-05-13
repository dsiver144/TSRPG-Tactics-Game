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
    }

}