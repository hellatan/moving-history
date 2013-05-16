/*!
 * jQuery Common Sizes
 * Forces all elements in a jQuery object to resize to common height/width.
 * Usage: $('element').commonHeight([250|{method:'min'}]);
 * Arguments: Either an optional integer or an optional object with a key of "method": {method:'max'|'min'|'avg'}
 *      Integer: Supplying an integer manually sets the jQuery object elements to that size in pixels.
 *      Object: Supplying one of the keywords in the `method` object resizes based on the keyword:
 *          `max`: Resizes all selected elements equivalent to the largest element. Default setting.
 *          `min`: Resizes all selected elements equivalent to the smallest element.
 *          `avg`: Calculates the average size of the collective object and sets all elements to that average.
 */

;(function($){
    $.fn.commonHeight = function(settings){
        var defaults = {method:'max'}, len = this.length, a = [], s, i, qty, y=0;
        i = qty = len;

        if(!isNaN(parseInt(settings,10))){
            //If argument is an integer, just set the height.
            return this.height(parseInt(settings, 10));
        }

        s = $.extend(defaults, settings);

        while(i--){
            a.push(this.eq(i).height());
        }

        if(s.method == 'max'){
            return this.height(Math.max.apply(null, a));
        }
        else if(s.method == 'min'){
            return this.height(Math.min.apply(null, a));
        }
        else if(s.method == 'avg'){
            while(len--){
                y+=a[len];
            }
            return this.height(y/qty);
        }

        return this;
    };

    $.fn.commonWidth = function(settings){
        var defaults = {method:'max'}, len = this.length, a = [], s, i, qty, y=0;
        i = qty = len;

        if(!isNaN(parseInt(settings,10))){
            //If argument is an integer, just set the height.
            return this.height(parseInt(settings, 10));
        }

        s = $.extend(defaults, settings);

        while(i--){
            a.push(this.eq(i).width());
        }

        if(s.method == 'max'){
            return this.width(Math.max.apply(null, a));
        }
        else if(s.method == 'min'){
            return this.width(Math.min.apply(null, a));
        }
        else if(s.method == 'avg'){
            while(len--){
                y+=a[len];
            }
            return this.width(y/qty);
        }

        return this;
    };
}(jQuery));