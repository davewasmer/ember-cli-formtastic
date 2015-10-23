import Ember from 'ember';

export default Ember.Component.extend({

  tagName: 'button',
  classNames: 'submit-for',
  attributeBindings: [ 'type' ],
  type: 'submit'

});
