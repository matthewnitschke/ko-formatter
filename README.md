# ko-formatter

ko-formatter is an incredibly easy to use knockout js forced formatter plugin.

# Installation

```html
<script src="/path/to/knockout.js"></script>
<script src="/path/to/ko-formatter.js"></script>
```

# Usage
There are two ways to use ko-formatter, object formatting, and pattern formatting.

## Object Formatting
```html
<input data-bind="textInput: phoneNumber, formatter: ko.formatter.phone" />

<script>
  ko.applyBindings({
    phoneNumber: ko.observable()
  })
</script>
```

## Pattern Formatting
```html
<input data-bind="textInput: phoneNumber, formatter: '###-###-####'" />

<script>
  ko.applyBindings({
    phoneNumber: ko.observable()
  })
</script>
```

# Object Formatters
All can be accessed from the `ko.formatter` object

| Formatter Name | User Entered Value | Formatted Value |
|----------------|--------------------|-----------------|
| money | 12000 | $12,000 |
| state | mt | MT |
| date | 12122012 | 12/12/2012 |
| zip | a1e234d5 | 12345 |
| ssn | 1234567890 | 1234-56-7890 |
| phone | 1234567890 | 123-456-7890 |
| phoneNoAreaCode | 1234567 | 123-4567 |
| numbers | ab12c3 | 123 |
| characters | ab12c3 | abc |
| capitalize | this is a test | This Is A Test |
| creditCardNumber | 1234567890123456 | 1234 5678 9012 3456 |
| creditCardCVC | a1b2c3e | 123 |
| creditCardDate | 1212 | 12/12 |
| bankRoutingNumber | 123t45e67a89 | 123456789 |
| bankAccountNumber | 123456e78t901e23a45e67 | 12345678901234567 |
| oneWord | this is some words | this |

### Custom Formatters
You can create your own formatters

```javascript
Formatter.customFormatter = {
  formatterFunction: function(value) {
    // this is where you will take value and change it into what you want the formatted value to be
  },
  patternCharacters: "", // this is a string of all the characters you are going to add to the value
  lengthLimit: 0, // (optional) the length of your formatter
  preformatter: function(value){}, // (optional) a function that is run before the formatter to clear out unwanted values
  allowNull: false // (default: false) if true, the formatter will be run even when the input is null
}
```


# Pattern Formatters
Sometimes a formatter doesnt require a complex features and can simply be a pattern. This is when pattern formatters should be used

### Wildcards
| Wildcard | Property |
|----------|----------|
| #        | number |
| @        | letter |
| *        | anything |

### Examples
| Pattern | Function |
|---------|----------|
|###-###-####| Phone number |
|####-##-#### | SSN |
| @@ | State |
