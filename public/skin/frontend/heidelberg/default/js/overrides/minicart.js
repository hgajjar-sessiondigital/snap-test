Minicart.prototype.init = function() {
    var cart = this;

    this.selectors.container = '#minicart-sidebar-container';

    // bind remove event
    $j(this.selectors.itemRemove).unbind('click.minicart').bind('click.minicart', function(e) {
        e.preventDefault();
        cart.removeItem($j(this));
    });

    // bind update qty event
    $j(this.selectors.inputQty)
        .unbind('blur.minicart')
        .unbind('focus.minicart')
        .bind('focus.minicart', function() {
            cart.previousVal = $j(this).val();
            cart.displayQuantityButton($j(this))
        })
        .bind('blur.minicart', function() {
            cart.revertInvalidValue(this);
            $j(this).removeClass('validation-failed').parent().find('.validation-advice').hide();
        });

    $j(this.selectors.quantityButtonClass)
        .unbind('click.quantity')
        .bind('click.quantity', function() {
            cart.processUpdateQuantity(this);
    });

    _HDM_QuantityValidator.initInputs();
}
Minicart.prototype.removeItem = function(el) {
    el.trigger('blur');
    var cart = this;
    if (confirm(el.data('confirm'))) {
        cart.hideMessage();
        cart.showOverlay();
        $j.ajax({
            type: 'POST',
            dataType: 'json',
            data: {form_key: cart.formKey},
            url: el.data('href')
        }).done(function(result) {
            cart.hideOverlay();
            if (result.success) {
                cart.updateCartQty(result.qty);
                cart.updateContentOnRemove(result, el.closest('li'));

                if (typeof googleAnalyticsUniversalCart != 'undefined') {
                    googleAnalyticsUniversalCart.parseRemoveFromCartCookies();
                }
            } else {
                cart.showMessage(result);
            }
        }).error(function() {
            cart.hideOverlay();
            cart.showError(cart.defaultErrorMessage);
        });
    }
}

Minicart.prototype.showMessage = function(result) {
    var showMessage = false;

    if (typeof result.notice != 'undefined') {
        this.showError(result.notice);
        showMessage = true;
    } else if (typeof result.error != 'undefined') {
        this.showError(result.error);
        showMessage = true;
    } else if (typeof result.message != 'undefined') {
        this.showSuccess(result.message);
        showMessage = true;
    }

    if (showMessage && typeof _HDM_Global !== 'undefined') {
        _HDM_Global.initNotifications();
    }
}

Minicart.prototype.showError = function(message) {
    $j(this.selectors.error).find('span').text(message).end().fadeIn('slow');
}

Minicart.prototype.showSuccess = function(message) {
    $j(this.selectors.success).find('span').text(message).end().fadeIn('slow');
}

Minicart.prototype.updateContentOnRemove = function(result, el) {
    var cart = this;
    el.hide('slow', function() {
        cart.addActiveClassOnMinicartToolbarButton(result);
        cart.showMessage(result);
        _HDM_QuantityValidator.initInputs();
    });
}
Minicart.prototype.updateContentOnUpdate = function(result) {
    this.addActiveClassOnMinicartToolbarButton(result);
    this.showMessage(result);
    _HDM_QuantityValidator.initInputs();
}
Minicart.prototype.addActiveClassOnMinicartToolbarButton = function(result) {
    var $resultContent = $j('<div/>').html(result.content);

    $resultContent.find('.sticky-toolbar-item-button.shopping-cart').addClass('active');
    $j(this.selectors.container).html($resultContent.html());

    _HDM_Global.initQtyInput();
}
Minicart.prototype.revertInvalidValue = function(el) {
    if (!this.isValidQty($j(el).val()) || $j(el).val() == this.previousVal || $j(el).hasClass('validation-failed')) {
        $j(el).val(this.previousVal);
        this.hideQuantityButton(el);
    }
}
Minicart.prototype.isValidQty = function(val) {
    val = val.replace(',', '.');
    return (val.length > 0) && (val - 0 == val) && (val - 0 > 0);
}
