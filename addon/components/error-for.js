import Ember from 'ember';
import Field from '../lib/field';

const { get, computed, on } = Ember;

export default Ember.Component.extend({

  positionalParams: [ 'errorTarget' ],

  errorTarget: null,
  attribute: computed.alias('errorTarget.attribute'),
  matches: null,

  matchesPattern: computed('matches', function () {
    if (get(this, 'matches')) {
      return new RegExp(get(this, 'matches'), 'gi');
    } else {
      return null;
    }
  }),

  registerHandler: on('init', function() {
    if (get(this, 'form')) {
      get(this, 'form.errorHandlers').pushObject(this);
    }
  }),

  unregisterHandler: on('willDestroy', function() {
    if (get(this, 'form')) {
      get(this, 'form.errorHandlers').removeObject(this);
    }
  }),

  form: computed.alias('errorTarget.form'),
  attributeErrors: computed.alias('errorTarget.errors'),

  errors: computed('form.errorsByHandler', function() {
    return get(this, 'form.errorsByHandler').get(this);
  }),

  error: computed.alias('errors.firstObject'),

  isFirstErrorForAttribute: computed('attributeErrors.firstObject', 'error', function() {
    return get(this, 'attributeErrors.firstObject') === get(this, 'error');
  }),

  fieldShouldShowErrors: computed.alias('errorTarget.shouldShowErrors'),

  isActive: computed.and('isFirstErrorForAttribute', 'fieldShouldShowErrors')

});
