class Window_TacticalUnitSelectionList extends Window_Command {

    constructor(rect) {
        super(rect);
        /**
         * @type {Game_Actor[]}
         */
        this._actorList = [...this.getPartyMembers()];
        this.setHandler('ok', this.onActorOK.bind(this));
    }
    /**
     * Add actor to the list
     * @param {Game_Actor} actor 
     */
     addActor(actor) {
        this._actorList.push(actor);
        this.refresh();
    }
    /**
     * Remove actor from the list
     * @param {Game_Actor} actor 
     */
    removeActor(actor) {
        this._actorList.splice(this._actorList.indexOf(actor), 1);
        this.refresh();
    }
    /**
     * Make command list
     */
    makeCommandList() {
        if (!this._actorList) return;
        this._actorList.forEach(member => {
            member.characterName();
            member.characterIndex
            this.addCommand(member.name(), 'ok', true, member);
        });
    }
    /**
     * Get party members
     * @returns {Game_Actor[]}
     */
    getPartyMembers() {
        return $gameParty.members();
    }
    /**
     * On Actor OK
     */
    onActorOK() {
        const actor = this.currentExt();

        const battleSystem = TacticalBattleSystem.inst();
        battleSystem.actorPreviewSprite.setImage(actor.characterName(), actor.characterIndex());
        battleSystem.actorPreviewSprite.visible = true;

        battleSystem.cursor.activate();

        this.refresh();
    }
    /**
     * Draw item
     * @param {number} index 
     */
    drawItem(index) {
        const rect = this.itemLineRect(index);
        const align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
    }
}

class Window_TacticalSelectedUnits extends Window_Command {
    constructor(rect) {
        super(rect);
        /**
         * @type {Game_Actor[]}
         */
        this._selectedActors = [];
        this.setHandler('ok', this.onActorOK.bind(this));
    }
    /**
     * Add actor to the list
     * @param {Game_Actor} actor 
     */
    addActor(actor) {
        this._selectedActors.push(actor);
    }
    /**
     * Remove actor from the list
     * @param {Game_Actor} actor 
     */
    removeActor(actor) {
        this._selectedActors.splice(this._selectedActors.indexOf(actor), 1);
    }
    /**
     * Make command list
     */
    makeCommandList() {
        if (!this._selectedActors) return;
        this._selectedActors.forEach((actor) => {
            this.addCommand(actor.name(), 'ok', true, actor);
        })
    }
    /**
     * On Actor OK
     */
    onActorOK() {
        console.log(this.currentExt());
        this.activate();
    }
    /**
     * Draw item
     * @param {number} index 
     */
    drawItem(index) {
        const rect = this.itemLineRect(index);
        const align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
    }
}