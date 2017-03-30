
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
      allowNull: false,
      preformatter: function(value){
        return value.replace(/[^0-9.]/g, ""); // remove everything but numbers and periods
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
            retValue += ") ";
          } else if (i == 6){
            retValue += "-";
          }

          retValue += value.charAt(i);

        }
        return retValue;
      },
      lengthLimit: 14,
      preformatter: clearNonNumbers
    }

}(this.KoFormatter = this.KoFormatter || {}));


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

      if (hasValue(value) || formatterObject.allowNull) {
        if (value.length > formatterObject.lengthLimit) {
          value = value.substring(0, formatterObject.lengthLimit);
        }

        if (formatterObject.preformatter != null) {
          value = formatterObject.preformatter(value);
        }

        if (formatterObject.formatterFunction){
          var charCounter = {
            recurrences: [],
            inc: function(index){
              this.recurrences.push(index);
            }
          }
          value = formatterObject.formatterFunction(value, charCounter);

          var caretPos = element.selectionStart;
          var addedChars = charCounter.recurrences;


        }

      }

        valueAccessor(value);
    }
}
