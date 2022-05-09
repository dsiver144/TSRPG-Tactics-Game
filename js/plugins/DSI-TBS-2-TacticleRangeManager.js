class TacticleRangeManager {
    /**
     * This class manage the range related stuff.
     */

     constructor() {

    }
    /**
     * Calculate move ranges
     * @param {TacticleUnit} unit 
     * @returns {FLOOD_FILL_TILE[]}
     */
    calculateMovableTiles(unit) {
        const movableTiles = GameUtils.floodFill(unit.position.x, unit.position.y, unit.moveRange(), (x, y) => {
            var passable = $gameMap.checkPassage(x, y, 0x0f);
            var hasUnit = TacticalUnitManager.inst().getUnitAt(x, y);
            var hasEvent = $gameMap.blockableEventsXy(x, y)[0];
            return !hasUnit && !hasEvent && passable;
        });
        unit.movableTiles = movableTiles;
        return movableTiles;
    }
    /**
     * Calcuate attack range from move ranges
     * @param {TacticalUnit} unit
     * @param {FLOOD_FILL_TILE[]} moveableTiles 
     */
    calculateAttackTileFromMoveableTiles(unit, moveableTiles) {
        const visitedTiles = {};
        moveableTiles.forEach(tile => {
            visitedTiles[`${tile.x}-${tile.y}`] = true;
        })
        
        let attackTiles = [];
        const attackRange = unit.attackRange();
        moveableTiles.forEach(tile => {
            if (tile.totalEdges >= 4) return;
            let result = GameUtils.floodFill(tile.x, tile.y, attackRange, (x, y) => {
                return true;
            });
            result = result.filter((tile) => !visitedTiles[`${tile.x}-${tile.y}`]);
            result.forEach(tile => visitedTiles[`${tile.x}-${tile.y}`] = true);
            attackTiles = attackTiles.concat(result);
        })
        // Filter out some tile that not match the condition.
        const unitTeamMembers = TacticalUnitManager.inst().getUnitTeam(unit);
        attackTiles = attackTiles.filter(tile => {
            const hasAlliedUnit = unitTeamMembers.some(unit => tile.x == unit.position.x && tile.y == unit.position.y);
            if (hasAlliedUnit) {
                return false;
            }
            return true;
        })

        return attackTiles;
    }
    /**
     * Calcuate Action Tiles
     * @param {TacticalUnit} unit 
     * @param {TacticleRange} range 
     * @returns {FLOOD_FILL_TILE[]}
     */
    calculateActionTiles(unit, range) {
        const result = [];
        for (var y = -range.max; y <= range.max; y++) {
            for (var x = -range.max; x <= range.max; x++) {
                const dist = Math.abs(x) + Math.abs(y);
                if (dist >= range.min && dist <= range.max) {
                    if (!range.diagonal && (x != 0 && y != 0)) {
                        continue;
                    }
                    result.push(new FLOOD_FILL_TILE(unit.position.x + x, unit.position.y + y, false, dist));
                }
            }
        }
        unit.actionTiles = result;
        return result;
    }
    /**
     * 
     * @param {TacticalUnit} unit 
     * @param {TacticleAOERange} aoeRange 
     * @returns {FLOOD_FILL_TILE[]}
     */
    calculateAOETiles(unit, aoeRange) {
        const result = [];
        for (var y = -range.max; y <= range.max; y++) {
            for (var x = -range.max; x <= range.max; x++) {
                const dist = Math.abs(x) + Math.abs(y);
                if (aoeRange.shape === AOE_RANGE_SHAPE.DIAMOND && !(dist >= range.min && dist <= range.max)) {
                    continue;
                }
                result.push(new FLOOD_FILL_TILE(unit.position.x + x, unit.position.y + y, false, dist));
            }
        }
    }
    /**
     * Show Move Range At Unit
     * @param {TacticleUnit} unit 
     */
    showMoveTileSprites(unit) {
        const movableTiles = this.calculateMovableTiles(unit);
        movableTiles.forEach(rangeTile => {
            const {x, y} = rangeTile;
            // if (rangeTile.outer) return;
            const rangeSprite = new Sprite_StaticRange(new Position(x, y), false ? "RedSquare" : "BlueSquare");
            GameUtils.addSpriteToTilemap(rangeSprite);
        })
        const attackTiles = this.calculateAttackTileFromMoveableTiles(unit, movableTiles);
        attackTiles.forEach(rangeTile => {
            const {x, y} = rangeTile;
            // if (rangeTile.outer) return;
            const rangeSprite = new Sprite_StaticRange(new Position(x, y), true ? "RedSquare" : "BlueSquare");
            GameUtils.addSpriteToTilemap(rangeSprite);
        })
        // Do stuff here.
    }
    /**
     * Show Action Range Sprites
     * @param {TacticalUnit} unit 
     */
    showActionTileSprites(unit) {
        const actionTiles = this.calculateActionTiles(unit, $dataSkills[4 + Math.randomInt(4)].tbsSkill.range);
        actionTiles.forEach(tile => {
            const {x, y} = tile;
            const rangeSprite = new Sprite_StaticRange(new Position(x, y), true ? "RedSquare" : "BlueSquare");
            GameUtils.addSpriteToTilemap(rangeSprite);
        })
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