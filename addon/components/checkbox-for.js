import Ember from 'ember';
import ControlComponent from './control';

const { alias } = Ember.computed;

export default ControlComponent.extend({

  classNames: 'checkbox-for',
  attributeBindings: [ 'checked' ],
  type: 'checkbox',
  checked: alias('value')

});
