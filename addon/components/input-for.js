import Ember from 'ember';

var computed = Ember.computed;

export default Ember.TextField.extend({

  classNames: 'input-for',
  classNameBindings: [ 'dasherizedField', 'isErrored:error' ],
  dasherizedField: computed('field', function() {
    if (this.get('field')) {
      return Ember.String.dasherize(this.get('field'));
    }
  }),

  attributeBindings: [ 'placeholder' ],
  placeholder: computed('field', function() {
    if (this.get('field')) {
      return Ember.String.capitalize(this.get('dasherizedField').replace('-', ' '));
    }
  }),

  // Options

  /**
   * The yielded form value supplied by {{form-for}}. Required to use the
   * `field` option and error tracking.
   *
   * @type {FormForComponent}
   */
  form: null,

  /**
   * Name of the field on the form's model that this input represents.
   *
   * @type {String}
   */
  field: null,

  /**
   * Overridable alias to the model
   *
   * @type {DS.Model|Object}
   */
  model: computed.reads('form.model'),

  /**
   * Overridable alias to the errors for the model
   *
   * @type {DS.Errors}
   */
  errors: computed.reads('model.errors'),

  /**
   * The value is either aliased to the form's model (if a `field` property is
   * supplied) or is stored directly (in the `_value`) property.
   *
   * @type {String}
   */
  _value: "",
  value: computed(function(key, value) {
    var path;
    if (this.get('field')) {
      Ember.assert('You must supply the "form" to input-for when you specify the "field". To bind a value directly, use "value" instead.', this.get('form'));
      path = 'model.' + this.get('field');
    } else {
      path = '_value';
    }

    if (arguments.length > 1) {
      this.set(path, value);
    }
    return this.get(path, value);
  }),


  /**
   * Does the form's Errors instance contain any errors for this field?
   *
   * @type {Boolean}
   */
  hasErrors: computed('errors.[]', function() {
    let errors = this.get('errors');
    return errors && errors.errorsFor(this.get('field')).length > 0;
  }),

  /**
   * Has this input been touched by the user yet?
   *
   * @type {Boolean}
   */
  isTouched: computed('form.touchedFields.[]', function() {
    return this.get('form.touchedFields').contains(this.get('field'));
  }),

  /**
   * Is this input live?
   *
   * @type {Boolean}
   */
  isLive: computed('form.liveFields.[]', function() {
    return this.get('form.liveFields').contains(this.get('field'));
  }),

  /**
   * Are there errors to render, and should those errors be displayed yet?
   *
   * @type {Boolean}
   */
  isErrored: computed(
    'form.validate',
    'form.submitted',
    'hasErrors',
    'isTouched',
    'isLive',
    function() {
      let mode = this.get('form.validate');
      let submitted = this.get('form.submitted');

      let shouldDisplay = submitted || (
        (mode === 'touch' && this.get('isTouched')) ||
        (mode === 'live' && this.get('isLive')) ||
        (mode === 'submit' && this.get('form.submitted')) ||
        (mode === 'continuous')
      );

      return this.get('hasErrors') && shouldDisplay;
  }),

  /**
   * Track blur events - the form will use this to determine if this field is
   * touched. We can't track that purely at {{input-for}} level, because the
   * form may reset the touched state on submit, etc.
   */
  focusOut() {
    var form = this.get('form');
    if (form) {
      form.get('touchedFields').pushObject(this.get('field'));
    }
  },

  /**
   * Track focus events - the form will use this to determine if this field is
   * live. We can't track that purely at {{input-for}} level, because the
   * form may reset the live state on submit, etc.
   */
  focusIn() {
    var form = this.get('form');
    var field = this.get('field');
    if (form) {
      form.get('liveFields').pushObject(field);
    }
  }

});
