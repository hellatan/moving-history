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
    $.fn.simpleAccordionList = function () {
        var allItems = $('.accordion-list-items');

        this.find('.accordion-list-trigger').click(function () {
            var heads = $('.accordion-list-head'),
                myHead = $(this).parent('.accordion-list-head'),
                items = $(this).siblings('.accordion-list-items');

            allItems.slideUp();

            heads
                .removeClass('accordion-list-is-expanded')
                .addClass('accordion-list-is-collapsed');

            if (items.is(':hidden')) {
                myHead.addClass('accordion-list-is-expanded');
                items.slideDown();
            }
            return false;
        });

        return this;
    };
})(jQuery);
