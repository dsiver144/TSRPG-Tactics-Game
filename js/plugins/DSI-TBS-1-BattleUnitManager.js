class TacticalUnitManager {
    constructor() {
        /**
         * @type {TacticalUnit[]}
         */
        this.allyUnits = [];
        /**
         * @type {TacticalUnit[]}
         */
        this.enemyUnits = [];
    }
    /**
     * Reset
     */
    reset() {
        this.allyUnits = [];
        this.enemyUnits = [];
        this.activeTeamId = 0;
    }
    /**
     * Get All Unit of the same team.
     * @param {TacticalUnit} unit 
     */
    getUnitTeam(unit) {
        const teamId = unit.teamId;
        return teamId === 0 ? this.allyUnits : this.enemyUnits;
    }
    /**
     * Get All Unit of the opposite team.
     * @param {TacticalUnit} unit 
     * @returns 
     */
    getOppositeTeam(unit) {
        const teamId = unit.teamId;
        return teamId === 0 ? this.enemyUnits : this.allyUnits;
    }
    /**
     * Get unit at
     * @param {number} x
     * @param {number} y 
     */
    getUnitAt(x, y) {
        return this.allyUnits.concat(this.enemyUnits).filter(unit => unit.position.x === x && unit.position.y === y)[0];
    }
    /**
     * Add Ally Unit
     * @param {TacticalUnit} unit 
     */
    addAllyUnit(unit) {
        this.allyUnits.push(unit);
    }
    /**
     * Add Enemy Unit
     * @param {TacticalUnit} unit 
     */
    addEnemyUnit(unit) {
        this.enemyUnits.push(unit);
    }
    /**
     * Check if an unit on both team is busy
     * @returns {boolean}
     */
    isUnitBusy() {
        const isAllyBusy = this.allyUnits.some(ally => ally.isBusy());
        const isEnemyBusy = this.enemyUnits.some(enemy => enemy.isBusy());
        return isAllyBusy || isEnemyBusy;
    }
    /**
     * Update units
     */
    updateUnits() {
        this.allyUnits.forEach(u => u.update());
        this.enemyUnits.forEach(u => u.update());
    }
}

/**
 * Get Instance
 * @returns {TacticalUnitManager}
 */
 TacticalUnitManager.inst = function() {
    if (TacticalUnitManager.instance) {
        return TacticalUnitManager.instance;
    }
    TacticalUnitManager.instance = new TacticalUnitManager();
    return TacticalUnitManager.instance;
}