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

class TBS_SkillData {
    /**
     * TBS_SkillData
     */
    constructor() {
        this.range = new TacticalRange(0, 0);
        this.targets = [];
        /** @private */
        this.sequences = null;
    }
    /**
     * Set Targets
     * @param {('ally' | 'enemy' | 'user')[]} targets 
     */
    setTargets(targets) {
        this.targets = targets;
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