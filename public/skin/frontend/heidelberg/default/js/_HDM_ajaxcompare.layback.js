;(function($) {

    'use strict';

    window.HdmAddToCompare = function(options) {
        this.layback(options);
        this.element = this.get('element');
        this.url = this.element.attr('href');
        this.get('element').on('click', $.proxy(this._addProduct, this));
    }

    layback(window.HdmAddToCompare)
        .use('jQuery-plugin', 'hdmAddToCompare')
        .defaults({
            data: {
                activeClass: 'active',
                miniCompareBtnDisabledClass: 'disabled',
                miniCompareBtnActiveClass: 'active'
            },
            dom: {
                miniCompare: '#minicompare-sidebar-container',
                miniCompareBtn: '.sticky-toolbar-item-button.comparison'
            }
        })
        .addMethod('_addProduct', function(ev) {
            ev.preventDefault();

            this.element.hide();

            $.ajax({
                url: this.url
            })
            .success($.proxy(this._processResponse, this))
            .error($.proxy(this._processError, this));
        })
        .addMethod('_processResponse', function(data) {
            var dataJSON = typeof (data) === "object" ? data : $.parseJSON(data),
                $miniCompare = this.dom('miniCompare'),
                $miniCompareBtn = this.dom('miniCompareBtn');

            $miniCompare.html(dataJSON.comparelist_html);
            $miniCompareBtn.removeClass(this.get('miniCompareBtnDisabledClass'));

            if (dataJSON.redirect) {
                window.location.href = dataJSON.redirect;
            }
            else if (dataJSON.messages) {
                var message = new HdmMessage({
                    message: dataJSON.messages,
                    type: dataJSON.hasError ? 'error' : 'success',
                    parentElement: '.sticky-toolbar-item-comparison .cart-message',
                    messagesElement:  '.sticky-toolbar-item-comparison .cart-message > .validation-advice'
                });
                message.show();
            }
            this.element.show();
        })
        .addMethod('_processError', function() {
            var message = new HdmMessage({
                message: 'Unexpected error!<br />Please try again later!',
                type: 'error',
                parentElement: '.sticky-toolbar-item-comparison .cart-message',
                messagesElement:  '.sticky-toolbar-item-comparison .cart-message > .validation-advice'
            });
            message.show();
            this.element.show();
        })
        .make();

})(jQuery);