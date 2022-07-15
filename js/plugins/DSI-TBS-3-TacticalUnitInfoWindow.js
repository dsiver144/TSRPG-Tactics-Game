class Window_TacticalUnitInfo extends Window_Base {
    /**
     * Window_TacticalUnitInfo
     * @param {Rectangle} rect 
     */
    constructor() {
        const windowWidth = 600;
        const windowHeight = Window_Base.prototype.fittingHeight(6);
        super(new Rectangle(0, Graphics.height - windowHeight, windowWidth, windowHeight));
        this.pageIndex = -1;
    }
    /**
     * Set Unit
     * @param {TacticalUnit} unit 
     */
    setUnit(unit) {
        this.unit = unit;
        this.pageIndex = 0;
        this.drawUnitInfo();
        
        this.applyAction();
    }
    /**
     * Draw unit info
     */
    drawUnitInfo() {
        if (!this.unit) return;
        this['drawPage' + this.pageIndex]();
    }
    /**
     * Draw Page 0
     * @param {Game_Battler} testBattler
     */
    drawPage0(testBattler = null) {
        this.contents.clear();
        const unit = this.unit;
        const offset = 4;
        const lh = this.lineHeight();
        const cw = this.contentsWidth() - offset * 2;
        const ch = this.contentsHeight() - offset * 2;
        const name = unit.name();
        const level = unit.level();
        let dx = offset;
        let dy = offset;
        this.drawText(name, dx, dy, cw, 'left');
        this.drawText('Lv ' + level, dx, dy, cw, 'right');
        this.fillRect(dx, dy + lh, cw, 1);
        const battler = unit.battler;
        dy += lh * 2;
        const colWidth = cw / 3;
        const previewHP = testBattler ? testBattler.hp : null;
        this.drawGauge('HP', battler.hp, battler.mhp, battler.hpRate(), dx, dy, colWidth, "#eba315", "#eb1543", previewHP);
        dy += lh;
        const previewMP = testBattler ? testBattler.mp : null;
        this.drawGauge('MP', battler.mp, battler.mmp, battler.mpRate(), dx, dy, colWidth, "#429eff", "#82daff", previewMP);
    }
    /**
     * Draw Gauge
     * @param {string} text 
     * @param {number} rate 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {string} color1 
     * @param {string} color2 
     * @param {number} previewValue
     */
    drawGauge(text, current, max, rate, x, y, width, color1, color2, previewValue) {
        if (max <= 0) return;
        let gaugeX = x + 32;
        let gaugeY = y + 4;
        let gaugeWidth = width - 32;
        let gaugeHeight = 24;
        this.changeTextColor(ColorManager.systemColor());
        this.drawText(text, x, y, width, 'left');
        this.changeTextColor(ColorManager.normalColor());
        this.fillRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight, "#333333", "#333333");
        if (previewValue != null) {

            const previewRate = previewValue / max;
            console.log({previewValue, max, previewRate});

            this.fillRect(gaugeX, gaugeY, gaugeWidth * previewRate, gaugeHeight, color1, color2);
            this.contents.paintOpacity -= 150;
            this.fillRect(gaugeX, gaugeY, gaugeWidth * rate, gaugeHeight, color1, color2);
            this.contents.paintOpacity += 150;
            this.drawText(`${previewValue}/${max}`, gaugeX, y - 1, gaugeWidth, 'center');
        } else {
            this.fillRect(gaugeX, gaugeY, gaugeWidth * rate, gaugeHeight, color1, color2);
            this.drawText(`${current}/${max}`, gaugeX, y - 1, gaugeWidth, 'center');
        }
        

    }
    /**
     * Fill Rect
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} color 
     */
    fillRect(x, y, width, height, color = '#ffffff', color2 = '#ffffff') {
        /** @type {Bitmap} */
        const contents = this.contents;
        contents.gradientFillRect(x, y, width, height, color, color2);
    }
    /**
     * Apply Action
     * @param {Game_Action} action 
     */
    applyAction(action) {
        if (!this.unit) return;
        action = new Game_Action();
        action.setSubject(this.unit.battler);
        action.setAttack();
        /** @type {Game_Battler} */
        const testBattler = JsonEx.makeDeepCopy(this.unit.battler);
        action.apply(testBattler);
        const result = testBattler.result();
        if (result.hpDamage > 0 || result.mpDamage > 0) {
            this.drawPage0(testBattler);
        }
    }

}