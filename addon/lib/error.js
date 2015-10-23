import Ember from 'ember';

const computed = Ember.computed;

export default Ember.Object.extend({

  attribute: null,
  message: null,

  isFormError: computed.empty('attribute'),

  isCaptured: false,
  capturePriority: 0

});
