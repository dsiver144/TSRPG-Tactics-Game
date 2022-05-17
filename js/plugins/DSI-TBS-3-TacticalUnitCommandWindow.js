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
        const moveEnabled = this.unit.isMoved == false && !this.unit.hasActed();
        this.addCommand("Move", 'move', moveEnabled);
        this.addCommand("Attack", 'attack', true);
        // this.addCommand("Defend", 'defend', true);
        // this.addCommand("Skill", 'skill', true);
        // this.addCommand("Magic", 'skill', true);
        // this.addCommand("Use Item", 'item', true);
        this.addCommand("Wait", 'wait', true);
    }

}