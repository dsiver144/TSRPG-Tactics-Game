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
     */
    attack() {

    }
    /**
     * Defend
     */
    defend() {

    }
    /**
     * Use Skill
     * @param {number} skillId 
     */
    skill(skillId) {

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
     * Unit MOV
     * @returns {number}
     */
    moveRange() {
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
        return this.battlerSprite && this.battlerSprite._character.hasPath();
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
     * Calculate Turn Start State
     */
    calculateTurnStartState() {

    }
    /**
     * Calculate Turn End State
     */
    calculateTurnEndState() {

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
        return 1;
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
        return 1;
    }
}