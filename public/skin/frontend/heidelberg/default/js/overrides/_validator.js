Validation.prototype.validate = function() {
    var result = false;
    var useTitles = this.options.useTitles;
    var callback = this.options.onElementValidate;
    try {
        if (this.options.stopOnFirst) {
            result = Form.getElements(this.form).all(function(elm) {
                if (elm.hasClassName('local-validation') && !this.isElementInForm(elm, this.form)) {
                    return true;
                }
                return Validation.validate(elm,{useTitle : useTitles, onElementValidate : callback});
            }, this);
        } else {
            result = Form.getElements(this.form).collect(function(elm) {
                if (elm.hasClassName('local-validation') && !this.isElementInForm(elm, this.form)) {
                    return true;
                }
                return Validation.validate(elm,{useTitle : useTitles, onElementValidate : callback});
            }, this).all();
        }
    } catch (e) {}

    if (!result && this.options.focusOnError) {
        try {
            var $firstErrorItem = jQuery(Form.getElements(this.form).findAll(function(elm){return $(elm).hasClassName('validation-failed')}).first());

            if (!$firstErrorItem.visible()) {
                var $itemToJumpTo = $firstErrorItem,
                    $itemLabel = $firstErrorItem.parent('.input-box').prev('label');

                if ($itemLabel.length) {
                    $itemToJumpTo = $itemLabel;
                }
                jQuery('html,body').animate({scrollTop: $itemToJumpTo.offset().top});
            }
            Form.getElements(this.form).findAll(function(elm){return $(elm).hasClassName('validation-failed')}).first().focus();
        } catch (e) {}
    }
    this.options.onFormValidate(result, this.form);
    return result;
};
