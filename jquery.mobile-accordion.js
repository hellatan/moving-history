/*! /dibs/assets/js/dibs/mobile-accordion.js  */
/**
 * Created by timwhidden
 * Date: 29/08/2012
 * Time: 17:43
 * Copyright 1stdibs.com, Inc. 2012. All Rights Reserved.
 *
 * markup structure must be like so:
 *
 * <ul class="my-class">
 *      <li class="accordion-list-head is-collapsed">
 *          <a href="#" class="accordion-list-trigger">head item (expands the list)</a>
 *          <ul class="accordion-list-items" style='display: none;'>
 *              <li><a href="#">item</a></li>
 *              <li><a href="#">item</a></li>
 *              ...etc..
 *          </ul>
 *      </li>
 * </ul>
 *
 * *** INCLUDE SCSS/PLUGINS/SIMPLE-ACCORDION.SCSS ON YOUR TEMPLATE ***
 *
 * The wrapping UL which has the accordion method applied to it can be classed or ID'd in any way
 *      The list head must have 'accordion-list-head' class
 *      The list items must have 'accordion-list-items' class and should have style="display:none" on page load
 *
 * usage (after DOM is ready):
 *      $('.my-class').simpleAccordionList()
 */
(function ($) {
    $.fn.simpleAccordionList = function (settings) {
        var defaults = {
                defaultTrigger: null,
                allAllowedOpen: false,
                elements: {
                    triggerTag: 'span' // this case is when a link is inside the accordion trigger
                }
            },
            prevItems = {
                $masterHead: [],
                $heads: []
            },
            options = $.extend(true, defaults, settings),
            allItems = $('.mobile-accordion-list-items');

        this.find('.master-mobile-accordion-list-trigger').click(function () {
            var master = $(this).parents('.master'),
                head = $(this).parent('.mobile-accordion-list-head');

            head.toggleClass('master-expanded');

            if (master.length && master.is(':visible')) {
                master.find('.mobile-accordion-list').slideToggle();
            }
            return false;
        });

        this.find('.mobile-accordion-list-trigger').click(function (e) {
            var $this = $(this),
                heads = $('.mobile-accordion-list-head'),
                myHead = $this.parent('.mobile-accordion-list-head'),
                items = $this.siblings('.mobile-accordion-list-items');

            if (e.target) {
                if ($(e.target).parent(options.elements.triggerTag).length) {
                    if (e.target.nodeName.toLowerCase() === 'a') {
                        // this takes care of any links nested inside the trigger
                        // since you cannot nest anchor tags inside anchor tags, this works out
                        // solves for the "clear" link
                        return;
                    }
                }
            }

            if (!options.allAllowedOpen) {
                // allItems.slideUp();
                allItems.removeClass('is-expanded').addClass('is-collapsed');
                heads.each(function () {
                    console.log($(this), ' :: ', myHead);
                    if (prevItems.$heads.length && !prevItems.$heads.hasClass('is-expanded')) {
                        $(this).removeClass('is-expanded').addClass('is-collapsed');
                    }
                });
            }

            console.log('head: ', heads);
            // heads.removeClass('is-expanded').addClass('is-collapsed');

            if (myHead.hasClass('is-collapsed')) {
                myHead.removeClass('is-collapsed').addClass('is-expanded');
                console.log('height: ', items.find('.mobile-accordion-measuring-wrap'), ' :: ', items.find('.mobile-accordion-measuring-wrap').height());
                var h = items.find('.mobile-accordion-measuring-wrap').outerHeight(true);
                items.removeClass('is-collapsed').addClass('is-expanded').height(h);
                prevItems.$heads = myHead;
            } else {
                myHead.removeClass('is-expanded').addClass('is-collapsed');
                items.removeClass('is-expanded').addClass('is-collapsed').height(0);
                prevItems.$heads = [];
            }

            return false;

//            if (items.is(':hidden')) {
            if (items.hasClass('is-collapsed')) {
                myHead.removeClass('is-collapsed').addClass('is-expanded');
                if (options.defaultTrigger) {
                    // no animation on the initial open
                    options.defaultTrigger = null;
//                    items.show();
//                    items.removeClass('is-collapsed').addClass('is-expanded');
                } else {
//                    items.removeClass('is-expanded').addClass('is-collapsed');
//                    items.slideDown();
                }
                items.removeClass('is-collapsed').addClass('is-expanded');
            } else {
                items.removeClass('is-expanded').addClass('is-collapsed');
            }
            return false;
        });

        if (options.defaultTrigger) {
            $(options.defaultTrigger).click();
        }

        return this;
    };
})(jQuery);
