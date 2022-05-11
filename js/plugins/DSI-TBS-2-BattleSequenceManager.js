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
        console.log("ACTIONS: ", this.actions);
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
        console.log("Start action", action);
    }
    /**
     * Update sequences.
     */
    update() {
        if (!this.isBusy()) return;
        let finishCount = 0;
        this.actions.forEach(action => {
            action.update();
            if (action.isFinished()) finishCount += 1;
        });
        if (finishCount === this.actions.length) {
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

    getTarget() {
        return this.subject.getCharacter();
    }

    onStart() {
        super.onStart();
        $gameTemp.requestAnimation([this.getTarget()], this.animationId);
    }

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

    setWaitFrames(frames) {
        this.waitFrames = frames;
        this.setWait(true);
    }

    updateAction() {
        if (this.waitFrames > 0) {
            this.waitFrames -= 1;
        }
        super.updateAction();
    }

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
    }

    onStart() {
        super.onStart();
        this.battleAction.apply(this.target);
        console.log("> Appled Action to Target: ", this.target.result());
    }
    
    isFinished() {
        return true;
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