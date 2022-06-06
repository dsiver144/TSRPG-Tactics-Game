class Window_TacticalUnitInfo extends Window_Base {
    /**
     * Set Unit
     * @param {TacticalUnit} unit 
     */
    setUnit(unit) {
        this.unit = unit;
    }
    /**
     * Draw unit info
     */
    drawUnitInfo() {
        this.contents.clear();
        if (!this.unit) return;
        
    }

}