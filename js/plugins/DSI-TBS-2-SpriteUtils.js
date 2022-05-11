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
        return 0;
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
        return 0;
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
    }
    /**
     * Screen Z
     * @returns {number}
     */
    screenZ() {
        return 0;
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
    }
    /**
     * Update per frame.
     */
    update() {
        super.update();
        this.updatePosition();
    }
    /**
     * Update position
     */
    updatePosition() {
        this.x = this.target.x + this.offset.x * $gameMap.tileWidth();
        this.y = this.target.y + this.offset.y * $gameMap.tileHeight();
        this.z = 0;
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