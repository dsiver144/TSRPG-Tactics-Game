class TacticalSequenceManager {
    /**
     * Init
     */
    reset() {
        this.actionIndex = -1;
        /**
         * @type {TacticalSequenceAction[]}
         */
        this.actions = [];
    }
    /**
     * Run battle sequences
     * @param {TacticalUnit} user 
     * @param {TacticalUnits[]} targets 
     * @param {string} sequences 
     */
    runSequences(user, targets, sequences) {
        this.reset();
        this.user = user;
        this.targets = targets;
        eval(sequences);
        this.startNextAction();
    }
    /**
     * Play Animation
     * @param {TacticalUnit} subject 
     * @param {number} animationId 
     * @param {boolean} waitForComplete 
     */
    playAnim(subject, animationId, waitForComplete = true) {
        const action = new TacticalSequencePlayAnimAction(subject, this);
        action.setAnimId(animationId).setWait(waitForComplete);
        this.actions.push(action);
    }
    /**
     * Play Animation On Cursor
     * @param {number} animationId 
     * @param {boolean} waitForComplete
     */
    playAnimOnCursor(animationId, waitForComplete = true) {
        const cursor = TacticalBattleSystem.inst().cursor;
        const action = new TacticalSequencePlayAnimActionOnCursor(cursor, this);
        action.setAnimId(animationId).setWait(waitForComplete);
        this.actions.push(action);
    }
    /**
     * Apply action.
     * @param {TacticalUnit} targetUnit 
     */
    applyAction(targetUnit) {
        const battleAction = this.user.currentAction();
        const action = new TacticalSequenceApplyBattleAction(null, this);
        action.setBattleAction(battleAction, targetUnit.battler);
        this.actions.push(action);
    }
    /**
     * Wait Action
     * @param {number} frames 
     */
    wait(frames) {
        const action = new TacticalSequenceWaitAction(null, this);
        action.setWaitFrames(frames);
        this.actions.push(action);
    }
    /**
     * Start Next Action
     */
    startNextAction() {
        this.actionIndex += 1;
        const action = this.actions[this.actionIndex];
        action && action.onStart();
    }
    /**
     * Update sequences.
     */
    update() {
        if (!this.isBusy()) return;
        let finishCount = 0;
        this.actions.forEach(action => {
            action.update();
            if (action.isFinished()) {
                finishCount += 1;
            }
        });
        if (finishCount >= this.actions.length) {
            this.reset();
        }
    }
    /**
     * Is Busy
     * @returns {boolean}
     */
    isBusy() {
        return this.actions.length > 0;
    }

}

class TacticalSequenceAction {
    /**
     * TacticalSequencePlayAnimAction
     * @param {TacticalUnit} subject 
     * @param {TacticalSequenceManager} manager 
     */
    constructor(subject, manager) {
        const cursor = TacticalBattleSystem.inst().cursor;

        this.manager = manager;
        this.subject = subject;

        this.isNextActionStarted = false;
        this.isFinishAction = false;
        this.isStarted = false;
    }
    /**
     * Set wait.
     * @param {boolean} v 
     * @returns {TacticalSequenceAction}
     */
    setWait(v) {
        this.waiting = v;
        return this;
    }
    /**
     * Start action
     */
    onStart() {
        this.isStarted = true;
    }
    /**
     * Finish Action
     */
    onFinish() {
        console.log("FINISH ", this);
    }
    /**
     * Start Next Action
     */
    startNextAction() {
        this.manager.startNextAction();
        this.isNextActionStarted = true;
    }
    /**
     * Update
     */
    update() {
        if (!this.isStarted) return;
        this.updateAction();
    }
    /**
     * Update action
     * @returns {void}
     */
    updateAction() {
        if (this.isFinished() && !this.isFinishAction) {
            this.onFinish();
            this.isFinishAction = true;
        }
        if (this.isNextActionStarted) return;
        if (this.waiting) {
            if (this.isFinished()) {
                this.startNextAction();
            }
        } else {
            this.startNextAction();
        }
    }
    /**
     * Check if this action is finish or not.
     * @returns {boolean}
     */
    isFinished() {
        return false;
    }
}

class TacticalSequencePlayAnimAction extends TacticalSequenceAction {
    /**
     * Set Animation ID
     * @param {number} id 
     */
    setAnimId(id) {
        this.animationId = id;
        return this;
    }
    /**
     * Get Target
     * @returns {Game_Character | TacticalCursor}
     */
    getTarget() {
        return this.subject.getCharacter();
    }
    /**
     * On Start
     */
    onStart() {
        super.onStart();
        $gameTemp.requestAnimation([this.getTarget()], this.animationId);
    }
    /**
     * Check if this action is finish or not.
     * @returns {boolean}
     */
    isFinished() {
        return !this.getTarget().isAnimationPlaying();
    }
}

class TacticalSequencePlayAnimActionOnCursor extends TacticalSequencePlayAnimAction {

    getTarget() {
        return this.subject;
    }
}

class TacticalSequenceWaitAction extends TacticalSequenceAction {
    /**
     * Set Wait Frames
     * @param {number} frames 
     */
    setWaitFrames(frames) {
        this.waitFrames = frames;
        this.setWait(true);
    }
    /**
     * Update action
     */
    updateAction() {
        if (this.waitFrames > 0) {
            this.waitFrames -= 1;
        }
        super.updateAction();
    }
    /**
     * Check if this action is finish or not.
     * @returns {boolean}
     */
    isFinished() {
        return this.waitFrames === 0;
    }
}

class TacticalSequenceApplyBattleAction extends TacticalSequenceAction {
    /**
     * Set Battle Action
     * @param {Game_Action} action 
     * @param {Game_Battler} target 
     */
    setBattleAction(action, target) {
        this.battleAction = action;
        this.target = target;
        this.actionFinished = false;
    }
    /**
     * On Start
     */
    onStart() {
        super.onStart();
        const beforeHP = this.target.hp;
        this.battleAction.apply(this.target);
        const afterHP = this.target.hp;
        console.log("> Appled Action to Target: ", this.target.result(), beforeHP, afterHP);
        this.processActionResult();
    }
    /**
     * Process action result
     */
    processActionResult() {
        const result = this.target.result();
        const isCritical = result.critical;
        const isMissed = result.missed;
        const isEvaded = result.evaded;
        const hpDmg = result.hpAffected ? result.hpDamage : null;
        const tpDmg = this.target.isAlive() && result.mpDamage !== 0 ?  result.mpDamage : 0;
        const addedStates = result.addedStateObjects();
        const removedStates = result.removedStateObjects();
        const addedBuffs = result.addedBuffs;
        const addedDebuffs = result.addedDebuffs;
        const removedBuffs = result.removedBuffs;
        console.log("Action result: ", result);
        this.actionFinished = true;
    }
    /**
     * Check if this action is finish or not.
     * @returns {boolean}
     */
    isFinished() {
        return this.actionFinished;
    }
}

/**
 * Get Instance
 * @returns {TacticalSequenceManager}
 */
 TacticalSequenceManager.inst = function() {
    if (TacticalSequenceManager.instance) {
        return TacticalSequenceManager.instance;
    }
    TacticalSequenceManager.instance = new TacticalSequenceManager();
    return TacticalSequenceManager.instance;
}