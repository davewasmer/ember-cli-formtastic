import Ember from 'ember';
import ControlComponent from './control';

const computed = Ember.computed;

export default ControlComponent.extend({

  classNames: 'input-for',
  attributeBindings: [ 'checked' ],
  type: 'radio',

  checked: computed(function() {})

});
