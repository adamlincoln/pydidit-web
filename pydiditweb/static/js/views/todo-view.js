define([
    'jquery',
    'underscore-min',
    'backbone-min',
    'mustache',
    'text!templates/mustache/item.mustache',
    'text!templates/mustache/todo/primary_descriptor.mustache',
    'text!templates/mustache/todo/details.mustache',
    'text!templates/mustache/todo/buttons.mustache',
    'text!templates/mustache/edit.mustache',
], function (
    $,
    _,
    Backbone,
    Mustache,
    ItemTemplate,
    PrimaryDescriptorTemplate,
    DetailsTemplate,
    ButtonsTemplate,
    EditTemplate
) {
    TodoView = Backbone.View.extend({
        tagName: 'li',
        className: 'todo',

        events: {
            'click .remove-todo': 'remove',
            'click .edit-todo': 'edit',
            'click .save': 'save',
            'click .complete-todo': 'complete',
            'click': 'model_dump' // For debug.
        },

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },

        render: function() {
            var todoJSON = this.model.toJSON();
            // Protect against null values that are assigned by the backend later
            var success = false;
            while (!success) {
                success = true;
                try {
                    this.$el.html(Mustache.render(ItemTemplate, todoJSON, {
                        primary_descriptor: PrimaryDescriptorTemplate,
                        details: DetailsTemplate,
                        buttons: ButtonsTemplate,
                    }));
                } catch (err) {
                    console.log(err);
                    var errorWords = err.message.split(' ');
                    if (errorWords.slice(1).join(' ') === 'is not defined') {
                        success = false;
                        todoJSON[errorWords[0]] = null;
                    } else {
                        throw err;
                    }
                }
            }
            this.$el.data('todoId', this.model.get('id'));
            this.$el.data('todoDisplayPosition', this.model.get('display_position'));
            return this;
        },

        remove: function() {
            this.$el.addClass('bg-danger');
            this.$el.hide(
                'slow',
                function() {
                    $(this).remove();
                }
            );
            this.model.destroy();
        },

        edit: function() {
            //var editTemplate = _.template($('#edit-template').html());
            var modelData = _.clone(this.model.toJSON());
            _.extend(modelData, {
                'primaryDescriptor' : this.model.primaryDescriptor,
                'initialValue' : this.model.get(this.model.primaryDescriptor),
            });
            this.$el.html(Mustache.render(EditTemplate, modelData));
        },

        save: function() {
            var description = this.$el.children('div').children('#edit-description').val();
            this.model.save({'description': description});
            this.render();
        },

        complete: function() {
            this.$el.addClass('bg-success');
            this.$el.hide(
                'slow',
                function() {
                    $(this).remove();
                }
            );
            this.model.save({'state': 'completed'});
        },

        model_dump: function() {
            // Dumps model to console.
            console.log(this.model);
        }
    });

    return TodoView;
});
