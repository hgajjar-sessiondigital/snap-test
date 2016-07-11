(function($, Product){
    Product.Config.prototype.reloadPrice = function() {
        var _productId = this.getFinalProductId();
        this.handleFinalProductPrice(_productId);
    };

    Product.Config.prototype.getFinalProductId = function() {
        var _allSelected = true,
            _filteredProducts = false,
            _productId = false,
            This = this;
        $.each(this.state, function(i, optionId) {
            if (i == parseInt(i)) {
                _allSelected = _allSelected && (optionId !== false);

                if (_allSelected) {
                    var _options = This.getAttributeOptions(i);

                    $.each(_options, function(i, option) {
                        if (option.id == optionId) {
                            var _allowedProducts = option.allowedProducts;
                            if (_filteredProducts === false) {
                                _filteredProducts = _allowedProducts;
                            } else {
                                _filteredProducts = _filteredProducts.filter(function(productId) {
                                    return _allowedProducts.indexOf(productId) !== -1;
                                });
                            }
                        }
                    });
                }
            }
        });
        if (!_allSelected) {
            return false;
        }
        this.updateLayoutForSimpleProduct(_filteredProducts[0]);

        return _filteredProducts[0];
    };

    Product.Config.prototype.handleFinalProductPrice = function(productId) {
        if (productId) {
            $('.configurable-product-price-wrapper').attr('product-id', productId);
            $('.configurable-product-tierprice-wrapper').attr('product-id', productId);
            hdmPriceUpdater.laybackCollection.items = $('.configurable-product-price-wrapper');
            hdmPriceUpdater.fetchPrices();
            $('#product-addtocart-button').attr('disabled', false);
            $('.main-product-add-to-wishlist').show();
            $('.main-product-add-to-compare').hide();
        } else {
            $('.configurable-product-price-wrapper').attr('product-id', 0).html('');
            $('.configurable-product-tierprice-wrapper').attr('product-id', 0).html('');
            $('.main-product-add-to-wishlist').hide();
            $('.main-product-add-to-compare').show();
        }
    };

    Product.Config.prototype.updateLayoutForSimpleProduct = function(productId) {
        var This = this;

        if (typeof renderedProductsCache[productId] !== 'undefined') {
            This._processUpdateLayout(productId);
        } else {
            $.ajax({
                url: 'catalog/product/view/id/' + productId,
                dataType: 'json',
                success: function(resp) {
                    if (typeof resp.top_info !== 'undefined' && typeof resp.options_container !== 'undefined' && typeof resp.details !== 'undefined') {
                        renderedProductsCache[productId] = resp;
                        This._processUpdateLayout(productId);
                    }
                }
            });
        }
    };

    Product.Config.prototype._processUpdateLayout = function(productId) {
        var $productView = $('.product-view');

        $productView.removeClass('no-warnings no-thumbnail no-media one-media-image more-media-images');

        $.each(renderedProductsCache[productId], function(identifier, content) {
            $('#js_pdp_replace_' + identifier).html(content);
        });


        if (!$.trim($('.product-warnings').html()).length && $.trim($('.product-documents').html())) {
            $productView.addClass('no-warnings');
        }

        if (!$productView.hasClass('more-media-images')) {
            $productView.addClass('no-thumbnail');
        }
    };
})(jQuery, Product);
