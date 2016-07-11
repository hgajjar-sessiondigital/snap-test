;
// Checkout
Checkout.prototype.initialize = function(accordion, urls, options) {
    this.accordion = accordion;
    this.progressUrl = urls.progress;
    this.reviewUrl = urls.review;
    this.saveMethodUrl = urls.saveMethod;
    this.failureUrl = urls.failure;
    this.billingForm = false;
    this.shippingForm= false;
    this.syncBillingShipping = false;
    this.method = '';
    this.payment = '';
    this.loadWaiting = false;
    this.steps = ['login', 'deliveryandpayment', 'review'];
    this.isLoggedIn = options.isLoggedIn;
    
    //Initialize the steps for progress
    this.currentStep = this.isLoggedIn || this.method ? 'deliveryandpayment' : 'login';

    this.accordion.sections.each(function(section) {
        Event.observe($(section).down('.step-title'), 'click', this._onSectionClick.bindAsEventListener(this));
    }.bind(this));

    this.accordion.disallowAccessToNextSections = true;
};
Checkout.prototype.reloadStep = function(prevStep) {
    if (this.prevStepCache != prevStep){
        var updater = new Ajax.Updater(prevStep + '-progress-opcheckout', this.progressUrl, {
            method:'get',
            onFailure:this.ajaxFailure.bind(this),
            onComplete: function(){
                this.checkout.prevStepCache = prevStep;
                this.checkout.resetPreviousSteps();
            },
            parameters: prevStep ? { prevStep:prevStep } : null
        });    
    }
};
Checkout.prototype.fixSection = function(section) {
    switch (section) {
        case 'shipping':
        case 'shipping_method':
        case 'billing':
        case 'payment':
            section = 'deliveryandpayment';
        break;
        default: break;
    }
    return section;
};
Checkout.prototype.setLoadWaiting = function(step, keepDisabled) {
    if (step) {
        step = this.fixSection(step);
        if (this.loadWaiting) {
            this.setLoadWaiting(false);
        }
        var container = $(step + '-buttons-container');
        container.setStyle({opacity: .8});
        this._disableEnableAll(container, true);
        Element.show(step + '-please-wait');
    } else {
        if (this.loadWaiting) {
            var container = $(this.loadWaiting + '-buttons-container');
            var isDisabled = (keepDisabled ? true : false);
            if (!isDisabled) {
                container.setStyle({opacity:1});
            }
            this._disableEnableAll(container, isDisabled);
            Element.hide(this.loadWaiting + '-please-wait');
        }
    }
    this.loadWaiting = step;
};
Checkout.prototype.gotoSection = function(section, reloadProgressBlock) {
    var fromStep = this.currentStep;
    section = this.fixSection(section);

    if (reloadProgressBlock) {
        this.reloadProgressBlock(this.currentStep);
    }

    this.currentStep = section;

    var sectionElement = $('opc-' + section);
    sectionElement.addClassName('allow');
    this.accordion.openSection('opc-' + section);

    if (!reloadProgressBlock) {
        this.resetPreviousSteps();
    }

    if (fromStep !== this.currentStep) {
        jQuery('html,body').animate({scrollTop: jQuery('#checkoutSteps').offset().top});
    }
    if (fromStep === 'review' && this.currentStep === 'deliveryandpayment') {
        deliveryandpayment.resetAllStepsSavedStatus();
    }
    if (this.currentStep === 'review' && typeof _HDM_Cart !== 'undefined') {
        _HDM_Cart.equalizeReviewOrderDetailsColumns();4
        _HDM_Global.initTooltipster();
    }
};
Checkout.prototype.setMethod = function(method) {
    if ($('login:guest') && $('login:guest').checked) {
        this.method = 'guest';
        var request = new Ajax.Request(
            this.saveMethodUrl,
            {method: 'post', onFailure: this.ajaxFailure.bind(this), parameters: {method:'guest'}}
        );
        this.gotoSection('delivery', true);
    }
    else if ($('login:register') && ($('login:register').checked || $('login:register').type == 'hidden')) {
        this.method = 'register';
        this.setLoadWaiting('register');
        var request = new Ajax.Request(
            this.saveMethodUrl,
            {
                method: 'post',
                onComplete: this.setLoadWaiting(false),
                onFailure: this.ajaxFailure.bind(this),
                parameters: {method:'register'}
            }
        );
        this.gotoSection('delivery', true);
    } else {
        alert(Translator.translate('Please choose to register or to checkout as a guest'));
        return false;
    }
    document.body.fire('login:setMethod', {method : this.method});
};
Checkout.prototype.setStepResponse = function(response) {
    if ((typeof this.isRedirected) == 'undefined') {
        this.isRedirected = false;
    }
    if (response.update_section) {
        if ($('checkout-' + response.update_section.name + '-load')) {
            this.updateHtmlSection('checkout-' + response.update_section.name + '-load', response.update_section.html);
        }
    }
    if (response.allow_sections) {
        response.allow_sections.each(function(e) {
            if ($('opc-' + e)) {
                $('opc-' + e).addClassName('allow');    
            }
        });
    }

    if (response.duplicateShippingInfo) {
        this.syncBillingShipping = true;
        billing.setSameAsShipping(true);
    }

    if (response.goto_section) {
        this.gotoSection(response.goto_section, true);
        return true;
    }

    if (response.redirect && !this.isRedirected) {
        this.isRedirected = true;
        location.href = response.redirect;
        return true;
    }
    return false;
};
Checkout.prototype.reloadProgressBlock = function(toStep) {
    this.reloadStep(toStep);
};
Checkout.prototype.processNormalResponse = function(transport) {
    var response = {};

    if (transport && transport.responseText) {

        try {
            response = eval('(' + transport.responseText + ')');
        }
        catch (e) {
            response = {};
        }

        if (response.error) {
            alert(response.message);
            return false;
        }

        return this.setStepResponse(response);
    }
};
Checkout.prototype.updateHtmlSection = function(htmlElementId, html) {
    jQuery('#' + htmlElementId).html(html); 
    if (deliveryandpayment) {
        deliveryandpayment.setOnSaveChain();
    }
};

// Shipping
Shipping.prototype.initialize = function(form, addressUrl, saveUrl, methodsUrl, reloadMethodsUrl) {
    this.form = form;
    this.addressUrl = addressUrl;
    this.saveUrl = saveUrl;
    this.methodsUrl = methodsUrl;
    this.reloadMethodsUrl = reloadMethodsUrl;
    this.onAddressLoad = this.fillForm.bindAsEventListener(this);
    this.onSave = this.nextStep.bindAsEventListener(this);
    this.onComplete = this.resetLoadWaiting.bindAsEventListener(this);
    this.reloadShippingMethodsTimer = false;

    jQuery(this.form).on('change', function() {
        if ((typeof deliveryandpayment) != 'undefined') {
            deliveryandpayment.shippingSaved = false;
        }
    });
    jQuery('input[name="choose_shipping"]').on('change', function() {
        var $shippingAddressSelect = jQuery('#shipping-address-select'),
            selectedShippingAddressOption = '';

        if (jQuery(this).val() !== 'new') {
            selectedShippingAddressOption = $shippingAddressSelect.find('option:first-child').val();
        }
        $shippingAddressSelect.val(selectedShippingAddressOption).trigger('change');
    });
};
Shipping.prototype.newAddress = function(isNew, blurAddressSelect) {
    if (isNew) {
        this.resetSelectedAddress();
        Element.show('shipping-new-address-form');
        jQuery('input[name="choose_shipping"][value="new"]').prop('checked', true);
    } else {
        Element.hide('shipping-new-address-form');
        jQuery('input[name="choose_shipping"][value=""]').prop('checked', true);
    }
    this.reloadShippingMethodsBlock();
    shipping.setSameAsBilling(false);

    if ((typeof deliveryandpayment) != 'undefined') {
        deliveryandpayment.shippingSaved = false;
    }

    // Let the address selector get focus at first, then make it loose focus after each onchange
    if (typeof blurAddressSelect != "undefined" && blurAddressSelect) {
        $("shipping-address-select").blur();
    }
};
Shipping.prototype.reloadShippingMethodsBlock = function(delayed) {
    var This = this;

    if (this.reloadShippingMethodsTimer) {
        window.clearTimeout(this.reloadShippingMethodsTimer);
    }
    if (delayed) {
        this.reloadShippingMethodsTimer = window.setTimeout(function() {
            This._reloadShippingMethodsBlock();
        }, 3000);
    } else {
        This._reloadShippingMethodsBlock();
    }
};
Shipping.prototype._reloadShippingMethodsBlock = function() {
    var radios = document.getElementsByName('shipping_method');
    var oldShippingMethod = false;
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            oldShippingMethod = radios[i].value;
            break;
        }
    }

    if ((typeof checkout) !== "undefined") {
        checkout.setLoadWaiting('deliveryandpayment');
    }
    
    this.disableShippingMethods();
    var updater = new Ajax.Request(
        this.reloadMethodsUrl,
        {
            method:'post',
            onSuccess: function(transport) {
                var maxShippingPriceWidth = 0,
                    $shippingPrices;

                checkout.processNormalResponse(transport);
                $shippingPrices = jQuery('#checkout-shipping-method-load').find('.price-container');
                $shippingPrices.each(function(index, item) {
                    if (jQuery(item).width() > maxShippingPriceWidth) {
                        maxShippingPriceWidth = jQuery(item).width();
                    }
                });
                $shippingPrices.width(maxShippingPriceWidth);

                if (oldShippingMethod) {
                    var radios = document.getElementsByName('shipping_method');
                    for (var i = 0, length = radios.length; i < length; i++) {
                        if (radios[i].value == oldShippingMethod) {
                            radios[i].checked = true;
                            break;
                        }
                    }
                }
                if ((typeof deliveryandpayment) != 'undefined') {
                    deliveryandpayment.shippingMethodSaved = false;
                }
            },
            onComplete: this.resetLoadWaiting,
            parameters: Form.serialize(this.form)
        }
    );
};
Shipping.prototype.nextStep = function(transport) {
    if (transport && transport.responseText) {
        try {
            response = eval('(' + transport.responseText + ')');
        }
        catch (e) {
            response = {};
            alert(Translator.translate('An error occured during the saving your shipping address. Please try again!'));
            return false;
        }
    }
    if (response.error) {
        if ((typeof response.message) == 'string') {
            alert(response.message);
        } else {
            if (window.shippingRegionUpdater) {
                shippingRegionUpdater.update();
            }
            alert(response.message.join("<br />"));
        }

        return false;
    }

    response.update_section = false;

    checkout.setStepResponse(response);

    return true;
};
Shipping.prototype.resetLoadWaiting = function(transport) {
    shipping.enableShippingMethods();
    checkout.setLoadWaiting(false);
};
Shipping.prototype.enableShippingMethods = function() {
    var $shippingMethods = jQuery('#checkout-shipping-method-load'),
        $shippingMethodCheckboxes = $shippingMethods.find('input[type="radio"][name="shipping_method"]');

    if ($shippingMethodCheckboxes.length) {
        $shippingMethods.css('opacity', '1');
        $shippingMethodCheckboxes.prop('disabled', false);
        $shippingMethods.find('tr.disabled input[type="radio"][name="shipping_method"]').prop('disabled', true);
        $shippingMethodCheckboxes.last().addClass('validate-one-required-by-name');
    }
};
Shipping.prototype.disableShippingMethods = function() {
    var $shippingMethods = jQuery('#checkout-shipping-method-load'),
        $shippingMethodCheckboxes = $shippingMethods.find('input[type="radio"][name="shipping_method"]');

    if ($shippingMethodCheckboxes.length) {
        $shippingMethods.css('opacity', '0.6');
        $shippingMethodCheckboxes.prop('disabled', true);
    }
};

// Billing
Billing.prototype.initialize = function(form, addressUrl, saveUrl) {
    this.form = form;

    this.addressUrl = addressUrl;
    this.saveUrl = saveUrl;
    this.onAddressLoad = this.fillForm.bindAsEventListener(this);
    this.onSave = this.nextStep.bindAsEventListener(this);
    this.onComplete = this.resetLoadWaiting.bindAsEventListener(this);

    jQuery(this.form).on('change', function() {
        if ((typeof deliveryandpayment) != 'undefined') {
            deliveryandpayment.billingSaved = false;
        }
    });
};
Billing.prototype.syncWithShipping = function () {
    $('shipping-address-select') && this.newAddress(!$('shipping-address-select').value);
    $('shipping:same_as_billing').checked = true;
    if (!$('shipping-address-select') || !$('shipping-address-select').value) {
        arrElements = Form.getElements(this.form);
        for (var elemIndex in arrElements) {
            if (arrElements[elemIndex].id) {
                var sourceField = $(arrElements[elemIndex].id.replace(/^billing:/, 'shipping:'));
                if (sourceField){
                    arrElements[elemIndex].value = sourceField.value;
                }
            }
        }

        billingRegionUpdater.update();
        if ($('billing:region_id') && $('shipping:region_id')) {
            jQuery('#billing\\:region_id').val(jQuery('#shipping\\:region_id').val()).trigger('change');
        }
        if ($('billing:region') && $('shipping:region')) {
            $('billing:region').value = $('shipping:region').value;
        }
        if ($('billing:country_id') && $('shipping:country_id')) {
            jQuery('#billing\\:country_id').val(jQuery('#shipping\\:country_id').val()).trigger('change');
        }
    } else {
        jQuery('#billing-address-select').val(jQuery('#shipping-address-select').val()).trigger('change');
    }
};
Billing.prototype.setSameAsShipping = function (flag) {
    $('shipping:same_as_billing').checked = flag;
    $('billing:same_as_shipping').checked = flag;

    if (flag) {
        this.syncWithShipping();
    }
};
Billing.prototype.nextStep = function(transport) {
    if (transport && transport.responseText) {
        try {
            response = eval('(' + transport.responseText + ')');
        }
        catch (e) {
            response = {};
            return false;
        }
    }
    if (response.error) {
        if ((typeof response.message) == 'string') {
            alert(response.message);
        } else {
            if (window.billingRegionUpdater) {
                billingRegionUpdater.update();
            }

            alert(response.message.join("<br />"));
        }

        return false;
    }
    if (response.update_section) {
        response.update_section = false;
    }

    checkout.setStepResponse(response);

    payment.initWhatIsCvvListeners();

    return true;
};
Billing.prototype.resetLoadWaiting = function(transport) {
    document.body.fire('billing-request:completed', {transport: transport});
}

// ShippingMethod
ShippingMethod.prototype.initialize = function(form, saveUrl) {
    this.form = form;
    jQuery('#' + this.form).on('change', function() {
        if ((typeof deliveryandpayment) != 'undefined') {
            deliveryandpayment.shippingMethodSaved = false;
        }
    });
    this.saveUrl = saveUrl;
    this.validator = new Validation(this.form);
    this.onSave = this.nextStep.bindAsEventListener(this);
    this.onComplete = this.resetLoadWaiting.bindAsEventListener(this);
};
ShippingMethod.prototype.save = function() {
    if (this.validate()) {
        var serializedFormData = Form.serialize(this.form);

        if (checkout.loadWaiting != false) return;
        checkout.setLoadWaiting('deliveryandpayment');

        if (jQuery('#co-deliverydate-form').length) {
            serializedFormData += '&' + Form.serialize('co-deliverydate-form');
        }

        var request = new Ajax.Request(
            this.saveUrl,
            {
                method:'post',
                onComplete: this.onComplete,
                onSuccess: this.onSave,
                onFailure: checkout.ajaxFailure.bind(checkout),
                parameters: serializedFormData
            }
        );
    }
};
ShippingMethod.prototype.nextStep = function(transport) {
    if (transport && transport.responseText) {
        try{
            response = eval('(' + transport.responseText + ')');
        }
        catch (e) {
            response = {};
            alert(Translator.translate('An error occured during the saving process of the shipping method. Please try again!'));
            return false;
        }
    }
    if (response.error) {
        alert(response.message);
        return false;
    }

    payment.initWhatIsCvvListeners();

    if (response.goto_section) {
        checkout.gotoSection(response.goto_section, true);
    }

    return true;
};
ShippingMethod.prototype.resetLoadWaiting = function(transport) {};

// Payment
Payment.prototype.init = function() {
    this.beforeInit();
    if ($(this.form)) {
        this.validator = new Validation(this.form);
        jQuery('#' + this.form).on('change', function() {
            if ((typeof deliveryandpayment) != 'undefined') {
                deliveryandpayment.paymentSaved = false;
            }
        });
    }

    var elements = Form.getElements(this.form);
    var method = null;
    for (var i=0; i<elements.length; i++) {
        if (elements[i].name=='payment[method]') {
            if (elements[i].checked) {
                method = elements[i].value;
            }
        } else {
            elements[i].disabled = true;
        }
        elements[i].setAttribute('autocomplete','off');
    }
    if (method) {
        this.switchMethod(method);
    }

    this.afterInit();
};
Payment.prototype.nextStep = function(transport) {
    if (transport && transport.responseText) {
        try{
            response = eval('(' + transport.responseText + ')');
        }
        catch (e) {
            response = {};
            alert(Translator.translate('An error occured during the saving process your payment. Please try again!'));
            return false;
        }
    }

    if (response.redirect) {
        this.isSuccess = true;
        location.href = response.redirect;
        return false;
    }

    if (response.error) {
        if (response.fields) {
            var fields = response.fields.split(',');
            for (var i=0; i<fields.length; i++) {
                var field = null;
                if (field = $(fields[i])) {
                    Validation.ajaxError(field, response.error);
                }
            }
            alert(Translator.translate('Please provide all required payment fields in the right format!'));
            return false;
        }
        if (response.message) {
            alert(response.message);
            return false;
        }
        alert(response.error);

        return false;
    }

    jQuery('.global-messages-wrapper').hide();
    checkout.setStepResponse(response);

    return true;
};
Payment.prototype.resetLoadWaiting = function(transport) {};
Payment.prototype.changeVisible = function(method, mode) {
    var block = 'payment_form_' + method;
    [block + '_before', block, block + '_after'].each(function(el) {
        element = $(el);
        if (element) {
            element.style.display = (mode) ? 'none' : '';
            element.select('input', 'select', 'textarea', 'button').each(function(field) {
                field.disabled = mode;
            });
            // On IE 11 the paymetric form does not show sometimes, make sure it is displayed!
            element.select('iframe').each(function(frame) {
                var coll = frame.contentWindow.document.getElementsByTagName('body');
                if (0 < coll.length) {
                    coll[0].style.display = (mode) ? 'none' : '';
                }
            });
        }
    });
};

//DeliveryAndPayment
var DeliveryAndPayment = Class.create();
DeliveryAndPayment.prototype = {
    initialize: function(shipping, billing, shipping_method, payment, saveUrl,
                         reloadPaymentMethodUrl, reference, reloadPurchaseTableUrl, isOrderSimulationNeeded) {
        this.setShipping(shipping);
        this.setBilling(billing);
        this.setShippingMethod(shipping_method);
        this.setPayment(payment);
        this.setReference(reference);

        this.resetAllStepsSavedStatus();

        this.saveUrl = saveUrl;

        this.reloadPurchaseTableUrl = reloadPurchaseTableUrl;
        this.isOrderSimulationNeeded = isOrderSimulationNeeded;

        if (typeof billing === 'object') {
            var This = this;
            this.reloadPaymentMethodsTimer = false;
            this.reloadPaymentMethodUrl = reloadPaymentMethodUrl;
            this.reloadPaymentMethodsBlock(false);

            if (typeof shipping === 'object') {
                this.shipping.reloadShippingMethodsBlock(false);
                This.billing.setSameAsShipping(true);
            }

            jQuery('#' + this.shipping.form).find(':input').on('change', function() {
                This.billing.setSameAsShipping(true);

                var id = jQuery(this).attr('id');
                if (id == 'shipping:country' || id == 'shipping:country_id' || id == 'shipping:postcode') {
                    This.shipping.reloadShippingMethodsBlock(true);
                }
            });
        } else {
            jQuery('#save-delivery-and-payment').prop('disabled', true);
        }
    },
    setShippingMethod: function(shipping_method) {
        this.shipping_method = shipping_method;
    },
    setBilling: function(billing) {
        this.billing = billing;
    },
    setShipping: function(shipping) {
        this.shipping = shipping;
    },
    setPayment: function(payment) {
        this.payment = payment;
    },
    setReference: function(reference) {
        this.reference = reference;
    },
    save: function() {
        if (checkout.loadWaiting != false) return;

        var billingValidator = new Validation(this.billing.form);
        if (!this.payment.validator) {
            this.payment.validator = new Validation(this.payment.form);
        }

        var valid = true;
        if (typeof this.shipping == 'object') {
            var shippingValidator = new Validation(this.shipping.form);
            valid = valid && shippingValidator.validate();
        } else {
            this.shippingSaved = true;
        }

        if (this.shipping_method !== '') {
            valid = valid && this.shipping_method.validate();
        } else {
            this.shippingMethodSaved = true;
        }
        
        valid = valid && billingValidator.validate();

        valid = valid && this.payment.validator.validate();

        valid = valid && this.payment.validate();

        if (this.reference) {
            this.reference.validator = new Validation(this.reference.form);
            valid = valid && this.reference.validator.validate();
        }

        var This = this;

        if (valid) {
            this.setOnSaveChain();
            this._save();
        }
    },
    _save: function() {
        if (jQuery('#p_method_paymetric').is(':checked') && paymetricAuthStatus != 'success') {
            if (jQuery("#paymetric_iframe").get(0).contentDocument.getElementById('PayNowButton')) { 
                jQuery("#paymetric_iframe").get(0).contentDocument.getElementById('PayNowButton').click();
            } else {
                alert(Translator.translate('An error occured during the saving process your payment. Please try again!'));
            }
            return;
        }
        if (this.reference && !this.referenceSaved) {
            this.reference.save();
        } else if (!this.billingSaved) {
            this.billing.save();
        } else if (!this.shippingSaved) {
            this.shipping.save();
        } else if (!this.shippingMethodSaved) {
            if (this.shipping_method !== '') {
                this.shipping_method.save();
            } else {
                this.shippingMethodSaved = true;
            }
        } else if (!this.paymentSaved) {
            if (this.isOrderSimulationNeeded) {
                _HDM_FullpageAjaxLoader.show();
            }
            this.payment.save();
        }
    },
    setOnSaveChain: function() {
        var This = this;

        This.reference.onSave = (function(transport) {
            checkout.setLoadWaiting(false, false);
            This.referenceSaved = true;
            This._save();
        }).bindAsEventListener(This.reference);

        This.billing.onSave = (function(transport) {
            checkout.setLoadWaiting(false, false);
            if (This.billing.nextStep(transport)) {
                This.billingSaved = true;
                This._save();
            } else {
                This.resetAllStepsSavedStatus();
            }
        }).bindAsEventListener(this.billing);

        This.shipping.onSave = (function(transport) {
            checkout.setLoadWaiting(false, false);
            if (This.shipping.nextStep(transport) && !checkout.isRedirected) {
                This.shippingSaved = true;
                This._save();
            } else {
                This.resetAllStepsSavedStatus();
            }
        }).bindAsEventListener(This.shipping);

        This.shipping_method.onSave = (function(transport) {
            checkout.setLoadWaiting(false, false);
            if (This.shipping_method.nextStep(transport) && !checkout.isRedirected) {
                This.shippingMethodSaved = true;
                This._save();
            } else {
                This.resetAllStepsSavedStatus();
            }
        }).bindAsEventListener(This.shipping_method);

        This.payment.onSave = (function(transport) {
            checkout.setLoadWaiting(false, false);
            _HDM_FullpageAjaxLoader.hide();
            if (This.payment.nextStep(transport) && !checkout.isRedirected) {
                This.paymentSaved = true;
                This._save();
            } else {
                This.resetAllStepsSavedStatus();
            }
        }).bindAsEventListener(This.payment);
    },
    resetLoadWaiting: function() {
        checkout.setLoadWaiting(false);
    },
    reloadPaymentMethodsBlock: function(delayed) {
        var This = this;

        if (this.reloadPaymentMethodsTimer) {
            window.clearTimeout(this.reloadPaymentMethodsTimer);
        }
        if (delayed) {
            this.reloadPaymentMethodsTimer = window.setTimeout(function() {
                This._reloadPaymentMethodsBlock();
            }, 3000);
        }
        else {
            This._reloadPaymentMethodsBlock();
        }
    },
    _reloadPaymentMethodsBlock: function() {
        if ((typeof checkout) != 'undefined') {
            checkout.setLoadWaiting('deliveryandpayment');
        }
        var updater = new Ajax.Request(
            this.reloadPaymentMethodUrl,
            {
                method:'post',
                onSuccess: function(transport){
                    checkout.processNormalResponse(transport);
                    if ((typeof deliveryandpayment) != 'undefined') {
                        deliveryandpayment.paymentSaved = false;
                    }
                },
                onComplete: function(transport){
                    checkout.setLoadWaiting(false);
                }
            }
        );
    },
    resetAllStepsSavedStatus: function() {
        this.billingSaved = false;
        this.shippingSaved = false;
        this.shippingMethodSaved = false;
        this.paymentSaved = false;
        this.referenceSaved = false;
    }
};
DeliveryAndPayment.prototype.reloadPurchaseTable = function(shippingMethodFormData) {
    if ((typeof shipping) != 'undefined') {
        shipping.disableShippingMethods();
    }

    var request = new Ajax.Request(
        this.reloadPurchaseTableUrl,
        {
            method: 'post',
            onComplete: function(transport) {
                if ((typeof shipping) != 'undefined') {
                    shipping.enableShippingMethods();
                }
            },
            onSuccess: function(transport) {
                checkout.processNormalResponse(transport);
            },
            onFailure: checkout.ajaxFailure.bind(checkout),
            parameters: shippingMethodFormData
        }
    );
};

//Reference
var Reference = Class.create();
Reference.prototype = {
    initialize: function(form, saveUrl) {
        this.form = form;
        this.saveUrl = saveUrl;

        this.onSave = this.nextStep.bindAsEventListener(this);
        this.onComplete = this.resetLoadWaiting.bindAsEventListener(this);
    },
    save: function() {
        var validator = new Validation(this.form);

        if (validator.validate()) {
            if (checkout.loadWaiting != false) return;
            checkout.setLoadWaiting('deliveryandpayment');

            var serializedFormData = Form.serialize(this.form);

            if (jQuery('#co-deliverydate-form').length) {
                serializedFormData += '&' + Form.serialize('co-deliverydate-form');
            }

            var request = new Ajax.Request(
                this.saveUrl,
                {
                    method:'post',
                    onComplete: this.onComplete,
                    onSuccess: this.onSave,
                    onFailure: checkout.ajaxFailure.bind(checkout),
                    parameters: serializedFormData
                }
            );
        }
    },
    resetLoadWaiting: function(transport) {},
    nextStep: function(transport) {
        checkout.setStepResponse(response);
    }
}