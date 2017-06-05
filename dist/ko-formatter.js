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
        return !isNaN(parseInt(value));
      }
    },
    {
      wildcard: "@",
      isValid: function(value){
        return value.match(/[a-z]/i);
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

        var formatterObject = valueAccessor(); 
        var format;
        if (typeof formatterObject === "string") {
          format = function(){
            ko.bindingHandlers.formatter.formatPattern(element, element.value, formatterObject);
          }
        } else {
          format = function(){
            ko.bindingHandlers.formatter.format(element, element.value, formatterObject);
          }
        }

        element.addEventListener("input", format);
        format(); 
      },
      formatPattern: function(element, value, pattern){
        var valueAccessor = value;
        value = ko.unwrap(value);

        if (value){
          var caretPos = element.selectionEnd;

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

          element.value = formattedValue;
          setTimeout(function(){
              setCaretPosition(element, newCaretPos);
          }, 0);
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

        var caretPos = element.selectionEnd;

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

        element.value = value;
        setTimeout(function(){
            setCaretPosition(element, caretPos);
        }, 0);

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
