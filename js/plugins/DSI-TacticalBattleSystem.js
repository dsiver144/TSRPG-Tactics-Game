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

// (function() {

    const pluginName = 'DSI-TacticalBattleSystem';
    let dsiTBS = PluginManager.parameters(pluginName);
    dsiTBS = PluginManager.processParameters(dsiTBS);

    TBS.params = TBS.params || {};
    TBS.params = {...TBS.params, dsiTBS};
    
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

            this.actorListWindow = new Window_TacticleUnitSelectionList(new Rectangle(0, 0, 300, 200));
            this.actorListWindow.setHandler('cancel', this.onActorListCancel.bind(this));
            this.actorListWindow.visible = false;
            this.actorListWindow.deactivate();
            GameUtils.addWindow(this.actorListWindow);

            this.spritePhaseText = new Sprite();
            this.spritePhaseText.anchor.x = 0.5;
            this.spritePhaseText.anchor.y = 0.5;
            this.spritePhaseText.x = Graphics.width / 2;
            this.spritePhaseText.y = Graphics.height / 2;
            GameUtils.addSprite(this.spritePhaseText);
            this.spritePhaseText.opacity = 0;

            this.actorPreviewSprite = new Sprite_TacticleUnitSelection();
            GameUtils.addSpriteToTilemap(this.actorPreviewSprite);
            this.actorPreviewSprite.visible = false;

            // this.actorListWindow = new Window_Sel(new Rectangle(0, 0, 300, 200));
            // this.actorListWindow.visible = false;
            // this.actorListWindow.deactivate();
            // GameUtils.addWindow(this.actorListWindow);
        }
        /**
         * Setup battle
         * @param {Game_Event[]} allyStartPositions 
         * @param {Game_Event[]} enemyEvents 
         */
        setup(allyStartPositions, enemyEvents) {
            this.allyStartPositions = allyStartPositions;
            this.createAllySpotSprites();
            
            this.enemyEvents = enemyEvents;
            this.currentPhase = 'selectUnit';

            this.cursor.show();
            this.moveCursorToFirstSlot();
        }
        /**
         * Move Cursor to first slot.
         */
        moveCursorToFirstSlot() {
            const firstSlot = this.allyStartPositions[0];
            this.cursor.move(firstSlot.x, firstSlot.y);
        }
        /**
         * Create Ally Spot Sprites
         */
        createAllySpotSprites() {
            /**
             * @type {Sprite_AllySpot[]}
             */
            this.allySpotSprites = [];
            this.allyStartPositions.forEach(event => {
                const sprite = new Sprite_AllySpot(new Position(event.x, event.y));
                GameUtils.addSpriteToTilemap(sprite);
                this.allySpotSprites.push(sprite);
            });
        }
        /**
         * Hide Ally Spot Sprites
         */
        hideAllySpotSprites() {
            this.allySpotSprites.forEach(sprite => {
                GameUtils.removeSpriteFromTilemap(sprite);
            })
            this.allySpotSprites = [];
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
            if (this.isBusy()) return;
            switch(this.currentPhase) {
            case 'selectUnit':
                this.onSelectUnits();
                break;
            case 'updateSelectUnit':
                break;
            case 'init':
                this.onInitUnits();
                break;
            case 'battleStart':
                this.onBattleStart();
                break;
            case 'playerTurn':
                this.onPlayerTurn();
                break;
            case 'enemyTurn':
                this.onEnemyTurn();
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
         * Get unit at
         * @param {number} x
         * @param {number} y 
         */
        getUnitAt(x, y) {
            return this.allyUnits.concat(this.enemyUnits).filter(unit => unit.position.x === x && unit.position.y === y)[0];
        }
        /**
         * Update cursor
         */
        updateCursor() {
            this.cursor.update();
        }
        /**
         * Select unit phase
         */
        onSelectUnits() {

            this.actorListWindow.activate();
            this.actorListWindow.refresh();
            this.actorListWindow.visible = true;

            this.cursor.setOnOKCallback((cursorX, cursorY) => {
                if (!this.allyStartPositions.some(event => event.x === cursorX && event.y === cursorY)) {
                    SoundManager.playBuzzer();
                    return;
                }   
                SoundManager.playOk();
                this.cursor.deactivate();

                this.actorPreviewSprite.enableInput(
                    (direction) => {
                        // On Preview OK
                        SoundManager.playSave();
                        this.actorListWindow.activate();
                        this.actorPreviewSprite.hideCharacter();
                        this.actorPreviewSprite.disableInput();

                        // Todo: Spawn ally unit here.
                        const actor = this.actorListWindow.currentExt();
                        this.actorListWindow.removeActor(actor);

                        const character = new Game_Character();
                        character.setImage(actor.characterName(), actor.characterIndex());
                        character.setDirection(direction);
                        character.locate(cursorX, cursorY);
                        const sprite = new Sprite_Character(character);
                        // Init Ally Unit
                        const allyUnit = new Tacticle_AllyUnit(new Position(cursorX, cursorY));
                        allyUnit.setBattler(actor);
                        allyUnit.setSprite(sprite);
                        allyUnit.setFaceDirection(direction);
                        this.allyUnits.push(allyUnit);
                        
                        GameUtils.addSpriteToTilemap(sprite);
                    }
                ,   () => {
                        // ON Preview Cancel
                        SoundManager.playCancel();
                        this.cursor.activate();
                        this.actorPreviewSprite.disableInput();
                    }
                )

            })
            this.cursor.setOnCancelCallback(() => {
                this.actorListWindow.activate();
                this.cursor.deactivate();
                this.actorPreviewSprite.hideCharacter();
            })

            this.currentPhase = 'updateSelectUnit';
        }
        /**
         * On Actor List Cancel
         * NOTE: THIS WILL BE CALLED WHEN FINISH SETUP PLAYER TEAM.
         */
        onActorListCancel() {
            if (!this.canCancelUnitSelection()) {
                SoundManager.playBuzzer();
                this.actorListWindow.activate();
                return;
            }
            this.actorListWindow.deactivate();
            this.actorListWindow.visible = false;
            this.hideAllySpotSprites();
            this.cursor.clearAllCallbacks();

            this.currentPhase = 'init';
        }
        /**
         * Chcekc if player can cancel unit selection and process to go to battle start.
         * @returns {boolean}
         */
        canCancelUnitSelection() {
            return true;
        }
        /**
         * Init units for both side
         */
        onInitUnits() {
            this.initEnemyUnits();
            this.currentPhase = 'battleStart';
        }
        /**
         * Init enemy units
         */
        initEnemyUnits() {
            this.enemyEvents.forEach(event => {
                const { enemyId } = event.enemyData;
                const enemy = new Game_Enemy(enemyId, event.x, event.y);
                const enemySprite = GameUtils.getEventSprite(event.eventId());
                const enemyUnit = new Tacticle_EnemyUnit(new Position(event.x, event.y));
                enemyUnit.setBattler(enemy);
                enemyUnit.setSprite(enemySprite);
                enemyUnit.setFaceDirection(event.direction());
                this.enemyUnits.push(enemyUnit);
            });
        }
        /**
         * Show Phase Text Sprite
         * @param {string} name 
         */
        showPhaseTextSprite(name) {
            this.spritePhaseText.bitmap = ImageManager.loadTBS(name);
            this.spritePhaseText.startTween({opacity: 255}, 30).onFinish(() => {
                this.spritePhaseText.startTween({opacity: 0}, 30).onFinish(() => {
                    this.spritePhaseText.bitmap = null;
                });
            });
        }
        /**
         * Battle Start
         */
        onBattleStart() {
            this.showPhaseTextSprite("BattleStart");
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
        onPlayerTurn() {
            // Show Player Turn sprite;
            this.showPhaseTextSprite("PlayerTurn");
            this.currentPhase = 'updateTurn';

            this.cursor.activate();
            this.cursor.setOnOKCallback((x, y) => {
                const allyUnit = [...this.allyUnits].filter(unit => unit.position.x === x && unit.position.y === y)[0];
                const enemyUnit = [...this.enemyUnits].filter(unit => unit.position.x === x && unit.position.y === y)[0];
                if (allyUnit) {
                    console.log("Select ally: ", allyUnit);
                    allyUnit.controller.onSelect();
                    TacticleRangeManager.inst().showMoveRangeSprites(allyUnit);
                }
                if (enemyUnit) {
                    console.log("Select enemy: ", enemyUnit);
                    TacticleRangeManager.inst().showMoveRangeSprites(enemyUnit);

                }
            })
            this.allyUnits.forEach((unit) => {
                unit.onTurnStart();
            })
        }
        /**
         * Update player turn
         */
        updatePlayerTurn() {
            const isAllPlayerFinished = this.allyUnits.every(unit => !unit.isBusy() && unit.actionPoints == 0);
            if (isAllPlayerFinished) {
                this.allyUnits.forEach((unit) => {
                    unit.onTurnEnd();
                });
                // Swap active team;
                this.determineTurn();
            }
        }
        /**
         * On Enemy Turn
         */
        onEnemyTurn() {
            // Show Enemy Turn Sprite
            this.showPhaseTextSprite("EnemyTurn");
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
            const isPhaseTextShowing = this.spritePhaseText.bitmap != null;
            const isUnitBusy = this.isUnitBusy();
            return isPhaseTextShowing || isUnitBusy;
        }
        /**
         * Check if an unit on both team is busy
         * @returns {boolean}
         */
        isUnitBusy() {
            const isAllyBusy = this.allyUnits.some(ally => ally.isBusy());
            const isEnemyBusy = this.enemyUnits.some(enemy => enemy.isBusy());
            return isAllyBusy || isEnemyBusy;
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


// })();

//========================================================================
// END OF PLUGIN
//========================================================================