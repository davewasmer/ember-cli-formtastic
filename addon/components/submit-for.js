import Ember from 'ember';

var computed = Ember.computed;

export default Ember.Component.extend({

  tagName: 'button',
  classNames: 'submit-btn',
  classNameBindings: [ 'disabled' ],
  attributeBindings: [ 'disabled' ],

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
   * during saves or when the form is visibly invalid. If you don't supply the
   * form, then you can directly bind the disabled state of the button to your
   * own flag.
   *
   * @type {Boolean}
   */
  disabled: computed('form.hasActiveErrors', 'form.model.isSaving', function() {
    return Boolean(
      this.get('form.hasActiveErrors') ||
      this.get('form.model.isSaving')
    );
  })

});
