jQuery.fn.setPlaceholder = function(){
	/*!
	 * setPlaceholder v1.0
	 * http://library.niftinessafoot.com/placeholder
	 * A jQuery plugin to emulate the placeholder attribute for browsers not natively supporting it.
	 * Dependencies: jQuery 1.6.1+
	 *
	 * Usage:Run .setPlaceholder against a jQuery object containing text fields.
	 *
	 * Copyright 2010-2012, Matthew Smith [m at niftinessafoot dot com]
	 * Licensed under the MIT license.
	*/
	return this.each(function(i, el){
		var t = $(el)
		,	title = t.attr('placeholder')
		,	testPlaceholder = document.createElement(el.nodeName)
		;


		if(!('placeholder' in testPlaceholder)){
			t.val(title);
			t.on('focusin focusout',function(e){
				if(e.type === 'focusin'){
					if(t.val() === title){
						t.val('');
					}
				}
				else{
					if(t.attr('value') === ''){
						t.val(title);
					}
				}
			});
		}
	});
};