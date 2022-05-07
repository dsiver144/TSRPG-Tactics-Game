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
class TacticleRange {
    /**
     * Setup Tacticle Range
     * @param {Number} min 
     * @param {Number} max 
     */
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    /**
     * Set Min
     * @param {Number} min 
     * @returns {TacticleRange}
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
     * @returns {TacticleRange}
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
     * @returns {TacticleRange}
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
     * @returns {TacticleRange}
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
     * @param {AOE_RANGE_SHAPE} shape 
     * @returns 
     */
    setAOE(range, shape) {
        this.aoe = new TacticleAOERange();
        this.aoe.shape
        this.aoe.setRange(range).setShape(shape);
        return this;
    }
    /**
     * Get AOE Range
     * @returns {TacticleAOERange}
     */
    getAOE() {
        return this.aoe;
    }
}

class TacticleAOERange {
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
     * @returns {TacticleAOERange}
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
     * @returns {TacticleAOERange}
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
