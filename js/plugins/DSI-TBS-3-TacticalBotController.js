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
        const cursor = TacticalBattleSystem.inst().cursor;

        const unit = this.unit;
        const battleStyle = 'agressive';
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
            this.calculateAllPossibleActionPosition(tbsSkill);
            return;
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
        }, 500);
        // this.unit.move(destinateTile.x, destinateTile.y, () => {
        //     TacticalRangeManager.inst().hideTileSprites(this.unit);
        // });

        console.log({battleStyle, unit, oppositeUnitsByDistance, closestUnit});
        // const 
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
        console.log(result);
        return result
    }
}

class TBS_PossibleActionPosition {
    constructor(x, y, tiles, selectable) {
        this.x = x;
        this.y = x;
        this.tiles = tiles;
        this.selectable = selectable;
    }
}