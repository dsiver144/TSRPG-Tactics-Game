//=======================================================================================================
// > TacticleCursor
//=======================================================================================================

const POSITION_OFFSET_BY_DIRECTION = {
    2: [0, 1],
    4: [-1, 0],
    6: [1, 0],
    8: [0, -1],
}

class TacticleCursor {

    constructor() {
        /**
         * @type {Position} - Position of the cursor
         */
        this.position = new Position(0, 0);
        /**
         * @type {Position[]} - Valid position that cursor can move when unit is using an action.
         */
        this.validActionPositions = [];
        /**
         * @type {boolean} - Cursor active status
         */
        this.active = false;
        /**
         * @type {number} - the current delay until player can press
         */
        this.moveDelay = 0;
        /**
         * @type {number} - the amount of frames that player need to press the button to move.
         */
        this.moveDelayAmount = 4;
        this.createCursorSprite();
    }
    /**
     * Create cursor sprite
     */
    createCursorSprite() {
        this.sprite = new Sprite_TacticleCursor(this);
        this.sprite.visible = false;
        GameUtils.addSpriteToTilemap(this.sprite);
    }
    /**
     * Destroy cursor sprite
     */
    destroyCursorSprite() {
        if (!this.sprite) return;
        GameUtils.removeSpriteFromTilemap(this.sprite);
    }
    /**
     * Show cursor sprite
     */
    show() {
        if (!this.sprite) return;
        this.sprite.visible = true;
    }
    /**
     * Hide cursor sprite
     */
    hide() {
        if (!this.sprite) return;
        this.sprite.visible = false;
    }
    /**
     * Activate cursor so player can move.
     */
    activate() {
        this.active = true;
    }
    /**
     * Deactivate cursor
     */
    deactivate() {
        this.active = false;
    }
    /**
     * Move cursor to new position.
     * @param {number} x 
     * @param {number} y 
     */
    move(x, y) {
        x = Math.max(0, Math.min(x, $gameMap.width() - 1));
        y = Math.max(0, Math.min(y, $gameMap.height() - 1));
        this.position.x = x;
        this.position.y = y;

        console.log(this.position);
    }
    /**
     * Screen X
     * @returns {number}
     */
    screenX() {
        const tw = $gameMap.tileWidth();
        const scrollX = $gameMap.adjustX(this.position.x);
        return Math.floor(scrollX * tw);
    };
    /**
     * Screen Y
     * @returns {number}
     */
    screenY() {
        const th = $gameMap.tileHeight();
        const scrollY = $gameMap.adjustY(this.position.y);
        return Math.floor(
            scrollY * th
        );
    };
    /**
     * Set AOE Range
     * @param {number} aoeRange 
     */
    setActionAOERange(aoeRange) {
        this.aoeRange = aoeRange;
    }
    /**
     * Set valid position that cursor can move while using actions
     * @param {Position[]} validActionPositions 
     */
    setActionRange(validActionPositions) {
        this.validActionPositions = validActionPositions;
    }
    /**
     * Update will be called each frame.
     */
    update() {
        this.isInsideValidPositions();
        this.updateInput();
    }
    /**
     * Update cursor move by Input.
     */
    updateInput() {
        if (!this.active) return;
        if (Input.dir4 != 0) {
            const [x, y] = this.getPositionOffsetByDirection(Input.dir4);
            this.moveByInput(x, y);
        }
        if (TouchInput.isTriggered()) {
            const x = $gameMap.canvasToMapX(TouchInput.x);
            const y = $gameMap.canvasToMapY(TouchInput.y);
            this.move(x, y);
        }
        if (Input.isTriggered('ok')) {
            Input.update();
            this.onOKCallback && this.onOKCallback(this.position.x, this.position.y);
        }
        if (Input.isTriggered('cancel')) {
            Input.update();
            this.onCancelCallback && this.onCancelCallback();
        }
    }
    /**
     * Get Position Offset
     * @param {number} direction 
     * @returns {number[]}
     */
    getPositionOffsetByDirection(direction) {
        return POSITION_OFFSET_BY_DIRECTION[direction];
    }
    /**
     * Check if player can move the cursor
     * @returns {boolean}
     */
    canMove() {
        return this.moveDelay == 0;
    }
    /**
     * Move cursor by input
     * @param {number} dx 
     * @param {number} dy 
     */
    moveByInput(dx, dy) {
        if (this.canMove()) {
            this.move(this.position.x + dx, this.position.y + dy);
            this.moveDelay = this.moveDelayAmount;
        } else {
            this.moveDelay -= 1; 
        }
    }
    /**
     * Set On OK Callback
     * @param {Function} callback 
     */
    setOnOKCallback(callback) {
        this.onOKCallback = callback;
    }
    /**
     * Set On Cancel Callback
     * @param {Function} callback 
     */
    setOnCancelCallback(callback) {
        this.onCancelCallback = callback;
    }
    /**
     * Clear all callbacks
     */
    clearAllCallbacks() {
        this.onOKCallback = null;
        this.onCancelCallback = null;
    }
    /**
     * Check if cursor is inside valid action positions.
     * @returns {Boolean}
     */
    isInsideValidPositions() {
        const valid = this.validActionPositions.some(position => this.position.x == position.x && this.position.y == position.y);
        return valid;
    }

}

class Sprite_TacticleCursor extends Sprite_OnMapObject {
    /**
     * Tacticle Cursor Sprite
     * @param {TacticleCursor} cursor 
     */
    constructor(cursor) {
        super();
        /**
         * @type {TacticleCursor} - referent to current cursor.
         */
        this.cursor = cursor;
        this.bitmap = ImageManager.loadTBS('cursor');
        this.frameIndex = 0;
        this.maxFrames = 2;
        this.frameWidth = 48;
        this.frameHeight = 48;
        this.frameCount = 0;
        this.frameChangeCount = 20;
        this.updateAnimation();
    }
    /**
     * Update per frame
     */
    update() {
        super.update();
        this.updateAnimation();
    }
    /**
     * Update cursor animation
     */
    updateAnimation() {
        this.frameCount = (this.frameCount + 1) % this.frameChangeCount;
        if (this.frameCount === 0) {
            this.frameIndex = (this.frameIndex + 1) % this.maxFrames;
        }
        this.setFrame(this.frameIndex * this.frameWidth, 0, this.frameWidth, this.frameHeight);
    }
    /**
     * Screen X
     * @returns {number}
     */
    screenX() {
        return this.cursor.screenX();
    }
    /**
     * Screen Y
     * @returns {number}
     */
    screenY() {
        return this.cursor.screenY();
    }
    /**
     * Screen Z
     * @returns {number}
     */
    screenZ() {
        return 1;
    }

}