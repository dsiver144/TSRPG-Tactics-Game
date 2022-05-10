class TacticalUnitController {
    /**
     * TacticalUnitController
     * @param {TacticalUnit} unit 
     */
    constructor(unit) {
        this.unit = unit;
    }

    onSelect() {
        
    }
}

class TacticalPlayerController extends TacticalUnitController {
    /**
     * TacticalPlayerController
     * @param {TacticalUnit} unit 
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
        console.log("Bot select unit", unit);
        // const 
    }
}