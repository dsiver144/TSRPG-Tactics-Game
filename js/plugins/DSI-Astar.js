//=======================================================================
// * Plugin Name  : DSI-Astar.js
// * Last Updated : 3/9/2022
//========================================================================
/*:
* @author dsiver144
* @plugindesc (v1.0) A star pathfind plugin by dsiver144
* @help
* ======================================================
* Script call:
* ======================================================
* Game_Character.findpathToEx(destinationX, destinationY);
* ex: $gamePlayer.findpathToEx(10, 10);
* 
*/
(function() {

    var params = PluginManager.parameters('DSI-Astar');
    params = PluginManager.processParameters(params);

    function easyAStar(reachable, start, end) {
        var open = {};
        var close = {};
        open[start.x + "_" + start.y] = {
            pos: start,
            parent: null,
            g: 0,
            h: Math.abs(end.x - start.x) + Math.abs(end.y - start.y)
        };
        while ((!close[end.x + "_" + end.y]) && Object.keys(open).length > 0) {
            var minF = Number.POSITIVE_INFINITY;
            var minFkey = "";
            for (var key in open) {
                if (open.hasOwnProperty(key)) {
                    var f = open[key].g + open[key].h;
                    if (f < minF) {
                        minF = f;
                        minFkey = key;
                    }
                }
            }
            close[minFkey] = open[minFkey];
            delete open[minFkey];
            var curNode = close[minFkey];
            var fourDt = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }];
            for (var index = 0; index < fourDt.length; index++) {
                var dt = fourDt[index];
                var tmpPos = { x: curNode.pos.x + dt.x, y: curNode.pos.y + dt.y };
                if (reachable(tmpPos.x, tmpPos.y)) {
                    if (!close[tmpPos.x + "_" + tmpPos.y]) {
                        if ((!open[tmpPos.x + "_" + tmpPos.y]) || (open[tmpPos.x + "_" + tmpPos.y].g > curNode.g + 1)) {
                            open[tmpPos.x + "_" + tmpPos.y] = {
                                pos: tmpPos,
                                parent: curNode.pos,
                                g: curNode.g + 1,
                                h: Math.abs(end.x - tmpPos.x) + Math.abs(end.y - tmpPos.y)
                            };
                        }
                    }
                }
            }
        }
        if (close[end.x + "_" + end.y]) {
            var path = [];
            path.push(close[end.x + "_" + end.y].pos);
            var parent_1 = close[end.x + "_" + end.y].parent;
            while (parent_1) {
                path.push(parent_1);
                parent_1 = close[parent_1.x + "_" + parent_1.y].parent;
            }
            return path.reverse();
        }
        else {
            return false;
        }
    }

	var DSI_Astar_Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
		DSI_Astar_Game_Map_setup.call(this, mapId);
        this._astarMap = null;
    };

    Game_Map.prototype.generateAstarMap = function() {
        if (this._astarMap) return this._astarMap;
        var map = [];
        const width = this.width();
        const height = this.height();
        for (var y = 0; y < height; y++) {
            const xAxis = [];
            for (var x = 0; x < width; x++) {
                var passable = this.checkPassage(x, y, 0x0f);
                xAxis.push(passable ? 0 : 1);
            }
            map.push(xAxis);
        }
        this._astarMap = map;
        return map;
    }

    Game_Character.prototype.findpathToEx = function(endX, endY) {
        this.findpathTo(this.x, this.y, endX, endY);
    }

    Game_Character.prototype.findpathTo = function(startX, startY, endX, endY) {
        const map = $gameMap.generateAstarMap();
        this.clearFindPath();
        this.pathResult = easyAStar((x, y)=>{
            if (map[y] && map[y][x] === 0) {
                return true; 
            } else {
                return false;
            }
        }, {x: startX, y: startY}, {x: endX, y: endY});
    }

    Game_Character.prototype.clearFindPath = function() {
        this.pathResult = null;
    }

    Game_Character.prototype.moveTowardPoint = function(x, y) {
        var sx = this.deltaXFrom(x);
        var sy = this.deltaYFrom(y);
        if (Math.abs(sx) > Math.abs(sy)) {
            this.moveStraight(sx > 0 ? 4 : 6);
            if (!this.isMovementSucceeded() && sy !== 0) {
                this.moveStraight(sy > 0 ? 8 : 2);
            }
        } else if (sy !== 0) {
            this.moveStraight(sy > 0 ? 8 : 2);
            if (!this.isMovementSucceeded() && sx !== 0) {
                this.moveStraight(sx > 0 ? 4 : 6);
            }
        }
    };

    Game_Character.prototype.hasPath = function() {
        return this.pathResult && this.pathResult.length > 0;
    }

    Game_Character.prototype.getDirectionFromAToB = function(pointA, pointB) {
        var sx = (pointB.x - pointA.x);
        var sy = (pointB.y - pointA.y);
        if (Math.abs(sx) > Math.abs(sy)) {
            return sx > 0 ? 6 : 4;
        } else if (sy !== 0) {
            return sy > 0 ? 2 : 8;
        }
    }

	var DSI_Astar_Game_Player_moveByInput = Game_Player.prototype.moveByInput;
    Game_Player.prototype.moveByInput = function() {
        if (this.hasPath()) {
            return;
        }
        DSI_Astar_Game_Player_moveByInput.call(this);
    };

	var DSI_Astar_Game_CharacterBase_updateStop = Game_CharacterBase.prototype.updateStop;
    Game_Character.prototype.updateStop = function() {
		DSI_Astar_Game_CharacterBase_updateStop.call(this); 
        if (this.hasPath()) {
            const point = this.pathResult.shift();
            var direction = this.getDirectionFromAToB({x: this.x, y: this.y}, point);
            if (direction > 0) {
                this.moveStraight(direction);
            }
        }
    };


})();
//========================================================================
// END OF PLUGIN
//========================================================================