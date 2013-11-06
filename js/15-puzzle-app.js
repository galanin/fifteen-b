(function () {

    var root = this;

    root.FifteenPuzzleApp = Backbone.Router.extend({
        initialize: function (options) {
            this.el = options.el;
            this.nav = options.nav;
            this.route(/^(?:(\d)x(\d)(?::([\d,]*))?)?$/, 'createPuzzle');
        },

        createPuzzle: function (width, height, position) {
            var options = this._prepareOptions(width, height, position);
            if (this.puzzle) {
                this.puzzle.init(options);
            }
            else {
                this.puzzle = new FifteenPuzzle(options);
                var puzzleBoard = new FifteenPuzzleBoard({ model: this.puzzle });
                puzzleBoard.render();
                var puzzlePanel = new FifteenPuzzlePanel({ model: this.puzzle });
                puzzlePanel.render();
                var puzzleSolver = new FifteenPuzzleSolver({ board: this.puzzle });
                var puzzleSolverPanel = new FifteenPuzzleSolverPanel({ model: puzzleSolver });
                puzzleSolverPanel.render();
                this.el.append(puzzleBoard.$el).append(puzzlePanel.$el).append(puzzleSolverPanel.$el);
            }
            this.highlightNavigation(options.width, options.height);
        },

        _prepareOptions: function (width, height, position) {
            var width = parseInt(width) || 0, height = parseInt(height) || 0, starting_position;
            if (width < 2 || height < 2) {
                width = height = 4;
            }

            if (position) {
                var sequence = _.map(position.split(','), function(s) { return +s || 0 });
                var check = _.uniq(_.sortBy(sequence, _.identity), true);
                if (check.length === width * height && check[0] === 0 && _.last(check) === width * height - 1) {
                    starting_position = sequence;
                }
            }
            return { width: width, height: height, position: starting_position };
        },

        highlightNavigation: function (width, height) {
            var dim = '' + width + 'x' + height;

            var prev = this.nav.find('.active');
            var next = this.nav.find('li:has(a[href="#'+dim+'"])');
            if (prev.length === 1 && next.length === 1 && prev[0] == next[0]) return;

            if (prev.hasClass('custom')) {
                prev.remove();
            }
            else {
                prev.removeClass('active');
            }

            if (next.length === 0) {
                next = this.nav.children(':first').clone();
                next.addClass('custom').find('a').attr('href', '#'+dim).text(dim);
                next.appendTo(this.nav);
            }
            next.addClass('active');
        }
    });

}).call(this);
