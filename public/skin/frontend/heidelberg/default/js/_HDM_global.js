/**
 * Global functions.
 *
 * @author David Bodrogi <dbodrogi@sessiondigital.de>
 * */

var _HDM_Global = (function($, Modernizr) {
    'use strict';

    var _isInited = false,
        _lastClass = 'last',
        _maxTabindex = 1;

    return {
        /* Initialization scripts */
        init: function() {
            if (!_isInited) {

                Detectizr.detect({detectScreen:false});

                _HDM_Global.initNotifications();
                _HDM_Global.initTabindexesOnForms();
                _HDM_Global.initQtyInput();
                _HDM_Global.initTooltipster();
                
                _isInited = true;
            }
        },
        initNotifications: function() {
            $(document).ready(function() {
                var $globalMessageItems = $('.global-messages-wrapper').find('.messages > li'),
                    $messagesContainer = $('ul.messages'),
                    $messageItems = $messagesContainer.find('> li');

                $globalMessageItems.last().addClass(_lastClass);

                $messageItems.click(function() {
                    $(this).fadeOut('slow', function() {
                        $(this).remove();
                        if (!$messagesContainer.find('> li').length) {
                            $messagesContainer.remove();
                        }
                    });
                });
            });
        },
        initTabindexesOnForms: function() {
            $(document).ready(function() {
                var tabIndex = 1;
                $('form:not(".skip-js-tabindex")').each(function() {
                    $(this).find('input, select, textarea, button').each(function() {
                        if (this.type != 'hidden' && $(this).css('display') != 'none') {
                            $(this).attr('tabindex', tabIndex);
                            tabIndex++;
                        }
                    });
                });
                _maxTabindex = tabIndex;
            });
        },
        dismissCookie: function(cookieName, cookieValue, cookieExpiry, cookieDomain) {
            var $betPhaseBanner = $('#beta-phase-banner');

            $.cookie(cookieName, cookieValue, { expires: cookieExpiry, domain: cookieDomain, path: '/' });
            if ($betPhaseBanner.length) {
                $betPhaseBanner.show();
            }
            $('#notice-cookie-block').hide();
        },
        initQtyInput: function() {
            $(document).ready(function() {
                $('input.qty-input').keypress(function(event) {
                    var keyCode = event.keyCode ? event.keyCode : event.which;
                    
                    // backspace, end, home, left, up, right, down, del
                    if ($.inArray(keyCode, [8, 35, 36, 37, 38, 39, 40, 44, 46]) > -1) {
                        return true;
                    }
                    // space or anything else except numbers
                    if (keyCode == 32 || isNaN(String.fromCharCode(keyCode))) {
                        return false;
                    }
                });
            });
        },
        initTooltipster: function() {
            $(document).ready(function() {
                $('.tooltip').tooltipster({
                    trigger: Modernizr.touch ? 'click' : 'hover',
                    arrowColor: '#ddd'
                });
            });
        },
        getMaxTabindex: function() {
            return _maxTabindex;
        }
    }
})(jQuery, Modernizr);

_HDM_Global.init();
