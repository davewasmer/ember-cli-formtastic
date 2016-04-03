import Ember from 'ember';

const { alias } = Ember.computed;

const SubmitForComponent = Ember.Component.extend({

  tagName: 'button',
  classNames: 'submit-for',
  classNameBindings: [ 'submitting', 'disabled' ],
  attributeBindings: [ 'type', 'disabled' ],
  type: 'submit',

  disabled: alias('form.isSubmitting'),
  submitting: alias('form.isSubmitting'),

});

SubmitForComponent.reopenClass({
  positionalParams: [ 'form' ]
});

export default SubmitForComponent;
