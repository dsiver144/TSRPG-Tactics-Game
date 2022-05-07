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

    screenZ() {
        return 0;
    }

}