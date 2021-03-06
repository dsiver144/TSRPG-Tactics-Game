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
        TacticalSequenceManager.inst().reset();
        TacticalBattleSystem.inst().reset();
        TacticalBattleSystem.inst().setup(startPos, enemyEvents);
        // GameUtils.setPlayerMapScroll(false);
        GameUtils.setCameraTarget(TacticalBattleSystem.inst().cursor);
    });

    class TacticalBattleSystem {

        constructor() {
            this.currentPhase = 'none';
            /**
             * @type {number}
             */
            this.totalTurns = 0;
            /**
             * @type {number}
             */
            this.activeTeamId = 0;
            /**
             * @type {TacticalCursor}
             */
            this.cursor = new TacticalCursor();
            

            this.actorListWindow = new Window_TacticalUnitSelectionList(new Rectangle(40, 40, 300, 200));
            this.actorListWindow.setHandler('cancel', this.onActorListCancel.bind(this));
            this.actorListWindow.visible = false;
            this.actorListWindow.deactivate();
            GameUtils.addWindow(this.actorListWindow);

            this.actorUnitCommandWindow = new Window_TacticalUnitCommand(new Rectangle(40, 40, 300, 200));
            this.actorUnitCommandWindow.setHandler('cancel', this.onActorUnitCommandCancel.bind(this));
            this.actorUnitCommandWindow.visible = false;
            this.actorUnitCommandWindow.deactivate();
            GameUtils.addWindow(this.actorUnitCommandWindow);

            this.unitInfoWindow = new Window_TacticalUnitInfo();
            this.unitInfoWindow.visible = false;
            this.unitInfoWindow.deactivate();
            GameUtils.addWindow(this.unitInfoWindow);

            this.spritePhaseText = new Sprite();
            this.spritePhaseText.anchor.x = 0.5;
            this.spritePhaseText.anchor.y = 0.5;
            this.spritePhaseText.x = Graphics.width / 2;
            this.spritePhaseText.y = Graphics.height / 2;
            GameUtils.addSprite(this.spritePhaseText);
            this.spritePhaseText.opacity = 0;

            this.actorPreviewSprite = new Sprite_TacticalUnitSelection();
            GameUtils.addSpriteToTilemap(this.actorPreviewSprite);
            this.actorPreviewSprite.visible = false;

            this.unitDirectionIndicatorSprite = new Sprite_UnitDirectionIndicator();
            GameUtils.addSpriteToTilemap(this.unitDirectionIndicatorSprite);

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
            this.totalTurns = 0;

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
            TacticalUnitManager.inst().reset();
        }
        /**
         * Update every frame
         */
        update() {
            if (this.currentPhase === 'none') return;
            this.updatePhase();
            this.updateUnits();
            this.updateCursor();
            this.updateSequences();
        }
        /**
         * Update battle phase
         */
        updatePhase() {
            console.log("BUSY", this.isBusy());
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
            TacticalUnitManager.inst().updateUnits();
        }
        /**
         * Update cursor
         */
        updateCursor() {
            this.cursor.update();
        }
        /**
         * Update sequences
         */
        updateSequences() {
            TacticalSequenceManager.inst().update();
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

                const unit = this.actorPreviewSprite.tempUnit;
                unit.setFaceChoosingStatus(true);
                this.unitDirectionIndicatorSprite.setUnit(unit);

                this.actorPreviewSprite.enableInput(
                    (direction) => {

                        this.unitDirectionIndicatorSprite.clearUnit();

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
                        character.locate(cursorX, cursorY);
                        const sprite = new Sprite_Character(character);
                        // Init Ally Unit
                        const allyUnit = new Tactical_AllyUnit(new Position(cursorX, cursorY));
                        allyUnit.setBattler(actor);
                        allyUnit.setSprite(sprite);
                        allyUnit.setFaceDirection(direction);
                        
                        TacticalUnitManager.inst().addAllyUnit(allyUnit);
                        
                        GameUtils.addSpriteToTilemap(sprite, true);
                    }
                ,   () => {
                        // ON Preview Cancel
                        this.unitDirectionIndicatorSprite.clearUnit();

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
         * Check if player can cancel unit selection and process to go to battle start.
         * @todo
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
                const enemyUnit = new Tactical_EnemyUnit(new Position(event.x, event.y));
                enemyUnit.setBattler(enemy);
                enemyUnit.setSprite(enemySprite);
                enemyUnit.setFaceDirection(event.direction());
                TacticalUnitManager.inst().addEnemyUnit(enemyUnit);
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
            this.clearAllyStartingPositionEvents();
            this.setActiveTeam(0);
        }
        /**
         * Clear Ally Starting Position
         */
        clearAllyStartingPositionEvents() {
            this.allyStartPositions.forEach(e => {
                e.erase();
            })
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
            this.totalTurns += 1;
            if (this.activeTeamId == 0) {
                this.currentPhase = 'playerTurn';
            } else {
                this.currentPhase = 'enemyTurn';
            }
        }
        /**
         * Swap active team
         */
        swapActiveTeam() {
            this.activeTeamId = this.activeTeamId == 0 ? 1 : 0;
        }
        /**
         * On player turn
         */
        onPlayerTurn() {
            // Show Player Turn sprite;
            this.showPhaseTextSprite("PlayerTurn");
            this.currentPhase = 'updateTurn';

            this.cursorOnPlayerTurn();
            
            TacticalUnitManager.inst().allyUnits.forEach((unit) => {
                unit.onTurnStart();
            });
        }
        /**
         * Cursor on Player Turn
         */
        cursorOnPlayerTurn() {
            this.cursor.activate();
            this.cursor.clearAllCallbacks();
            this.cursor.setOnOKCallback(this.cursorOnPlayerTurnCallback.bind(this));
            this.cursor.setOnPositionChangedCallback(this.cursorPositionChangedCallbackOnPlayerTurn.bind(this), false);
            this.cursorPositionChangedCallbackOnPlayerTurn(this.cursor.position.x, this.cursor.position.y);
        }
        /**
         * Cursor on player turn.
         * @param {number} x 
         * @param {number} y 
         */
        cursorOnPlayerTurnCallback(x, y) {
            const selectedUnit = TacticalUnitManager.inst().getUnitAt(x, y);
            if (!selectedUnit) {
                return;
            };
            if (selectedUnit.teamId === 0) {
                selectedUnit.controller.onSelect();
            } else {
                // console.log("Select enemy: ", selectedUnit);
                // TacticalRangeManager.inst().showMoveTileSprites(selectedUnit);
                selectedUnit.controller.onSelect();
            }
        }
        /**
         * Cursor move callback on player turn
         * @param {number} direction 
         * @param {number} x 
         * @param {number} y 
         */
        cursorPositionChangedCallbackOnPlayerTurn(x, y) {
            const selectedUnit = TacticalUnitManager.inst().getUnitAt(x, y);
            if (!selectedUnit) {
                this.unitInfoWindow.deactivate();
                this.unitInfoWindow.visible = false;
                return;
            }
            this.unitInfoWindow.activate();
            this.unitInfoWindow.visible = true;
            this.unitInfoWindow.setUnit(selectedUnit);
        }
        /**
         * On Actor Unit Command Cancel.
         */
        onActorUnitCommandCancel() {
            this.actorUnitCommandWindow.visible = false;
            this.cursor.setOnOKCallback(this.cursorOnPlayerTurnCallback.bind(this));
        }
        /**
         * Update player turn
         */
        updatePlayerTurn() {
            const isAllPlayerFinished = TacticalUnitManager.inst().allyUnits.every(unit => !unit.isBusy() && unit.hasActed());
            if (isAllPlayerFinished) {
                this.onPlayerTurnEnd();
            }
        }
        /**
         * On Player Turn End.
         */
        onPlayerTurnEnd() {
            TacticalUnitManager.inst().allyUnits.forEach((unit) => {
                unit.onTurnEnd();
            });

            this.cursor.deactivate();
            this.cursor.clearAllCallbacks();

            this.swapActiveTeam();
            this.determineTurn();
        }
        /**
         * On Enemy Turn
         */
        onEnemyTurn() {
            // Show Enemy Turn Sprite
            this.showPhaseTextSprite("EnemyTurn");
            this.currentPhase = 'updateTurn';

            TacticalUnitManager.inst().enemyUnits.forEach((unit) => {
                unit.onTurnStart();
            });

            setTimeout(() => {
                this.currentEnemyUnit = TacticalUnitManager.inst().enemyUnits[0];
                this.currentEnemyUnit.controller.onSelect();
            }, 1000);
        }
        /**
         * Update Enemy Turn
         */
        updateEnemyTurn() {
            if (this.currentEnemyUnit && !this.currentEnemyUnit.isBusy()) {
                // Update select next unit.
                if (this.currentEnemyUnit.actionPoints == 0) {
                    this.currentEnemyUnit = null;
                    setTimeout(() => {
                        this.currentEnemyUnit = TacticalUnitManager.inst().enemyUnits.filter(unit => unit.actionPoints > 0)[0];
                        this.currentEnemyUnit && this.currentEnemyUnit.controller.onSelect();
                    }, 500);
                }
            }
            const isAllPlayerFinished = TacticalUnitManager.inst().enemyUnits.every(unit => !unit.isBusy() && unit.actionPoints == 0);
            if (isAllPlayerFinished) {
                this.onEnemyTurnEnd();
            }
        }
        /**
         * On Enemy Turn End.
         */
        onEnemyTurnEnd() {
            TacticalUnitManager.inst().enemyUnits.forEach((unit) => {
                unit.onTurnEnd();
            });

            this.swapActiveTeam();
            this.determineTurn();
        }
        /**
         * Check if battle system is busy.
         * @returns {Boolean}
         */
        isBusy() {
            const isPhaseTextShowing = this.spritePhaseText.bitmap != null;
            const isUnitBusy = TacticalUnitManager.inst().isUnitBusy();
            const isSequenceBusy = TacticalSequenceManager.inst().isBusy();
            return isPhaseTextShowing || isUnitBusy || isSequenceBusy;
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