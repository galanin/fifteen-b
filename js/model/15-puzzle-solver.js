(function () {

    var root = this;

    root.FifteenPuzzleSolver = Backbone.Model.extend({
        initialize: function (options) {
            this.board = options.board;
            this.possibleTurns = [];
            this.board.on('initialize', this.onInitialize, this);
            this.board.on('turn', this.onTurn, this);
        },

        onInitialize: function () {
            this.stop();
            this.possibleTurns = [];
        },

        onTurn: function () {
            if (this.board.isSolved()) {
                this.stop();
            }
        },

        turn: function () {
            var previousHash = this.previousHash;
            var possibleTurns = this._getPossibleTurns();
            var nextTurn = _.chain(possibleTurns)
                .filter(function (turn) {
                    return turn.hash !== previousHash;
                })
                .sortBy('prio').value()[0];
            nextTurn.prio++;

            this.previousHash = this.board.getPositionHash();

            this.board.turn(nextTurn.dir);
        },

        solve: function () {
            if (this.board.isSolved()) return;
            this.solving = true;
            this.trigger('start');
            this._solvingCycle();
        },

        stop: function () {
            this.solving = false;
            this.trigger('stop');
        },

        _solvingCycle: function () {
            if (this.solving) {
                this.turn();
                _.delay(_.bind(this._solvingCycle, this, false), 1);
            }
        },

        _getPossibleTurns: function () {
            var hash = this.board.getPositionHash();
            if (!_.has(this.possibleTurns, hash)) {
                var distance = this.board.getDistance();
                this.possibleTurns[hash] = this.board.getPossibleTurns();
                _.each(this.possibleTurns[hash], function (turn) {
                    turn.prio = turn.distance - distance;
                });
            }
            return this.possibleTurns[hash];
        }
    });

}).call(this);
