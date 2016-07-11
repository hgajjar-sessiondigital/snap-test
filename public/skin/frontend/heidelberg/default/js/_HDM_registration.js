/**
 * Functions related to the registration page.
 *
 * @author David Bodrogi <dbodrogi@sessiondigital.de>
 * */

var _HDM_Registration = (function($) {
    'use strict';

    var _isInited = false,
        _otherControlId = 'hear_other';

    return {
        /* Initialization scripts */
        init: function() {
            if (!_isInited) {
                _HDM_Registration.initHearAboutControls();

                _isInited = true;
            }
        },
        initHearAboutControls: function() {
            $(document).ready(function() {
                var $otherTextInput = $('#other-text');

                $('#hear-about-controls').find('input[name="hear_about_shop"]').click(function() {
                    var controlId = $(this).attr('id'),
                        isDisabled = true;

                    if (controlId === _otherControlId) {
                        isDisabled = false;
                    }
                    $otherTextInput.prop('disabled', isDisabled).focus();
                });
                
                if ($('#' + _otherControlId).prop('checked')) {
                   $otherTextInput.prop('disabled', false); 
                }
            });
        },
        forcedGuestRegistration: function() {
            $(document).ready(function() {
                var $registerIntereset = $('#register-interest'),
                    $usernameLabel = $('#username_label'),
                    $username = $('#username');

                $registerIntereset.on('change', function() {
                    if ($(this).is(':checked')) {
                        $usernameLabel.addClass('required');
                        $username.addClass('required-entry validate-length maximum-length-255');
                    } else {
                        $usernameLabel.removeClass('required');
                        $username
                            .removeClass('required-entry validate-length maximum-length-255 validation-failed')
                            .next('.validation-advice')
                            .remove();
                    }
                });
            });
        }
    }
})(jQuery);

// Calling the initialization sequence
_HDM_Registration.init();
