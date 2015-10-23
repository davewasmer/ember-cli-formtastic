import Ember from 'ember';
import Field from './field';

const { computed } = Ember;
const { alias } = computed;

export default Ember.Object.extend({

  form: null,

  unknownProperty(attribute) {
    let field = Field.create({ attribute: attribute, fieldset: this });
    field.value = alias('form.model.' + attribute);
    field.errors = alias('form.errorsByAttribute.' + attribute);
    this.set(attribute, field);
    return field;
  }

});
