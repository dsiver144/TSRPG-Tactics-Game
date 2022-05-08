class TacticleRangeManager {
    /**
     * This class manage the range related stuff.
     */

     constructor() {

    }
    /**
     * Calculate move ranges
     * @param {TacticleUnit} unit 
     * @returns {Position[]}
     */
    calculateMoveRanges(unit) {
        const ranges = GameUtils.floodFill(unit.position.x, unit.position.y, unit.moveRange(), (x, y) => {
            var passable = $gameMap.checkPassage(x, y, 0x0f);
            var hasUnit = TacticalBattleSystem.inst().getUnitAt(x, y);
            return !hasUnit && passable;
        });
        return ranges;
    }

    caculateActionRanges(unit) {
        return [];
    }

    showMoveRangeSprites(unit) {
        const ranges = this.calculateMoveRanges(unit);
        ranges.forEach(rangeTile => {
            const {x, y} = rangeTile;
            if (rangeTile.outer) return;
            const rangeSprite = new Sprite_StaticRange(new Position(x, y), rangeTile.attack ? "RedSquare" : "BlueSquare");
            // rangeSprite.bitmap.drawText(`${x}-${y}`, 0, 0, 48, 48, 'center');
            GameUtils.addSpriteToTilemap(rangeSprite);
        })
        // Do stuff here.
    }

    showActionRangeSprites(unit) {
        const positions = this.caculateActionRanges(unit);
        // Do stuff here.
    }
}

/**
 * Get Instance
 * @returns {TacticleRangeManager}
 */
 TacticleRangeManager.inst = function() {
    if (TacticleRangeManager.instance) {
        return TacticleRangeManager.instance;
    }
    TacticleRangeManager.instance = new TacticleRangeManager();
    return TacticleRangeManager.instance;
}