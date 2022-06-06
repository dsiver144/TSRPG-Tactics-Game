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
    getAllyTeam(unit) {
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
     * Get Unit Map
     * @returns {TBS_UnitMap}
     */
    getUnitMap() {
        const map = new TBS_UnitMap();
        this.allyUnits.concat(this.enemyUnits).forEach(u => {
            map.set(u.position.x, u.position.y, u);
        })
        return map;
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

class TBS_UnitMap {
    /**
     * TBS_UnitMap
     */
    constructor() {
        this.map = {};
    }
    /**
     * Set
     * @param {number} x 
     * @param {number} y 
     * @param {TacticalUnit} unit 
     */
    set(x, y, unit) {
        this.map[`${x}-${y}`] = unit;
    }
    /**
     * Get
     * @param {number} x 
     * @param {number} y 
     * @returns {TacticalUnit}
     */
    get(x, y) {
        return this.map[`${x}-${y}`];
    }
}