class Tactical_PlayerOpenWindowItemListCommand extends Tactical_PlayerCommand {
    /**
     * Start Action
     */
    startAction() {
        this.cursor.clearAllCallbacks();
        this.cursor.deactivate();

        this.commandWindow.visible = false;

        this.listWindow = new Window_TacticalItemList(new Rectangle(0, 0, 500, 300));
        this.listWindow.setUnit(this.unit);
        this.listWindow.activate();
        GameUtils.addWindow(this.listWindow);
        this.listWindow.setHandler('item', this.onItemOK.bind(this));
        this.listWindow.setHandler('cancel', this.onActionCancel.bind(this));
        this.setItemListWindowPosition();
    }
    /**
     * Set Item List Window Position
     */
    setItemListWindowPosition() {
        const xSpacing = 64;
        this.listWindow.x = this.unit.battlerSprite.x + xSpacing;
        this.listWindow.y = this.unit.battlerSprite.y - this.listWindow.height / 2;
        if (this.listWindow.x + this.listWindow.width >= Graphics.width) {
            this.listWindow.x = this.unit.battlerSprite.x - this.listWindow.width - xSpacing;
        }
    }
    /**
     * On Item OK
     */
    onItemOK() {
        const item = this.listWindow.currentExt();
        /** @type {TBS_ItemData} */
        const tbsItem = item.tbsItem;

        const command = new Tactical_PlayerSkillCommand(this.controller);
        command.setSkill(tbsItem.skillId, 'item');
        command.setItem(item);

        this.controller.pushCommand(command);

        GameUtils.removeWindow(this.listWindow);
    }
    /**
     * On Action Cancel
     */
    onActionCancel() {
        GameUtils.removeWindow(this.listWindow);
        super.onActionCancel();
    }
}

class Window_TacticalItemList extends Window_Command {
    /**
     * Set Unit
     * @param {TacticalUnit} unit 
     */
    setUnit(unit) {
        this.unit = unit;
        this.refresh();
    }
    /**
     * Make command list
     * @returns {void}
     */
    makeCommandList() {
        if (!this.unit) return;
        const items = this.unit.getItems();
        items.forEach(item => {
            if (!item) return;
            this.addCommand("Item", 'item', true, item);
        });
    }
    /**
     * Draw Item
     * @param {number} index 
     */
    drawItem(index) {
        const rect = this.itemLineRect(index);
        const align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        const item = this._list[index].ext;

        const iconIndex = item.iconIndex;
        const name = item.name;
        const number = $gameParty.numItems(item);

        this.drawIcon(iconIndex, rect.x, rect.y);
        this.drawText(name, rect.x + 34, rect.y, rect.width, 'left');
        this.drawText(`x ${number}`, rect.x, rect.y, rect.width, 'right');
    }

}