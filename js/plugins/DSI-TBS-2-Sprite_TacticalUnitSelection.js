class Sprite_TacticalUnitSelection extends Sprite_Character {
    constructor() {
        var character = new Game_CharacterBase();
        character.setImage("0", 0);
        super(character);
        /** @type {TacticalUnit} */
        this.tempUnit = new TacticalUnit(0, new Position(0, 0));
        this.tempUnit.setFaceDirection(character.direction());
    }
    /**
     * Set character image
     * @param {string} name 
     * @param {number} index 
     */
    setImage(name, index) {
        this._character.setImage(name, index);
        this.renderable = true;
    }
    /**
     * Hide character
     */
    hideCharacter() {
        this.renderable = false;
    }
    /**
     * Update per frame.
     */
    update() {
        super.update();
        this.updateInput();
    }
    /**
     * Update position
     */
    updatePosition() {
        const cursor = TacticalBattleSystem.inst().cursor;
        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();
        this.x = cursor.screenX() + tw / 2;
        this.y = cursor.screenY() + th;
        this.z = TacticalSpriteConfig.UNIT_SELECTION_Z;
        this.tempUnit.position.x = cursor.position.x;
        this.tempUnit.position.y = cursor.position.y;
    }
    /**
     * Update input
     * @returns {void}
     */
    updateInput() {
        if (!this.inputEnabled())
            return;
        if (Input.isTriggered('ok')) {
            Input.update();
            this.onOKCallback && this.onOKCallback(this._character.direction());
        }
        if (Input.isTriggered('cancel')) {
            Input.update();
            this.onCancelCallback && this.onCancelCallback();
        }
        if (Input.dir4 != 0) {
            this._character.setDirection(Input.dir4);
            this.tempUnit.setFaceDirection(Input.dir4);
        }
    }
    /**
     * Check if input is enabled
     * @returns {boolean}
     */
    inputEnabled() {
        return this._inputEnabled;
    }
    /**
     * Enable input with callbacks.
     * @param {Function} onOKCallback 
     * @param {Function} onCancelCallback 
     */
    enableInput(onOKCallback, onCancelCallback) {
        this._inputEnabled = true;
        this.onOKCallback = onOKCallback;
        this.onCancelCallback = onCancelCallback;
    }
    /**
     * Disable input and clear callbacks.
     */
    disableInput() {
        this.onOKCallback = null;
        this.onCancelCallback = null;
        this._inputEnabled = false;
    }
}
