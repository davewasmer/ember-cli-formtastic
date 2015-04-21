import Ember from 'ember';
import DS from 'ember-data';

var computed = Ember.computed;
var on = Ember.on;

export default Ember.Component.extend({

  // Options

  /**
   * The yielded form value supplied by {{form-for}}. Required when used
   * with `field` option or for catch-all error behavior (see `matches` option).
   *
   * @type {FormForComponent}
   */
  form: null,

  /**
   * Name of the field on the form's model that this error corresponds to.
   *
   * @type {String}
   */
  field: null,

  /**
   * Display multiple errors at once, or only just the first one in the stack.
   *
   * @type {Boolean}
   */
  multiple: false,

  /**
   * Errors belong to a particular field, and come in different types. Using the
   * `matches` option, you can display the error message block only when the
   * specified `field` has a certain kind of error.
   *
   * `matches` should be a RegExp (or String that will be converted to a RegExp)
   * that will be checked against each error to find a match.
   *
   * If you don't specify a `matches` option, the component assumes "catch-all"
   * mode. Any errors for the supplied field that are *not* picked up by other
   * {{error-for}} components will be treated as matching this one. Note - all
   * your {{error-for}} instances must be passed in the form option for this to
   * work.
   *
   * @type {RegExp|String}
   */
  matches: null,

  /**
   * Sometimes you only want to display an error message when some other
   * condition is true. For example, you might want to display a different error
   * message if the user makes the same mistake three or more times in a row.
   *
   * `when` lets you add an additional condition more elegantly than wrapping
   * the {{error-for}} block in an {{if}} helper.
   *
   * @type {Boolean}
   */
  when: true,

  /**
   * This option is mutually exclusive with the `field` option. When `field` is
   * used, the errors will be looked up via the injected form's model.errors
   * property. If your form's model doesn't have an errors property, you can
   * manually specify the array of errors this block should check.
   *
   * @type {DS.Errors}
   */
  errors: computed('form.errors.[]', function() {
    if (this.get('field')) {
      return this.get('form.errors');
    } else {
      return new DS.Errors();
    }
  }),


  classNames: 'formtastic-error',

  // Take the 'matches' argument and convert to a RegExp if not already one.
  pattern: computed('matches', function() {
    if (typeof this.get('matches') === 'string') {
      return new RegExp(this.get('matches'));
    } else {
      return this.get('matches');
    }
  }),

  // Are there any actual errors to render?
  isVisible: computed.gt('visibleErrors.length', 0),

  // Let the parent know this error-for component exists. Used to help determine
  // what errors are *not* being handled so they can be passed off to the
  // catch-all handlers (see the matchingErrors property below).
  registerWithForm: on('didInsertElement', function() {
    this.get('form.errorHandlers').pushObject(this);
  }),
  deregisterWithForm: on('willDestroyElement', function() {
    this.get('form.errorHandlers').removeObject(this);
  }),

  // Of all the errors against this particular field, which ones should this
  // component handle? Three scenarios:
  //
  // 1. {{error-for field='email' matches='AlreadyTaken'}}
  //    matches all errors on the 'email' field that match 'AlreadyTaken'
  // 2. {{error-for field='email'}}
  //    matches all errors on the 'email' field *that are not otherwise matched*
  // 3. {{error-for errors=foo.bar}}
  //    doesn't check for matches, just uses the supplied 'errors' array
  //
  matchingErrors: computed('errors.[]', function() {
    if (this.get('pattern')) {
      return this.get('errors').filter(this.matchesError.bind(this));
    } else if (this.get('field')) {
      return this.get('form').findUnmatchedErrorsFor(this.get('field'));
    } else {
      return this.get('errors');
    }
  }),

  // Of the errors that this component should handle, which ones are we actually
  // displaying?
  visibleErrors: computed('multiple', 'errors.[]', function() {
    var errors = this.get('matchingErrors');
    if (errors.get('length') === 0) {
      return [];
    }
    return this.get('multiple') ? errors : Ember.A([ errors.get('firstObject') ]);
  }),

  // Take a `matches` regex pattern and an error and return if they match
  matchesError(error) {
    var pattern = this.get('pattern');
    var field = this.get('field');
    return error.attribute === field && error.message.match(pattern);
  }

});
