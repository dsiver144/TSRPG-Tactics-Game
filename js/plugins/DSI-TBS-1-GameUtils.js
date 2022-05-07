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
GameUtils.floodFill = function(x, y, range, conditionFunction) {
    const result = [];
    const visitedTiles = {};
    visitedTiles[`${x}-${y}`] = true;
    // Recursive function to fill the array.
    function doFill(targetX, targetY, range) {
        const nextTiles = [];
        GameUtils.floodFillOffsets.forEach(([offsetX, offsetY]) => {
            const checkX = targetX + offsetX;
            const checkY = targetY + offsetY;
            if (!visitedTiles[`${checkX}-${checkY}`]) {
                if (conditionFunction(checkX, checkY)) {
                    const tile = {
                        x: checkX,
                        y: checkY,
                        value: range
                    }
                    nextTiles.push([checkX, checkY]);
                    result.push(tile);
                }
                visitedTiles[`${checkX}-${checkY}`] = true;
            }
        })
        if (range <= 0) return;
        nextTiles.forEach(([nextX, nextY]) => {
            doFill(nextX, nextY, range - 1);
        })  
    }
    doFill(x, y, range - 1);
    return result;
}

GameUtils.getAllyPositionEvents = function() {
    const events = $gameMap.events().filter(e => {
        return e.event().note.match(/<StartPos>/i);
    });
    return events;
}

GameUtils.getEnemyEvents = function() {
    const events = $gameMap.events().filter(e => {
        const comments = this.getEventComment(e);
        if (comments)
        return false;
    })
}

GameUtils.parseEnemyComment = function(e) {
    const comments = this.getEventComment(e);
    let readTBSEnemy = false;
    comments.forEach
}

GameUtils.getEventComment = function(event) {
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

    toString() {
        return `${this.x}-${this.y}`;
    }
}

var DSI_TBS_1_GameUtils_Game_Player_updateScroll = Game_Player.prototype.updateScroll;
Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
    if (this.scrollDisabled) return;
	DSI_TBS_1_GameUtils_Game_Player_updateScroll.call(this, lastScrolledX, lastScrolledY);
};


//========================================================================
// END OF PLUGIN
//========================================================================