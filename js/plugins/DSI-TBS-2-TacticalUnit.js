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
        if (this.battlerSprite) {
            this.battlerSprite._character.update();
        }
    }
    /**
     * Attack
     * @param {number} x
     * @param {number} y
     */
    attack(x, y) {

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
    skill(skillId, x, y) {

    }
    /**
     * Wait
     */
    wait() {

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
    }
    /**
     * Check if the sprite is moving
     * @returns {boolean}
     */
    isMoving() {
        return this.battlerSprite && this.battlerSprite._character.isMoving();
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
        return isSpriteMoving;
    }
    /**
     * On Turn Start
     */
    onTurnStart() {
        this.refillActionPoints();
        this.calculateTurnStartState();
    }
    /**
     * On Turn End
     */
    onTurnEnd() {
        this.calculateTurnEndState();
    }
    /**
     * Play animation 
     * @param {string} animation 
     */
    playAnimation(animation) {
        // Implementation go here.
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