import Ember from 'ember';

const { get, computed } = Ember;
const { reads, notEmpty } = computed;

export default Ember.Object.extend({

  fieldset: null,
  errors: null,
  attribute: null,
  value: null,

  form: reads('fieldset.form'),

  isTouched: false,
  isLive: false,

  hasErrors: notEmpty('errors'),
  shouldShowErrors: computed('form.valdiationMode', 'isTouched', 'isLive', function() {
    let mode = get(this, 'form.validationMode');
    if (mode === 'continuous') {
      return true;
    } else if (mode === 'live') {
      return get(this, 'isLive');
    } else if (mode === 'touch') {
      return get(this, 'isTouched');
    }
    return false;
  })

});
