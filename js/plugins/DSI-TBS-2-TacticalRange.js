/**
 * @readonly
 * @enum {number}
 */
 const AOE_RANGE_SHAPE = {
    "NONE": -1,
    "SQUARE": 0,
    "DIAMOND": 1
}
/**
 * @enum {number}
 */
const SELECTION_TYPE = {
    "NONE": -1,
    "ALL": 1,
    "SQUARE": 1,
    "DIAMOND": 2,
    "LINE": 3
}

/**
 * @private
 * @property {number} min   
 * @property {number} max   
 */
class TacticalRange {
    /**
     * Setup Tacticle Range
     * @param {Number} min 
     * @param {Number} max 
     */
    constructor(min, max) {
        this.min = min;
        this.max = max;
        this.diagonal = true;
        this.penerate = false;
        this.selection = null;

        this.setSelection("DIAMOND", 0);
    }
    /**
     * Set Min
     * @param {Number} min 
     * @returns {TacticalRange}
     */
    setMin(min) {
        this.min = min;
        return this;
    }
    /**
     * Get Min
     * @returns {Number}
     */
    getMin() {
        return this.min;
    }
    /**
     * Set Max
     * @param {Number} max 
     * @returns {TacticalRange}
     */
    setMax(max) {
        this.max = max;
        return this;
    }
    /**
     * Get Max
     * @returns {Number}
     */
    getMax() {
        return this.max;
    }
    /**
     * Set Diagonal
     * @param {Boolean} bool 
     * @returns {TacticalRange}
     */
    setDiagonal(bool) {
        this.diagonal = bool;
        return this;
    }
    /**
     * Get Diagonal
     * @returns {Boolean}
     */
    getDiagonal() {
        return this.diagonal;
    }
    /**
     * Set Penerate
     * @param {Boolean} bool 
     * @returns {TacticalRange}
     */
    setPenerate(bool) {
        this.penerate = bool;
        return this;
    }
    /**
     * Get Penetrate
     * @returns {Boolean}
     */
    getPenerate() {
        return this.penerate;
    }
    /**
     * Set AOE Range
     * @param {Number} range 
     * @param {string} type 
     * @param {string} extraParam
     * @returns 
     */
    setSelection(type, range, extraParam) {
        this.selection = new TacticalActionSelection();
        this.selection.setRange(range).setType(SELECTION_TYPE[type]).setExtraParam(extraParam);
        return this;
    }
    /**
     * Get Selection
     * @returns {TacticalActionSelection}
     */
    getSelection() {
        return this.selection;
    }
    /**
     * Check if can show selection on cursor.
     * @returns {boolean}
     */
    canShowSelection() {
        if (this.selection && this.selection.getType() === SELECTION_TYPE.ALL) return false;
        return true;
    }
    /**
     * Check if player can select 
     * @returns {boolean}
     */
    isSelectable() {
        if (this.selection && this.selection.getType() == SELECTION_TYPE.ALL) return false;
        if (this.getMin() === 0 && this.getMax() === 0) return false;
        return true;
    }
}

class TacticalActionSelection {
    /**
     * Tacticle AOE Range
     * @property {Number} range
     * @property {SELECTION_TYPE} shape
     */
    constructor() {
        this.range = 0;
        this.type = SELECTION_TYPE.NONE;
    }
    /**
     * Set Selection Range.
     * @param {Number} range 
     * @returns {TacticalActionSelection}
     */
    setRange(range) {
        this.range = range;
        return this;
    }
    /**
     * Get Range
     * @returns {Number}
     */
    getRange() {
        return this.range;
    }
    /**
     * Set selection type
     * @param {SELECTION_TYPE} shape 
     * @returns {TacticalActionSelection}
     */
    setType(shape) {
        this.type = shape;
        return this;
    }
    /**
     * Get AOE Range Shape
     * @returns {SELECTION_TYPE}
     */
    getType() {
        return this.type;
    }
    /**
     * Set Extra Param
     * @param {string} param 
     * @returns {TacticalActionSelection}
     */
    setExtraParam(param) {
        this.extraParam = param;
        return this;
    }
    /**
     * Get Extra Param.
     * @returns {string}
     */
    getExtraParam() {
        return this.extraParam;
    }

}
