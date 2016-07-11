/**
 * Functions related to the color manager.
 *
 * @author David Bodrogi <dbodrogi@sessiondigital.de>
 **/

;var _HDM_ColorManager = (function($) {
    'use strict';

    var $form,
        $colorNumberInput,
        $searchButton,
        $noResultBlock,
        $tooManyResultsBlock,
        $tooManyResultsBlockBottom,
        $resultBlock,
        $colormanagerRequiredLabel,
        $accordionTitles,
        $filterInputs,
        $disabledFilterInputs,
        dataForm,
        steps,
        hdmPriceUpdaterOptions,
        $nextStepItem = '',
        actualStep = 0,
        maxStep = 4,
        showResult = false;

    function resetRefirements() {
        $noResultBlock.hide();
        $tooManyResultsBlock.hide();
        $tooManyResultsBlockBottom.hide();
        $resultBlock.html('').hide();

        actualStep = 0;

        $.each(steps, function(index, item) {
            steps[index].next('.colormanager__filter-step')
                .find('.colormanager__input').prop('checked', false).prop('disabled', false)
                .end()
                .find('.validation-advice').remove()
                .end().end().removeClass('open visible');
        });
        $('.colormanager__filter-step').find('label').removeClass('disabled');
    }

    function checkResult(resp) {
        if (resp.count == 0) {
            $tooManyResultsBlock.hide();
            $tooManyResultsBlockBottom.hide();
            $noResultBlock.show();
            $colormanagerRequiredLabel.hide();

            return;
        } else if (resp.count > 1) {
            $tooManyResultsBlock.show();

            if (showResult) {
                $tooManyResultsBlock.hide();
                $tooManyResultsBlockBottom.show();
                return;
            }
        }

        if (resp.count == 1 && showResult) {
            displayProduct(resp.product_html);
            
            return;
        }

        $colormanagerRequiredLabel.show();
        if (resp.has_temperature_variant == 1) {
            $('.accordion-title').addClass('visible');
            gotoStep(0);
        } else {
            $('.accordion-title:not(#colormanager__filter-step--temp)').addClass('visible');
            gotoStep(1);
        }
    }

    function gotoStep(stepNum) {
        if (stepNum <= maxStep) {
            var $nextFormItem = steps[stepNum],
                $nextStep = $nextFormItem.next('.colormanager__filter-step'),
                $currentStep = steps[actualStep];

            actualStep = stepNum;
            $accordionTitles.removeClass('open');
            $nextFormItem.addClass('open');
            $nextStepItem = '';
        }
    }

    function displayProduct(productHtml) {
        $tooManyResultsBlock.hide();
        $tooManyResultsBlockBottom.hide();
        $noResultBlock.hide();
        $resultBlock.html(productHtml).show();

        // add to cart via ajax
        $('.add-to-cart-form').hdmAddToCart();

        // add to shopping list via ajax
        _HDM_Wishlist.initAddToWishlist();

        // update prices via ajax
        var hdmPriceUpdater = new HdmPriceUpdater(hdmPriceUpdaterOptions);
        hdmPriceUpdater.fetchPrices();

        _HDM_QuantityValidator.initInputs();
    }

    function sendPost(resetRefirementsForm) {
        var formData = $form.serialize();

        if (resetRefirementsForm) {
            formData = $colorNumberInput.attr('name') + '=' + $colorNumberInput.val();
        }

        $noResultBlock.hide();
        $resultBlock.html('');
        disableInputs();

        $.ajax({
            url: $form.attr('action'),
            type: 'POST',
            dataType: 'json',
            data: formData,
            success: function(resp) {
                if (resetRefirementsForm) {
                    resetRefirements();
                }

                if ($nextStepItem !== '' && $nextStepItem.hasClass('required')) {
                    var nextStepNum = $nextStepItem.closest('.colormanager__filter-step').prev('.accordion-title').data('step');
                    nextStepNum++;
                    gotoStep(nextStepNum);
                }
                checkResult(resp);
            },
            complete: function() {
                enableInputs();
            }
        });
    }

    function initAccordion() {
        $accordionTitles.click(function() {
            var $this = $(this);

            if (!$this.hasClass('open')) {
                gotoStep($this.data('step'));
            }
        });
    }

    function disableInputs() {
        $disabledFilterInputs = [];
        $colorNumberInput.prop('disabled', true).addClass('disabled');
        $searchButton.prop('disabled', true).addClass('disabled');

        $filterInputs.each(function(index, item) {
            if ($(item).prop('disabled')) {
                $disabledFilterInputs.push($(item).attr('id'));
            }
            $(item).prop('disabled', true);
            $('label[for=' + $(item).attr('id') + ']').addClass('disabled');
        });
    }

    function enableInputs() {
        $colorNumberInput.prop('disabled', false).removeClass('disabled');
        $searchButton.prop('disabled', false).removeClass('disabled');

        $filterInputs.each(function(index, item) {
            if ($.inArray($(item).attr('id'), $disabledFilterInputs) == -1) {
                $(item).prop('disabled', false);
                $('label[for=' + $(item).attr('id') + ']').removeClass('disabled');
            }
        });
        $disabledFilterInputs = [];
    }

    return {
        initSearchForm: function(formId, priceUpdaterOptions) {
            $form = $('#' + formId);
            $colorNumberInput = $('#color_number');
            $filterInputs = $form.find('.colormanager__input');
            $searchButton = $('#colormanager__filter-btn--search');
            $noResultBlock = $('#colormanager__no-result');
            $tooManyResultsBlock = $('#colormanager__too-many-results');
            $tooManyResultsBlockBottom = $('#colormanager__too-many-results--bottom');
            $resultBlock = $('#colormanager__result');
            $colormanagerRequiredLabel = $('#colormanager-required-label');
            $accordionTitles = $('.accordion-title');
            dataForm = new VarienForm(formId);
            steps = new Array(
                $('#colormanager__filter-step--temp'),
                $('#colormanager__filter-step--coating'),
                $('#colormanager__filter-step--method'),
                $('#colormanager__filter-step--paper'),
                $('#colormanager__filter-step--container')
            );
            hdmPriceUpdaterOptions = priceUpdaterOptions;

            initAccordion();

            $searchButton.click(function() {
                if (!dataForm.validator.validate()) {
                    return;
                }

                showResult = false;
                sendPost(true);
            });

            $form.submit(function(event) {
                event.preventDefault();
                $searchButton.trigger('click');
            });

            $filterInputs.click(function() {
                if (!dataForm.validator.validate()) {
                    return;
                }

                if ($(this).hasClass('disable-combination')) {
                    var isDisabled = false,
                        cominationInputIds = $(this).data('combination').split(',');

                    if ($(this).prop('checked')) {
                        isDisabled = true;
                    }

                    $.each(cominationInputIds, function(index, cominationInput) {
                        var $cominationInput = $(cominationInput),
                            $itemLabel = $('label[for=' + $cominationInput.attr('id') + ']');

                        $cominationInput.prop('disabled', isDisabled);
                        if (isDisabled) {
                            $cominationInput.prop('checked', false);
                        }
                        $itemLabel.toggleClass('disabled', isDisabled);
                    });
                    if ($(this).data('checkinstead') && $(this).prop('checked')) {
                        $($(this).data('checkinstead')).prop('checked', true);
                    }
                }

                $nextStepItem = $(this);

                showResult = true;
                sendPost();
            });
        }
    }
})(jQuery);
