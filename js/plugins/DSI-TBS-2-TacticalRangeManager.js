class TacticalRangeManager {
    /**
     * This class manage the range related stuff.
     */

    constructor() {
        this.tileSprites = [];
    }
    /**
     * Calculate move ranges
     * @param {number} x
     * @param {number} y
     * @param {number} moveRange
     * @returns {FLOOD_FILL_TILE[]}
     */
    calculateMovableTiles(startX, startY, moveRange) {
        const movableTiles = GameUtils.floodFill(startX, startY, moveRange, (x, y) => {
            var passable = $gameMap.checkPassage(x, y, 0x0f);
            var hasUnit = TacticalUnitManager.inst().getUnitAt(x, y);
            var hasEvent = $gameMap.blockableEventsXy(x, y)[0];
            return !hasUnit && !hasEvent && passable;
        });
        return movableTiles;
    }
    /**
     * Calcuate attack range from move ranges
     * @param {number} x
     * @param {number} y
     * @param {number} attackRange
     * @param {FLOOD_FILL_TILE[]} moveableTiles 
     * @param {(tile: FLOOD_FILL_TILE) => boolean} filterFunction 
     */
    calculateAttackTilesFromMoveableTiles(startX, startY, attackRange, moveableTiles, filterFunction) {
        const visitedTiles = {};
        moveableTiles.forEach(tile => {
            visitedTiles[`${tile.x}-${tile.y}`] = true;
        })
        /** @type {FLOOD_FILL_TILE[]} */
        let attackTiles = [];
        const outerTiles = this.findOuterTiles(startX, startY, moveableTiles);
        outerTiles.forEach(tile => {
            let result = GameUtils.floodFill(tile.x, tile.y, attackRange, (x, y) => {
                return true;
            });
            result = result.filter((tile) => !visitedTiles[`${tile.x}-${tile.y}`]);
            result.forEach(tile => visitedTiles[`${tile.x}-${tile.y}`] = true);
            attackTiles = attackTiles.concat(result);
        })
        // Filter out some tile that not match the condition.
        if (filterFunction) {
            attackTiles = attackTiles.filter(filterFunction);
        }
        return attackTiles;
    }
    /**
     * Calcuate Action Tiles
     * @param {number} x 
     * @param {number} y 
     * @param {TacticalRange} range 
     * @returns {FLOOD_FILL_TILE[]}
     */
    calculateActionTiles(startX, startY, range) {
        /** @type {FLOOD_FILL_TILE[]} */
        const result = [];
        for (var y = -range.max; y <= range.max; y++) {
            for (var x = -range.max; x <= range.max; x++) {
                const dist = Math.abs(x) + Math.abs(y);
                if (dist >= range.min && dist <= range.max) {
                    if (!range.diagonal && (x != 0 && y != 0)) {
                        continue;
                    }
                    result.push(new FLOOD_FILL_TILE(startX + x, startY + y, false, dist));
                }
            }
        }
        return result;
    }
    /**
     * Calculate Selection Tiles
     * @param {TacticalUnit} unit
     * @param {number} startX
     * @param {number} startY
     * @param {TacticalRange} range 
     * @returns {FLOOD_FILL_TILE[]}
     */
    calculateSelectionTiles(unit, startX, startY, range) {
        const selection = range.getSelection();
        let result = [];
        switch(selection.getType()) {
            case SELECTION_TYPE.ALL:
                const tiles = TacticalRangeManager.inst().calculateActionTiles(unit.position.x, unit.position.y, range);
                result = result.concat(tiles);
                break;
            case SELECTION_TYPE.LINE:
                const curSignX = startX - unit.position.x;
                const curSignY = startY - unit.position.y;
                const isHorizontal = curSignY == 0;
                for (var i = 0; i <= selection.range; i++) {
                    const dx = startX + (isHorizontal ? i * curSignX : 0);
                    const dy = startY + (isHorizontal ? 0 : i * curSignY);
                    const dist = Math.abs(x) + Math.abs(y);
                    result.push(new FLOOD_FILL_TILE(dx, dy, false, dist));
                }
                break;
            case SELECTION_TYPE.SQUARE:
                for (var y = -selection.range; y <= selection.range; y++) {
                    for (var x = -selection.range; x <= selection.range; x++) {
                        const dist = Math.abs(x) + Math.abs(y);
                        result.push(new FLOOD_FILL_TILE(startX + x, startY + y, false, dist));
                    }
                }
                break;
            case SELECTION_TYPE.DIAMOND:
                for (var y = -selection.range; y <= selection.range; y++) {
                    for (var x = -selection.range; x <= selection.range; x++) {
                        const dist = Math.abs(x) + Math.abs(y);
                        if (dist > selection.range) {
                            continue;
                        }
                        result.push(new FLOOD_FILL_TILE(startX + x, startY + y, false, dist));
                    }
                }
                break;
        }
        
        return result;
    }
    /**
     * Show Selection Tiles At Cursor
     * @param {TacticalUnit} unit 
     * @param {TacticalRange} range 
     * @param {string} bitmapName
     */
    showSelectionTileAtCursor(unit, range, bitmapName = 'RedSquare') {
        const selection = range.getSelection();
        const cursor = TacticalBattleSystem.inst().cursor;
        const aoeTiles = this.calculateSelectionTiles(unit, cursor.position.x, cursor.position.y, range);
        aoeTiles.forEach(tile => {
            let offsets = new Position(tile.x - cursor.position.x, tile.y - cursor.position.y);
            const rangeSprite = new Sprite_DynamicRange(cursor.sprite, offsets, bitmapName);
            GameUtils.addSpriteToTilemap(rangeSprite);

            rangeSprite.unit = cursor;
            this.tileSprites.push(rangeSprite);
        })
    }
    /**
     * Find outer tiles
     * @param {FLOOD_FILL_TILE[]} tiles 
     */
    findOuterTiles(startX, startY, tiles) {
        const map = {};
        tiles.forEach(tile => {
            map[`${tile.x}-${tile.y}`] = tile;
        });
        tiles.forEach(tile => {
            const dist = Math.abs(tile.x - startX) + Math.abs(tile.y - startY);
            if (dist <= 1) {
                tile.totalEdges = 4;
                return;
            }
            const {x, y} = tile;
            const topTile = map[`${x}-${y - 1}`];
            const bottomTile = map[`${x}-${y + 1}`];
            const leftTile = map[`${x - 1}-${y}`];
            const rightTile = map[`${x + 1}-${y}`];
            let totalEdges = 0;
            totalEdges += (topTile ? 1 : 0);
            totalEdges += (bottomTile ? 1 : 0);
            totalEdges += (leftTile ? 1 : 0);
            totalEdges += (rightTile ? 1 : 0);
            tile.totalEdges = totalEdges;
        });
        return tiles.filter(tile => tile.totalEdges < 4);
    }
    /**
     * Show Move Range At Unit
     * @param {TacticalUnit} unit 
     */
    showMoveTileSprites(unit) {
        // Calculate and show moveable tiles
        const unitTeamMembers = TacticalUnitManager.inst().getUnitTeam(unit);
        let movableTiles = this.calculateMovableTiles(unit.position.x, unit.position.y, unit.moveRange());
        unit.movableTiles = movableTiles;
        let attackTiles = this.calculateAttackTilesFromMoveableTiles(unit.position.x, unit.position.y, unit.attackRange(), movableTiles);
        // let outerTiles = this.findOuterTiles(unit.position.x, unit.position.y, attackTiles.concat(movableTiles));
        attackTiles = attackTiles.filter(tile => {
            const hasAlliedUnit = unitTeamMembers.some(unit => tile.x == unit.position.x && tile.y == unit.position.y);
            if (hasAlliedUnit) {
                return false;
            }
            return true;
        });
        // Show tiles
        movableTiles.forEach(rangeTile => {
            const {x, y} = rangeTile;
            const rangeSprite = new Sprite_StaticRange(new Position(x, y), false ? "RedSquare" : "BlueSquare");
            GameUtils.addSpriteToTilemap(rangeSprite);
            
            rangeSprite.unit = unit;
            this.tileSprites.push(rangeSprite);
        });
        attackTiles.forEach(rangeTile => {
            const {x, y} = rangeTile;
            // if (rangeTile.outer) return;
            const rangeSprite = new Sprite_StaticRange(new Position(x, y), true ? "RedSquare" : "BlueSquare");
            GameUtils.addSpriteToTilemap(rangeSprite);

            rangeSprite.unit = unit;
            this.tileSprites.push(rangeSprite);
        });
        // outerTiles.forEach(rangeTile => {
        //     const {x, y} = rangeTile;
        //     // if (rangeTile.outer) return;
        //     const rangeSprite = new Sprite_StaticRange(new Position(x, y), true ? "GreenSquare" : "BlueSquare");
        //     GameUtils.addSpriteToTilemap(rangeSprite);
        // });
    }
    /**
     * Show Action Range Sprites
     * @param {TacticalUnit} unit 
     * @param {number} skillId
     */
    showActionTileSprites(unit, skillId, bitmapName = 'RedSquare') {
        const skill = $dataSkills[skillId];
        const actionTiles = this.calculateActionTiles(unit.position.x, unit.position.y, skill.tbsSkill.range);
        unit.actionTiles = actionTiles;
        actionTiles.forEach(tile => {
            const {x, y} = tile;
            const rangeSprite = new Sprite_StaticRange(new Position(x, y), bitmapName);
            GameUtils.addSpriteToTilemap(rangeSprite);
            
            rangeSprite.unit = unit;
            this.tileSprites.push(rangeSprite);
        });
    }
    /**
     * Hide Move Tile Sprites
     * @param {TacticalUnit} unit 
     */
    hideTileSprites(unit) {
        const tileSpritesOfUnit = this.tileSprites.filter(sprite => sprite.unit == unit);
        tileSpritesOfUnit.forEach(sprite => {
            GameUtils.removeSpriteFromTilemap(sprite);
        });
        this.tileSprites = this.tileSprites.filter(sprite => sprite.unit != unit);
    }
    /**
     * Calculate Action Target Position By Range
     * @param {TacticalUnit} unit 
     * @param {TacticalRange} range 
     * @returns {FLOOD_FILL_TILE[]}
     */
    calculateActionTargetPositionsByRange(unit, targetX, targetY, range) {
        return this.calculateSelectionTiles(unit, targetX, targetY, range);
    }
}

/**
 * Get Instance
 * @returns {TacticalRangeManager}
 */
 TacticalRangeManager.inst = function() {
    if (TacticalRangeManager.instance) {
        return TacticalRangeManager.instance;
    }
    TacticalRangeManager.instance = new TacticalRangeManager();
    return TacticalRangeManager.instance;
}