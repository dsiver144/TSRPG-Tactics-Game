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
* @param testParam:number
* @text Test Param
* @type number
* @default 144
* @desc A Test Param
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
(function() {

    var params = PluginManager.parameters('DSI-TacticalBattleSystem');
    params = PluginManager.processParameters(params);

    function GameUtils() {
        return new Error("Can't init static class");
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

    const map = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
        [0, 1, 1, 0, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]
    
    let time = Date.now();
    var result = GameUtils.floodFill(3, 3, 20, (x, y) => {
    	//console.log(x, y, map[y][x]);
    	return true; //map[y][x] == 1;
    })
    console.log("Time:", Date.now() - time)
    
    result.forEach(({x, y, value}) => {
    	//map[y][x] = 9;
    })
    
    console.log(result);
    console.log(map);


})();
//========================================================================
// END OF PLUGIN
//========================================================================