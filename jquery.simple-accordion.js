/*! /dibs/assets/js/dibs/simple-accordion.js  */
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
                defaultTrigger: null
            },
            options = $.extend(true, defaults, settings),
            allItems = $('.accordion-list-items');

        this.find('.master-accordion-list-trigger').click(function () {
            var master = $(this).parents('.master'),
                head = $(this).parent('.accordion-list-head');

            head.toggleClass('master-expanded');

            if (master.length && master.is(':visible')) {
                master.find('.accordion-list').slideToggle();
            }
            return false;
        });

        this.find('.accordion-list-trigger').click(function () {
            var heads = $('.accordion-list-head'),
                myHead = $(this).parent('.accordion-list-head'),
                items = $(this).siblings('.accordion-list-items');

            allItems.slideUp();

            heads
                .removeClass('is-expanded')
                .addClass('is-collapsed');

            if (items.is(':hidden')) {
                myHead.addClass('is-expanded');
                if (options.defaultTrigger) {
                    // no animation on the initial open
                    options.defaultTrigger = null;
                    items.show();
                } else {
                    items.slideDown();
                }
            }
            return false;
        });

        if (options.defaultTrigger) {
            $(options.defaultTrigger).click();
        }

        return this;
    };
})(jQuery);
