/**
 * Quantity Calculator
 *
 * @author David Bodrogi <dbodrogi@sessiondigital.de>
 * */

;var _HDM_QuantityCalculator = (function($) {
    'use strict';

    var _quantityCalculatorInited = false,
        valRay = new Array(),
        hasAlert = false,
        isOnPDP = null,
        clickedOnUseQtyButton = false,
        $pdpQtyInput,
        $calculatorForm,
        $mainResultRow,
        $suggestedRowCan,
        $suggestedRowCartridge,
        $resultMain,
        $resultSuggestedCan,
        $resultSuggestedCartridge,
        $useQtyForProductButton;

    function initFormTabindex() {
        var maxTabindex = _HDM_Global.getMaxTabindex(),
            calculatorFormTabindex = maxTabindex + 1;

        $('.calculator-input-c').each(function(index, item) {
            $(item).attr('tabindex', calculatorFormTabindex++);
        });
        $('.calculator-input-u').each(function(index, item) {
            $(item).attr('tabindex', calculatorFormTabindex++);
        });

        $('#quantity-calculation-button').attr('tabindex', calculatorFormTabindex);
    }

    function isPDP() {
        if (isOnPDP == null) {
            $pdpQtyInput = $('#qty[data-container-type]');
            isOnPDP = $('body').hasClass('catalog-product-view') && $pdpQtyInput.length;
        }

        return Boolean(isOnPDP);
    }

    function showOrHideUseQtyButton(show) {
        if (!isPDP()) {
            return;
        }

        var preselectedContainerType = getPreselectedContainerType();

        if (!show) {
            $suggestedRowCan.find('.buttons-set').hide();
            $suggestedRowCartridge.find('.buttons-set').hide();

            return;
        }

        if (preselectedContainerType == 'can') {
            $suggestedRowCan.find('.buttons-set').css('display', 'inline-block');
        } else if (preselectedContainerType == 'cartridge') {
            $suggestedRowCartridge.find('.buttons-set').css('display', 'inline-block');
        }
    }

    function openPopupForm() {
        var preselectedContainerType = getPreselectedContainerType();
        clickedOnUseQtyButton = false;

        if (isPDP()) {
            if ($pdpQtyInput.data('container-type') == 'can') {
                $suggestedRowCan.show();
            } else if ($pdpQtyInput.data('container-type') == 'cartridge') {
                $suggestedRowCartridge.show();
            }

            $useQtyForProductButton.click(function() {
                $pdpQtyInput.val($(this).closest('.results-row').find('.result-field').html());
                clickedOnUseQtyButton = true;
                $('#cboxClose').click();
            });
        }

        if (preselectedContainerType == '') {
            $mainResultRow.show();
            $suggestedRowCan.show();
            $suggestedRowCartridge.show();
        } else if (preselectedContainerType == 'can') {
            $suggestedRowCan.show();
        } else if (preselectedContainerType == 'cartridge') {
            $suggestedRowCartridge.show();
        }
    }

    function completePopupForm() {
        if ($('#paper_type_c').length && $('#paper_type_c').prop('checked')) {
            $('#first-input-coated').focus();
        }
        if ($('#paper_type_u').length && $('#paper_type_u').prop('checked')) {
            $('#first-input-uncoated').focus();
        }
    }

    function closePopupForm() {
        clearInputs();
        resetResultFields();
        hideWarningBlock();
        hideResultRows();

        $calculatorForm.find('.coated-cell, .uncoated-cell').removeClass('highlighted');

        if (clickedOnUseQtyButton) {
            $pdpQtyInput.focus();
            _HDM_QuantityValidator.checkFormAndGetPrice($pdpQtyInput);
        }
    }

    function clearInputs() {
        $calculatorForm.find(':input[type=text]').val('');
    }

    function resetResultFields() {
        $resultMain.html('');
        $resultSuggestedCan.html('');
        $resultSuggestedCartridge.html('');
        showOrHideUseQtyButton(false);
    }

    function calculate() {
        var result = 0,
            noC = 1,
            noU = 1;

        valRay = new Array();
        hasAlert = false;
        resetResultFields();
        
        if (!checkEmptyColumns()) {
            hideWarningBlock();
            return false;
        }

        if ($('.coated-cell').hasClass('highlighted')) {
            noC = fillValArrayAndCheckErrors('calculator-input-c');
            if (hasAlert) {
                hideWarningBlock();
                return false;
            }
            if (noC == 0) {
                result = (valRay['Ccmbreit'] / 100) * (valRay['Ccmlang'] / 100) * (valRay['Cflaechendeckung'] / 100) * (valRay['Cauflagenhoehe'] * 1.4 / 1000);
                setResult(result);
            }
        } else if ($('.uncoated-cell').hasClass('highlighted')) {
            noU = fillValArrayAndCheckErrors('calculator-input-u');
            if (hasAlert) {
                hideWarningBlock();
                return false;
            }
            if (noU == 0) {
                result = (valRay['Ucmbreit'] / 100) * (valRay['Ucmlang'] / 100) * (valRay['Uflaechendeckung'] / 100) * (valRay['Uauflagenhoehe'] * 1.8 / 1000);
                setResult(result);
            }
        }

        if (noC && noU) {
            alert(Translator.translate('Please check your inputs again!'));
            hideWarningBlock();
        } else {
            showWarningBlock();
        }
    }

    function checkEmptyColumns() {
        var emptyC = false,
            emptyU = false;

        $('.calculator-input-c').each(function(index, item) {
            if ($.trim($(item).val()) == '') {
                emptyC = true;
            }
        });
        $('.calculator-input-u').each(function(index, item) {
            if ($.trim($(item).val()) == '') {
                emptyU = true;
            }
        });

        if ($('.coated-cell').hasClass('highlighted') && emptyC) {
            alert(Translator.translate("Please fill out the Coated column before clicking calculate button."));

            return false;
        } else if ($('.uncoated-cell').hasClass('highlighted') && emptyU) {
            alert(Translator.translate("Please fill out the Uncoated column before clicking calculate button."));

            return false;
        }

        if (emptyC && emptyU) {
            alert(Translator.translate("Please fill out at least one column before clicking calculate button."));

            return false;
        }

        return true;
    }

    function fillValArrayAndCheckErrors(className) {
        var $inputs = $('.' + className),
            error = 0;

        for (var i = 0; i < $inputs.length; i++) {
            var $currentInput = $($inputs[i]),
                currentVal = $currentInput.val().replace(/\s+|\%/g, ''),
                currentName = $currentInput.attr('name');

            if (testForIllegals($currentInput) == false) {
                valRay.length = 0;

                error = 1;
                return error;
            }

            if (currentVal) {
                valRay[currentName] = toNaturalNumbers(currentVal);
            }

            if (!currentVal) {
                error = 1;
            }
        }

        return error;
    }

    function toNaturalNumbers(val) {
        val = val.replace(/\,/g, 'comma');
        val = val.replace(/\./g, '');
        val = val.replace(/comma/, '.');

        return val;
    }
    
    function testForIllegals($item) {
        var valString = $item.val().toString();

        if ($item.val().match(/[^0-9\,\.\%]/)) {
            hasAlert = true;
            alert(Translator.translate('Please type only numbers, comma or dot!'));

            return false;
        }

        if (valString.match(/\.(\d\d?)$/)) {
            hasAlert = true;
            alert(Translator.translate('In %s please change dot to comma!').replace('%s', valString));

            return false;
        }

        if (valString.match(/^\d\d?\,/) && valString.length > 5) {
            hasAlert = true;
            alert(Translator.translate('In %s please change the first comma to dot!').replace('%s', valString));

            return false;
        }

        return true;
    }

    function toDecimals(val) {
        val = val.toString();
        val = val.replace(/\,/g, '');
        val = parseFloat(Math.round(parseInt(val * 1000) / 10) / 100).toString();
        val = val.replace(/\./, ',');

        if (val.match(/\,\d$/)) {
            val = val + '0';
        }
        if (val.match(/\d{4},\d\d/)) {
            var parts = val.split(','); //Wednesday, October 08, 2008
            var tPunkt = parts[0].length - 3;
            val = parts[0].substring(0, tPunkt) + parts[0].substring(tPunkt, 30) + ',' + parts[1];
        }
        
        return toZeros(val);
    }

    function toZeros(val) {
        val = val.toString();

        if (val.match(/\,\d\d/)) {
            return val;
        } else if (val.match(/\,\d$/)) {
            val += '0';
        } else {
            val += ',00';
        }
        
        return val;
    }

    function setResult(result) {
        result = toDecimals( Math.round(result * 100) / 100 );
        $resultMain.html(result);
        checkContainerTypeAndSuggestInkAmount(result);
    }

    function checkContainerTypeAndSuggestInkAmount(originalResult) {
        var preselectedContainerType = getPreselectedContainerType();

        originalResult = parseFloat(originalResult.replace(/\,/g, '.'));

        // 0.5 kg increments where 0, 0.5, 1.5 are not possible values
        if (preselectedContainerType == 'can' || preselectedContainerType == '') {
            var result = Math.ceil(originalResult * 2) / 2;
            
            if (result <= 1) {
                result = 1;
            } else if (result > 1 && result < 2) {
                result = 2;
            }

            $resultSuggestedCan.html(result.toString().replace(/\./g, ','));
            $suggestedRowCan.show();
        }
        // 2 kg increments where 0 is not possible value
        if (preselectedContainerType == 'cartridge' || preselectedContainerType == '') {
            var result = Math.ceil(originalResult);

            if (result <= 2) {
                result = 2;
            } else if (result % 2 != 0) {
                result++;
            }

            $resultSuggestedCartridge.html(result.toString().replace(/\./g, ','));
            $suggestedRowCartridge.show();
        }

        showOrHideUseQtyButton(true);
    }

    function getPreselectedContainerType() {
        var $preselectedContainerType = $('input[name="container_type"]:checked'),
            preselectedContainerTypeVal = '';

        if ($preselectedContainerType.length) {
            preselectedContainerTypeVal = $preselectedContainerType.val();
        }
        if (isPDP()) {
            preselectedContainerTypeVal = $pdpQtyInput.data('container-type');
        }

        return preselectedContainerTypeVal;
    }
    
    function showWarningBlock() {
        $('#calculator-warning').show();
        $.colorbox.resize();
    }

    function hideWarningBlock() {
        $('#calculator-warning').hide();
        $.colorbox.resize();
    }

    function hideResultRows() {
        $mainResultRow.hide();
        $suggestedRowCan.hide();
        $suggestedRowCartridge.hide();
    }

    return {
        /* Initialization scripts */
        init: function() {
            if (!_quantityCalculatorInited) {
                _HDM_QuantityCalculator.initPopupForm();

                _quantityCalculatorInited = true;
            }
        },
        initPopupForm: function() {
            $(document).ready(function() {
                $calculatorForm = $('#quantity-calculator-form');
                $resultMain = $('#main-result');
                $mainResultRow = $('#main-result-row');
                $suggestedRowCan = $('#suggested-row-can');
                $suggestedRowCartridge = $('#suggested-row-cartridge');
                $resultSuggestedCan = $('#result-suggested-can');
                $resultSuggestedCartridge = $('#result-suggested-cartridge');
                $useQtyForProductButton = $('.use-quantity-for-product');

                initFormTabindex();
                
                $('#show-quantity-calculator-form').colorbox({
                    title: false,
                    inline: true,
                    href: '#quantity-calculator-form',
                    scrolling: false,
                    hasFooter: true,
                    onOpen: openPopupForm,
                    onComplete: completePopupForm,
                    onClosed: closePopupForm
                });

                $('#quantity-calculation-button').click(function() {
                    calculate();
                });

                $('.calculator-input-c, .calculator-input-u').focus(function() {
                    var highlightClass = $(this).data('highlight');

                    if (!$('.' + highlightClass).hasClass('highlighted')) {
                        $('.' + highlightClass).addClass('highlighted');

                        if ($(this).is('.calculator-input-c')) {
                            $('.uncoated-cell').removeClass('highlighted');
                        } else {
                            $('.coated-cell').removeClass('highlighted');
                        }
                    }
                });
            });
        }
    }
})(jQuery);
