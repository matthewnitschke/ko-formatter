/*!
    ko-formatter - knockout input auto formatter
    Author: Matthew Nitschke
    License: MIT (http://www.opensource.org/licenses/mit-license.php)
    Version: 1.0.0
*/


(function(global, undefined) {

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
        return true; 
      }
    }
  ];

  ko.bindingHandlers.formatter = {
      init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var bindings = allBindings();
        var value;

        if (bindings.textInput){
          value = bindings.textInput;
        } else if (bindings.value){
          value = bindings.value;
        }

        var formatterObject = bindings.formatter; 

        var format;
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
        format(); 
      },
      formatPattern: function(element, value, pattern){
        var valueAccessor = value;
        value = ko.unwrap(value);

        if (value){
          var caretPos = element.selectionStart;

          var replace = function(remainingString, pattern) {
            var index = pattern.search(getWildcardRegex()); 
            pattern = pattern.split('');
            if (index > -1){ 
              for(var i = 0; i < wildcards.length; i ++){
                if (wildcards[i].wildcard == pattern[index]){ 
                  if (wildcards[i].isValid(remainingString.charAt(0))){
                    pattern[index] = remainingString.charAt(0);
                  } else {
                    caretPos--; 
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
              var characters = pattern.replace(getWildcardRegex(), ""); 
              value = value.replace(new RegExp("[" + characters + "]", 'gi'), ""); 
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

        function getPatternCharLength(value, caretPos){
          if (formatterObject.patternCharacters){
            var regexMatcher = new RegExp("[" + formatterObject.patternCharacters + "]", 'gi');
            var patternChars = value.substring(0, caretPos).match(regexMatcher);
            return patternChars ? patternChars.length : 0;
          } else {
            return 0;
          }
        }

        var caretPos = element.selectionStart;

        if (!!(value) || formatterObject.allowNull) {

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
        return value.replace(/[^0-9.]/g, ""); 
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
