import Ember from 'ember';
import ControlMixin from '../lib/control';

const { get, computed, on } = Ember;

export default Ember.TextField.extend(ControlMixin, {

  notifyUpdate: on('willUpdate', function() {
    console.log('input-for is re-rendering');
  }),

  classNames: 'input-for',

  type: computed('field.attribute', function() {
    return get(this, 'field.attribute') === 'password' ? 'password' : 'text';
  })

});
