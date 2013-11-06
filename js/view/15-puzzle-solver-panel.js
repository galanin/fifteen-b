(function () {

    var root = this;

    root.FifteenPuzzleSolverPanel = Backbone.View.extend({
        className: 'fifteen-puzzle-panel',
        template: _.template(
            '<button type="button" class="btn btn-primary solve">Solve</button>' +
            '<div class="checkbox"><label><input type="checkbox" class="step-by-step"> Step by step</label></div>'
        ),

        events: {
            'click button.solve': 'onUiClickSolve'
        },

        initialize: function (options) {
            this.model.on('start', this.onSolverStart, this);
            this.model.on('stop', this.onSolverStop, this);
        },

        render: function () {
            this.$el.html(this.template());
            this.$solve = this.$('.solve');
            this.$step = this.$('.step-by-step');
        },

        onUiClickSolve: function () {
            if (this.$solve.hasClass('active')) {
                this.model.stop();
            }
            else {
                var stepByStep = this.$('.step-by-step').prop('checked');
                if (stepByStep) {
                    this.model.turn();
                }
                else {
                    this.model.solve();
                }
            }
        },

        onSolverStart: function () {
            this.$solve.addClass('active').blur();
            this.$step.prop('disabled', true);
        },

        onSolverStop: function () {
            this.$solve.removeClass('active').blur();
            this.$step.prop('disabled', false);
        }
    });

}).call(this);
