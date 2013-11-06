(function() {

    var root = this;

    root.FifteenPuzzleBoard = Backbone.View.extend({
        className: 'fifteen-puzzle-board',
        templateTile: _.template('<div class="fifteen-puzzle-tile" style="' +
            'width:<%=tileSize%>px; height:<%=tileSize%>px; font-size:<%=fontSize%>px; ' +
            'line-height:<%=lineHeight%>px; border-width:<%=borderWidth%>px"><%=i%></div>'),

        events: {
            'click .movable': 'onUiClickTile',
        },

        initialize:function (options) {
            this.options = {
                tileSize: 75,
                tileSpace: 10,
                borderWidth: 0
            };
            for (p in this.options) {
                if (p in options) this.options[p] = options[p];
            }
            this.model.on('turn', this.onBoardTurn, this);
            this.model.on('initialize', this.onBoardInitialize, this);
            this.model.on('changeBoard', this.onBoardChange, this);
            $(root.document).on('keyup', _.bind(this.onUiKeyUp, this));
        },

        render: function () {
            var width = this.model.get('width'), height = this.model.get('height');
            this.$el.empty().css({
                width: this._getD(width),
                height: this._getD(height)
            });

            var tileOptions = {
                tileSize: this.options.tileSize,
                fontSize: this.options.tileSize *.5,
                lineHeight: this.options.tileSize - this.options.borderWidth * 2,
                borderWidth: this.options.borderWidth
            };
            this.tiles = [];
            var N = width * height;
            for (var i = 1; i < N; i++) {
                tileOptions.i = i;
                var $tile = $(this.templateTile(tileOptions));
                this.tiles.push($tile)
                this.$el.append($tile);
            }

            this.$tiles = this.$el.children();
            this.refreshTiles();
            this._setupTileStyles();
            return this;
        },

        refreshTiles: function () {
            var self = this;
            var tilePositions = this.model.getTilePositions();
            _.each(this.tiles, function ($tile, i) {
                $tile.css({
                    left: self._getD(tilePositions[i].x) + "px",
                    top: self._getD(tilePositions[i].y) + "px"
                });
            });
        },

        _getD: function (p) {
            return p * (this.options.tileSize + this.options.tileSpace) + this.options.tileSpace;
        },

        _cleanupTileStyles: function () {
            this.$tiles.removeClass('movable').attr('data-move-direction', '');
        },

        _setupTileStyles: function () {
            var tiles = this.tiles;
            _.each(this.model.getPossibleTurns(), function (turn, dir) {
                tiles[turn.n].addClass('movable').attr('data-move-direction', dir);
            });
        },

        onUiClickTile: function (event) {
            this.model.turn($(event.target).attr('data-move-direction'));
        },

        onUiKeyUp: function (event) {
            var direction;
            switch (event.which) {
                case 37: direction = 'left'; break;
                case 38: direction = 'up'; break;
                case 39: direction = 'right'; break;
                case 40: direction = 'down'; break;
            }
            if (direction) {
                this.model.turn(direction);
                event.stopPropagation();
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        },

        onBoardTurn: function (tileNum, newX, newY) {
            this._cleanupTileStyles();
            var newLeft = this._getD(newX);
            var newTop = this._getD(newY);
            var _setupTileStyles = _.bind(this._setupTileStyles, this);
            this.$tiles.finish();
            this.tiles[tileNum].animate({
                    left: newLeft,
                    top: newTop
                }, 90, _setupTileStyles);
        },

        onBoardInitialize: function () {
            this._cleanupTileStyles();
            this.refreshTiles();
            this._setupTileStyles();
        },

        onBoardChange: function () {
            this.render();
        }
    });

}).call(this);
