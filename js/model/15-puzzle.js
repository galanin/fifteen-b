(function () {
    //TODO remove self

    var root = this;

    var hashBase = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'];

    function Tile() {
        if (arguments[0] instanceof Tile) {
            var original = arguments[0];
            this.n = original.n;
            this.x = original.x;
            this.y = original.y;
            this.goalX = original.goalX;
            this.goalY = original.goalY;
        }
        else {
            var n = arguments[0], pos = arguments[1], goalPos = arguments[2];
            this.n = n;
            this.x = pos.x;
            this.y = pos.y;
            this.goalX = goalPos.x;
            this.goalY = goalPos.y;
        }
    }

    Tile.prototype.place = function (a1, a2) {
        if (_.isObject(a1)) {
            this.x = a1.x;
            this.y = a1.y;
        }
        else {
            this.x = a1;
            this.y = a2;
        }
    };

    Tile.prototype.getDistance = function () {
        return Math.abs(this.x - this.goalX) + Math.abs(this.y - this.goalY);
    };

    Tile.prototype.isGoalX = function () {
        return this.x === this.goalX;
    };

    Tile.prototype.isGoalY = function () {
        return this.y === this.goalY;
    };

    Tile.prototype.isGoal = function () {
        return this.isGoalX() && this.isGoalY();
    };

    Tile.prototype.doesConflictInRow = function (tile) {
        return this.isGoalY() && tile.isGoalY() &&
            (this.x > tile.x && this.goalX < tile.goalX ||
                this.x < tile.x && this.goalX > tile.goalX);
    };

    Tile.prototype.doesConflictInCol = function (tile) {
        return this.isGoalX() && tile.isGoalX() &&
            (this.y > tile.y && this.goalY < tile.goalY ||
                this.y < tile.y && this.goalY > tile.goalY);
    };

    function Board() {
        var self = this;
        if (arguments[0] instanceof Board) {
            var original = arguments[0];
            self.width = original.width;
            self.height = original.height;
            self.area = original.area;
            self.tile_count = original.tile_count;
            self.x0 = original.x0;
            self.y0 = original.y0;
            self.parity = original.parity;
            self._copyTiles(original);
        }
        else {
            self.width = arguments[0];
            self.height = arguments[1];
            self.area = self.width * self.height;
            self.tile_count = self.area - 1;
            self.parity = self.calculateParityOfSolved(self.width, self.height);

            self._initTiles(arguments[2]);
        }
        self.index = _.times(self.height, function (i) {
            return new Array(self.width);
        });
        self._reindex();
    }

    Board.prototype._copyTiles = function (original) {
        var self = this;

        self.tiles = _.map(original.tiles, function (tile) { return new Tile(tile) });
    };

    Board.prototype._initTiles = function (howToArrange) {
        var self = this;

        self.tiles = [];

        var position = self._getGamePosition(howToArrange);
        var tilesPosition = new Array(self.area);
        _.each(position, function (tileIndex, spaceIndex) {
            if (tileIndex > 0) {
                self.tiles[tileIndex - 1] = self._createTile(tileIndex - 1, spaceIndex);
            }
            else {
                var pos =  self._indexToPos(spaceIndex);
                self.x0 = pos.x;
                self.y0 = pos.y;
            }
        });
    };

    Board.prototype._getGamePosition = function (howToArrange) {
        var position;
        if (howToArrange === 'solved') {
            // 'solved' (goal) order of tiles
            position = _.range(self.tile_count);
            position.push(0);
        }
        else if (howToArrange instanceof Array) {
            // tiles are user-ordered
            howToArrange = _.map(howToArrange, function (n) { return Math.floor(n) });
            var check = _.uniq(_.sortBy(howToArrange, _.identity), true);
            if (check.length === this.area && check[0] === 0 && _.last(check) === this.tile_count) {
                position = howToArrange;
            }
        }
        if (_.isUndefined(position)) {
            // random tile order
            position = _.shuffle(_.range(this.area));
        }
        return position;
    };

    Board.prototype._indexToPos = function (index) {
        return { x: index % this.width, y: Math.floor(index / this.width) };
    };

    Board.prototype._createTile = function (tileIndex, spaceIndex) {
        return new Tile(tileIndex, this._indexToPos(spaceIndex), this._indexToPos(tileIndex));
    };

    Board.prototype._reindex = function () {
        var self = this;
        _.each(self.tiles, function (tile) {
            self.index[tile.y][tile.x] = tile;
        });
        self.index[self.y0][self.x0] = undefined;
    };

    Board.prototype.shuffle = function () {
        this._initTiles();
        this._reindex();
    };

    Board.prototype.getTilePositions = function () {
        return _.map(this.tiles, function (tile) {
            return { x: tile.x, y: tile.y };
        });
    };

    Board.prototype.doesConflictInRow = function (x1, x2, y) {
        return this.index[y][x1] && this.index[y][x2] &&
            this.index[y][x1].doesConflictInRow(this.index[y][x2]);
    };

    Board.prototype.doesConflictInCol = function (x, y1, y2) {
        return this.index[y1][x] && this.index[y2][x] &&
            this.index[y1][x].doesConflictInCol(this.index[y2][x]);
    };

    Board.prototype.isGoal = function (x, y) {
        return this.index[y][x] && this.index[y][x].isGoal();
    };

    /**
     * Manhattan distance used
     */
    Board.prototype.getDistance = function () {
        var self = this;

        var distance = _.reduce(self.tiles, function (memo, tile) {
            return memo + tile.getDistance();
        }, 0);

        var conflicts = _.times(self.height, function (i) {
            return new Array(self.width);
        });
        // conflicts in rows
        for (var y = 0; y < self.height; ++y) {
            for (var x1 = 0; x1 < self.width - 1; ++x1) {
                for (var x2 = x1 + 1; x2 < self.width; ++x2) {
                    if (self.doesConflictInRow(x1, x2, y)) {
                        distance += 2;
                        conflicts[y][x1] = conflicts[y][x2] = true;
                    }
                }
            }
        }

        // conflicts in columns
        for (var x = 0; x < self.width; ++x) {
            for (var y1 = 0; y1 < self.height - 1; ++y1) {
                for (var y2 = y1 + 1; y2 < self.height; ++y2) {
                    if (self.doesConflictInCol(x, y1, y2)) {
                        distance += 2;
                        conflicts[y1][x] = conflicts[y2][x] = true;
                    }
                }
            }
        }

        // conflicts in corners
        if (!self.isGoal(0, 0) && (self.isGoal(1, 0) && !conflicts[0][1]
            || self.isGoal(0, 1) && !conflicts[1][0])) {
            distance += 2;
        }
        if (!self.isGoal(0, self.height - 1) &&
            (self.isGoal(1, self.height - 1) && !conflicts[self.height - 1][1]
                || self.isGoal(0, self.height - 2) && !conflicts[self.height - 2][0])) {
            distance += 2;
        }
        if (!self.isGoal(self.width - 1, 0) &&
            (self.isGoal(self.width - 2, 0) && !conflicts[0][self.width - 2]
                || self.isGoal(self.width - 1, 1) && !conflicts[1][self.width - 1])) {
            distance += 2;
        }

        return distance;
    };

    Board.prototype.getPossibleTurns = function () {
        var self = this;
        var turns = {};
        if (self.y0 > 0) {
            turns['down'] = { x: self.x0, y: self.y0 - 1 };
        }
        if (self.y0 < self.height - 1) {
            turns['up'] = { x: self.x0, y: self.y0 + 1 };
        }
        if (self.x0 > 0) {
            turns['right'] = { x: self.x0 - 1, y: self.y0 };
        }
        if (self.x0 < self.width - 1) {
            turns['left'] = { x: self.x0 + 1, y: self.y0 };
        }
        _.each(turns, function (turn, dir) {
            turn.dir = dir;
            turn.n = self.index[turn.y][turn.x].n;
            var newBoard = new Board(self);
            newBoard.turn(dir);
            turn.distance = newBoard.getDistance();
            turn.hash = newBoard.getPositionHash();
        });
        return turns;
    };

    Board.prototype.turn = function (direction) {
        var self = this;
        var x0 = self.x0, y0 = self.y0, tileX = x0, tileY = y0;
        if (direction === 'down' && y0 > 0) tileY -= 1 ;
        else if (direction === 'up' && y0 < self.height - 1) tileY += 1;
        else if (direction === 'right' && x0 > 0) tileX -= 1;
        else if (direction === 'left' && x0 < self.width - 1) tileX += 1;

        if (tileX !== x0 || tileY !== y0) {
            var tile = self.index[tileY][tileX];
            tile.place(x0, y0);
            self.index[y0][x0] = tile;
            self.index[tileY][tileX] = undefined;
            self.x0 = tileX;
            self.y0 = tileY;
            return { tileNum: tile.n, newX: tile.x, newY: tile.y };
        }
        return false;
    };

    Board.prototype.getPositionHash = function () {
        var self = this;
        if (self.area > hashBase.length) {
            throw "Too big board";
        }
        return _.reduce(self.tiles, function (memo, tile) {
            return memo + hashBase[ tile.y * self.width + tile.x ];
        }, '');
    };

    Board.prototype.getPositionArray = function () {
        var self = this;
        var position = [];
        for (var y = 0; y < self.height; ++y) {
            for (var x = 0; x < self.width; ++x) {
                var tile = self.index[y][x];
                position.push(_.isUndefined(tile) ? 0 : tile.n + 1);
            }
        }
        return position;
    };

    Board.prototype.calculateParityOfSolved = function (width, height) {
        var tileMap = [];
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                tileMap.push(y*width + (y % 2 === 0 ? x : width - 1 - x));
            }
        }
        tileMap.pop();
        var sum = 0;
        for (var i = 0; i < tileMap.length - 1; ++i) {
            for (var j = i + 1; j < tileMap.length; ++j) {
                if (tileMap[i] > tileMap[j]) {
                    ++sum;
                }
            }
        }
        return sum % 2;
    };

    Board.prototype.testSolubility = function () {
        var self = this;
        var tileMap = [];
        for (var y = 0; y < self.height; ++y) {
            // arrange tiles like snake
            if (y % 2 === 0) { // left to right for even rows (starting from zero)
                for (var x = 0; x < self.width; ++x) {
                    if (!_.isUndefined(self.index[y][x])) {
                        tileMap.push(self.index[y][x].n);
                    }
                }
            }
            else { // right to left for odd rows
                for (var x = self.width - 1; x >= 0; --x) {
                    if (!_.isUndefined(self.index[y][x])) {
                        tileMap.push(self.index[y][x].n);
                    }
                }
            }
        }

        var sum = 0;
        for (var i = 0; i < tileMap.length - 1; ++i) {
            for (var j = i + 1; j < tileMap.length; ++j) {
                if (tileMap[i] > tileMap[j]) {
                    ++sum;
                }
            }
        }

        return sum % 2 === self.parity;
    };

    root.FifteenPuzzle = Backbone.Model.extend({
        defaults: {
            width: 4,
            height: 4
        },

        initialize: function (options) {
            this.init(options);
        },

        /**
         * Initializes a position by the given array of numbers.
         * Amount of numbers are equal to amount of board's tiles.
         * Empty tile is coded by zero in the array.
         * @param {Array} item's index is tile position, item value is number of tile
         */
        init: function (options) {
            this.set(options);
            var changed = !!this.board;
            this.board = new Board(options.width, options.height, options.position);
            if (changed) this.trigger('changeBoard');
            this.trigger('initialize');
        },

        /**
         * Shuffles a game position.
         * Unsolvable positions are possible.
         * @see FifteenPuzzle#testSolubility
         */
        shuffle: function () {
            this.board.shuffle();
            this.trigger('initialize');
        },

        /**
         * Make turn.
         * @param {String} direction turn direction: up|down|left|right
         */
        turn: function (direction) {
            var result = this.board.turn(direction);
            result && this.trigger('turn', result.tileNum, result.newX, result.newY);
        },

        /**
         * Return "manhattan distance" between a current position and goal position.
         * @returns {Number} positive integer number
         */
        getDistance: function () {
            return this.board.getDistance();
        },

        /**
         * Return true if puzzle is in 'solved' state now.
         * @returns {boolean} solved state flag
         */
        isSolved: function () {
            return this.board.getDistance() === 0;
        },

        /**
         * Return an object with all possible turns.
         * Each turn object contains direction, coords and number of a tile turned,
         * a manhattan distance and position's hash code after the turn.
         * @returns {Object} {up: {dir:'up', x:x, y:y, n:n, distance:d, hash:h}, ... }
         */
        getPossibleTurns: function () {
            return this.board.getPossibleTurns();
        },

        /**
         * Return hash code of a current position.
         * Length of hash is equal to amount of cells on the board.
         * @returns {String} hash-code
         */
        getPositionHash: function () {
            return this.board.getPositionHash();
        },

        /**
         * Return array of tile numbers.
         * @returns {Array}
         */
        getPositionArray: function () {
            return this.board.getPositionArray();
        },

        /**
         * Returns an array of tiles with their coords on board.
         * @returns {Array} [{x:x, y:y}, ...]
         */
        getTilePositions: function () {
            return this.board.getTilePositions();
        },

        /**
         * Test solubility of a current game position.
         * @returns {Boolean}
         */
        testSolubility: function () {
            return this.board.testSolubility();
        }
    });
}).call(this);
