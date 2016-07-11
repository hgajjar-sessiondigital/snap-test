;(function($) {

    'use strict';

    window.HdmPriceUpdater = function(options) {
        this.layback(options);
        this.addCollectionItem(this.dom('items'));
    }

    layback(window.HdmPriceUpdater)
        .use('collection')
        .use('setget')
        .defaults({
            data: {
                fetchUrl: '',
                tierPriceClassPrefix: 'product-tierprice-wrapper-',
                loaderHtml: '<div class="loader">Loading price...</div>',
                errorHtml: '<div class="error">Error during fetching your price!</div>'
            },
            dom: {
                items: '.product-price-wrapper'
            }
        })
        .addMethod('getProductIds', function() {
            var This = this,
                ids = [];

            this.eachCollectionItems(function(i, item) {
                var id = This._getIdForElement(item);
                if (id) {
                    ids.push(id);
                }
            });
            return ids;
        })
        .addMethod('showLoaders', function() {
            this._setContentToElements({
                price: this.getLoaderHtml(),
                tier_price: ''
            });
        })
        .addMethod('fetchPrices', function() {
            if (this.getCollectionSize() > 0) {
                this.showLoaders();
                $.ajax({
                    type: 'POST',
                    url: this.getFetchUrl(),
                    data: {ids: this.getProductIds()}
                })
                .success($.proxy(this._processResponse, this))
                .error($.proxy(this._processError, this));
            }
        })
        .addMethod('_getIdForElement', function(item) {
            return $(item).attr('product-id');
        })
        .addMethod('_getTierPriceElement', function(id) {
            return $(this.getTierPriceClassPrefix() + id);
        })
        .addMethod('_processResponse', function(data) {
            var dataJSON = (typeof data) !== "string" ? data : $.parseJSON(data);
            this._setContentToElements(dataJSON);
        })
        .addMethod('_processError', function() {
            this._setContentToElements({
                price: this.getErrorHtml(),
                tier_price: ''
            });
        })
        .addMethod('_setContentToElements', function(jsonObject) {
            var This = this;
            this.eachCollectionItems(function(i, item) {
                var id = This._getIdForElement(item),
                    priceHtml = This._getContentFromJsonObject(jsonObject, 'price', id),
                    tierPriceHtml = This._getContentFromJsonObject(jsonObject, 'tier_price', id);

                $(item).html(priceHtml);
                This._getTierPriceElement(id).html(tierPriceHtml);
            });
        })
        .addMethod('_getContentFromJsonObject', function(jsonObject, key, id) {
            if ((typeof jsonObject[key]) != 'undefined') {
                return jsonObject[key];
            }

            if ((typeof jsonObject[id]) != 'undefined' && (typeof jsonObject[id][key]) != 'undefined') {
                return jsonObject[id][key];
            }

            return this.getErrorHtml();
        })
        .make();
})(jQuery);