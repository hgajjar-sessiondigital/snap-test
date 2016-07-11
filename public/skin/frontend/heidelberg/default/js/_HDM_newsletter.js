/**
 * Functions related to the newsletter form.
 *
 * @author David Bodrogi <dbodrogi@sessiondigital.de>
 * */

var _HDM_Newsletter = (function($) {
    'use strict';

    var _newsletterFormInited = false,
        _newsletterFormOpenClass = 'open';

    return {
        /* Initialization scripts */
        init: function() {
            if (!_newsletterFormInited) {
                _HDM_Newsletter.initNewsletterFormFooter();

                _newsletterFormInited = true;
            }
        },
        initNewsletterFormFooter: function() {
            $(document).ready(function() {
                var formId = 'newsletter-form-footer',
                    $newsletterForm = $('#' + formId),
                    $newsletterFormExtended = $newsletterForm.find('.newsletter-form-extended'),
                    formValidator =  new Validation(formId);

                $newsletterForm.on('click', '.button', function() {
                    if (!formValidator.validate() && !$newsletterFormExtended.is(':visible')) {
                        $newsletterFormExtended.addClass(_newsletterFormOpenClass);
                    }
                });
                $newsletterForm.on('focus', '.email-input', function() {
                    $newsletterFormExtended.addClass(_newsletterFormOpenClass);
                });
                $newsletterForm.on('click', '.close-icon', function() {
                    $newsletterFormExtended.removeClass(_newsletterFormOpenClass);

                    return false;
                });
            });
        }
    }
})(jQuery);

// Calling the initialization sequence
_HDM_Newsletter.init();
