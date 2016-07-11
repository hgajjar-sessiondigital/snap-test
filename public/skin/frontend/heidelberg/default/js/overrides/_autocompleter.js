Autocompleter.Base.prototype.fixIEOverlapping = function() {
    Position.clone(this.update, this.iefix, {setTop:(!this.update.style.height)});
    var initialZ = this.update.getStyle('z-index');
    if(initialZ === parseInt(initialZ, 10)) {
        this.iefix.style.zIndex = initialZ - 1;
    } else {
        this.iefix.style.zIndex = 1;
        this.update.style.zIndex = 2;
    }
    Element.show(this.iefix);
};

Varien.searchForm.prototype.initAutocomplete = function(url, destinationElement) {
    this.autocompleter = new Ajax.Autocompleter(
        this.field,
        destinationElement,
        url,
        {
            paramName: this.field.name,
            method: 'get',
            minChars: 2,
            updateElement: this._selectAutocompleteItem.bind(this),
            onShow : function(element, update) {
                if (!update.style.position || update.style.position == 'absolute') {
                    update.style.position = 'absolute';
                    Position.clone(element, update, {
                        setHeight: false,
                        offsetTop: element.offsetHeight
                    });
                    $j(update).css({
                        left: 0,
                        top: $j(element).outerHeight(true)
                    });
                }
                
                Effect.Appear(update,{duration:0});
            }
        }
    );
};
