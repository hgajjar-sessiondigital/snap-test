/**
 * Functions related to the homepage.
 *
 * @author Zsolt Molnar <zmolnar@sessiondigital.de>
 * */

var _HDM_Productpage = (function($) {
    'use strict';

    return {
        mediaSliderInited: false,
        mediaGalleryInited: false,
        tabsInited: false,
        relatedBoxInited: false,
        /* Initialization scripts */
        init: function() {
            _HDM_Productpage.initMediaSlider();
            _HDM_Productpage.initMediaGallery();
            _HDM_Productpage.initTabs();
            _HDM_Productpage.initRelatedBox();
            _HDM_Productpage.moveSuccessorNoticeAboveHeader();
        },

        /**
         * Initialises the media slider on the pdp
         * */
        initMediaSlider: function () {
            if (!_HDM_Productpage.mediaSliderInited) {

                $('.media-slider').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    fade: true,
                    asNavFor: '.media-slider-nav'
                });

                $('.media-slider-nav').on('init', function(evt, slick){

                    $.each($('.media-slider-nav .slick-slide'), function (i, slide) {
                        var goTo = $(slide).data('slick-index');
                        if (goTo >= slick.slideCount) {
                            goTo = 0;
                        }
                        if (goTo < 0) {
                            goTo = slick.slideCount - 1;
                        }
                        $(slide).click(function() {
                            $('.media-slider-nav').slick('slickGoTo', goTo, true);
                        });
                    });
                });

                $('.media-slider-nav').slick({
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    asNavFor: '.media-slider',
                    arrows: false,
                    dots: true,
                    centerMode: true,
                    centerPadding: 0,
                    focusOnSelect: true
                });                
            }
            _HDM_Productpage.mediaSliderInited = true;
        },

        /**
         * Initialises the gallery
         * */
        initMediaGallery: function () {
            if (!_HDM_Productpage.mediaGalleryInited) {
                $('.productmedia-gallery').colorbox({
                    rel: 'productMediaGallery',
                    opacity: 0.6,
                    maxWidth: 900
                });
            }
            _HDM_Productpage.mediaGalleryInited = true;
        },

        /**
         * Initialises related/upell sliders
         * */
        initRelatedBox: function () {
            if (!_HDM_Productpage.relatedBoxInited) {
                $('.box-related .box-content').slick({
                    speed: 500,
                    slidesToShow: 4,
                    slidesToScroll: 2,
                    arrows: true,
                    infinite: false,
                    dots: false
                });
                $('.box-upsell .box-content').slick({
                    speed: 500,
                    slidesToShow: 4,
                    slidesToScroll: 2,
                    arrows: true,
                    infinite: false,
                    dots: false
                });
            }
            _HDM_Productpage.relatedBoxInited = true;
        },

        /**
         * Initialises info tabs
         * */
        initTabs: function () {
            if (!_HDM_Productpage.tabsInited) {
                $(".product-page-tabs").easytabs({
                    animate: false,
                    defaultTab: "li.tab-0",
                    panelActiveClass: "selected",
                    tabActiveClass: "selected",
                    tabs: "> ul > li",
                    updateHash: false
                });
            }
            _HDM_Productpage.tabsInited = true;
        },
        /**
         * If there is a successor block on the PDP, this function will move it above the header
         * */
        moveSuccessorNoticeAboveHeader: function() {
            var $successorNoticeBlock = $('#notice-successor-block');

            if (!$successorNoticeBlock.length) {
                return;
            }

            $successorNoticeBlock.appendTo('.global-site-notices').show();
        }
    }
})(jQuery);
