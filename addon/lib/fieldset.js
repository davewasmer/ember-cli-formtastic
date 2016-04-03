import Ember from 'ember';
import Field from './field';

const { computed, set, get } = Ember;
const { alias, filter } = computed;

const defineField = function defineField(attribute, fieldset) {
  return Field.extend({
    attribute: attribute,
    fieldset: fieldset,
    value: alias('form.model.' + attribute),
    serverErrors: alias('form.serverErrors.' + attribute),
    clientErrors: alias('form.clientErrors.' + attribute + '.errors'),
    actionErrors: filter('form.actionErrors', function(error) {
      return get(error, 'attribute') === attribute;
    })
  });
};

export default Ember.Object.extend({

  form: null,

  unknownProperty(attribute) {
    let field = defineField(attribute, this).create();
    set(this, attribute, field);
    return field;
  }

});
