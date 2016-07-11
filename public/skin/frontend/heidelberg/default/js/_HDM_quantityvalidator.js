/**
 * Functions related to the ink quantity validation.
 *
 * @author David Bodrogi <dbodrogi@sessiondigital.de>
 **/

;var _HDM_QuantityValidator = (function($) {
    'use strict';

    var _quantityValidatorInited = false,
        decimalValidationClass = 'validate-decimal-number',
        qtyValidationClass = 'validate-ink-qty',
        validationFailedClass = 'validation-failed',
        invalidNumberValidationText = '',
        invalidQtyValidationText = '',
        formValidators = [],
        decimalSeparator = '',
        decimalSeparatorKeyCode = '',
        timeout = '',
        timeoutDelay = 500;

    function checkValidQty(inputVal, $item) {
        var predefinedQtys = $item.data('container-capacity'),
            isValid = false,
            sums,
            minVal;
        
        inputVal = inputVal.replace(',', '.');

        if (!predefinedQtys || !isValidDecimal(inputVal)) {
            return true;
        }
        predefinedQtys = parseContainerArrayToFloat(predefinedQtys);
        inputVal = parseFloat(inputVal);
        minVal = Math.min.apply(Math, predefinedQtys);
        
        do {
            isValid = findQty(inputVal, predefinedQtys);
            if (!isValid) {
                inputVal -= minVal;
            }
        } while (!isValid && inputVal >= minVal);

        return isValid;
    }

    function findQty(inputVal, predefinedQtys) {
        var sums = [],
            found = false;

        for (var i = 0; i < predefinedQtys.length; i++) {
            for (var j = 0; j < predefinedQtys.length; j++) {
                if (i < j) {
                    sums.push(predefinedQtys[i] + predefinedQtys[j]);
                }
            }
        }

        sums = predefinedQtys.concat(sums);

        for (var i = 0; i < sums.length; i++) {
            var divide = inputVal / sums[i];

            if (parseInt(divide) == divide) {
                found = true;
                break;
            }
        }

        return found;
    }

    function parseContainerArrayToFloat(predefinedQtys) {
        var tempArray = [];

        for (var i = 0; i < predefinedQtys.length; i++) {
            tempArray.push(parseFloat(predefinedQtys[i]));
        }

        return tempArray.sort(function(a, b) {
            return a - b;
        });
    }

    function isValidDecimal(inputVal) {
        inputVal = inputVal.replace(',', '.').toString();

        if (Validation.get('IsEmpty').test(inputVal) || !/^\d+(\.\d+)?$/.test(inputVal)) {
            return false;
        }

        return true;
    }

    function getPrice($item) {
        var productId = $item.closest('.product-addto-panel').find('.product-price-wrapper').attr('product-id'),
            productQty = $item.val();

        $item.prop('disabled', true);

        $.ajax({
            url: BASE_URL + 'color-ink-product-search/price',
            type: 'POST',
            dataType: 'json',
            data: {
                'product_id': productId,
                'qty': productQty
            },
            success: function(resp) {
                if (resp[productId].price) {
                    $('.product-price-wrapper[product-id=' + productId + ']').html(resp[productId].price);
                }
                if (resp[productId].tier_price) {
                    $('.product-tierprice-wrapper-' + productId).html(resp[productId].tier_price);
                }
            },
            complete: function() {
                $item.prop('disabled', false).focus();
            }
        });
    }

    return {
        init: function() {
            if (!_quantityValidatorInited) {
                _HDM_QuantityValidator.initInputs();

                _quantityValidatorInited = true;
            }
        },
        initInputs: function() {
            $(document).ready(function() {
                var $inputs = $('input[data-container-capacity]');
                if (! $inputs.length) {
                    return;
                }

                formValidators = [];
                invalidNumberValidationText = Translator.translate('Please enter a valid number in this field.');
                invalidQtyValidationText = Translator.translate('%s is available for purchase in increments of %s');

                decimalSeparator = LOCALE_SYMBOL_DECIMAL;
                if (decimalSeparator == ',') {
                    decimalSeparatorKeyCode = 188;
                } else if (decimalSeparator == '.') {
                    decimalSeparatorKeyCode = 190;
                }

                $inputs
                    .removeClass('qty-input validate-number')
                    .addClass(decimalValidationClass).addClass(qtyValidationClass)
                    .unbind('keypress') // remove keypress binding in _HDM_global.js
                    .keydown(function(event) {
                        var $this = $(this),
                            keyCode = event.keyCode,
                            goodToGo = false,
                            inputVal = $.trim($this.val()).replace(',', '.'),
                            numpadCodeToCharCode = keyCode - 48;

                        // use not able to enter more than 1 decimal separator
                        if (keyCode == decimalSeparatorKeyCode && (
                            inputVal == '' || /^\d+(\.){1}$/.test(inputVal) || inputVal.indexOf('.') > -1))
                        {
                            return false;
                        }

                        // backspace, end, home, left, up, right, down, del and decimal separator
                        if ($.inArray(keyCode, [8, 35, 36, 37, 38, 39, 40, 46, decimalSeparatorKeyCode]) > -1) {
                            goodToGo = true;
                        }

                        // space or anything else except numbers
                        if (!goodToGo && (keyCode == 32 || (isNaN(String.fromCharCode(keyCode)) && isNaN(String.fromCharCode(numpadCodeToCharCode))))) {
                            return false;
                        }

                        if ($.inArray(keyCode, [35, 36, 37, 38, 39, 40]) == -1) {
                            _HDM_QuantityValidator.checkFormAndGetPrice($this);
                        }
                    }).each(function(index, item) {
                        var $item = $(item),
                            predefinedQtys = $item.data('container-capacity'),
                            itemId = $item.attr('id') ? $item.attr('id') : $item.attr('name'),
                            validationContainerId = 'advice-' + qtyValidationClass + '-' + itemId;

                        if (predefinedQtys && !document.getElementById(validationContainerId)) {
                            var currentValidationText = invalidQtyValidationText.replace('%s', $item.data('productname')).replace('%s', '<' + predefinedQtys.join(', ') + '>');

                            $('<div />')
                                .addClass('validation-advice')
                                .attr('id', validationContainerId)
                                .html(currentValidationText)
                                .css({opacity: 0, display: 'none'})
                                .insertAfter($item);
                        }
                    });

                if (decimalSeparator == ',') {
                    $inputs.each(function(index, item) {
                        $(item).val($(item).val().replace('.', ','));
                    });
                }

                Validation.add(
                    decimalValidationClass,
                    invalidNumberValidationText,
                    function(inputVal) {
                        return isValidDecimal(inputVal);
                    }
                );
                Validation.add(
                    qtyValidationClass,
                    invalidQtyValidationText,
                    function(inputVal, item) {
                        return checkValidQty(inputVal, $(item));
                    }
                );
            });
        },
        checkFormAndGetPrice: function($item) {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(function() {
                var formValidator,
                    formId = $item.closest('form').attr('id');

                if (!formValidators[formId]) {
                    formValidators[formId] = new VarienForm(formId);
                }
                formValidator = formValidators[formId];

                if (formValidator.validator.validate() && $item.data('price-update') == 1) {
                    getPrice($item);
                }
            }, timeoutDelay);
        }
    }
})(jQuery);

// Calling the initialization sequence
_HDM_QuantityValidator.init();
