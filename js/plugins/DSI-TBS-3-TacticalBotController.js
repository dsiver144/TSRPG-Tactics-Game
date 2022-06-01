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

        const moveableTiles = TacticalRangeManager.inst().calculateMovableTiles(this.unit.position.x, this.unit.position.y, this.unit.moveRange());
        TacticalRangeManager.inst().showMoveTileSprites(this.unit);

        let attackable = false;

        console.log(moveableTiles);

        moveableTiles.forEach(tile => {
            const distToTarget = GameUtils.distance(closestUnit.position, tile);
            if (distToTarget >= tbsSkill.range.getMin() && distToTarget <= tbsSkill.range.getMax()) {
                console.log(distToTarget, tbsSkill.range, closestUnit.position, tile);
                this.unit.getCharacter()._through = true;
                this.unit.move(tile.x, tile.y);
                return;
            }
        })

        console.log({battleStyle, unit, oppositeUnitsByDistance, closestUnit});
        // const 
    }
}
