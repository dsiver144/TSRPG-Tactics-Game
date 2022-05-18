const TacticalSpriteConfig = {
    "UNIT_SELECTION_Z": 9,
    "STATIC_OBJECT_Z": 0,
    "ALLY_SPOT_Z": 0,
    "STATIC_RANGE_Z": 0,
    "DYNAMIC_RANGE_Z": 5,
    "DIRECTION_INDICATOR_Z": 10,
}
class Sprite_OnMapObject extends Sprite {
    /**
     * Update per frame
     */
    update() {
        super.update();
        this.updatePosition();
    }
    /**
     * Screen X
     * @abstract
     * @returns {number}
     */
    screenX() {
        return new Error("Need to implement this");
    }
    /**
     * Screen Y
     * @abstract
     * @returns {number}
     */
    screenY() {
        return new Error("Need to implement this");
    }
    /**
     * Screen Z
     * @abstract
     * @returns {number}
     */
    screenZ() {
        return new Error("Need to implement this");
    }
    /**
     * Update Sprite Position
     */
    updatePosition() {
        this.x = this.screenX();
        this.y = this.screenY();
        this.z = this.screenZ();
    }
}

class Sprite_StaticMapObject extends Sprite_OnMapObject {
    /**
     * 
     * @param {Position} position 
     */
    constructor(position) {
        super();
        this.customPosition = position;
    }
    /**
     * Screen X
     * @returns {number}
     */
    screenX() {
        const tw = $gameMap.tileWidth();
        const scrollX = $gameMap.adjustX(this.customPosition.x);
        return Math.floor(scrollX * tw);
    };
    /**
     * Screen Y
     * @returns {number}
     */
    screenY() {
        const th = $gameMap.tileHeight();
        const scrollY = $gameMap.adjustY(this.customPosition.y);
        return Math.floor(
            scrollY * th
        );
    };
    /**
     * Screen Z
     * @abstract
     * @returns {number}
     */
    screenZ() {
        return TacticalSpriteConfig.STATIC_OBJECT_Z;
    }
}

class Sprite_AllySpot extends Sprite_StaticMapObject {
    /**
     * 
     * @param {Position} position 
     */
    constructor(position) {
        super(position);
        this.bitmap = ImageManager.loadTBS('BlueSquare');
    }
    /**
     * Screen Z
     * @returns {number}
     */
    screenZ() {
        return TacticalSpriteConfig.ALLY_SPOT_Z;
    }

}

class Sprite_StaticRange extends Sprite_StaticMapObject {
    /**
     * 
     * @param {Position} position 
     */
     constructor(position, bitmapName = 'BlueSquare') {
        super(position);
        this.bitmap = ImageManager.loadTBS(bitmapName);
        /**
         * @type {TacticalUnit}
         */
        this.unit = null;
        this.updatePosition();
    }
    /**
     * Screen Z
     * @returns {number}
     */
    screenZ() {
        return TacticalSpriteConfig.STATIC_RANGE_Z;
    }
}

class Sprite_DynamicRange extends Sprite {
    /**
     * Sprite_DynamicRange
     * @param {Sprite} target
     * @param {Position} offset
     */
    constructor(target, offset, bitmapName = 'RedSquare') {
        super();
        /**
         * @type {Sprite}
         */
        this.target = target;
        /**
         * @type {Position}
         */
        this.offset = offset;
        this.bitmap = ImageManager.loadTBS(bitmapName);
        this.updatePosition();
    }
    /**
     * Update per frame.
     */
    update() {
        super.update();
        this.updatePosition();
        this.updateAOEVisibility();
    }
    /**
     * Set visiblity callback
     * @param {Function} callback 
     */
    setVisiblityCallback(callback) {
        this.visibilityCallback = callback;
    }
    /**
     * Upadate AOE Visiblity
     */
    updateAOEVisibility() {
        if (!this.visibilityCallback) return;
        this.visible = this.visibilityCallback();
    }
    /**
     * Update position
     */
    updatePosition() {
        this.x = this.target.x + this.offset.x * $gameMap.tileWidth();
        this.y = this.target.y + this.offset.y * $gameMap.tileHeight();
        this.z = TacticalSpriteConfig.DYNAMIC_RANGE_Z;
    }
}

var DSI_TBS_2_TacticalCursor_Spriteset_Map_findTargetSprite = Spriteset_Map.prototype.findTargetSprite;
Spriteset_Map.prototype.findTargetSprite = function(target) {
    switch(target.constructor) {
        case TacticalCursor:
            return TacticalBattleSystem.inst().cursor.sprite;
    }
	const result = DSI_TBS_2_TacticalCursor_Spriteset_Map_findTargetSprite.call(this, target);
    return result;
};

class Sprite_UnitDirectionIndicator extends Sprite_StaticMapObject {
    /**
     * Sprite_UnitDirectionIndicator
     */
    constructor() {
        super(new Position(0, 0));
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.scale.x = 2.0;
        this.scale.y = 2.0;
        this.currentDirection = 0;
        this.visible = false;
        /** @type {TacticalUnit} */
        this.unit = null;
    }
    /**
     * Set Unit
     * @param {TacticalUnit} unit 
     */
    setUnit(unit) {
        this.unit = unit;
        this.customPosition = this.unit.position;
        this.currentDirection = this.unit.getFaceDirection();
        this.refresh();
    }
    /**
     * Clear Unit
     */
    clearUnit() {
        this.unit = null;
        this.visible = false;
    }
    /**
     * Refresh
     */
    refresh() {
        this.currentDirection = this.unit.getFaceDirection();
        this.bitmap = ImageManager.loadTBS("Dir" + this.currentDirection);
    }
    /**
     * Update
     */
    update() {
        super.update();
        this.updateDirection();
    }
    /**
     * Screen X
     * @returns {number}
     */
    screenX() {
        return super.screenX() + $gameMap.tileWidth() / 2;
    }
    /**
     * Screen Y
     * @returns {number}
     */
    screenY() {
        return super.screenY() - 64;
    }
    /**
     * Screen Z
     * @returns {number}
     */
    screenZ() {
        return TacticalSpriteConfig.DIRECTION_INDICATOR_Z;
    }
    /**
     * Update direction
     * @returns {void}
     */
    updateDirection() {
        if (!this.unit) return;
        this.visible = this.unit.isChoosingFaceDirection();
        if (this.visible) {
            if (this.currentDirection != this.unit.getFaceDirection()) {
                this.refresh();
            }
        }
    }

}