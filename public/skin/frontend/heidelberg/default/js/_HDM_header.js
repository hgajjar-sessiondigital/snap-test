/**
 * Functions related to the header.
 *
 * @author David Bodrogi <dbodrogi@sessiondigital.de>
 * */

var _HDM_Header = (function($, Modernizr) {
    'use strict';

    var _headerInited = false,
        _switcherMenuOpenedClass = 'opened',
        _dropDownMenuShownClass = 'shown-sub',
        _searchInputActiveClass = 'active',
        _clickedClass = 'clicked',
        _buttonActiveClass = 'active',
        _customerNavigationOpenClass = 'open',
        _lastClass = 'last',
        _myAccountButtonHoverTriggered = false,
        _blurTimeout = 250,
        _blurTimer = null,
        _headerMyAccountButton,
        _headerCustomerNavigation;

    function _setMouseLeaveTimer() {
        if (_myAccountButtonHoverTriggered) {
            _blurTimer = setTimeout(
                _resetHeaderCustomerNavigation,
                _blurTimeout
            );
        }
    }
    function _resetHeaderCustomerNavigation() {
        _headerMyAccountButton.data(_clickedClass, false).removeClass(_buttonActiveClass);
        _headerCustomerNavigation.removeClass(_customerNavigationOpenClass);
        _myAccountButtonHoverTriggered = false;
    }

    return {
        /* Initialization scripts */
        init: function() {
            if (!_headerInited) {
                _HDM_Header.bindSwitcherMenuClick();
                _HDM_Header.navigationDropDown();
                _HDM_Header.initSearchInput();
                _HDM_Header.initHeaderCustomerNavigation();
                _HDM_Header.initSecondaryBreadcrumbs();

                _headerInited = true;
            }
        },

        /**
         * Binds click event on Country and Language switchers in the header.
         * If user clicks on the label, the switcher menu opens, if user clicks outside, it closes.
         * */
        bindSwitcherMenuClick: function() {
            $(window).load(function() {
                $('.switcher').on('click', 'label', function(event) {
                    event.stopPropagation();
                    if (!$(this).parent().hasClass(_switcherMenuOpenedClass)) {
                        $('.switcher').removeClass(_switcherMenuOpenedClass);
                    }
                    $(this).parent().toggleClass(_switcherMenuOpenedClass);
                });
                $('.switcher').on('click', '.switcher-menu', function(event) {
                    event.stopPropagation();
                });
                $(document).click(function() {
                    $('.switcher').removeClass(_switcherMenuOpenedClass);
                });
            });
        },
        navigationDropDown: function() {
            $(document).ready(function() {
                var $nav = $('#nav'),
                    $dropDown = $nav.find('ul.dropdown'),
                    $topMainMenuItems = $nav.find('a.level-top.has-submenu');

                $dropDown.find('li.level1:nth-of-type(5n+1)').addClass('clear');

                // handle touch event on menu items with dropdown
                if (Modernizr.touch) {
                    $dropDown.prepend('<li class="close-item"><a href="javascript:;"></a></li>');
                    $dropDown.find('.close-item').on('click', 'a', function() {
                        $(this).closest('ul.dropdown').removeClass(_dropDownMenuShownClass);
                        $topMainMenuItems.removeClass('touch-activated').removeClass('over');
                        $topMainMenuItems.parent().removeClass('over');
                    });
                    $topMainMenuItems.on('click touch', function(event) {
                        if (!$(this).parent().is('.top-cat')) {
                            if (!$(this).hasClass('touch-activated')) {
                                event.preventDefault();
                                $topMainMenuItems.removeClass('touch-activated');
                                $(this).addClass('touch-activated');
                            }
                        }
                    });

                    $topMainMenuItems.each(function(index, item) {
                        var $linkItem = $(item).clone(true).removeClass(),
                            $topCatLi = $('<li />').addClass('top-cat').append($linkItem);

                        $(item).next('.dropdown').prepend($topCatLi);
                    });
                }
            });
        },
        initSearchInput: function() {
            $(document).ready(function() {
                $('#search').focus(function() {
                    $(this).closest('.input-container').addClass(_searchInputActiveClass);
                }).blur(function() {
                    $(this).closest('.input-container').removeClass(_searchInputActiveClass);
                });
            });
        },
        initHeaderCustomerNavigation: function() {
            $(document).ready(function() {
                _headerMyAccountButton = $('.header-panel').find('a.my-account');
                _headerCustomerNavigation = $('#header-customer-account-navigation');

                if (!Modernizr.touch) {
                    if (!_headerCustomerNavigation.length) {
                        return;
                    }

                    _headerCustomerNavigation.click(function(event) {
                        event.stopPropagation();
                    });

                    
                    var $headerLogo = $('.header').find('a.logo');

                    _headerMyAccountButton.mouseenter(function() {
                        clearTimeout(_blurTimer);
                        if (!_myAccountButtonHoverTriggered) {
                            _myAccountButtonHoverTriggered = true;
                            _headerMyAccountButton.addClass(_buttonActiveClass);
                            _headerCustomerNavigation.addClass(_customerNavigationOpenClass);
                        }
                    });
                    _headerMyAccountButton.mouseleave(function() {
                        _setMouseLeaveTimer();
                    });

                    $headerLogo.mouseenter(function() {
                        clearTimeout(_blurTimer);
                    });
                    $headerLogo.mouseleave(function() {
                        _setMouseLeaveTimer();
                    });

                    _headerCustomerNavigation.mouseenter(function() {
                        clearTimeout(_blurTimer);
                    });
                    _headerCustomerNavigation.mouseleave(function() {
                        _setMouseLeaveTimer()
                    });
                } else {
                    _headerMyAccountButton.click(function(event) {
                        if (!$(this).hasClass(_buttonActiveClass)) {
                            event.preventDefault();

                            $(this).addClass(_buttonActiveClass);
                            _headerCustomerNavigation.addClass(_customerNavigationOpenClass);

                            return false;
                        }
                    })
                }
            });
        },
        setGeoIpCookie: function(cookieName, cookieValue, cookieExpiry, cookieDomain) {
            // set the cookie and hide the GeoIP bar above the header
            $.cookie(cookieName, cookieValue, { expires: cookieExpiry, domain: cookieDomain, path: '/' });
            $('#store-switcher-block').hide();
        },
        sizeDropdowns: function() {
            var width = $('.header-container .header .nav-container').outerWidth();
            var $dropdowns = $('#nav li.level-top ul.level1.dropdown');
            $dropdowns.css('width', width + 'px');
        },
        initSecondaryBreadcrumbs: function() {
            $(document).ready(function() {
                $('.cms-menu').find('ul li:last-child').addClass(_lastClass);
            });
        }
    }
})(jQuery, Modernizr);

// Calling the initialization sequence
_HDM_Header.init();
