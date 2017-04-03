/*!
    ko-formatter - knockout input auto formatter
    Author: Matthew Nitschke
    License: MIT (http://www.opensource.org/licenses/mit-license.php)
    Version: 1.0.0
*/

ko.bindingHandlers.formatter = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
      var bindings = allBindings();
      var value;

      if (bindings.textInput){
        value = bindings.textInput;
      } else if (bindings.value){
        value = bindings.value;
      }

      var formatterObject = ko.unwrap(valueAccessor); 

      var format = function(){
        ko.bindingHandlers.formatter.format(element, value, formatterObject);
      }

      value.subscribe(format);
      format(); 

    },
    format: function(element, valueAccessor, formatterObject){
      var value = ko.unwrap(valueAccessor);

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

;(function(ns){
    var clearNonNumbers = function(value){
      return value.replace(/\D+/g, '');
    }

    var clearNonCharacters = function(value){
      return value.replace(/[^a-z]/ig, '');
    }

    ns.money = {
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
    }

    ns.state = {
      formatterFunction: function(value){
        return value.toUpperCase();
      },
      lengthLimit: 2,
      preforatter: clearNonCharacters
    }

    ns.date = {
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
    }

    ns.zip = {
      lengthLimit: 5,
      preformatter: clearNonCharacters
    }

    ns.ssn = {
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
    }

    ns.phone = {
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
    }

    ns.phoneNoAreaCode = {
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
    }

    ns.numbers = {
      preformatter: clearNonNumbers
    }

    ns.characters = {
      preformatter: clearNonCharacters
    }

    ns.capitalize = {
      formatterFunction: function(value){
        value = value.replace(/\b(\w)/g, function(m){
          return m.toUpperCase();
        });
        return value;
      }
    }

    ns.creditCardNumber = {
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
    }

    ns.creditCardCVC = {
      preformatter: clearNonNumbers,
      lengthLimit: 3
    }

    ns.creditCardDate = {
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
    }

    ns.bankRoutingNumber = {
      preformatter: clearNonNumbers,
      lengthLimit: 9
    }

    ns.bankAccountNumber = {
      preformatter: clearNonNumbers,
      lengthLimit: 17
    }

    ns.oneWord = {
      formatterFunction: function(value){
        value = value.match(/(.)[^ ]*/)
        return value ? value[0] : ''
      }
    }

}(this.Formatter = this.Formatter || {}));
