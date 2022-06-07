class TBS_EnemyData {

    constructor() {
        this.enemyId = 0;
        this.mov = 0;
        this.attackSkillId = 0;
    }
    /**
     * Is valid data
     * @returns {boolean}
     */
    isValid() {
        return this.enemyId != 0 || this.mov != 0;
    }
}

/**
 * @enum
 */
const TBS_TARGET_TYPE = {
    "ally": 0,
    "enemy": 1,
    "user": -1
}
class TBS_SkillData {
    /**
     * TBS_SkillData
     */
    constructor() {
        this.range = new TacticalRange(0, 0);
        this.targets = ['enemy'];
        /** @private */
        this.sequences = null;
        this.tileImg = 'RedSquare';
        this.canBeCritical = false;
    }
    /**
     * Set Targets
     * @param {('ally' | 'enemy' | 'user')[]} targets 
     */
    setTargets(targets) {
        this.targets = targets;
    }
    /**
     * Target Types
     * @returns {TBS_TARGET_TYPE[]}
     */
    getTargets() {
        return this.targets.map(t => TBS_TARGET_TYPE[t]);
    }
    /**
     * Set AI Targets
     * @param {('ally' | 'enemy' | 'user')[]} targets 
     */
    setAITargets(targets) {
        this.aiTargets = targets;
    }
    /**
     * AI Target Types
     * @returns {TBS_TARGET_TYPE[]}
     */
    getAITargets() {
        return (this.aiTargets || this.targets).map(t => TBS_TARGET_TYPE[t]);
    }
    /**
     * Set Sequences
     * @param {string} str 
     */
    setSequences(str) {
        this.sequences = str;
    }
    /**
     * Get sequences
     * @returns {string}
     */
    getSequences() {
        return this.sequences;
    }
    /**
     * Set Tile Image
     * @param {string} imgPath 
     */
    setTileImage(imgPath) {
        this.tileImg = imgPath;
    }
    /**
     * Get Tile Image
     * @returns {string}
     */
    getTileImage() {
        return this.tileImg;
    }
    /**
     * Set Critical
     * @param {boolean} v 
     */
    setCritical(v) {
        this.canBeCritical = v;
    }
    /**
     * Get Critical
     * @returns {boolean}
     */
    getCritical() {
        return this.canBeCritical;
    }

}

class TBS_WeaponData {
    
    constructor() {
        this.skillId = 0;
    }
    /**
     * Set skill
     * @param {number} id 
     */
    setSkill(id) {
        this.skillId = id;
    }

}

class TBS_ItemData {
    
    constructor() {
        this.skillId = 0;
    }
    /**
     * Set skill
     * @param {number} id 
     */
    setSkill(id) {
        this.skillId = id;
    }

}