const BOT_DELAY = 200;

class TacticalBotController extends TacticalUnitController {
    /**
     * TacticalBotController
     * @param {TacticalUnit} unit
     */
    constructor(unit) {
        super(unit);
    }
    /**
     * On Select
     */
    onSelect() {

        this.onBotTurn();

        return;

        const cursor = TacticalBattleSystem.inst().cursor;

        const unit = this.unit;
        const battleStyle = 'agressive';
        const allyUnits = TacticalUnitManager.inst().getAllyTeam(this.unit);
        const oppositeUnits = TacticalUnitManager.inst().getOppositeTeam(this.unit);
        const oppositeUnitsByDistance = oppositeUnits.sort((a, b) => {
            const distA = GameUtils.distance(a.position, this.unit.position);//Math.abs(this.unit.position.x - a.position.x) + Math.abs(this.unit.position.y - a.position.y);
            const distB = GameUtils.distance(b.position, this.unit.position);//Math.abs(this.unit.position.x - b.position.x) + Math.abs(this.unit.position.y - b.position.y);
            return distA - distB;
        });

        const skill = $dataSkills[this.unit.attackSkillId()];
        /** @type {TBS_SkillData} */
        const tbsSkill = skill.tbsSkill;

        const closestUnit = oppositeUnitsByDistance[0];
        const vulnerablePosition = closestUnit.vulnerablePosition();

        const distanceToClosestUnit = GameUtils.distance(closestUnit.position, this.unit.position);

        let attackable = false;

        if (distanceToClosestUnit >= tbsSkill.range.getMin() && distanceToClosestUnit <= tbsSkill.range.getMax()) {
            // When bot is already in attack range.
            attackable = true;
            const actionPosition = this.calculateBestActionPosition(tbsSkill, allyUnits, oppositeUnits);
            if (actionPosition) {
                let actionTileImg = tbsSkill.getTileImage();
                let showSelection = tbsSkill.range.canShowSelection();
                TacticalRangeManager.inst().showActionTileSprites(this.unit, skill.id, showSelection ? "BlackSquare" : actionTileImg);
                TacticalRangeManager.inst().showSelectionTileAtCursor(this.unit, tbsSkill.range);
                setTimeout(() => {
                    setTimeout(() => {
                        cursor.move(actionPosition.x, actionPosition.y);
                        setTimeout(() => {
                            this.unit.useSkill(skill.id, actionPosition.x, actionPosition.y);
                            TacticalRangeManager.inst().hideTileSprites(cursor);
                            TacticalRangeManager.inst().hideTileSprites(this.unit);
                        }, BOT_DELAY);
                    }, BOT_DELAY);
                }, BOT_DELAY);
                return;
            }
            
            // let targets = [];
            // // let minTarget = 
            // actionPositions.forEach(positionData => {
                
            // })
            // return;
        }

        const moveableTiles = TacticalRangeManager.inst().calculateMovableTiles(this.unit.position.x, this.unit.position.y, this.unit.moveRange());
        TacticalRangeManager.inst().showMoveTileSprites(this.unit);


        console.log(moveableTiles);


        const possibleTiles = [];
        moveableTiles.forEach(tile => {
            // Move to the tile that you can the bot can use the skill at the closest unit.
            const distToTarget = GameUtils.distance(closestUnit.position, tile);
            if (distToTarget >= tbsSkill.range.getMin() && distToTarget <= tbsSkill.range.getMax()) {
                attackable = true;
                possibleTiles.push(tile);
            }
        })

        if (possibleTiles.length == 0) {
            // Move to the tile that closest to the closest unit.
            let minDist = Number.POSITIVE_INFINITY;
            let targetTile = null;
            moveableTiles.forEach(tile => {
                const distToTarget = GameUtils.distance(closestUnit.position, tile);
                if (distToTarget < minDist) {
                    minDist = distToTarget;
                    targetTile = tile;
                }
            })
            possibleTiles.push(targetTile);
        }

        const destinateTile = possibleTiles[0];
        setTimeout(() => {
            cursor.move(destinateTile.x, destinateTile.y);
            TacticalRangeManager.inst().hideTileSprites(this.unit);
            this.unit.move(destinateTile.x, destinateTile.y, () => {

            });
        }, BOT_DELAY);
        // this.unit.move(destinateTile.x, destinateTile.y, () => {
        //     TacticalRangeManager.inst().hideTileSprites(this.unit);
        // });

        console.log({battleStyle, unit, oppositeUnitsByDistance, closestUnit});
        // const 
    }

    async onBotTurn() {
        const cursor = TacticalBattleSystem.inst().cursor;

        const skill = $dataSkills[unit.attackSkillId()];
        /** @type {TBS_SkillData} */
        const tbsSkill = skill.tbsSkill;

        const unit = this.unit;
        const battleStyle = 'agressive';

        const allyUnits = TacticalUnitManager.inst().getAllyTeam(this.unit);
        const oppositeUnits = TacticalUnitManager.inst().getOppositeTeam(this.unit);
        const oppositeUnitsByDistance = oppositeUnits.sort((a, b) => {
            const distA = GameUtils.distance(a.position, this.unit.position);   //Math.abs(this.unit.position.x - a.position.x) + Math.abs(this.unit.position.y - a.position.y);
            const distB = GameUtils.distance(b.position, this.unit.position);   //Math.abs(this.unit.position.x - b.position.x) + Math.abs(this.unit.position.y - b.position.y);
            return distA - distB;
        });

        const closestUnit = oppositeUnitsByDistance[0];
        const vulnerablePosition = closestUnit.vulnerablePosition();

        const distanceToClosestUnit = GameUtils.distance(closestUnit.position, unit.position);

        const isInRangeToUseSkillToClosestTarget = distanceToClosestUnit >= tbsSkill.range.getMin() && distanceToClosestUnit <= tbsSkill.range.getMax();

        if (isInRangeToUseSkillToClosestTarget) {
            // When bot is already in attack range.
            await this.checkUseAction(tbsSkill, allyUnits, oppositeUnits);
        }

        const moveableTiles = TacticalRangeManager.inst().calculateMovableTiles(this.unit.position.x, this.unit.position.y, this.unit.moveRange());
        TacticalRangeManager.inst().showMoveTileSprites(this.unit);
    }
    /**
     * checkUseAction
     * @param {TBS_SkillData} tbsSkill 
     * @param {TacticalUnit[]} allyUnits 
     * @param {TacticalUnit[]} oppositeUnits 
     * @returns 
     */
    async checkUseAction(tbsSkill, allyUnits, oppositeUnits) {
        const actionPosition = this.calculateBestActionPosition(tbsSkill, allyUnits, oppositeUnits);
        if (!actionPosition) return;
        let actionTileImg = tbsSkill.getTileImage();
        let showSelection = tbsSkill.range.canShowSelection();
        TacticalRangeManager.inst().showActionTileSprites(this.unit, skill.id, showSelection ? "BlackSquare" : actionTileImg);
        TacticalRangeManager.inst().showSelectionTileAtCursor(this.unit, tbsSkill.range);
        await this.wait(BOT_DELAY);
        cursor.move(actionPosition.x, actionPosition.y);
        await this.wait(BOT_DELAY);
        this.unit.useSkill(skill.id, actionPosition.x, actionPosition.y);
        TacticalRangeManager.inst().hideTileSprites(cursor);
        TacticalRangeManager.inst().hideTileSprites(this.unit);
    }

    async checkMove() {

    }
    /**
     * Wait
     * @param {number} duration 
     * @returns {Promise<void>}
     */
    wait(duration) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, duration)
        })
    }
    /**
     * Calculate All Possible Action Position
     * @param {TBS_SkillData} tbsSkill 
     * @returns {TBS_PossibleActionPosition[]}
     */
    calculateAllPossibleActionPosition(tbsSkill) {
        const range = tbsSkill.range;
        const unitX = this.unit.position.x;
        const unitY = this.unit.position.y;
        const actionTiles = TacticalRangeManager.inst().calculateActionTiles(unitX, unitY, range);
        /** @type {TBS_PossibleActionPosition[]} */
        const result = [];
        console.log({actionTiles});
        if (range.isSelectable()) {
            for (let tile of actionTiles) {
                const targetPositions = TacticalRangeManager.inst().calculateSelectionTiles(this.unit, tile.x, tile.y, range);
                result.push(new TBS_PossibleActionPosition(tile.x, tile.y, targetPositions, true));
            }
        } else {
            const targetPositions = TacticalRangeManager.inst().calculateSelectionTiles(this.unit, unitX, unitY, range);
            result.push(new TBS_PossibleActionPosition(unitX, unitY, targetPositions, false));

        }
        return result
    }
    /**
     * Calculate Best Action Position
     * @param {TBS_SkillData} tbsSkill 
     * @param {TacticalUnit[]} allyUnits
     * @param {TacticalUnit[]} oppositeUnits
     * @returns {TBS_PossibleActionPosition}
     */
    calculateBestActionPosition(tbsSkill, allyUnits, oppositeUnits) {
        const positions = this.calculateAllPossibleActionPosition(tbsSkill);
        /** @type {TacticalUnit[]} */
        let targets = [];
        if (tbsSkill.getTargets().includes(TBS_TARGET_TYPE.ally)) {
            targets = targets.concat(allyUnits);
        }
        if (tbsSkill.getTargets().includes(TBS_TARGET_TYPE.enemy)) {
            targets = targets.concat(oppositeUnits);
        }
        if (tbsSkill.getTargets().includes(TBS_TARGET_TYPE.user)) {
            targets.push(this.unit);
        }
        const targetMap = new TBS_UnitMap();
        targets.forEach(u => targetMap.set(u.position.x, u.position.y, u));

        let maxTargetNumber = 0;
        /** @type {TBS_PossibleActionPosition} */
        let result = null;
        positions.forEach(positionData => {
            let targetNumber = 0;
            const tiles = positionData.tiles;
            tiles.forEach(tile => {
                if (targetMap.get(tile.x, tile.y)) {
                    targetNumber += 1;
                }
            })
            if (targetNumber > maxTargetNumber) {
                result = positionData;
                maxTargetNumber = targetNumber;
            }
        })
        return result;
        // tbsSkill.getTargets().includes()
    }
}

class TBS_PossibleActionPosition {
    constructor(x, y, tiles, selectable) {
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
        /** @type {FLOOD_FILL_TILE[]} */
        this.tiles = tiles;
        /** @type {boolean} */
        this.selectable = selectable;
    }
}