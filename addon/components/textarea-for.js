import Ember from 'ember';
import ControlMixin from '../lib/control';

const TextareaForComponent = Ember.TextArea.extend(ControlMixin, {

  classNames: 'textarea-for',
  tagName: 'textarea',
  type: null

});

TextareaForComponent.reopenClass({
  positionalParams: [ 'field' ]
});

export default TextareaForComponent;
