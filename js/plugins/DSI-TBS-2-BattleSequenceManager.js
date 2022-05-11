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
        action && action.start();
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
        this.manager = manager;
        this.subject = subject;

        this.isNextActionStarted = false;
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
    start() {

    }
    /**
     * Finish Action
     */
    finish() {
        console.log("FINISH ", this);
    }
    /**
     * Start Next Action
     */
    startNextAction() {
        this.finish();
        this.manager.startNextAction();
        this.isNextActionStarted = true;
    }
    /**
     * Update
     */
    update() {
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
     * Start action
     */
    start() {
        $gameTemp.requestAnimation([this.subject.getCharacter()], this.animationId);
    }
    /**
     * Check if this action is finish or not.
     * @returns {boolean}
     */
    isFinished() {
        return !this.subject.getCharacter().isAnimationPlaying();
    }
}

class TacticalSequenceWaitAction extends TacticalSequenceAction {
    /**
     * Set wait frame
     */
    setWaitFrames(frames) {
        this.waitFrames = frames;
        this.setWait(true);
    }
    /**
     * Update
     */
    update() {
        if (this.waitFrames > 0) {
            this.waitFrames -= 1;
        }
        super.update();
    }
    /**
     * Check if this action is finish or not.
     * @returns {boolean}
     */
    isFinished() {
        return this.waitFrames === 0;
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