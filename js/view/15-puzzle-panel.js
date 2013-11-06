(function() {

    var root = this;

    root.FifteenPuzzlePanel = Backbone.View.extend({
        className: 'fifteen-puzzle-panel',
        template: _.template(
            '<p class="lead"><button type="button" class="btn btn-primary shuffle">Shuffle</button>' +
                '<span class="label label-success solvable">Solvable</span>' +
                '<span class="label label-danger unsolvable">Unsolvable</span></p>' +
            '<div class="form-group"><p>Moves</p><input type="text" readonly="readonly" class="form-control moves"/></div>' +
            '<div class="form-group"><p>Manhattan distance</p><input type="text" readonly="readonly" class="form-control distance"/></div>' +
            '<p><a class="permalink" href="" target="_blank">Permalink</a> to this position</p>' +
            '<p>You can use arrow keys to move tiles or simply click them</p>' +
            '<p class="lead solved"><span class="label label-success">Solved</span></p>'

    ),

        events: {
            'click button.shuffle': 'onUiClickShuffle'
        },

        initialize: function (options) {
            this.boardView = options.boardView;
            this.model.on('initialize', this.onBoardInitialize, this);
            this.model.on('turn', this.onBoardTurn, this);
        },

        render: function() {
            this.$el.html(this.template());
            this.$shuffle = this.$('.shuffle');
            this.$turns = this.$('input.moves');
            this.$distance = this.$('input.distance');
            this.$permalink = this.$('a.permalink');

            this.onBoardInitialize();
        },

        onUiClickShuffle: function () {
            this.model.shuffle();
            this.$shuffle.blur();
        },

        onBoardInitialize: function () {
            var isSolvable = this.model.testSolubility();
            this.$el.toggleClass('puzzle-solvable', isSolvable);
            this.$el.toggleClass('puzzle-unsolvable', !isSolvable);
            this.turns = 0;
            this.refresh();
        },

        onBoardTurn: function () {
            ++this.turns;
            this.refresh();
        },
        
        refresh: function () {
            this.$turns.val(this.turns);
            this.$distance.val(this.model.getDistance());

            var position = this.model.getPositionArray();
            var href = document.location.toString().split('#', 2)[0] +
                '#' + this.model.get('width') + 'x' + this.model.get('height') + ':' + position.join(',');
            this.$permalink.attr('href', href);

            this.$el.toggleClass('not-solved', !this.model.isSolved());
        }
    });

}).call(this);
