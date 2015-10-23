# ember-cli-formtastic

```hbs
{{#form-for blogPost as |form|}}
  {{error-for form.title}}
  {{input-for form.title}}
{{/form-for}}
```



LEFT OFF
got errors displaying, but multiple are displaying for a single attribute.

I need to unify the facade for forms and fields. That way, the error handler can
point to the errorTarget's error list, and have it either be a field's error list or the form's orphaned errors list. That way, the error handler can compare it's error against the first on the attribute list.
