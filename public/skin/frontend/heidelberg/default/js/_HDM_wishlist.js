/**
 * Functions related to the wishlist (=shopping list)
 *
 * @author Gabor Szabo <gszabo@sessiondigital.de>
 */
;var _HDM_Wishlist = (function($) {
    'use strict';

    return {

        /**
         * Replace discontinued product by its successor in customer's wishlist
         *
         * @param baseUrl
         * @param wishlistItemId
         * @param successorId
         */
        useSuccessorProduct: function(baseUrl, wishlistItemId, successorId) {

            successorId = parseInt(successorId);
            var successorQty = parseInt(jQuery('#successor_qty_successor_id_' + successorId).val());

            if (successorId > 0 && successorQty > 0) {

                var postData = {
                    'wishlistItemId': wishlistItemId,
                    'successorId': successorId,
                    'qty': successorQty
                };

                jQuery.redirect(baseUrl, postData);
            }

            return;
        },
        addProductToWishlistBySku: function(sorterSaveUrl) {
            var addProductToListFormId = 'add-to-wishlist-by-sku-form',
                addProductToListForm = new VarienForm(addProductToListFormId),
                addProductToListFormValidator = new Validation(addProductToListFormId),
                $form = $('#' + addProductToListFormId),
                $skuInput = $('#product-sku'),
                $submitButton = $form.find('.button');

            if (addProductToListFormValidator.validate() && !$submitButton.is(':disabled')) {
                $submitButton.prop('disabled', true);
                $form.find('.validation-advice').remove();
                $skuInput.removeClass('validation-failed');
                
                $.ajax({
                    type: 'POST',
                    dataType: 'json',
                    url: $form.attr('action'),
                    data: $form.serialize(),
                    success: function(dataJSON) {
                        if (dataJSON.redirect) {
                            window.location.href = dataJSON.redirect;
                            return;
                        }
                        if (dataJSON.messages) {
                            if (dataJSON.hasError) {
                                var $validationError = $('<div class="validation-advice" />').html(dataJSON.messages);
                                $validationError.attr('id', 'advice-required-entry-' + $skuInput.attr('id'));
                                $skuInput.after($validationError);
                                $skuInput.addClass('validation-failed');
                            } else {
                                var message = new HdmMessage({
                                    message: dataJSON.messages,
                                    type: 'success',
                                    parentElement: '.sticky-toolbar-item-shoppinglist .cart-message',
                                    messagesElement:  '.sticky-toolbar-item-shoppinglist .cart-message > .validation-advice'
                                });
                                message.show();
                                $skuInput.val('');
                            }
                        }
                        if (dataJSON.shoppinglist_html) {
                            $('#mini_shopping_list').html(dataJSON.shoppinglist_html);
                        }
                        if (dataJSON.producttable_html) {
                            $('#shoppinglist-product-table').html(dataJSON.producttable_html);
                            _HDM_MyAccount.handleSelectAllItemsInTable('wishlist-view-form');
                            _HDM_Cart.showAddReference();
                            _HDM_Global.initTooltipster();
                            _HDM_Global.initQtyInput();
                            _HDM_QuantityValidator.initInputs();

                            $('.wishlist-list-items').hdmWishlistSorter({saveUrl: sorterSaveUrl});
                            $(".button-wishlist-item-remove").hdmWishlistManager({
                                formElement: '#wishlist_removeitem_popup_form',
                                onSuccess: function(obj, dataJSON) {
                                    if (!dataJSON.hasError) {
                                        var $element = obj.getElement().closest('li.wishlist-item'),
                                            $wishlistProductTable = $('#shoppinglist-product-table');
                                        $element.fadeOut(function() {
                                            $element.remove();
                                            if (!$wishlistProductTable.find('li.wishlist-item').length) {
                                                $wishlistProductTable.html('');
                                                _HDM_MyAccount.handleSelectAllItemsInTable('wishlist-view-form');
                                                $('.wishlist-empty').show();
                                                $('.select-all').hide();
                                            }
                                        });
                                    }
                                }
                            });
                            $('.wishlist-empty').hide();
                            $('.select-all').show();
                        }
                    },
                    complete: function() {
                        $submitButton.prop('disabled', false);
                    },
                    error: function() {
                        var message = new HdmMessage({
                            message: 'Unexpected error!<br />Please try again later!',
                            type: 'error',
                            parentElement: '.sticky-toolbar-item-shoppinglist .cart-message',
                            messagesElement:  '.sticky-toolbar-item-shoppinglist .cart-message > .validation-advice'
                        });
                        message.show();
                    }
                });
            }
        },

        initAddToWishlist: function() {
            $('.link-wishlist').hdmWishlistManager({
                onInitFormAfter: function(obj) {
                    var nameInput = obj.form.find('.wishlist-name'),
                        wishlistSelect = obj.form.find('select'),
                        origQtyInput = obj.getElement().closest('form').find('input[name="qty"]'),
                        qtyInput = $('#product_add_wishlists_qty');
                    
                    wishlistSelect.on('change', function() {
                        $('#product_add_wishlists_new_container')[$(this).val()=='new'?'show':'hide']();
                        if ($(this).val() == 'new') {
                            nameInput.focus();
                        }
                        nameInput.attr('name', $(this).val()=='new'?'name':'_name');
                        nameInput[$(this).val()=='new'?'addClass':'removeClass']('required-entry');
                    });

                    if (origQtyInput.length && qtyInput.length && origQtyInput.val() > 0) {
                        qtyInput.val(origQtyInput.val());
                    }
                }
            });
        }
    }
})(jQuery);

(function($) {
    'use strict';

    /**
     * Layback treat for Handling AJAX response
     * 
     */
    var WishListAjaxResponse = function(classObject) {
        layback(classObject)
        .addMethod('_processResponse', function(data) {
            var dataJSON = typeof (data) === "object" ? data : $.parseJSON(data);

            this.dispatch('success-before', dataJSON);

            if (dataJSON.redirect) {
                window.location.href = dataJSON.redirect;
            }
            else if (dataJSON.messages) {
                this.showMessage(dataJSON.messages, dataJSON.hasError ? 'error' : 'success');
                if (dataJSON.shoppinglist_html) {
                    this.dom('miniShoppingListWrapper').html(dataJSON.shoppinglist_html);
                }
            }
            if (dataJSON['item_messages'] && this.get('itemsClassPrefix')) {
                var This = this;
                jQuery.each(dataJSON['item_messages'], function (id, message) {
                    This.showMessage(
                        message.message,
                        message.type,
                        {
                            parentElement: This.get('itemsClassPrefix') + id,
                            messagesElement: This.get('itemsClassPrefix') + id + ' > .validation-advice'
                        }
                    );
                });
            }

            this.clearUp();

            this.dispatch('success', dataJSON);
            this.dispatch('complete', dataJSON);
        })
        .addMethod('_processError', function() {
            
            this.dispatch('error-before');

            this.showMessage('Unexpected error!<br />Please try again later!', 'error');

            this.clearUp();

            this.dispatch('error', {});
            this.dispatch('complete', {});
        })
        .addMethod('clearUp', function() {
            if (this.saveButton) {
                this.saveButton.attr('disabled', false).removeClass('disabled');
            }
            
            if (this.getMode() == 'popup') {
                $.colorbox.close();
            }
        })
        .addMethod('showMessage', function(text, messageType, messageOptions) {
            var message = new HdmMessage($.extend({
                message: text,
                type: messageType,
                parentElement: '.sticky-toolbar-item-shoppinglist .cart-message',
                messagesElement: '.sticky-toolbar-item-shoppinglist .cart-message > .validation-advice'
            }, messageOptions || {}));
            message.show();
        });
    }
    layback().treats().add(WishListAjaxResponse, 'hdmWishlistAjaxResponse');

    /**
     * Layback jQuery plugin object for managing popup like wishlist functions
     * 
     */
    window.WishlistManager = function (options) {
        this.layback(options);
    };

    layback(window.WishlistManager)
        .use('setget')
        .use('jQuery-plugin', 'hdmWishlistManager')
        .use('hdmWishlistAjaxResponse')
        .use('hdmPopupFormManager')
        .defaults({
            data: {
                popupUrl: '',
                addUrl: '',
                canCreate: true,
                wishlists: [],
                mode: 'popup',
                submitSelector: 'button:submit',
                actionUrl: false
            },
            dom: {
                form: '#wishlist_product_popup_add_form',
                miniShoppingListWrapper: '#mini_shopping_list',
                items: '#idontexist'
            }
        })
        .make();

        
        /**
         * layback jQuery plugin for sorting wishlists, and items
         * 
         */
        window.WishlistSorter = function(options) {
            this.layback(options);
            this.initSortable();
            this.observe('success', $.proxy(this.enable, this));
            this.observe('error', $.proxy(this.enable, this));
        };

        layback(window.WishlistSorter)
        .use('setget')
        .use('jQuery-plugin', 'hdmWishlistSorter')
        .use('hdmWishlistAjaxResponse')
        .defaults({
            data: {
                saveUrl: '',
                mode: false,
                sortableOptions: {
                    items: '> li',
                    handle: '.handle',
                    axis: 'y',
                    idAttribute: 'data-id'
                }
            }
        })
        .addMethod('initSortable', function () {
            this.getElement().sortable(this.getSortableOptions());

            var This =this;
            this.getElement().on('sortstop', $.proxy(this.saveOrder, this));
        })
        .addMethod('getIdList', function(){
            return this.getElement().sortable('toArray', {attribute: this.getSortableOptions().idAttribute});
        })
        .addMethod('disable', function () {
            this.getElement().sortable('disable');
        })
        .addMethod('enable', function () {
            this.getElement().sortable('enable');
        })
        .addMethod('saveOrder', function() {
            this.disable();
            $.ajax({
                url: this.getSaveUrl(),
                data: {order: this.getIdList()}
            })
            .success($.proxy(this._processResponse, this))
            .error($.proxy(this._processError, this));
        })
        .make();

})(jQuery);


var HDMWishlist;