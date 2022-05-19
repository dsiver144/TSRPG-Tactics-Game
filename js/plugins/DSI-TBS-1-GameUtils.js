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

/**
 * @interface
 */
class FLOOD_FILL_TILE  {
    constructor(x, y, outer, value) {
        this.x = x;
        this.y = y;
        this.outer = outer;
        this.value = value;
        this.totalEdges = 0;
    }
}

GameUtils.floodFillOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
/**
 * Floodfill
 * @param {number} x 
 * @param {number} y 
 * @param {number} range 
 * @param {Function} conditionFunction 
 * @returns {FLOOD_FILL_TILE[]}
 */
GameUtils.floodFill = function(x, y, range, conditionFunction) {
    const result = {};
    const visitedTiles = {};
    visitedTiles[`${x}-${y}`] = true;
    let originalX = x;
    let originalY = y;
    let originalRange = range;
    // Recursive function to fill the array.
    function doFill(targetX, targetY, edges) {
        const nextTiles = [];
        GameUtils.floodFillOffsets.forEach(([offsetX, offsetY]) => {
            const checkX = targetX + offsetX;
            const checkY = targetY + offsetY;
            const range = Math.abs(checkX - originalX) + Math.abs(checkY - originalY);
            if (!visitedTiles[`${checkX}-${checkY}`]) {
                if (conditionFunction(checkX, checkY, range)) {
                    const tile = new FLOOD_FILL_TILE(checkX, checkY, false, range);
                    tile.totalEdges = edges;
                    result[`${checkX}-${checkY}`] = tile;
                    if (range < originalRange) {
                        // This prevent the recursion function keep calling.  
                        nextTiles.push([checkX, checkY]);
                    }
                } 
                visitedTiles[`${checkX}-${checkY}`] = true;
            }
        });
        nextTiles.forEach(([nextX, nextY]) => {
            doFill(nextX, nextY, 0);
        })  
    }
    doFill(x, y, 1);
    return Object.values(result);
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
            if (line.match(/^atkSkill:\s*(\d+)/i)) {
                enemyData.attackSkillId = Number(RegExp.$1);
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
 * Setup TBS Skills
 */
GameUtils.setupTBSSkills = function() {
    // console.log($dataEnemies);
    $dataSkills.forEach((skill, index) => {
        if (!skill) return;
        const lines = skill.note.split(/[\r\n]+/i);
        const skillData = GameUtils.parseSkillData(lines);
        skillData && skillData.setSequences(this.parseSkillSequences(lines));
        skill.tbsSkill = skillData;
    })
}
/**
 * Setup TBS Weapons
 */
GameUtils.setupTBSWeapons = function() {
    $dataWeapons.forEach((weapon, index) => {
        if (!weapon) return;
        const lines = weapon.note.split(/[\r\n]+/i);
        const weaponData = GameUtils.parseWeaponData(lines);
        weapon.tbsWeapon = weaponData;
    })
}
/**
 * Setup TBS Items
 */
 GameUtils.setupTBSItems = function() {
    $dataItems.forEach((item, index) => {
        if (!item) return;
        const lines = item.note.split(/[\r\n]+/i);
        const itemData = GameUtils.parseItemData(lines);
        item.tbsItem = itemData;
    })
}
/**
 * Parse Skill Data From Note
 * @param {string[]} lines 
 * @returns {TBS_SkillData}
 */
 GameUtils.parseSkillData = function(lines) {
    /**
     * @type {TBS_SkillData}
     */
    let skillData = null;
    let readNotetag = false;
    lines.forEach(line => {
        if (line.match(/<tbs skill>/i)) {
            readNotetag = true;
            skillData = new TBS_SkillData();
            return;
        }
        if (line.match(/<\/tbs skill>/i)) {
            readNotetag = false;
            return;
        }
        if (readNotetag) {
            if (line.match(/^range:\s*(.+)/i)) {
                const [min, max] = RegExp.$1.split(',').map(n => Number(n));
                skillData.range.setMin(min).setMax(max);
            }
            if (line.match(/^diagonal:\s*(true|false)/i)) {
                skillData.range.setDiagonal(RegExp.$1 === 'true');
            }
            if (line.match(/^penetrate:\s*(true|false)/i)) {
                skillData.range.setPenerate(RegExp.$1 === 'true');
            }
            if (line.match(/^selection:\s*(.+)/i)) {
                const params = RegExp.$1.split(",").map(s => s.trim());
                const type = params[0];
                const range = Number(params[1]);
                const extraParams = params[2];
                skillData.range.setSelection(type, range, extraParams);
            }
            if (line.match(/^targets:\s*(.+)/i)) {
                const targets = RegExp.$1.split(",").map(s => s.trim());
                skillData.setTargets(targets);
            }
            if (line.match(/^tileImage:\s*(\w+)/i)) {
                skillData.setTileImage(RegExp.$1.trim());
            }
        }
    })
    return skillData;
}
/**
 * Parse Skill Data From Note
 * @param {string[]} lines 
 * @returns {string}
 */
 GameUtils.parseSkillSequences = function(lines) {
    let sequences = null;
    let readNotetag = false;
    lines.forEach(line => {
        if (line.match(/<tbs sequences>/i)) {
            readNotetag = true;
            sequences = ""
            return;
        }
        if (line.match(/<\/tbs sequences>/i)) {
            readNotetag = false;
            return;
        }
        if (readNotetag) {
            sequences += line + "\n";
        }
    })
    return sequences;
}
/**
 * Parse Weapon Data From Note
 * @param {string[]} lines 
 * @returns {TBS_WeaponData}
 */
 GameUtils.parseWeaponData = function(lines) {
    /**
     * @type {TBS_WeaponData}
     */
    let weaponData = null;
    let readNotetag = false;
    lines.forEach(line => {
        if (line.match(/<tbs weapon>/i)) {
            readNotetag = true;
            weaponData = new TBS_WeaponData();
            return;
        }
        if (line.match(/<\/tbs weapon>/i)) {
            readNotetag = false;
            return;
        }
        if (readNotetag) {
            if (line.match(/^skill:\s*(\d+)/i)) {
                weaponData.setSkill(Number(RegExp.$1));
            }
        }
    })
    return weaponData;
}
/**
 * Parse Item Data From Note
 * @param {string[]} lines 
 * @returns {TBS_ItemData}
 */
 GameUtils.parseItemData = function(lines) {
    /**
     * @type {TBS_ItemData}
     */
    let itemData = null;
    let readNotetag = false;
    lines.forEach(line => {
        if (line.match(/<tbs item>/i)) {
            readNotetag = true;
            itemData = new TBS_ItemData();
            return;
        }
        if (line.match(/<\/tbs item>/i)) {
            readNotetag = false;
            return;
        }
        if (readNotetag) {
            if (line.match(/^skill:\s*(\d+)/i)) {
                itemData.setSkill(Number(RegExp.$1));
            }
        }
    })
    return itemData;
}

{/* <tbs skill>
range: 1, 1
</tbs skill> */}

/**
 * Get Event Sprite On Map
 * @param {number} eventId 
 * @returns {Sprite_Character}
 */
GameUtils.getEventSprite = function(eventId) {
    return SceneManager._scene._spriteset._characterSprites.filter(e => e._character._eventId === eventId)[0];
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

GameUtils.addSpriteToTilemap = function(sprite, addToCharacters = false) {
    const spriteset = SceneManager._scene._spriteset;
    spriteset._tilemap.addChild(sprite);
    if (addToCharacters) {
        spriteset._characterSprites.push(sprite);
    }
}

GameUtils.removeSpriteFromTilemap = function(sprite, removeFromCharacters = false) {
    const spriteset = SceneManager._scene._spriteset;
    spriteset._tilemap.removeChild(sprite);
    if (removeFromCharacters) {
        const idx = spriteset._characterSprites.indexOf(sprite);
        spriteset._characterSprites.splice(idx, 1);
    }
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
    GameUtils.setupTBSSkills();
    GameUtils.setupTBSWeapons();
    GameUtils.setupTBSItems();
};

var DSI_TBS_1_GameUtils_Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
Scene_Boot.prototype.loadSystemImages = function() {
    DSI_TBS_1_GameUtils_Scene_Boot_loadSystemImages.call(this);
    this.preloadTBS();
};

Scene_Boot.prototype.preloadTBS = function() {
    ImageManager.loadTBS("RedSquare");
    ImageManager.loadTBS("BlueSquare");
    ImageManager.loadTBS("BlackSquare");
    ImageManager.loadTBS("GreenSquare");
    ImageManager.loadTBS("cursor");
    ImageManager.loadTBS("PlayerTurn");
    ImageManager.loadTBS("EnemyTurn");
    ImageManager.loadTBS("BattleStart");
};