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

        const closestUnit = oppositeUnitsByDistance[0];
        console.log({battleStyle, unit, oppositeUnitsByDistance, closestUnit});
        // const 
    }
}
