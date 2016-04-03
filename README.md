# ember-cli-formtastic

```hbs
{{#form-for blogPost as |form|}}
  {{error-for form.title}}
  {{input-for form.title}}
{{/form-for}}
```



LEFT OFF
Still too slow
What if I directly bind the Fields to their error source, i.e. form.modelErrors.attributes.[fieldname] & same for cp-validations. Action errors would be similar, but the grouping would be managed in the submit handler.

Test that first for perf. Assuming it's good, then have catch-all handlers pull
the union'd list of all errors, and have forms create a unioned list of all the
fields errors. Then diff, and you've got your unhandled errors.

Basically, its traditional binding all the way down, but then fields u-turn and
send state up, which is collected and analyzed once.
