import Ember from 'ember';
import TextField from "ember-views/views/text_field";

var computed = Ember.computed;

export default TextField.extend({

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
  value: computed({
    get: function() {
      if (this.get('field')) {
        Ember.assert('You must supply the "form" to input-for when you specify the "field". To bind a value directly, use "value" instead.', this.get('form'));
        return this.get('form.model.' + this.get('field'));
      } else {
        return this.get('_value');
      }
    },
    set: function(key, value) {
      if (this.get('field')) {
        Ember.assert('You must supply the "form" to input-for when you specify the "field". To bind a value directly, use "value" instead.', this.get('form'));
        return this.set('form.model.' + this.get('field'), value);
      } else {
        return this.set('_value', value);
      }
    }
  })

});
