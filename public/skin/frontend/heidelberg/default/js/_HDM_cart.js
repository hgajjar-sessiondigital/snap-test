/**
 * Functions related to the shopping cart.
 *
 * @author David Bodrogi <dbodrogi@sessiondigital.de>
 * @author Zsolt Molnar <zmolnar@sessiondigital.de>
 * */
var _HDM_Cart = (function($) {
    'use strict';

    var $_cartTable = '',
        _shoppingCartInited = false,
        _lastInRowClass = 'last-in-row',
        _activeReferenceClass = 'active',
        _disabledReferenceClass = 'disabled',
        _lastRowClass = 'last-row';

    function _getCartTable() {
        if (!$_cartTable) {
            $_cartTable = $('.cart-table');
        }

        return $_cartTable;
    }
    function _addLastClassOnLastRowInTable() {
        $('#shopping-cart-totals-table, .shopping-cart-totals-table').find('tbody tr:last-child:not(.subtotal)').addClass(_lastRowClass);
    }

    return {
        /* Initialization scripts */
        init: function() {
            var $cartTable = _getCartTable();

            if ($cartTable.length && !_shoppingCartInited) {
                _HDM_Cart.initItemOptions();
                _HDM_Cart.showAddReference();
                _HDM_Cart.addLastClassOnLastRowInTableAndTotals();
                _HDM_Cart.initCrosssellBox();

                _shoppingCartInited = true;
            }

            _HDM_FullpageAjaxLoader.init();
        },
        updateCartThenGoTo: function(redirectUrl) {
            $('#updatePostRedirectUrl').val(redirectUrl);
            _HDM_Cart.appendAdditionalInfo($('.btn-update'));
            return;
        },
        useSuccessorProduct: function(baseUrl, discontinuedId, successorId) {

            discontinuedId = parseInt(discontinuedId);
            successorId = parseInt(successorId);
            var successorQty = parseInt(jQuery('#successor_qty_successor_id_' + successorId).val());

            if (successorId > 0 && discontinuedId > 0 && successorQty > 0) {

                var postData = {
                    'discontinuedId': discontinuedId,
                    'successorId':    successorId,
                    'qty':            successorQty
                };

                jQuery.redirect(baseUrl, postData);
            }

            return;
        },
        initItemOptions: function() {
            $(document).ready(function() {
                var $cartTable = _getCartTable(),
                    $ddLastInRow = $cartTable.find('.item-options').find('dd:nth-of-type(2n+2)');

                $ddLastInRow.prev('dt').addClass(_lastInRowClass);
                $ddLastInRow.addClass(_lastInRowClass);
            });
        },
        showAddReference: function() {
            $(document).ready(function() {
                $('.add-reference').click(function() {
                    var $referenceContainer = $(this).closest('.reference-container');

                    if (!$(this).hasClass(_disabledReferenceClass) && !$referenceContainer.hasClass(_activeReferenceClass)) {
                        $referenceContainer.addClass(_activeReferenceClass);
                    }

                    return false;
                });
            });
            this.updateReferenceInputTooltip();
        },
        addLastClassOnLastRowInTableAndTotals: function() {
            $(document).ready(function() {
                var $cartTable = _getCartTable();

                $cartTable.find('.cart-table-content .row:last-child').addClass(_lastRowClass);
                _addLastClassOnLastRowInTable();
            });
        },
        equalizeReviewOrderDetailsColumns: function() {
            $(document).ready(function () {
                var $reviewOrderDetailsTable = $('.review-order-details');

                if ($reviewOrderDetailsTable.length) {
                    $reviewOrderDetailsTable.find('.col').height($reviewOrderDetailsTable.height() + 10);
                }

                _addLastClassOnLastRowInTable();
            });
        },
        initCrosssellBox: function() {
            $(document).ready(function() {
                $('.box-crosssell .box-content').slick({
                    speed: 500,
                    slidesToShow: 4,
                    slidesToScroll: 2,
                    arrows: true,
                    infinite: false,
                    dots: false
                });
            });
        },
        // add textarea's value from the bottom of the page into a hidden input in order the post contains that
        appendAdditionalInfo: function(button) {
            $('#checkout-additional-information-holder').val($('#checkout-additional-information-textarea').val());
            if ($(button).length) {
                $(button).closest('form').submit();
            }
        },
        updateHeaderButtonCartQty: function(qty) {
            $('#header-cart-items-count').html(qty);
        },
        updateReferenceInputTooltip: function() {
            $(document).ready(function() {
                $('input.reference').keyup(function() {
                    var actualVal = $.trim($(this).val());

                    if (!actualVal.length) {
                        actualVal = $(this).data('title');
                    }
                    $(this).attr('title', actualVal);
                });
            });
        }
    }
})(jQuery);

var _HDM_FullpageAjaxLoader = (function($) {
    'use strict';

    var _elementSelector = '#loading_animation',
        _bgSelector= '.loading-animation-bg',
        _boxSelector= '.loading-animation-box-wrapper',
        _isShown = false;

    var reposition = function () {
        if (_isShown) {
            var windowHeight = $(window).height(),
                documentHeight = $(document).height(),
                boxHeight = $(_boxSelector).height();
            $(_boxSelector).css('top', (windowHeight - boxHeight) / 2);
            $(_bgSelector).css('height', documentHeight);
        }
    }

    return {
        init: function() {
            $(window).on('resize', function(){reposition()});
            window.onbeforeunload = function() {
                if (_isShown) {
                    return Translator.translate("Your final price is currently being calculated.");
                }
            }
        },
        show: function() {
            _isShown = true;
            $(_elementSelector).show();
            reposition();
        },
        hide: function() {
            _isShown = false;
            $(_elementSelector).hide();
        }
    }
})(jQuery);