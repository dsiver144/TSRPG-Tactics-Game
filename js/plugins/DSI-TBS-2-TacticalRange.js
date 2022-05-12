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
        this.aoe = null;
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
     * @param {string} shape 
     * @returns 
     */
    setAOE(range, shape) {
        this.aoe = new TacticalAOERange();
        console.log(shape, AOE_RANGE_SHAPE[shape]);
        this.aoe.setRange(range).setShape(AOE_RANGE_SHAPE[shape]);
        return this;
    }
    /**
     * Get AOE Range
     * @returns {TacticalAOERange}
     */
    getAOE() {
        return this.aoe;
    }
}

class TacticalAOERange {
    /**
     * Tacticle AOE Range
     * @property {Number} range
     * @property {"Square | Diamond"} range
     */
    constructor() {
        this.range = 0;
        this.shape = AOE_RANGE_SHAPE.NONE;
    }
    /**
     * Set AOE Range.
     * @param {Number} range 
     * @returns {TacticalAOERange}
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
     * Set AOE Shape
     * @param {AOE_RANGE_SHAPE} shape 
     * @returns {TacticalAOERange}
     */
    setShape(shape) {
        this.shape = shape;
        return this;
    }
    /**
     * Get AOE Range Shape
     * @returns {AOE_RANGE_SHAPE}
     */
    getShape() {
        return this.shape;
    }

}
