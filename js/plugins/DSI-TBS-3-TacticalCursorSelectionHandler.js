class TacticalCursorSelectionHandler {
    /**
     * 
     * @param {TacticalCursor} cursor 
     */
    constructor(cursor) {
        /** @type {TacticalCursor} */
        this.cursor = cursor;
        /** @type {TacticalUnit} */
        this.unit = null;
        /** @type {FLOOD_FILL_TILE[]} */
        this.actionTiles = [];
        /** @type {TacticalRange} */
        this.range = null;
    }
    /**
     * Set action tiles
     * @param {FLOOD_FILL_TILE[]} tiles 
     */
    setActionTiles(tiles) {
        this.actionTiles = tiles;
    }
    /**
     * Set Unit
     * @param {TacticalUnit} unit 
     */
    setUnit(unit) {
        this.unit = unit;
    }
    /**
     * 
     * @param {TacticalRange} range 
     */
    setRange(range) {
        this.range = range;
    }

    hideSelection() {
        
    }

    showSelection() {

    }
}