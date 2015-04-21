import Ember from 'ember';

var computed = Ember.computed;

export default Ember.TextField.extend({

  // Options

  /**
   * The yielded form value supplied by {{form-for}}. Only required when used
   * with `field` option.
   * @type {FormForComponent}
   */
  form: null,

  /**
   * Name of the field on the form's model that this input represents.
   * @type {String}
   */
  field: null,


  classNames: 'formtastic-input',
  classNameBindings: 'field',

  _value: "",
  value: computed(function(key, value) {
    var path;
    if (this.get('field')) {
      Ember.assert('You must supply the "form" to input-for when you specify the "field". To bind a value directly, use "value" instead.', this.get('form'));
      path = 'form.model.' + this.get('field');
    } else {
      path = '_value';
    }

    if (arguments.length > 1) {
      this.set(path, value);
    }
    return this.get(path, value);
  })

});
