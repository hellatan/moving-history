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
        var api = this,
            defaults = {
                path: null,
                defaultTrigger: null,
                allAllowedOpen: false,
                elements: {
                    triggerTag: 'span' // this case is when a link is inside the accordion trigger
                },
                storage: {
                    prefix: 'accordion-list-status'
                }
            },
            prevItems = {
                $masterHead: [],
                $heads: []
            },
            storage = {},
            options = $.extend(true, defaults, settings),
            $allItems = $('.mobile-accordion-list-items');

        this.each(function (i, a) {
            var $this = $(this),
                id = $this.prop('id'),
                isExpanded = $this.find('.mobile-accordion-list-head').hasClass('is-expanded'),
                status = isExpanded ? 'is-expanded' : 'is-collapsed';

            if (!id) {
                id = options.storage.prefix + ':' + i;
            } else {
                id = options.storage.prefix + ':' + id;
            }
            if (!storage[id]) {
                storage[id] = {};
            }

            /**
             *
             *  NEED TO FIGURE OUT HOW TO NOT RELY ON LOCALSTORAGE STUFF HERE
             *
             */

            if (dibs.findNamespaceValue('dibs.utils.localStorage')) {
                var tmp = dibs.utils.localStorage.getItem(id);
                if (!tmp) {
                    dibs.utils.localStorage.setItem(id, status);
                } else {
                    if (tmp !== status) {
                        dibs.utils.localStorage.setItem(id, status);
                    }
                    status = tmp;
                }
            }

            storage[id].status = status;

        });

        this.find('.master-mobile-accordion-list-trigger').click(function () {
            var $master = $(this).parents('.master'),
                head = $(this).parent('.mobile-accordion-list-head');

            head.toggleClass('master-expanded');

            if ($master.length) {
                var $list = $master.find('.mobile-accordion-list'),
                    height = $list.children('.mobile-accordion-measuring-wrap').outerHeight(true),
                    isExpanded = $list.hasClass('is-expanded');
                if (isExpanded) {
                    $master.removeClass('is-expanded').addClass('is-collapsed');
                    $list.removeClass('is-expanded').addClass('is-collapsed').height(0);
                } else {
                    $master.removeClass('is-collapsed').addClass('is-expanded');
                    $list.removeClass('is-collapsed').addClass('is-expanded').height(height);
                }
            }
            return false;
        });

        this.find('.mobile-accordion-list-trigger').click(function (e) {
            var $this = $(this),
                $heads = $('.mobile-accordion-list-head'),
                $curMaster = $this.parents('.master'),
                $curHead = $this.parent('.mobile-accordion-list-head'),
                $items = $this.siblings('.mobile-accordion-list-items');

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
                $allItems.removeClass('is-expanded').addClass('is-collapsed');
                $heads.each(function () {
                    if (prevItems.$heads.length && !prevItems.$heads.hasClass('is-expanded')) {
                        $(this).removeClass('is-expanded').addClass('is-collapsed');
                    }
                });
            }

            if ($curHead.hasClass('is-collapsed')) {
                $curHead.removeClass('is-collapsed').addClass('is-expanded');
                console.log('height: ', $items.find('.mobile-accordion-measuring-wrap'), ' :: ', $items.find('.mobile-accordion-measuring-wrap').height());
                var h = $items.find('.mobile-accordion-measuring-wrap').outerHeight(true);
                if ($curMaster.length) {
                    if ($curMaster.hasClass('is-expanded')) {
                        var curMasterHeight = $curMaster.height();
                        console.log("curMasterHeight: ", curMasterHeight);
                        $curMaster.find('.mobile-accordion-list.is-expanded').height(curMasterHeight + h);
                    }
                }
                $items.removeClass('is-collapsed').addClass('is-expanded').height(h);
                prevItems.$heads = $curHead;
                api.fireEvent('accordion:update-items', 'expanded');
            } else {
                var h = $items.find('.mobile-accordion-measuring-wrap').outerHeight(true);
                $curHead.removeClass('is-expanded').addClass('is-collapsed');
                if ($curMaster.length) {
                    if ($curMaster.hasClass('is-expanded')) {
                        var curMasterHeight = $curMaster.height();
                        console.log("curMasterHeight: ", curMasterHeight);
                        $curMaster.find('.mobile-accordion-list.is-expanded').height(curMasterHeight - h);
                    }
                }
                $items.removeClass('is-expanded').addClass('is-collapsed').height(0);
                prevItems.$heads = [];
                api.fireEvent('accordion:update-items', 'collapsed');
            }

            console.log('ending here');
            return false;

            console.log('if you made it here...you are wrong');

//            if (items.is(':hidden')) {
            if ($items.hasClass('is-collapsed')) {
                $curHead.removeClass('is-collapsed').addClass('is-expanded');
                if (options.defaultTrigger) {
                    // no animation on the initial open
                    options.defaultTrigger = null;
//                    items.show();
//                    items.removeClass('is-collapsed').addClass('is-expanded');
                } else {
//                    items.removeClass('is-expanded').addClass('is-collapsed');
//                    items.slideDown();
                }
                $items.removeClass('is-collapsed').addClass('is-expanded');
            } else {
                $items.removeClass('is-expanded').addClass('is-collapsed');
            }
            return false;
        });

        this.fireEvent = function (event) {
            if ($.publish && event) {
                $.publish(event, [].slice.call(arguments, 1));
            }
        };

        return this;
    };
})(jQuery);
