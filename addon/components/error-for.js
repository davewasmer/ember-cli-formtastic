import Ember from 'ember';

const { get, computed } = Ember;

const ErrorForComponent = Ember.Component.extend({

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

  form: computed.alias('errorTarget.form'),
  attributeErrors: computed.alias('errorTarget.errors'),

  errors: computed('attributeErrors.[]', function() {
    if (get(this, 'matchesPattern')) {
      return get(this, 'attributeErrors').filter((error) => {
        return get(error, 'message').match(get(this, 'matchesPattern'));
      });
    } else {
      return get(this, 'attributeErrors');
    }
  }),

  error: computed.alias('errors.firstObject'),

  isFirstErrorForAttribute: computed('attributeErrors.firstObject', 'error', function() {
    return get(this, 'attributeErrors.firstObject') === get(this, 'error');
  }),

  fieldShouldShowErrors: computed.alias('errorTarget.shouldShowErrors'),

  isActive: computed.and('error', 'isFirstErrorForAttribute', 'fieldShouldShowErrors')

});

ErrorForComponent.reopenClass({
  positionalParams: [ 'errorTarget' ]
});

export default ErrorForComponent;
