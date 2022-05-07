class Sprite_TacticleUnitSelection extends Sprite_Character {

    constructor() {
        var character = new Game_CharacterBase();
        character.setImage("0", 0);
        super(character);
        this.opacity = 100;
        this._count = 0;

    }

    updateCharacter(name, index) {
        this._character.setImage(name, index);
    }

    hideCharacter() {
        this.updateCharacter("", 0);
    }

    update() {
        super.update();
        this.updateInput();
    }

    updatePosition() {
        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();
        this.x = TacticalBattleSystem.inst().cursor.screenX() + tw / 2;
        this.y = TacticalBattleSystem.inst().cursor.screenY() + th;
        this.z = 100;
    }

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
        }
    }

    inputEnabled() {
        return this._inputEnabled;
    }

    enableInput(onOKCallback, onCancelCallback) {
        this._inputEnabled = true;
        this.onOKCallback = onOKCallback;
        this.onCancelCallback = onCancelCallback;
    }

    disableInput() {
        this.onOKCallback = null;
        this.onCancelCallback = null;
        this._inputEnabled = false;
    }
}
