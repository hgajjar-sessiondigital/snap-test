/**
 * Functions related to the homepage.
 *
 * @author Zsolt Molnar <zmolnar@sessiondigital.de>
 * */

var _HDM_Homepage = (function($) {
    'use strict';

    return {
        teaserSliderInited: false,
        tabsInited: false,
        /* Initialization scripts */
        init: function() {
            _HDM_Homepage.initTeaserSlider(window.homepageSliderSpeed || 3);
            _HDM_Homepage.initCategoryTabs();
        },

        /**
         * Initialises the big teaser slider on the homepage
         * */
        initTeaserSlider: function (speedInSec) {
            if (!_HDM_Homepage.teaserSliderInited) {
                $('.homepage-small-slider').slick({
                    autoplay: false,
                    dots: false,
                    infinite: true,
                    arrows: false,
                    draggable: false,
                    fade: true
                });
                
                $('.homepage-slider').slick({
                    autoplay: true,
                    autoplaySpeed: speedInSec * 1000,
                    dots: true,
                    infinite: true,
                    asNavFor: '.homepage-small-slider'
                });
            }
            _HDM_Homepage.teaserSliderInited = true;
        },

        /**
         * Initialises info tabs
         * */
        initCategoryTabs: function () {
            if (!_HDM_Homepage.tabsInited && $('.category-fullnav > ul.simpletabs > li.tabcontrol').get().length) {
                $(".category-fullnav").easytabs({
                    animate: false,
                    defaultTab: ".first",
                    panelActiveClass: "selected",
                    tabActiveClass: "selected",
                    tabs: "> ul.simpletabs > li.tabcontrol",
                    updateHash: false
                });
                _HDM_Homepage.tabsInited = true;
            }
        }
    }
})(jQuery);
