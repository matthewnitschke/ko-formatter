
;(function(ns){
    var clearNonNumbers = function(value){
      return value.replace(/\D+/g, '');
    }

    var clearNonCharacters = function(value){
      return value.replace(/\W+/g, '');
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
        return value.replace(/[^0-9.]/g, ""); // remove everything but numbers and decimal points
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
          if (i == 0){
            retValue += "(";
          } else if (i == 3){
            retValue += ")";
          } else if (i == 6){
            retValue += "-";
          }

          retValue += value.charAt(i);

        }
        return retValue;
      },
      patternCharacters: "() -",
      lengthLimit: 13,
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

}(this.Formatter = this.Formatter || {}));


ko.bindingHandlers.formatter = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
      var bindings = allBindings();
      var value;

      if (bindings.textInput){
        value = bindings.textInput;
      } else if (bindings.value){
        value = bindings.value;
      }

      var formatterObject = valueAccessor();

      var format = function(){
        ko.bindingHandlers.formatter.format(element, value, formatterObject);
      }

      value.subscribe(format);
      format(value); // initially call format

    },
    format: function(element, valueAccessor, formatterObject){
      var value = ko.unwrap(valueAccessor);

      function hasValue(value) {
          return !!(value);
      }

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

      var caretPos = element.selectionStart;

      if (hasValue(value) || formatterObject.allowNull) {
        if (value.length > formatterObject.lengthLimit) {
          value = value.substring(0, formatterObject.lengthLimit);
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

        if (formatterObject.formatterFunction){
          var patternCharsBeforeFormat = getPatternCharLength(value, caretPos);

          if (formatterObject.preformatter != null) {
            value = formatterObject.preformatter(value);
          }

          value = formatterObject.formatterFunction(value);

          var patternCharsAfterFormat = getPatternCharLength(value, caretPos);

          caretPos = caretPos + (patternCharsAfterFormat - patternCharsBeforeFormat);

        }
      }

      valueAccessor(value);
      setCaretPosition(element, caretPos);


    }
}
