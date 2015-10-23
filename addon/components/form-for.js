import Ember from 'ember';
import Fieldset from '../lib/fieldset';
import FormError from '../lib/error';
import isArray from 'lodash/lang/isArray';

const { get, set, computed, RSVP } = Ember;
const { union, reads } = computed;

// We use this as the psuedo attribute name for form level errors to avoid
// collisions with actual attribute names.
const FORM_ATTRIBUTE = Ember.guidFor({});

export default Ember.Component.extend({

  /////////////
  // Options //
  /////////////

  /**
   * Accepts the model as the first positional arg
   *
   * @type {Array}
   */
  positionalParams: [ 'model', 'action' ],

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
    return model.validate.bind(model);
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
  clientErrors: reads('model.validations.errors'),

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
   * The list of all errors for this form. Defaults to the union of the model
   * errors, the ember-cp-validations errors, and any action errors.
   *
   * @type {Array}
   * @private
   */
  allErrors: computed('serverErrors.[]', 'clientErrors.[]', 'actionErrors.[]', function() {
    let allErrors = Ember.A();
    [ 'serverErrors', 'clientErrors', 'actionErrors' ].forEach((errorSourceName) => {
      allErrors.pushObjects(get(this, errorSourceName) || []);
    });
    return allErrors.uniq().map((error) => {
      return FormError.create({
        attribute: get(error, 'attribute'),
        message: get(error, 'message')
      });
    });
  }),

  /**
   * Sort the errors into attribute specific groups. Create clones of the error
   * objects so we can attach state tracking information to them (specifically,
   * whether or not the error has been captured, and by whom).
   *
   * @type {Object}
   * @private
   */
  errorsByAttribute: computed('allErrors.[]', function() {
    return get(this, 'allErrors').reduce((errorsByAttribute, error) => {
      let attribute = get(error, 'attribute') || FORM_ATTRIBUTE;
      let message = get(error, 'message');
      if (!errorsByAttribute[attribute]) {
        errorsByAttribute[attribute] = Ember.A();
      }
      errorsByAttribute[attribute].pushObject(error);
      return errorsByAttribute;
    }, {});
  }),

  /**
   * An array of error-for components that should capture any orphaned errors.
   *
   * @type {ErrorForComponent[]}
   * @private
   */
  errorHandlers: computed(function() { return Ember.A(); }),

  /**
   * A Map of error handlers and their captured errors.
   *
   * @type {Map}
   * @private
   */
  errorsByHandler: computed('allErrors.[]', 'errorHandlers.[]', function() {
    let handlers = get(this, 'errorHandlers');
    let allErrors = get(this, 'allErrors');

    let errorsByHandler = handlers.reduce((result, handler) => {
      result.set(handler, Ember.A());
      return result;
    }, new Map());
    allErrors.forEach((error) => {
      let capturingHandler = findCapturingHandler(error, handlers);
      if (capturingHandler) {
        errorsByHandler.get(capturingHandler).pushObject(error);
      }
    });

    return errorsByHandler;
  }),

  // Mock the Field interface so error-for components don't need to special-case
  // being handed form errors vs field errors.
  errors: computed.alias(`errorsByAttribute.${ FORM_ATTRIBUTE }`),
  attribute: FORM_ATTRIBUTE,
  form: computed(function() { return this; }),

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


function findCapturingHandler(error, handlers) {
  let errorAttribute = get(error, 'attribute');
  let errorMessage = get(error, 'message');
  let capturePriority = 0;
  let capturingHandler;

  handlers.forEach((handler) => {
    let handlerAttribute = get(handler, 'attribute');
    let handlerPattern = get(handler, 'matchesPattern');

    // Field errors
    if (errorAttribute) {

      // {{error-for form}} - generic catchall handler
      if (!handlerAttribute && !handlerPattern) {
        if (capturePriority < 1) {
          capturingHandler = handler;
          capturePriority = 1;
        }

      } else if (handlerAttribute === errorAttribute) {
        // {{error-for fields.email}} - attribute catchall
        if (!handlerPattern) {
          if (capturePriority < 2) {
            capturingHandler = handler;
            capturePriority = 2;
          }
        // {{error-for fields.email matches='blank'}} - attribute & error specific
        } else if (errorMessage.match(handlerPattern)) {
          if (capturePriority < 3) {
            capturingHandler = handler;
            capturePriority = 3;
          }
        }
      }

    // Form errors
    } else {

      // Skip field specific handlers
      if (handlerAttribute) {
        return;
      }

      // {{error-for form}} - generic catchall
      if (!handlerPattern) {
        if (capturePriority < 2) {
          capturingHandler = handler;
          capturePriority = 2;
        }

      // {{error-for form matches='conflict'}} - form-wide & error specific
      } else if (errorMessage.match(handlerPattern)) {
        if (capturePriority < 3) {
          capturingHandler = handler;
          capturePriority = 3;
        }
      }
    }
  });

  set(error, 'isCaptured', true);
  set(error, 'capturingHandler', capturingHandler);
  set(error, 'capturePriority', capturePriority);
  return capturingHandler;
}




// /**
//  * An array of all the attribute names that have been captured by an
//  * {{error-for}} component
//  *
//  * @type {String[]}
//  */
// capturedAttributes: computed('errorHandlers.[]', function() {
//   return get(this, 'errorHandlers').map((errorHandler) => {
//     return get(errorHandler, 'errorTarget');
//   }).filter((errorTarget) => {
//     return errorTarget !== this;
//   }).map((field) => {
//     return get(field, 'attribute');
//   });
// }),

// /**
//  * An array of all errors that are either:
//  *
//  *   a) form-level errors (i.e. they don't relate to a specific attribute), or
//  *   b) field-level errors whose attribute was not captured by any
//  *      {{error-for}} component
//  *
//  * @type {FormError[]}
//  */
// formErrors: computed('errors.[]', 'capturedAttributes.[]', function() {
//   let capturedAttributes = get(this, 'capturedAttributes');
//   return get(this, 'errors').filter((error) => {
//     let isCaptured = capturedAttributes.indexOf(get(error, 'attribute')) > -1;
//     return isCaptured || get(error, 'isFormError');
//   });
// }),
