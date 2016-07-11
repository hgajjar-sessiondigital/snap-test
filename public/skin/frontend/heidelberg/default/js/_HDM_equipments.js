(function($) {
    'use strict';

    /**
     * Layback treat for Handling AJAX response
     * 
     */
    var EquipmentAjaxResponse = function(classObject) {
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

            if (dataJSON.formContent) {
                $('#cboxLoadedContent').html(dataJSON.formContent);
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
            $().toastmessage('showToast', {
                text: text,
                sticky: false,
                position: 'middle-center',
                type: messageType,
            });
        });
    }
    layback().treats().add(EquipmentAjaxResponse, 'hdmEquipmentAjaxResponse');

    /**
     * Layback jQuery plugin object for managing popup like wishlist functions
     * 
     */
    window.WishlistManager = function (options) {
        this.layback(options);
    };

    layback(window.WishlistManager)
        .use('setget')
        .use('jQuery-plugin', 'hdmEquipmentManager')
        .use('hdmEquipmentAjaxResponse')
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

})(jQuery);