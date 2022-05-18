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
        /** @type {Game_Actor} */
        const actor = this.unit.battler;

        const moveEnabled = this.unit.isMoved == false && !this.unit.hasActed();
        this.addCommand("Move", 'move', moveEnabled);
        this.addCommand("Attack", 'attack', true);
        const skillTypes = actor.skillTypes();
        for (const stypeId of skillTypes) {
            const name = $dataSystem.skillTypes[stypeId];
            this.addCommand(name, "skill", true, stypeId);
        }
        this.addCommand("Defend", 'defend', true);
        this.addCommand("Use Item", 'item', true);
        this.addCommand("Wait", 'wait', true);
    }

}