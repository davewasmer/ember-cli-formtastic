import Ember from 'ember';

var computed = Ember.computed;

export default Ember.Component.extend({

  // Options

  /**
   * The yielded form value supplied by {{form-for}}. Only required if you want
   * to leverage disable-during-save and your form's model is a DS.Model.
   *
   * @type {FormForComponent}
   */
  form: null,

  /**
   * If you supply the form argument, the button will automatically be disabled
   * during saves if your form is a DS.Model. If you don't supply the form, then
   * you can directly bind the disabled state of the button to your own flag.
   *
   * @type {Boolean}
   */
  disabled: computed.or('form.model.isSaving', 'form.model.isInvalid'),


  classNameBindings: [ 'disabled' ],
  attributeBindings: [ 'disabled' ],

  classNames: 'submit-btn',

  tagName: 'button'

});
