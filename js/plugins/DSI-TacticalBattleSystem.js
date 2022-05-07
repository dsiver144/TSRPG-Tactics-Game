//=======================================================================
// * Plugin Name  : DSI-TacticalBattleSystem.js
// * Last Updated : 4/29/2022
//========================================================================
/*:
* @author dsiver144
* @plugindesc (v1.0) A custom plugin by dsiver144
* @help 
* Empty Help
* 
* @param testParam2:number
* @text Test Param
* @type number
* @default 144
* @desc A Test Param
*
* @command startBattle
* @text Start TBS Battle
* @desc Start a tbs battle on current map.
*
* 
*/
/*~struct~PositionObject:
 * @param x:num
 * @text x
 * @desc X position
 * 
 * @param y:num
 * @text y
 * @desc Y Position
 *
 */
/*~struct~SoundEffect:
 * @param name:str
 * @text name
 * @type file
 * @dir audio/se/
 * @desc Choose the name of SE you want to use.
 *
 * @param volume:num
 * @text volume
 * @default 70
 * @desc Choose the volume value of the se
 * 
 * @param pitch:num
 * @text pitch
 * @default 100
 * @desc Choose the pitch value of the se
 * 
 * @param pan:num
 * @text pan
 * @default 0
 * @desc Choose the pan value of the se
 * 
 */
window.TBS = window.TBS || {};

(function() {

    const pluginName = 'DSI-TacticalBattleSystem';
    let params = PluginManager.parameters(pluginName);
    params = PluginManager.processParameters(params);

    TBS.params = TBS.params || {};
    TBS.params = {...TBS.params, params};
    
    PluginManager.registerCommand(pluginName, "startBattle", args => {
        const startPos = GameUtils.getAllyPositionEvents();
        const enemyEvents = GameUtils.getEnemyEvents();
        console.log({startPos, enemyEvents});
        TacticalBattleSystem.inst().reset();
        TacticalBattleSystem.inst().setup(startPos, enemyEvents);
        // GameUtils.setPlayerMapScroll(false);
        GameUtils.setCameraTarget(TacticalBattleSystem.inst().cursor);
    });

    class TacticalBattleSystem {

        constructor() {
            this.currentPhase = 'none';
            /**
             * @type {TacticleUnit[]}
             */
            this.allyUnits = [];
            /**
             * @type {TacticleUnit[]}
             */
            this.enemyUnits = [];
            this.activeTeamId = 0;
            /**
             * @type {TacticleCursor}
             */
            this.cursor = new TacticleCursor();
        }
        /**
         * Setup battle
         * @param {Game_Event[]} allyStartPositions 
         * @param {Game_Event[]} enemyEvents 
         */
        setup(allyStartPositions, enemyEvents) {
            this.allyStartPositions = allyStartPositions;
            this.enemyEvents = enemyEvents;
            this.currentPhase = 'init';
            this.cursor.activate();
        }
        /**
         * Reset Battle System
         */
        reset() {
            this.currentPhase = 'none';
            this.allyUnits = [];
            this.enemyUnits = [];
        }
        /**
         * Update every frame
         */
        update() {
            if (this.currentPhase === 'none') return;
            this.updatePhase();
            this.updateUnits();
            this.updateCursor();
        }
        /**
         * Update battle phase
         */
        updatePhase() {
            switch(this.currentPhase) {
            case 'setup':
                
            case 'init':
                this.initUnits();
                break;
            case 'battleStart':
                this.battleStart();
                break;
            case 'playerTurn':
                this.playerTurn();
                break;
            case 'enemyTurn':
                this.enemyTurn();
                break;
            case 'updateTurn':
                this.activeTeamId == 0 ? this.updatePlayerTurn() : this.updateEnemyTurn();
                break;
            }
        }
        /**
         * Update Units for both side
         */
        updateUnits() {
            this.allyUnits.forEach(unit => unit.update());
            this.enemyUnits.forEach(unit => unit.update());
        }
        /**
         * Update cursor
         */
        updateCursor() {
            this.cursor.update();
        }
        /**
         * Init units for both side
         */
        initUnits() {
            this.currentPhase = 'battleStart';
        }
        /**
         * Battle Start
         */
        battleStart() {
            this.setActiveTeam(0);
        }
        /**
         * Set Active Team
         * @param {number} teamId 
         */
        setActiveTeam(teamId) {
            this.activeTeamId = teamId;
            this.determineTurn();
        }
        /**
         * Choose next turn base on current active team id
         */
        determineTurn() {
            if (this.activeTeamId == 0) {
                this.currentPhase = 'playerTurn';
            } else {
                this.currentPhase = 'enemyTurn';
            }
        }
        /**
         * On player turn
         */
        playerTurn() {
            // Show Player Turn sprite;
            this.currentPhase = 'updateTurn';
        }
        /**
         * Update player turn
         */
        updatePlayerTurn() {
            const isAllPlayerFinished = this.allyUnits.every(unit => !unit.isBusy() && unit.actionPoints == 0);
            if (isAllPlayerFinished) {
                // Swap active team;
            }
        }
        /**
         * On Enemy Turn
         */
        enemyTurn() {
            // Show Enemy Turn Sprite
            this.currentPhase = 'updateTurn';
        }
        /**
         * Update Enemy Turn
         */
        updateEnemyTurn() {
    
        }
        /**
         * Check if battle system is busy.
         * @returns {Boolean}
         */
        isBusy() {
            return false;
        }
    
    }
    /**
     * Get Instance
     * @returns {TacticalBattleSystem}
     */
    TacticalBattleSystem.inst = function() {
        if (TacticalBattleSystem.instance) {
            return TacticalBattleSystem.instance;
        }
        TacticalBattleSystem.instance = new TacticalBattleSystem();
        return TacticalBattleSystem.instance;
    }

    var DSI_TacticalBattleSystem_Scene_Map_updateScene = Scene_Map.prototype.updateScene;
    Scene_Map.prototype.updateScene = function() {
		DSI_TacticalBattleSystem_Scene_Map_updateScene.call(this);
        this.updateTBS();
    }

    Scene_Map.prototype.updateTBS = function() {
        if (SceneManager.isSceneChanging()) return;
        TacticalBattleSystem.inst().update();
    }


})();

//========================================================================
// END OF PLUGIN
//========================================================================