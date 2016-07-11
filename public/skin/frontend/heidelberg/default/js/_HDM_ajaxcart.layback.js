;(function($) {

    'use strict';

    window.HdmAddToCart = function(options) {
        this.layback(options);
        if (this.get('element')) {
            this.productAddToCartForm = new VarienForm($(this.get('element')).attr('id'));
            this.get('element').on('submit', $.proxy(this._addProducts, this));
        }
    }

    layback(window.HdmAddToCart)
        .use('jQuery-plugin', 'hdmAddToCart')
        .defaults({
            data: {
                addToCartForm: 'product_addtocart_form',
                cartBtn: '.add-to-cart-button',
                activeClass: 'active',
                miniCartBtnDisabledClass: 'disabled',
                miniCartBtnActiveClass: 'active',
                productPageAddToCartFormId: 'product_addtocart_form'
            },
            dom: {
                miniCart: '#minicart-sidebar-container',
                miniCartBtn: '.sticky-toolbar-item-button.shopping-cart',
                cartItemsCount: '#header-cart-items-count'
            }
        })
        .addMethod('_addProducts', function(ev) {
            ev.preventDefault();

            this.form = $(ev.currentTarget);
            this.button = this.form.find(this.get('cartBtn')).last();

            var action = this.form.attr('action'),
                productType = this.form.data('product-type'),
                listMode = this.form.data('list-mode'),
                qty = this.form.find('input[name="qty"]').val() * 1;

            if (qty <= 0) {
                qty = 1;
                this.get('element').find('input[name="qty"]').val(qty);
            }

            if (this.productAddToCartForm && !this.productAddToCartForm.validator.validate()) {
                return;
            }

            if (listMode === true && productType !== 'simple') {
                window.location = action;
            }

            this.button.prop('disabled', true);
            this.button.addClass(this.get('miniCartBtnDisabledClass'));

            $.ajax({
                url: action,
                data: this.form.serialize()
            })
            .success($.proxy(this._processResponse, this))
            .error($.proxy(this._processError, this));
        })
        .addMethod('_processResponse', function(data) {
            var dataJSON = typeof (data) === "object" ? data : $.parseJSON(data),
                $miniCart = this.dom('miniCart'),
                $miniCartBtn = this.dom('miniCartBtn'),
                $cartItemsCount = this.dom('cartItemsCount');

            $miniCart.html(dataJSON.cart_html);
            $miniCartBtn.removeClass(this.get('miniCartBtnDisabledClass'));
            $cartItemsCount.html(dataJSON.qty);

            if (typeof googleAnalyticsUniversalCart != 'undefined') {
                googleAnalyticsUniversalCart.parseAddToCartCookies();
            }

            if (dataJSON.is_saleable) {
                this.button.prop('disabled', false);
                this.button.removeClass(this.get('miniCartBtnDisabledClass'));
            }

            if (dataJSON.redirect) {
                window.location.href = dataJSON.redirect;
            }
            else if (dataJSON.messages) {
                var message = new HdmMessage({message: dataJSON.messages, type: dataJSON.hasError ? 'error' : 'success'});
                message.show();
            }
            _HDM_Global.initQtyInput();
            _HDM_QuantityValidator.initInputs();
        })
        .addMethod('_processError', function() {
            this.button.prop('disabled', false);
            this.button.removeClass(this.get('miniCartBtnDisabledClass'));
            var message = new HdmMessage({message: 'Unexpected error!<br />Please try again later!', type: 'error'});
            message.show();
        })
        .make();

})(jQuery);