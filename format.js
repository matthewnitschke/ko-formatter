
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
    };

    ns.phone = "###-###-####";
    ns.date = "##/##/####";


}(this.KoFormatter = this.KoFormatter || {}));

(function() {
    ko.extenders.formatter = function(target, formatterObject) {
        function hasValue(value) {
            return !!(value);
        }

        if (typeof formatterObject === 'object') {

            target.format = function(value) {
                if (hasValue(value) || formatterObject.allowNull) {

                    if (value.length > formatterObject.lengthLimit) {
                        value = value.substring(0, formatterObject.lengthLimit);
                    }

                    if (formatterObject.preformatter != null) {
                        value = formatterObject.preformatter(value);
                    }

                    value = formatterObject.formatterFunction(value);

                }

                return {
                    value: value,
                    caretPos: null
                }
            }

        } else if (typeof formatterObject === 'string') {

            var wildcards = [{
                    wildcard: "#",
                    isValid: function(value) {
                        if (!isNaN(parseInt(value))) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                },
                {
                    wildcard: "@",
                    isValid: function(value) {
                        if (value.match(/[a-z]/i)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                },
                {
                    wildcard: "*",
                    isValid: function(value) {
                        return true; // * = everything
                    }
                }
            ]

            var formatPattern = function(value, pattern, caretPos) {
                if (value && value.length > 0 && pattern && pattern.length > 0) {
                    var caretPos = caretPos; // create a local 'global' variable of caret pos

                    var replace = function(remainingString, pattern) {
                        var index = pattern.search(getWildcardRegex()); // finds first wildcard in pattern
                        pattern = pattern.split('');
                        if (index > -1) { // if wildcards was actually found
                            for (var i = 0; i < wildcards.length; i++) {
                                if (wildcards[i].wildcard == pattern[index]) { // find correct wildcard in array
                                    if (wildcards[i].isValid(remainingString.charAt(0))) {
                                        pattern[index] = remainingString.charAt(0);
                                    } else {
                                        caretPos--; // because we are making the string shorter, we need to account for the caret pos
                                        if (remainingString.length === 1) {
                                            pattern[index] = "";
                                        }
                                    }
                                    remainingString = remainingString.substring(1, remainingString.length);
                                }
                            }

                            if (remainingString.length > 0) {
                                return replace(remainingString, pattern.join(''));
                            } else {
                                return pattern.splice(0, index + 1).join('');
                            }
                        }
                        return pattern.join('');
                    }

                    var stringFormatter = function(value, pattern) {
                        if (value) {
                            var characters = pattern.replace(getWildcardRegex(), ""); // removes all wild cards
                            value = value.replace(new RegExp("[" + characters + "]", 'gi'), ""); // removes all non wildcard characters in pattern
                            if (value) {
                                return replace(value, pattern);
                            }
                        }
                    }

                    function getNonWildcardBeforeIndex(index, value, pattern) {
                        var valueSub = value.substring(0, index);
                        var patternSub = pattern.substring(0, index);
                        var matchedValues = valueSub.match(getNonWildcardRegex(patternSub));
                        return matchedValues ? matchedValues.length : null;
                    }

                    function getNonWildcardRegex(pattern) {
                        var nuPattern = pattern.replace(getWildcardRegex(), '');
                        return new RegExp("[" + nuPattern + "]", 'gi');
                    }

                    function getWildcardRegex() {
                        var retValue = "";
                        for (var i = 0; i < wildcards.length; i++) {
                            retValue += wildcards[i].wildcard;
                        }
                        return new RegExp("[" + retValue + "]", 'gi');
                    }

                    var formattedValue = stringFormatter(value, pattern);

                    var nonWildcardsBeforeFormat = getNonWildcardBeforeIndex(caretPos, value, pattern);
                    var nonWildcardsAfterFormat = getNonWildcardBeforeIndex(caretPos, formattedValue, pattern);

                    var newCaretPos = caretPos + (nonWildcardsAfterFormat - nonWildcardsBeforeFormat);


                    return {
                        value: formattedValue,
                        caretPos: newCaretPos
                    }
                } else {
                    return {
                        value: ""
                    }
                }

            };

            target.format = function(value, element) {
                var pattern = formatterObject;

                return formatPattern(value, pattern, element.selectionStart)
            }

        }

    }


    ko.bindingHandlers.formatter = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
          valueAccessor.format = function()
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

            function setCaretPosition(ctrl, pos) {
                if (ctrl.setSelectionRange) {
                    ctrl.focus();
                    ctrl.setSelectionRange(pos, pos);
                } else if (ctrl.createTextRange) {
                    var range = ctrl.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', pos);
                    range.moveStart('character', pos);
                    range.select();
                }
            }

            var formatterFunction = allBindings().formatter.format;
            var value = ko.unwrap(valueAccessor());

            var formattedDataReturn = formatterFunction(value, element)

            valueAccessor()(formattedDataReturn.value);

            if (formattedDataReturn.caretPos) {
                setCaretPosition(element, caretPos);
            }

        }
    }


}());
