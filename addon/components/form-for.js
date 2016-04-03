import Ember from 'ember';
import Fieldset from '../lib/fieldset';
import isArray from 'lodash/lang/isArray';

const { get, set, computed, RSVP } = Ember;
const { reads } = computed;

const FormForComponent = Ember.Component.extend({

  /////////////
  // Options //
  /////////////

  /**
   * An action closure to invoke when the form is submitted and valid
   *
   * @type {action}
   */
  action: null,

  /**
   * Describes when errors are displayed. Possible values:
   *
   *   * false        - do not display errors, ever
   *   * 'submit'     - display when the form submission is attempted
   *   * 'touch'      - display for each field that is touched (i.e. focusin then focusout)
   *   * 'live'       - display for each field that is touched or focused
   *   * 'continuous' - display errors all the time
   *
   * @type {String|Boolean}
   */
  validationMode: 'touch',

  /**
   * The validation function to execute when submitting the form. Defaults to
   * the ember-cp-validations on the model, but can be overriden with a
   * different function (via the `(action)` subexpression syntax).
   *
   * Because some validations can be async, we can't fire the submit action on
   * the form until we are sure those async validations have completed. So we
   * submit the form after waiting for any promise returned from this function.
   *
   * @type {Function}
   */
  validate: computed('model', function() {
    let model = get(this, 'model');
    return function validate() {
      return model.validate().then(({ model, validations }) => {
        return get(validations, 'isValid');
      });
    };
  }),

  /**
   * The model for the form. Should be supplied via the first positional param,
   * although in rare cases you may want to use formtastic without a model, so
   * it defaults to an empty object
   *
   * @type  {DS.Model}
   */
  model: computed(function() { return Ember.Object.create(); }),

  /**
   * An alias for DS.Errors coming from the model
   *
   * @type {DS.Errors}
   */
  serverErrors: reads('model.errors'),

  /**
   * An array of ValidationErrors that defaults to the ember-cp-validations
   * errors. These represent the client side validation errors, and must follow
   * the validation error format (i.e. have `attribute` and `message`).
   *
   * @type {ValidationError[]}
   */
  clientErrors: reads('model.validations.attrs'),

  /**
   * Has the form been submitted at any point so far?
   *
   * @type {Boolean}
   */
  isSubmitted: false,

  /**
   * Is the form currently submitting (i.e. the async action is currently
   * running)
   *
   * @type {Boolean}
   */
  isSubmitting: false,


  /////////////
  // Private //
  /////////////

  tagName: 'form',
  classNames: 'form-for',

  /**
   * Create a Fieldset object to yield to the template. The Fieldset object is
   * essentially the "template API" for the form-for component. It exposes a
   * facade that looks like an object with a property for each attribute.
   *
   * However, under the hood, it uses unknownProperty to lazily generate Field
   * objects for each field used by this form.
   *
   * @type {Fieldset}
   * @private
   */
  fieldset: computed(function() {
    return Fieldset.create({ form: this });
  }),

  /**
   * An array of errors encountered when executing the submit action. These are
   * errors returned by the action itself.
   *
   * @type {Error[]}
   * @private
   */
  actionErrors: computed(function() { return Ember.A(); }),

  /**
   * Should the form show errors. This is the form level property - if it's true
   * here, all errors show. If it's false, each field can determine for itself
   * whether or not to show an error.
   *
   * @type {Boolean}
   * @private
   */
  shouldShowErrors: computed('isSubmitted', 'validationMode', function() {
    return get(this, 'validationMode') !== false && get(this, 'isSubmitted');
  }),

  /**
   * The submit handler captures the form submission, sets the appropriate state
   * flags, and fires the form action if the form passes validation.
   *
   * @method submit
   * @private
   * @param  {Event} e
   */
  submit(e) {
    e.preventDefault();
    let actionErrors = get(this, 'actionErrors');
    actionErrors.clear();
    set(this, 'isSubmitting', true);
    set(this, 'submitted', true);
    RSVP.resolve()
    .then(() => {
      if (get(this, 'validationMode') !== false) {
        return get(this, 'validate')()
          .then((isValid) => {
            if (!isValid) {
              return RSVP.reject('Invalid form');
            }
        });
      }
    }).then(() => {
      // TODO we should have some more intelligent handling when the user
      // doesn't supply an action - is this there anything we can do that makes
      // sense, other than throw?
      return this.action(this.get('model')).catch((errors) => {
          if (typeof errors === 'string') {
            actionErrors.pushObject({ message: errors });
          } else if (isArray(errors)) {
            actionErrors.pushObjects(errors);
          } else {
            actionErrors.pushObject(errors);
          }
        });
    }).catch(() => {
      // swallow rejections here - this basically allows an invalid form to
      // cancel this promise chain above.
    }).finally(() => {
      set(this, 'isSubmitting', false);
    });
  }


});

FormForComponent.reopenClass({
  /**
   * Accepts the model as the first positional arg
   *
   * @type {Array}
   */
  positionalParams: [ 'model', 'action' ],
});

export default FormForComponent;
