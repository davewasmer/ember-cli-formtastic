import Ember from 'ember';
import capitalize from 'lodash/string/capitalize';
import kebabCase from 'lodash/string/kebabCase';

const { get, set, computed } = Ember;
const { notEmpty, or, and } = computed;

export default Ember.Component.extend({

  positionalParams: [ 'field' ],

  field: null,

  tagName: 'input',
  classNameBindings: [ 'dasherizedAttributeName', 'hasActiveError:error' ],
  attributeBindings: [ 'placeholder', 'type' ],

  type: 'text',

  dasherizedAttributeName: computed('field.attribute', function() {
    return kebabCase(get(this, 'field.attribute') || '');
  }),

  placeholder: computed('dasherizedAttributeName', function() {
    return capitalize(get(this, 'dasherizedAttributeName').replace('-', ' '));
  }),

  hasErrors: notEmpty('field.errors'),
  shouldShowErrors: or('form.shouldShowErrors', 'field.shouldShowErrors'),
  hasActiveError: and('hasErrors', 'shouldShowErrors'),

  focusIn() {
    set(this, 'field.isLive', true);
  },

  focusOut() {
    set(this, 'field.isTouched', true);
  }

});
