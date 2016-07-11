;(function($) {

    'use strict';

    window.HdmMessage = function(options) {
        this.layback(options);
        this.hideTimer = false;
    }

    layback(window.HdmMessage)
        .use('setget')
        .defaults({
            data: {
                type: 'success',
                message: '',
                hideTime: 5000,
                classPrefix: 'validation-advice-',
                template: '<div class="validation-advice"></div>',
                minSaleQty: 1,
                maxSaleQty: 100
            },
            dom: {
                parent: '.sticky-toolbar-item-cart .cart-message',
                messages: '.sticky-toolbar-item-cart .cart-message > .validation-advice'
            }
        })
        .addMethod('getClass', function() {
            return this.getClassPrefix() + this.getType();
        })
        .addMethod('show', function() {
            this.dom('messages').remove();
            if ($(window).width() < 960) {
                $().toastmessage('showToast', {
                    text: this.getMessage(),
                    sticky: false,
                    position: 'top-right',
                    type: this.getType(),
                });
            } else {
                this.msg = $(this.getTemplate()).html(this.getMessage()).addClass(this.getClass()).hide();
                this.dom('parent').append(this.msg);
                this.msg.fadeIn();
                this.msg.css('top', -1 * this.msg.height(true) / 2 + 12);

                this.startHide();

                var This = this;

                this.msg
                    .on('mouseenter', function() {
                        This.stopHide();
                    })
                    .on('mouseleave', function() {
                        This.startHide();
                    });    
            }
            
        })
        .addMethod('startHide', function() {
            if (this.hideTimer) {
                clearTimeout(this.hideTimer);
            }
            var This = this;
            this.hideTimer = setTimeout(function(){
                This.msg.fadeOut(function(){
                    This.msg.remove();
                });
            }, this.get('hideTime'));
        })
        .addMethod('stopHide', function() {
            if (this.hideTimer) {
                clearTimeout(this.hideTimer);
            }
        })
        .make();
})(jQuery);