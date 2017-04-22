/*!
    ko-formatter - knockout input auto formatter
    Author: Matthew Nitschke
    License: MIT (http://www.opensource.org/licenses/mit-license.php)
    Version: {{versionNumber}}
*/


(function(global, undefined) {

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

  var wildcards = [
    {
      wildcard: "#",
      isValid: function(value){
        if (!isNaN(parseInt(value))){
          return true;
        } else {
          return false;
        }
      }
    },
    {
      wildcard: "@",
      isValid: function(value){
        if (value.match(/[a-z]/i)){
          return true;
        } else {
          return false;
        }
      }
    },
    {
      wildcard: "*",
      isValid: function(value){
        return true; // * = everything
      }
    }
  ];

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

        var format;
        // get the correct formatter function, if string we are pattern formatting, if object, we are object formatting
        if (typeof formatterObject === "string"){
          format = function(){
            ko.bindingHandlers.formatter.formatPattern(element, value, formatterObject);
          }
        } else {
          format = function(){
            ko.bindingHandlers.formatter.format(element, value, formatterObject);
          }
        }

        value.subscribe(format);
        format(); // call format on initialization
      },
      formatPattern: function(element, value, pattern){
        var valueAccessor = value;
        value = ko.unwrap(value);

        if (value){
          var caretPos = element.selectionStart;

          var replace = function(remainingString, pattern) {
            var index = pattern.search(getWildcardRegex()); // finds first wildcard in pattern
            pattern = pattern.split('');
            if (index > -1){ // if wildcards was actually found
              for(var i = 0; i < wildcards.length; i ++){
                if (wildcards[i].wildcard == pattern[index]){ // find correct wildcard in array
                  if (wildcards[i].isValid(remainingString.charAt(0))){
                    pattern[index] = remainingString.charAt(0);
                  } else {
                    caretPos--; // because we are making the string shorter, we need to account for the caret pos
                    if (remainingString.length === 1){
                      pattern[index] = "";
                    }
                  }
                  remainingString = remainingString.substring(1, remainingString.length);
                }
              }

              if (remainingString.length > 0){
                return replace(remainingString, pattern.join(''));
              } else {
                return pattern.splice(0, index + 1).join('');
              }
            }
            return pattern.join('');
          }

          var stringFormatter = function(value, pattern){
            if (value){
              var characters = pattern.replace(getWildcardRegex(), ""); // removes all wild cards
              value = value.replace(new RegExp("[" + characters + "]", 'gi'), ""); // removes all non wildcard characters in pattern
              if (value){
                return replace(value, pattern);
              }
            }
          }

          function getNonWildcardBeforeIndex(index, value, pattern){
            var valueSub = value.substring(0, index);
            var patternSub = pattern.substring(0, index);
            var matchedValues = valueSub.match(getNonWildcardRegex(patternSub));
            return matchedValues ? matchedValues.length : null;
          }

          function getNonWildcardRegex(pattern){
            var nuPattern = pattern.replace(getWildcardRegex(), '');
            return new RegExp("[" + nuPattern + "]", 'gi');
          }

          function getWildcardRegex(){
            var retValue = "";
            for(var i = 0; i < wildcards.length; i ++){
              retValue += wildcards[i].wildcard;
            }
            return new RegExp("[" + retValue + "]", 'gi');
          }

          var formattedValue = stringFormatter(value, pattern);

          var nonWildcardsBeforeFormat = getNonWildcardBeforeIndex(caretPos, value, pattern);
          var nonWildcardsAfterFormat = getNonWildcardBeforeIndex(caretPos, formattedValue, pattern);

          var newCaretPos = caretPos + (nonWildcardsAfterFormat - nonWildcardsBeforeFormat);

          valueAccessor(formattedValue);
          setCaretPosition(element, newCaretPos);
        }

      },
      format: function(element, valueAccessor, formatterObject){
        var value = ko.unwrap(valueAccessor);

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

  var clearNonNumbers = function(value){
      return value.replace(/\D+/g, '');
  }
  var clearNonCharacters = function(value){
    return value.replace(/[^a-z]/ig, '');
  }
  ko.formatter = {

    date: "##/##/####",
    zip: "#####",
    ssn: "###-##-####",
    phone: "###-###-####",
    phoneNoAreaCode: "###-####",
    creditCardNumber: "#### #### #### ####",
    creditCardCVC: "###",
    creditCardDate: "##/##",
    bankRoutingNumber: "#########",
    bankAccountNumber: "#################",

    money: {
      formatterFunction: function (value) {
          value = value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

          // if cents exsist, only allow two digits after '.'
          var cents = value.match(/(\..{2})/);
          if (cents) {
              value = value.replace(/(\..{2}).+/g, cents[0]);
          }

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

    oneWord: {
      formatterFunction: function(value){
        value = value.match(/(.)[^ ]*/)
        return value ? value[0] : ''
      }
    },
  }

  })(this);
