import Ember from 'ember';
import DS from 'ember-data';

var computed = Ember.computed;

export default Ember.Component.extend({

  // Options

  /**
   * The model this form edits. Can be a DS.Model or just a POJO. Defaults to an
   * empty POJO.
   * @type {DS.Model|Object}
   */
  model: computed(function() { return {}; }),

  tagName: 'form',
  classNames: 'formtastic-form',

  // Proxy the submit action
  submit(e) {
    e.preventDefault();
    this.sendAction('action', this.get('model'));
  },

  // By default, errors are pulled from the model.errors property, but this
  // could be overridden.
  errors: computed('model.errors.[]', function() {
    return this.get('model.errors') || DS.Errors.create();
  }),

  // Child {{error-for}} components will register themselves
  errorHandlers: computed(function() { return Ember.A(); }),

  // Invoked by catch-all error-for components to find any errors that are not
  // being handled. Iterates through all errors and the registered handlers,
  // and filters out any errors that have a registered handler to match them.
  findUnmatchedErrorsFor(field) {
    return (this.get('errors.' + field) || []).filter((error) => {
      return !this.get('errorHandlers').find(function(handler) {
        return handler.matchesError(error);
      });
    });
  }

});
