/*!
    ko-formatter - knockout input auto formatter
    Author: Matthew Nitschke
    License: MIT (http://www.opensource.org/licenses/mit-license.php)
    Version: {{versionNumber}}
*/


(function(global, undefined) {

  ko.bindingHandlers.formatter = {
      init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var bindings = allBindings();
        var value;

        // get the observable bound to this input, could be a value binding or a textInput binding
        if (bindings.textInput){
          value = bindings.textInput;
        } else if (bindings.value){
          value = bindings.value;
        }

        var formatterObject = bindings.formatter; // get the formatter object passed in with this binding

        var format = function(){
          // when the observable bound to the input is updated, run the formatter function on this binding
          ko.bindingHandlers.formatter.format(element, value, formatterObject);
        }

        value.subscribe(format);
        format(); // call format on initialization

      },
      format: function(element, valueAccessor, formatterObject){
        var value = ko.unwrap(valueAccessor);

        // function that sets the cursor position of the element passed in
        function setCaretPosition(ctrl,pos) {
          if (ctrl.setSelectionRange){
            ctrl.focus();
            ctrl.setSelectionRange(pos,pos);
          }
          else if (ctrl.createTextRange){
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
          }
        }

        // helper method that gets number of patternCharacters before an index
        // is used for positioning the cursor after the formatting of the input
        function getPatternCharLength(value, caretPos){
          if (formatterObject.patternCharacters){
            var regexMatcher = new RegExp("[" + formatterObject.patternCharacters + "]", 'gi');
            var patternChars = value.substring(0, caretPos).match(regexMatcher);
            return patternChars ? patternChars.length : 0;
          } else {
            return 0;
          }
        }

        // get the cursors initial position
        var caretPos = element.selectionStart;

        // only format if value is not null or if the formatter object allows null values
        if (!!(value) || formatterObject.allowNull) {

          // the length limit check, if value is longer than length limit, substring value to fit
          if (value.length > formatterObject.lengthLimit) {
            value = value.substring(0, formatterObject.lengthLimit);
          }

          var patternCharsBeforeFormat = getPatternCharLength(value, caretPos);

          if (formatterObject.preformatter != null) {
            value = formatterObject.preformatter(value);
          }

          if (formatterObject.formatterFunction){
            value = formatterObject.formatterFunction(value);
          }

          var patternCharsAfterFormat = getPatternCharLength(value, caretPos);

          // corrects the cursor position due to patternCharacters getting added by the formatterFunction
          caretPos = caretPos + (patternCharsAfterFormat - patternCharsBeforeFormat);
        }

        valueAccessor(value);
        setCaretPosition(element, caretPos);

      }
  }

  ko.formatter = {
    money: {
      formatterFunction: function(value){
        value = value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        value = "$" + value;

        return value;
      },
      patternCharacters: "$,",
      allowNull: false,
      preformatter: function(value){
        return value.replace(/[^0-9.]/g, ""); // remove everything but numbers and decimal points
      },
    },

    state: {
      formatterFunction: function(value){
        return value.toUpperCase();
      },
      lengthLimit: 2,
      preforatter: clearNonCharacters
    },

    date: {
      formatterFunction: function(value, charCounter){
        var retValue = "";
        for(var i = 0; i < value.length; i ++){
          if (i == 2 || i == 4){
            retValue += "/";
            charCounter.inc(i);
          }
          retValue += value.charAt(i);

        }
        return retValue;
      },
      patternCharacters: "/",
      lengthLimit: 10,
      preformatter: clearNonNumbers
    },

    zip: {
      lengthLimit: 5,
      preformatter: clearNonCharacters
    },

    ssn: {
      formatterFunction: function(value){
        var retValue = "";
        for(var i = 0; i < value.length; i ++){
          if (i == 4 || i == 6){
            retValue += "-";
          }
          retValue += value.charAt(i);

        }
        return retValue;
      },
      patternCharacters: "-",
      lengthLimit: 12,
      preformatter: clearNonNumbers
    },

    phone: {
      formatterFunction: function(value){
        var retValue = "";
        for(var i = 0; i < value.length; i ++){
          if (i == 3 || i == 6){
            retValue += "-";
          }

          retValue += value.charAt(i);

        }
        return retValue;
      },
      patternCharacters: "-",
      lengthLimit: 12,
      preformatter: clearNonNumbers
    },

    phoneNoAreaCode: {
      formatterFunction: function(value){
        var retValue = "";
        for(var i = 0; i < value.length; i ++){

          if (i == 3) {
            retValue += "-";
          }

          retValue += value.charAt(i);

        }
        return retValue;
      },
      patternCharacters: "-",
      lengthLimit: 8,
      preformatter: clearNonNumbers
    },

    numbers: {
      preformatter: clearNonNumbers
    },

    characters: {
      preformatter: clearNonCharacters
    },

    capitalize: {
      formatterFunction: function(value){
        value = value.replace(/\b(\w)/g, function(m){
          return m.toUpperCase();
        });
        return value;
      }
    },

    creditCardNumber: {
      formatterFunction: function(value){
        var retValue = "";
        for (var i = 0; i < value.length; i ++){
          if (i == 4 || i == 8 || i == 12 || i == 16){
            retValue += " ";
          }
          retValue += value.charAt(i);
        }
        return retValue;
      },
      patternCharacters: " ",
      lengthLimit: 19,
      preformatter: clearNonNumbers
    },

    creditCardCVC: {
      preformatter: clearNonNumbers,
      lengthLimit: 3
    },

    creditCardDate: {
      formatterFunction: function(value){
        var retValue = "";
        for(var i = 0; i < value.length; i ++){
          if (i == 3){
            retValue += "/"
          }
          retValue += value.charAt(i);
        }
      },
      patternCharacters: "/",
      lengthLimit: 5,
      preformatter: clearNonNumbers
    },

    bankRoutingNumber: {
      preformatter: clearNonNumbers,
      lengthLimit: 9
    },

    bankAccountNumber: {
      preformatter: clearNonNumbers,
      lengthLimit: 17
    },

    oneWord: {
      formatterFunction: function(value){
        value = value.match(/(.)[^ ]*/)
        return value ? value[0] : ''
      }
    },
  }

  var clearNonNumbers = function(value){
    return value.replace(/\D+/g, '');
  }

  var clearNonCharacters = function(value){
    return value.replace(/[^a-z]/ig, '');
  }

  })(this);
