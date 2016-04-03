import Ember from 'ember';
import ControlMixin from '../lib/control';

const computed = Ember.computed;

const RadioForComponent = Ember.Component.extend(ControlMixin, {

  tagName: 'input',
  classNames: 'input-for',
  type: 'radio',

  attributeBindings: [ 'checked' ],
  checked: computed(function() {})

});

RadioForComponent.reopenClass({
  positionalParams: [ 'field' ]
});

export default RadioForComponent;
