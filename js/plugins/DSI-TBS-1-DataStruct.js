class TBS_EnemyData {

    constructor() {
        this.enemyId = 0;
        this.mov = 0;
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

    constructor() {
        this.range = new TacticalRange(0, 0);
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