import Ember from 'ember';
import DS from 'ember-data';
import { arrayMemberObserver } from 'ember-array-macros';

const computed = Ember.computed;
const assert = Ember.assert;
const get = Ember.get;
const set = Ember.set;
const on = Ember.on;
const contains = function(arrayKey, valueKey) {
  return computed(arrayKey + '.[]', valueKey, function() {
    return this.get(arrayKey).contains(this.get(valueKey));
  });
};

export default Ember.Component.extend({

  tagName: '',

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
  field: 'base',

  /**
   * Errors belong to a particular field, and come in different types. Using the
   * `matches` option, you can display the error message block only when the
   * specified `field` has a certain kind of error.
   *
   * `matches` should be a RegExp (or String that will be converted to a RegExp)
   * that will be checked against each error to find a matches.
   *
   * If you don't specify a `matches` option, the component assumes "catch-all"
   * mode. Any errors for the supplied field that are *not* picked up by other
   * {{error-for}} components will be treated as matching this one. Note - all
   * your {{error-for}} instances must be passed in the form option for this to
   * work.
   *
   * @type {RegExp|Boolean}
   */
  _pattern: false,
  matches: computed({
    get() {
      return this.get('_pattern');
    },
    set(key, value) {
      if (Ember.typeOf(value) === 'string') {
        value = new RegExp(value);
      }
      this.set('_pattern', value);
      return value;
    }
  }),

  /**
   * This option is mutually exclusive with the `field` option. When `field` is
   * used, the errors will be looked up via the injected form's model.errors
   * property. If your form's model doesn't have an errors property, you can
   * manually specify the array of errors this block should check.
   *
   * @type {Error[]}
   */
  errors: computed.reads('form.errors'),

  /**
   * Filtered list of all errors that apply to this field
   *
   * @type {Error[]}
   */
  fieldErrors: computed('errors.[]', function() {
    assert(`You must supply an instance of DS.Errors as the error source for this input (${this.get('field')}). If you didn't supplied a custom error source, check the parent form's error source.`, this.get('errors') instanceof DS.Errors);
    return this.get('errors').errorsFor(this.get('field'));
  }),

  /**
   * Errors that matches the `matches` pattern
   *
   * @type {Error[]}
   */
  matchingErrors: computed.filter('fieldErrors', function (error) {
    let message = this.buildErrorMessage(error);
    if (this.get('matches')) {
      return !get(error, 'isCaptured') && message.match(this.get('matches'));
    } else {
      return !get(error, 'isCaptured');
    }
  }),

  /**
   * The active error
   *
   * @type {String}
   */
  error: computed.alias('matchingErrors.firstObject'),

  /**
   * The active error message
   *
   * @type {String}
   */
  errorMessage: computed('error', function() {
    let error = this.get('error');
    if (error) {
      return this.buildErrorMessage(error);
    } else {
      return null;
    }
  }),

  /**
   * When items are added to our matching errors array, mark them as captured
   * so we can know which ones *aren't* captured and should be displayed in
   * catch-all handlers. Catch-all handlers themselves don't mark as captured.
   */
  trackCaptures: arrayMemberObserver('matchingErrors', {
    added(error) {
      if (this.get('matches')) {
        set(error, 'isCaptured', true);
      }
    },
    removed(error) {
      if (this.get('matches')) {
        set(error, 'isCaptured', false);
      }
    }
  }),

  /**
   * Takes an error object and builds a string to check against the `matches`
   * pattern. Extracted out to make it easily overridable.
   */
  buildErrorMessage(error) {
    if (error.message && error.message.type) {
      return error.message.type + ': ' + error.message.message;
    } else if (error.message) {
      return error.message;
    } else {
      return error.toString();
    }
  },


  // Visibility control
  //
  // {{error-for}} handlers can capture errors, but that doesn't mean they need
  // to display them. That depends on the validation mode of the form and
  // potentially whether the user has interacted with the field's associated
  // input

  isFirstError: computed('error', 'fieldErrors', function() {
    return this.get('errors.firstObject') === this.get('error');
  }),

  /**
   * Errors on the base attribute don't have a corresponding field for the user
   * to interact with, so they generally follow the touched/live pattern at the
   * form level rather than the individual input level.
   *
   * @type {Boolean}
   */
  isBase: computed.equal('field', 'base'),
  formIsTouched: computed.notEmpty('form.touchedFields'),
  formIsLive: computed.notEmpty('form.liveFields'),

  /**
   * When {{error-for}} tracks a specific field, it tracks whether that field
   * has been touched / is live.
   *
   * @type {Boolean}
   */
  fieldIsTouched: contains('form.touchedFields', 'field'),
  fieldIsLive: contains('form.liveFields', 'field'),

  // Are there errors to render, and should those errors be displayed yet?
  isActive: computed(
    'form.validate',
    'form.submitted',
    'error',
    'isFirstError',
    'fieldIsLive',
    'fieldIsTouched',
    function() {
      let mode = this.get('form.validate');

      return this.get('error') && this.get('isFirstError') && (
        (mode === 'touch' && this.get('fieldIsTouched')) ||
        (mode === 'live' && this.get('fieldIsLive')) ||
        (mode === 'submit' && this.get('form.submitted')) ||
        (mode === 'continuous')
      );
    }
  ),

  /**
   * Register and deregister with the parent form object.
   */
  registerWithForm: on('didInsertElement', function() {
    let handlers = this.get('form.errorHandlers');
    if (handlers) {
      handlers.pushObject(this);
    }
  }),
  deregisterWithForm: on('willDestroyElement', function() {
    let handlers = this.get('form.errorHandlers');
    if (handlers) {
      handlers.removeObject(this);
    }
  }),

});
