class TacticleUnitController {
    /**
     * TacticleUnitController
     * @param {TacticleUnit} unit 
     */
    constructor(unit) {
        this.unit = unit;
    }

    onSelect() {

    }
}

class TacticalPlayerController extends TacticleUnitController {
    /**
     * TacticleUnitController
     * @param {TacticleUnit} unit 
     */
    constructor(unit) {
        super(unit)
    }
    /**
     * On Select
     */
    onSelect() {
        // this.unit.move(this.unit.position.x + 1, this.unit.position.y);
        console.log("Player select ");
    }
}

class TacticalBotController extends TacticleUnitController {
    /**
     * TacticleUnitController
     * @param {TacticleUnit} unit 
     */
    constructor(unit) {
        super(unit)
    }
    /**
     * On Select
     */
    onSelect() {
        console.log("Bot select unit", unit);
    }
}