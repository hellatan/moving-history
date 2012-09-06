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
 *          <a href="#">head item (expands the list)</a>
 *          <ul class="accordion-list-items" style='display: none;'>
 *              <li><a href="#">item</a></li>
 *              <li><a href="#">item</a></li>
 *              ...etc..
 *          </ul>
 *      </li>
 * </ul>
 *
 * *** INCLUDE SCSS/MODULES/SIMPLE-ACCORDION.SCSS ON YOUR TEMPLATE ***
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

        this.children('.accordion-list-head').find('a').click( function () {
            var main = $(this).parent('.accordion-list-head'),
                items = $(this).siblings('.accordion-list-items');

            allItems.stop(true).slideUp();

            main.addClass(function (index, clss) {
                if (clss.indexOf('is-collapsed') != -1) {
                    main.removeClass('is-collapsed');
                    return "is-expanded";
                }
                main.removeClass('is-expanded');
                return 'is-collapsed';
            });

            if (items.is(':hidden')) {
                items.stop(true).slideDown();
            }
            return false;
        });

        return this;
    };
})(jQuery);
