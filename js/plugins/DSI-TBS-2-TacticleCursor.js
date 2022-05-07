class TacticleCursor {

    constructor() {
        /**
         * @type {Position} - Position of the cursor
         */
        this.position = new Position(0, 0);
        /**
         * @type {Position[]} - Valid position that cursor can move when unit is using an action.
         */
        this.validActionPositions = [];
        /**
         * @type {boolean} - Cursor active status
         */
        this.active = false;
    }
    /**
     * Activate cursor so player can move.
     */
    activate() {
        this.active = true;
    }
    /**
     * Deactivate cursor
     */
    deactivate() {
        this.active = false;
    }
    /**
     * Move cursor to new position.
     * @param {number} x 
     * @param {number} y 
     */
    move(x, y) {
        x = Math.max(0, Math.min(x, $gameMap.width() - 1));
        y = Math.max(0, Math.min(y, $gameMap.height() - 1));
        this.position.x = x;
        this.position.y = y;
        console.log("Move", this.position);
    }
    /**
     * Screen X
     * @returns {number}
     */
    screenX() {
        const tw = $gameMap.tileWidth();
        const scrollX = $gameMap.adjustX(this.position.x);
        return Math.floor(scrollX * tw + tw / 2);
    };
    /**
     * Screen Y
     * @returns {number}
     */
    screenY() {
        const th = $gameMap.tileHeight();
        const scrollY = $gameMap.adjustY(this.position.y);
        return Math.floor(
            scrollY * th + th
        );
    };
    /**
     * Set AOE Range
     * @param {number} aoeRange 
     */
    setActionAOERange(aoeRange) {
        this.aoeRange = aoeRange;
    }
    /**
     * Set valid position that cursor can move while using actions
     * @param {Position[]} validActionPositions 
     */
    setActionRange(validActionPositions) {
        this.validActionPositions = validActionPositions;
    }
    /**
     * Update will be called each frame.
     */
    update() {
        this.isInsideValidPositions();
        this.updateMoveByInput();
    }
    /**
     * Update cursor move by Input.
     */
    updateMoveByInput() {
        if (!this.active) return;
        if (Input.isRepeated('left')) {
            this.move(this.position.x - 1, this.position.y);
        }
        if (Input.isRepeated('right')) {
            this.move(this.position.x + 1, this.position.y);
        }
        if (Input.isRepeated('down')) {
            this.move(this.position.x, this.position.y + 1);
        }
        if (Input.isRepeated('up')) {
            this.move(this.position.x, this.position.y - 1);
        }
        
    }
    /**
     * Check if cursor is inside valid action positions.
     * @returns {Boolean}
     */
    isInsideValidPositions() {
        const valid = this.validActionPositions.some(position => this.position.x == position.x && this.position.y == position.y);
        return valid;
    }

}
