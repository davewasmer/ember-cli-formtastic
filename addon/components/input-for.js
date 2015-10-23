import Ember from 'ember';
import ControlComponent from './control';

const { get, computed } = Ember;

export default ControlComponent.extend({

  classNames: 'input-for',
  
  type: computed('field.attribute', function() {
    return get(this, 'field.attribute') === 'password' ? 'password' : 'text';
  })

});
