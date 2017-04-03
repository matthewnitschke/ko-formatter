# ko-formatter

ko-formatter is an incredibly easy to use knockout js forced formatter plugin.

# Installation

```html
<script src="/path/to/knockout.js"></script>
<script src="/path/to/ko-formatter.js"></script>
```

# Usage

```html
<input data-bind="textInput: phoneNumber, formatter: Formatter.phone">

<script>
  ko.applyBindings({
    phone: ko.observable()
  })
</script>
```

