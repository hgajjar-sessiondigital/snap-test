/**
 * Functions related to My Account.
 *
 * @author David Bodrogi <dbodrogi@sessiondigital.de>
 * */

var _HDM_MyAccount = (function($) {
    'use strict';

    var _myAccountInited = false,
        _lastInRowTileClass = 'last',
        _addressDataItems = {},
        _addressFormData = '',
        _newFormTitle = '',
        _editFormTitle = '',
        _orderAddToCartClicked = false,
        _disabledClass = 'disabled';

    function _updateAddressPopupForm() {
        var $addressForm = $('#address-form'),
            addressFormTitle = '';

        // reset form
        if (_addressFormData.address_id == 0) {
            addressFormTitle = _newFormTitle;
            $addressForm[0].reset();
        } else {
            addressFormTitle = _editFormTitle;
        }
        $.each(_addressFormData, function(fieldId, fieldValue) {
            var $item = $('#' + fieldId);

            if ($item.length) {
                $item.val(fieldValue);
            }
        });

        $addressForm.find('h4').html(addressFormTitle);
        $('#address_id').val(_addressFormData.address_id);
        $addressForm.find('.validation-passed').removeClass('validation-passed');
        $addressForm.find('.validation-failed').removeClass('validation-failed');
        $addressForm.find('.validation-advice').remove();
    }
    function _setDefaultShippingAddress(addressId) {
        var $defaultShippingAddressForm = $('#default-shipping-address-form'),
            $radioButtons = $defaultShippingAddressForm.find('input[name="default_shipping_address"]');

        $radioButtons.prop('disabled', true);
        $.ajax({
            url: $defaultShippingAddressForm.attr('action'),
            data: {
                address_id: addressId
            },
            type: 'POST',
            dataType: 'json',
            success: function(transport) {
                if (typeof transport.error !== 'undefined' && transport.error !== '') {
                    alert(transport.error);
                } else {
                    alert(transport.success);
                }
            },
            complete: function() {
                $radioButtons.prop('disabled', false);
            }
        });
    }

    return {
        /* Initialization scripts */
        init: function() {
            if (!_myAccountInited) {
                _HDM_MyAccount.initTiles();
                _HDM_MyAccount.changeDefaultShippingAddress();
                _HDM_MyAccount.addChangeEventOnSortByDropdown();

                _myAccountInited = true;
            }
        },
        initTiles: function() {
            $(document).ready(function() {
                var $dashBoardTiles = $('#dashboard-tiles');
                
                if ($dashBoardTiles.length) {
                    $dashBoardTiles.find('li.tile:nth-child(3n+3)').addClass(_lastInRowTileClass);
                }
            });
        },
        handleSelectAllItemsInTable: function(table) {
            $(document).ready(function() {
                var $table = $('#' + table),
                    $checkboxes = $table.find('.cb-select-item'),
                    $selectAllButton = $('#btn-select-all'),
                    $selectAllCheckbox = $('#select-all-checkbox'),
                    selectAllCheckboxIsDisabled = false;

                if (!$table.length) {
                    return;
                }
                if (!$checkboxes.length) {
                    selectAllCheckboxIsDisabled = true;
                }
                $selectAllCheckbox.prop('disabled', selectAllCheckboxIsDisabled);

                $selectAllCheckbox.change(function() {
                    var checkboxStatus = false,
                        buttonStatus = true;

                    if (!$checkboxes.length) {
                        return;
                    }

                    if ($(this).is(':checked')) {
                        checkboxStatus = true;
                        buttonStatus = false;
                    }
                    $checkboxes.prop('checked', checkboxStatus);
                    $selectAllButton.prop('disabled', buttonStatus);
                });

                $checkboxes.on('change', function() {
                    var checkedCheckboxes = 0;
                    $.each($checkboxes, function(index, item) {
                        if ($(item).is(':checked')) {
                            checkedCheckboxes++;
                        }
                    });
                    $selectAllButton.prop('disabled', checkedCheckboxes ? false : true);
                    if (!checkedCheckboxes) {
                        $selectAllCheckbox.prop('checked', false);
                    }
                });
            });
        },
        addToAddressDataItems: function(item) {
            _addressDataItems[item.address_id] = item;
        },
        initAddressPopupForm: function(newFormTitle, editFormTitle) {
            _newFormTitle = newFormTitle;
            _editFormTitle = editFormTitle;

            $(document).ready(function() {
                $('.show-address-form').click(function() {
                    _addressFormData = _addressDataItems[$(this).data('addressid')];
                });

                $('.show-address-form').colorbox({
                    inline: true,
                    href: '#address-form',
                    onOpen: function() {
                        _updateAddressPopupForm();
                    },
                    onCleanup: function() {
                        _addressFormData = '';
                    }
                });
            });
        },
        saveAddressForm: function() {
            var form = 'address-form',
                formValidator = new Validation(form),
                $addressForm = $('#' + form),
                $loader = $('#address-please-wait'),
                $submitButton = $addressForm.find('button');

            if (formValidator.validate()) {
                $submitButton.prop('disabled', true);
                $loader.show();

                $.ajax({
                    url: $addressForm.attr('action'),
                    type: 'post',
                    data: $addressForm.serialize(),
                    success: function(transport) {
                        if (typeof transport.error !== 'undefined' && transport.error !== '') {
                            alert(transport.error);
                        } else {
                            location.reload();
                        }
                    },
                    complete: function() {
                        $submitButton.prop('disabled', false);
                        $loader.hide();
                    }
                });
            }
        },
        changeDefaultShippingAddress: function() {
            $(document).ready(function() {
                $('#default-shipping-address-form').on('change', 'input[name="default_shipping_address"]', function() {
                    _setDefaultShippingAddress($(this).val());
                });
            });
        },
        addChangeEventOnSortByDropdown: function() {
            $(document).ready(function() {
                $('.myaccount-sortby').on('change', function() {
                    location.href = $(this).val();
                });
            });
        },
        addSelectionToCartFromOrder: function() {
            $(document).ready(function() {
                $('#order-details-table .btn-cart').on('click', function() {
                    var $form = $(this).closest('form'),
                        $button = $(this);

                    if (_orderAddToCartClicked) {
                        return;
                    }

                    _orderAddToCartClicked = true;
                    $button.prop('disabled', true).addClass(_disabledClass);

                    $.ajax({
                        type: 'POST',
                        dataType: 'json',
                        url: $form.attr('action'),
                        data: $form.serialize(),
                        success: function(dataJSON) {
                            if (dataJSON.cart_html) {
                                $('#minicart-sidebar-container').html(dataJSON.cart_html);
                                $('#header-cart-items-count').html(dataJSON.qty);
                                $('.sticky-toolbar-item-button.shopping-cart').removeClass(_disabledClass);

                                if (dataJSON.messages) {
                                    var message = new HdmMessage({message: dataJSON.messages, type: dataJSON.hasError ? 'error' : 'success'});
                                    message.show();
                                }
                                if (dataJSON['item_messages']) {
                                    $.each(dataJSON['item_messages'], function (id, message) {
                                        var message = new HdmMessage($.extend({
                                            message: message.message,
                                            type: message.type,
                                            parentElement: '.order-item-' + id,
                                            messagesElement: '.order-item-' + id + ' > .validation-advice'
                                        }, {}));
                                        message.show();
                                    });
                                }
                            }
                        },
                        complete: function() {
                            _orderAddToCartClicked = false;
                            $button.prop('disabled', false).removeClass(_disabledClass);
                        }
                    });
                });
            });
        }
    }
})(jQuery);

// Calling the initialization sequence
_HDM_MyAccount.init();
