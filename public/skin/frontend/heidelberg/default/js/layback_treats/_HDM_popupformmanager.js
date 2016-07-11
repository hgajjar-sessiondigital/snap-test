(function($) {
    'use strict';
    /**
     * Layback jQuery plugin object for managing popup like wishlist functions
     * 
     */
    var PopupFormManager = function (classObject) {
        layback(classObject)
        .addMethod('showPopup', function() {
            var This = this;
            $.colorbox({
                href: this.getPopupUrl(),
                onComplete: $.proxy(This.initForm, This)
            });
        })
        .addMethod('initForm', function() {
            var This = this;
            if (this.getMode() == 'popup') {
                $('#colorbox').addClass('allowOverflow');
            }
            this.form = this.dom('form');
            
            if (!this.form.data('hdmWishlistManagerInUse')) {
                this.form.on('submit', $.proxy(This.saveForm, This));
                this.form.data('hdmWishlistManagerInUse', true);
            }
            this.form.find('input.input-text').first().focus();

            this.saveButton = this.form.find(this.getSubmitSelector());

            this.dispatch('init-form-after');
        })
        .addMethod('saveForm', function(e){
            this.dispatch('save-form-before', e);

            var formValidation = new Validation(this.form.attr('id')),
                action = this.getActionUrl() || this.form.attr('action');

            if (formValidation.validate()) {
                this.saveButton.attr('disabled', true).addClass('disabled');

                var xhr = $.ajax({
                    type: 'POST',
                    url: action,
                    data: this.form.serialize()
                });
                if (this._processResponse) {
                    xhr.success($.proxy(this._processResponse, this))    
                }
                if (this._processError) {
                    xhr.error($.proxy(this._processError, this));    
                }
            }
            this.dispatch('save-form-after', e);

            return false;
        })
        .addInitMethod(function(obj){
            if (obj.getMode() == 'popup') {
                obj.getElement().on('click', function(){
                    obj.showPopup();
                    return false;
                });
            } else if (obj.getMode() == 'form'){
                obj.initForm();
            }
        });
    };

    layback().treats().add(PopupFormManager, 'hdmPopupFormManager');
})(jQuery); 