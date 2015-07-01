import Ember from 'ember';
import DS from 'ember-data';

var computed = Ember.computed;

export default Ember.Component.extend({

  tagName: 'form',

  // Options

  /**
   * The model this form edits. Can be a DS.Model or just a POJO. Defaults to an
   * empty POJO.
   * @type {DS.Model|Object}
   */
  model: computed(function() { return {}; }),

  /**
   * Describes when validations are run. Accepts 4 values:
   *
   *   false - do not run validations
   *   "submit" - run only when the form attempts to submit
   *   "touch" - run after the user "touches" a field (i.e. after focusin then focusout)
   *   "live" - as-you-type validations (i.e. after focusin)
   *   "continuous" - validate continuously (i.e. on first render and changes)
   *
   * @type {String|Boolean}
   */
  validate: 'touch',

  /**
   * The error source to read from. By default, it reads from model.errors, but
   * this can be overridden by passing in a different error source (custom
   * error sources must be DS.Errors instances, or must implement the same
   * interface).
   *
   * @type {DS.Errors}
   */
  errors: computed('model.errors.[]', function() {
    return this.get('model.errors') || DS.Errors.create();
  }),

  /**
   * Tracks whether this form has ever been submitted (used when validation mode
   * is 'submit').
   *
   * @type {Boolean}
   */
  submitted: false,

  /**
   * Capture submit events on the form, and run validations (if needed) before
   * firing the form action up.
   */
  submit(e) {
    e.preventDefault();
    this.set('submitted', true);
    if (this.get('model').validate && this.get('validate')) {
      this.get('model').validate()
      .then((isValid) => {
        if (isValid) {
          this.sendAction('action', this.get('model'));
        }
      });
    } else {
      this.sendAction('action', this.get('model'));
    }
  },

  // Track which fields have been 'touched' by the user to know when to display
  // validations triggered on touch. Touched = user started editing then stopped,
  // usually via focusout.
  touchedFields: computed(function() { return Ember.A(); }),

  // Track which fields are 'live' to know when to display validations that are
  // triggered on 'live'. Live = user started editing.
  liveFields: computed(function() { return Ember.A(); }),

  // Track which error handlers exist for this form. Used to determine if there
  // are any active errors.
  errorHandlers: computed(function() { return Ember.A(); }),

  // This is used primarily by the submit button - it will only disable if there
  // are visible errors.
  hasActiveErrors: computed('errorHandlers.@each.isActive', function() {
    return this.get('errorHandlers').find(handler => handler.get('isActive'));
  })

});
