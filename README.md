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
    phoneNumber: ko.observable()
  })
</script>
```

# Built in Formatters

| Formatter Name | User Entered Value | Formatted Value |
|----------------|--------------------|-----------------|
| money | 12000 | $12,000 |
| state | mt | MT |
| date | 12122012 | 12/12/2012 |
| zip | a1e234d5 | 12345 |
| ssn | 1234567890 | 1234-56-7890 |
| phone | 1234567890 | (123)456-7890 |
| phoneNoAreaCode | 1234567 | 123-4567 |
| numbers | ab12c3 | 123 |
| characters | ab12c3 | 123 |
| capitalize | this is a test | This Is A Test |
| creditCardNumber | 1234567890123456 | 1234 5678 9012 3456 |
| creditCardCVC | a1b2c3e | 123 |
| creditCardDate | 1212 | 12/12 |
| bankRoutingNumber | 123t45e67a89 | 123456789 |
| bankAccountNumber | 123456e78t901e23a45e67 | 12345678901234567 |
| oneWord | this is some words | this |


