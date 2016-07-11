/**
 * Functions related to the sticky toolbar.
 *
 * @author David Bodrogi <dbodrogi@sessiondigital.de>
 * */

var _HDM_StickyToolbar = (function($) {
    'use strict';

    var _stickyToolbarInited = false,
        _activeClass = 'active',
        _disabledClass = 'disabled',
        _maxSizeToHideToolbar = 960;

    return {
        /* Initialization scripts */
        init: function() {
            if (!_stickyToolbarInited) {
                _HDM_StickyToolbar.initClickOnItems();
                _HDM_StickyToolbar.hideBelowSize(_maxSizeToHideToolbar);

                _stickyToolbarInited = true;
            }
        },
        initClickOnItems: function() {
            $(document).ready(function() {
                var $stickyToolbar = $('#sticky_toolbar');

                $stickyToolbar.on('click', ".sticky-toolbar-item-button:not('.quantity-calculator'):not('.hdassistant')", function() {
                    if ($(this).hasClass(_activeClass)) {
                        $(this).removeClass(_activeClass)
                        return false;
                    }

                    $(document).trigger('click');
                    if (!$(this).hasClass(_disabledClass)) {
                        $(this).toggleClass(_activeClass);
                    }

                    return false;
                });
                $stickyToolbar.on('click', '.sticky-toolbar-item-content', function(event) {
                    event.stopPropagation();
                });

                $(document).click(function() {
                    $stickyToolbar.find('.sticky-toolbar-item-button').removeClass(_activeClass);
                });
            });
        },
        hideBelowSize: function(maxSize) {
            $(document).ready(function() {
                $(window).resize(function() {
                    var $stickyToolbar = $('#sticky_toolbar');

                    if ($(window).width() < maxSize) {
                        $stickyToolbar.hide();
                    } else {
                        $stickyToolbar.show();
                    }
                }).resize();
            });
        }
    }
})(jQuery);

// Calling the initialization sequence
_HDM_StickyToolbar.init();
