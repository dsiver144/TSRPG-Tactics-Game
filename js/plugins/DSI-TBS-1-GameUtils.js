//=======================================================================
// * Plugin Name  : DSI-TBS-1-GameUtils.js
// * Last Updated : 5/7/2022
//========================================================================
/*:
* @author dsiver144
* @plugindesc (v1.0) A custom plugin by dsiver144
* @help 
* Empty Help
* 
* @param testParam:number
* @text Test Param
* @type number
* @default 144
* @desc A Test Param
* 
*/

window.TBS = window.TBS || {};

function GameUtils() {
    return new Error("Can't init static class");
}

let params = PluginManager.parameters('DSI-TBS-1-GameUtils');
params = PluginManager.processParameters(params);

TBS.params = TBS.params || {};
TBS.params = {...TBS.params, params};

GameUtils.getParam = function(param) {
    return TBS.params[param];
}

GameUtils.floodFillOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
/**
 * Floodfill
 * @param {number} x 
 * @param {number} y 
 * @param {number} range 
 * @param {Function} conditionFunction 
 * @returns {{x: number, y: number, value: number}[]}
 */
GameUtils.floodFill = function(x, y, range, conditionFunction) {
    const result = [];
    const visitedTiles = {};
    visitedTiles[`${x}-${y}`] = true;
    let originalX = x;
    let originalY = y;
    let originalRange = range;
    
    // Recursive function to fill the array.
    function doFill(targetX, targetY) {
        const nextTiles = [];
        GameUtils.floodFillOffsets.forEach(([offsetX, offsetY]) => {
            const checkX = targetX + offsetX;
            const checkY = targetY + offsetY;
            const range = Math.abs(checkX - originalX) + Math.abs(checkY - originalY);
            if (!visitedTiles[`${checkX}-${checkY}`]) {
                if (conditionFunction(checkX, checkY, range)) {
                    const tile = {
                        x: checkX,
                        y: checkY,
                        outer: false,
                        value: range
                    }
                    result.push(tile);
                    if (range < originalRange) {
                        // This prevent the recursion function keep calling.  
                        nextTiles.push([checkX, checkY]);
                    }
                } else {
                    const tile = {
                        x: checkX,
                        y: checkY,
                        value: range,
                        outer: true
                    }
                    result.push(tile);
                }
                visitedTiles[`${checkX}-${checkY}`] = true;
            }
        })
        nextTiles.forEach(([nextX, nextY]) => {
            doFill(nextX, nextY, range - 1);
        })  
    }
    doFill(x, y, range - 1);
    return result;
}
/**
 * Get Ally Position Events
 * @returns {Game_Event[]}
 */
GameUtils.getAllyPositionEvents = function() {
    const events = $gameMap.events().filter(e => {
        return e.event().note.match(/<StartPos>/i);
    });
    return events;
}
/**
 * Get Enemy Events
 * @returns {Game_Event[]}
 */
GameUtils.getEnemyEvents = function() {
    const events = $gameMap.events().filter(e => {
        const comments = this.getEventComments(e);
        const enemyData = this.parseEnemyData(comments);
        e.enemyData = enemyData;
        return enemyData != null;
    })
    return events;
}
/**
 * Parse Enemy Data From Comments
 * @param {string[]} lines 
 * @returns {TBS_EnemyData}
 */
GameUtils.parseEnemyData = function(lines) {
    const enemyData = new TBS_EnemyData();
    let readTBSEnemy = false;
    lines.forEach(line => {
        if (line.match(/<TBS_Enemy>/i)) {
            readTBSEnemy = true;
            return;
        }
        if (line.match(/<\/TBS_Enemy>/i)) {
            readTBSEnemy = false;
            return;
        }
        if (readTBSEnemy) {
            if (line.match(/^id:\s*(\d+)/i)) {
                enemyData.enemyId = Number(RegExp.$1);
            }
            if (line.match(/^mov:\s*(\d+)/i)) {
                enemyData.mov = Number(RegExp.$1);
            }
        }
    })
    return enemyData.isValid() ? enemyData : null;
}
/**
 * Setup TBS Enemies
 */
GameUtils.setupTBSEnemies = function() {
    // console.log($dataEnemies);
    $dataEnemies.forEach((enemy, index) => {
        if (!enemy) return;
        const lines = enemy.note.split(/[\r\n]+/i);
        const enemyData = GameUtils.parseEnemyData(lines);
        enemy.tbsEnemy = enemyData;
    })
}
/**
 * Get Event Sprite On Map
 * @param {number} eventId 
 * @returns {Sprite_Character}
 */
GameUtils.getEventSprite = function(eventId) {
    return SceneManager._scene._spriteset._characterSprites.filter(e => e._character._eventId === eventId)[0];
}

class TBS_EnemyData {

    constructor() {
        this.enemyId = 0;
        this.mov = 0;
    }

    isValid() {
        return this.enemyId != 0 || this.mov != 0;
    }
}

/**
 * Get Event Comments
 * @param {Game_Event} event 
 * @returns {string[]}
 */
GameUtils.getEventComments = function(event) {
    let comments = [];
    event.list().forEach(command => {
        if (command.code != 108 && command.code != 408) return;
        comments.push(command.parameters[0]);
    })
    return comments;
}

GameUtils.setCameraTarget = function(target) {
    $gameMap.camTargetSet(target);
}

GameUtils.addSpriteToTilemap = function(sprite) {
    SceneManager._scene._spriteset._tilemap.addChild(sprite);
}

GameUtils.removeSpriteFromTilemap = function(sprite) {
    SceneManager._scene._spriteset._tilemap.removeChild(sprite);
}

GameUtils.addWindow = function(window) {
    SceneManager._scene.addChild(window);
}

GameUtils.addSprite = function(sprite) {
    SceneManager._scene.addChild(sprite);
}

GameUtils.removeWindow = function(window) {
    SceneManager._scene.removeChild(window);
}

ImageManager.loadTBS = function(filename) {
    return this.loadBitmap("img/tbs/", filename);
}

class Position {
    /**
     * Position object
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        /**
         * @type {number}
         */
        this.x = x;
        /**
         * @type {number}
         */
        this.y = y;
    }
    /**
     * To String
     * @returns {string}
     */
    toString() {
        return `${this.x}-${this.y}`;
    }
}

var DSI_TBS_1_GameUtils_Game_Player_updateScroll = Game_Player.prototype.updateScroll;
Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
    if (this.scrollDisabled) return;
	DSI_TBS_1_GameUtils_Game_Player_updateScroll.call(this, lastScrolledX, lastScrolledY);
};

var DSI_TBS_1_GameUtils_Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
Scene_Boot.prototype.onDatabaseLoaded = function() {
	DSI_TBS_1_GameUtils_Scene_Boot_onDatabaseLoaded.call(this);
    GameUtils.setupTBSEnemies();
};
