class TacticalUnit {

    constructor(teamId, position) {
        /**
         * @type {number}
         */
        this.teamId = teamId;
        /**
         * @type {Position}
         */
        this.position = position;
        /**
         * @type {boolean}
         */
        this.isMoved = false;
        /**
         * @type {number}
         */
        this.faceDirection = 0;
        /**
         * @type {TacticalUnitController}
         */
        this.controller = null;
        /**
         * @type {Game_Battler}
         */
        this.battler = null;
        /**
         * @type {number}
         */
        this.actionPoints = 0;
        /**
         * @type {FLOOD_FILL_TILE[]}
         */
        this.movableTiles = [];
        /**
         * @type {FLOOD_FILL_TILE[]}
         */
        this.actionTiles = [];
    }
    /**
     * Set Controller
     * @param {TacticalUnitController} controller 
     */
    setController(controller) {
        this.controller = controller;
    }
    /**
     * Set Battler
     * @param {Game_Battler} battler 
     */
    setBattler(battler) {
        this.battler = battler;
    }
    /**
     * Set Sprite
     * @param {Sprite_Character} sprite 
     */
    setSprite(sprite) {
        /**
         * @type {Sprite_Character}
         */
        this.battlerSprite = sprite;
    }
    /**
     * Update per frame.
     */
    update() {
        this.controller.update();
    }
    /**
     * Attack
     * @param {number} x
     * @param {number} y
     */
    attack(x, y) {
        this.useSkill(this.attackSkillId(), x, y);
    }
    /**
     * Defend
     */
    defend() {

    }
    /**
     * Use Skill
     * @param {number} skillId
     * @param {number} x
     * @param {number} y
     */
    useSkill(skillId, x, y) {
        this.turnTowardPoint(x, y);
        const skill = $dataSkills[skillId];
        /** @type {TBS_SkillData} */
        const tbsSkill = skill.tbsSkill;
        /** @type {string} */
        const sequences = tbsSkill.getSequences();
        /** @type {TacticalUnit[]} */
        const targets = this.getTargetsWhenUsingSkillAt(skillId, x, y);
        if (!sequences) {
            alert("Action sequences not found, please config!");
            return;
        }
        this.forceAction(skillId);
        TacticalSequenceManager.inst().runSequences(this, targets, sequences);
    }
    /**
     * Get Targets (TacticalUnit)
     * @param {number} skillId 
     * @param {number} x 
     * @param {number} y 
     * @returns {TacticalUnit[]}
     */
    getTargetsWhenUsingSkillAt(skillId, x, y) {
        const skill = $dataSkills[skillId];
        /** @type {TBS_SkillData} */
        const tbsSkill = skill.tbsSkill;
        /** @type {TacticalRange} */
        const range = tbsSkill.range;
        const targetTypes = tbsSkill.getTargets();
        /** @type {FLOOD_FILL_TILE[]} */
        const targetedTiles = TacticalRangeManager.inst().calculateActionTargetPositionsByRange(this, x, y, range);
        console.log({targetedTiles});
        /** @type {TacticalUnit[]} */
        const targets = [];
        targetedTiles.forEach(tile => {
            const unit = TacticalUnitManager.inst().getUnitAt(tile.x, tile.y);
            if (unit) {
                targets.push(unit);
            }
        })
        return targets;
    }
    /**
     * Force action
     * @param {number} skillId 
     */
    forceAction(skillId) {
        this.battler.forceAction(skillId, 0);
        this.useItem(this.currentAction().item());
    }
    /**
     * Get current action.
     * @returns {Game_Action}
     */
    currentAction() {
        return this.battler.currentAction();
    }
    /**
     * Use item
     * @param {object} item 
     */
    useItem(item) {
        this.battler.useItem(item);
    }
    /**
     * Wait
     */
    wait() {
        this.onTurnEnd();
    }
    /**
     * Move
     */
    move(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.isMoved = true;
        this.moveSprite(x, y);
    }
    /**
     * On knockback
     */
    knockback() {

    }
    /**
     * On Fall
     */
    fall() {

    }
    /**
     * Can Move To
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean}
     */
    canMoveTo(x, y) {
        return this.movableTiles.some(tile => tile.x == x && tile.y == y);
    }
    /**
     * Can Use Action At
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean}
     */
    canUseActionAt(x, y) {
        return this.actionTiles.some(tile => tile.x == x && tile.y == y);
    }
    /**
     * Unit MOV
     * @returns {number}
     */
    moveRange() {
        return 0;
    }
    /**
     * Attack skill id
     * @returns {number}
     */
    attackSkillId() {
        return 0;
    }
    /**
     * Attack Range
     * @returns {number}
     */
    attackRange() {
        return 0;
    }
    /**
     * Move sprite to a position
     * @param {number} x
     * @param {number} y 
     */
    moveSprite(x, y) {
        this.battlerSprite._character.findpathToEx(x, y);
        // this.battlerSprite._character.findpathToEx(x, y, (x, y) => {
        //     if (!!TacticalUnitManager.inst().getUnitAt(x, y)) return false;
        //     return true;
        // });
    }
    /**
     * Check if the sprite is moving
     * @returns {boolean}
     */
    isMoving() {
        return this.battlerSprite && (this.battlerSprite._character.isMoving() || this.battlerSprite._character.hasPath());
    }
    /**
     * Check if this unit is playing animation
     */
    isAnimationPlaying() {
        return this.battlerSprite && this.battlerSprite._character.isAnimationPlaying();
    }
    /**
     * Refill action points
     */
    refillActionPoints() {
        this.actionPoints = 1;
    }
    /**
     * Check if this unit is busy
     * @returns {boolean}
     */
    isBusy() {
        const isSpriteMoving = this.isMoving();
        const isAnimationPlaying = this.isAnimationPlaying();
        return isSpriteMoving || isAnimationPlaying;
    }
    /**
     * On Turn Start
     */
    onTurnStart() {
        this.isMoved = false;
        this.refillActionPoints();
        this.calculateTurnStartState();
    }
    /**
     * On Turn End
     */
    onTurnEnd() {
        this.actionPoints = 0;
        this.calculateTurnEndState();
    }
    /**
     * On Action End.
     */
    onActionEnd() {
        this.consumeActionPoints(1);
        if (this.hasActed()) {
            this.onTurnEnd();
        }
    }
    /**
     * Consume action points
     * @param {number} v 
     */
    consumeActionPoints(v) {
        this.actionPoints -= v;
        if (this.actionPoints < 0) {
            this.actionPoints = 0;
        }
    }
    /**
     * Play animation 
     * @param {string} animation 
     */
    playAnimation(animationId) {
        $gameTemp.requestAnimation([this.getCharacter()], animationId);
    }
    /**
     * Set Face Direction
     * @param {number} direction 
     */
    setFaceDirection(direction) {
        this.faceDirection = direction;
        this.getCharacter().setDirection(direction);
    }
    /**
     * Choose face direction.
     * @param {boolean} v
     */
    chooseFaceDirecion(v) {
        this.isFaceDirectionChoosing = v;
    }
    /**
     * Check if unit is choosing face direction
     * @returns {boolean}
     */
    isChoosingFaceDirection() {
        return !!this.isFaceDirectionChoosing;
    }
    /**
     * Turn toward point
     * @param {number} x 
     * @param {number} y 
     */
    turnTowardPoint(x, y) {
        const sx = this.position.x - x;
        const sy = this.position.y - y;
        if (Math.abs(sx) > Math.abs(sy)) {
            this.setFaceDirection(sx > 0 ? 4 : 6);
        } else if (sy !== 0) {
            this.setFaceDirection(sy > 0 ? 8 : 2);
        }
    }
    /**
     * Get Face Direction
     * @returns {number}
     */
    getFaceDirection() {
        return this.faceDirection;
    }
    /**
     * Check if this unit has acted this turn.
     * @returns {boolean}
     */
    hasActed() {
        return this.actionPoints == 0;
    }
    /**
     * Calculate Turn Start State
     */
    calculateTurnStartState() {

    }
    /**
     * Calculate Turn End State
     */
    calculateTurnEndState() {

    }
    /**
     * Get Character
     * @returns {Game_Character}
     */
    getCharacter() {
        return this.battlerSprite ? this.battlerSprite._character : null;
    }
}

class Tactical_EnemyUnit extends TacticalUnit {
    /**
     * Tacticle_EnemyUnit
     * @param {Position} position 
     */
    constructor(position) {
        super(1, position);
        this.setController(new TacticalBotController(this));
    }
    /**
     * Unit MOV
     * @returns {number}
     */
    moveRange() {
        return this.battler.enemy().tbsEnemy.mov;
    }
    /**
     * Attack Range
     * @returns {number}
     */
    attackRange() {
        /**
         * @type {TacticalRange}
         */
        const range = $dataSkills[this.attackSkillId()].tbsSkill.range;
        return range.max;
    }
    /**
     * Attack skill id
     */
    attackSkillId() {
        return this.battler.enemy().tbsEnemy.attackSkillId;
    }
}

class Tactical_AllyUnit extends TacticalUnit {
    /**
     * Tacticle_EnemyUnit
     * @param {Position} position 
     */
     constructor(position) {
        super(0, position);
        this.setController(new TacticalPlayerController(this));
    }
    /**
     * Update
     */
    update() {
        super.update();
        if (this.battlerSprite) {
            this.battlerSprite._character.update();
        }
    }
    
    refillActionPoints() {
        this.actionPoints = 2;
    }
    /**
     * Unit MOV
     * @returns {number}
     */
    moveRange() {
        return this.battler.luk;
    }
    /**
     * Attack Range
     * @returns {number}
     */
    attackRange() {
        /**
         * @type {TacticalRange}
         */
        const range = $dataSkills[this.attackSkillId()].tbsSkill.range;
        return range.max;
    }
    /**
     * Attack skill id
     */
     attackSkillId() {
        return this.battler.weapons()[0].tbsWeapon.skillId;
    }
}