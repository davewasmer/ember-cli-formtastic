import Ember from 'ember';
import ControlMixin from '../lib/control';

const { alias } = Ember.computed;

const CheckboxForComponent = Ember.Component.extend(ControlMixin, {

  classNames: 'checkbox-for',
  type: 'checkbox',
  checked: alias('value')

});

CheckboxForComponent.reopenClass({
  positionalParams: [ 'field' ]
});

export default CheckboxForComponent;
