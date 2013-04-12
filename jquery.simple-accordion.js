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
    "use strict";
    $.fn.simpleAccordionList = function (settings) {
        var api = this,
            defaults = {
                defaultTrigger: null,
                allowAllOpened: false,
                allowAnimation: true,
                classes: {
                    master: 'master',
                    masterTrigger: 'master-accordion-list-trigger',
                    container: 'accordion-list',
                    listTrigger: 'accordion-list-trigger',
                    listHead: 'accordion-list-head',
                    listItems: 'accordion-list-items'
                },
                stateClasses: {
                    masterExpanded: 'master-expanded'
                }
                // _classes and _stateClasses properties get created with
                // respective classes that start with periods
            },
            options,
            $allItems;


        function init(settings) {
            options = $.extend(true, defaults, settings);
            createClassStrings(["classes", "stateClasses"]);
            $allItems = $(options._classes.listItems);
            api.setup();
        }

        /**
         *
         * @param key {String|Array} Either a string of the key to use or an array of keys to use to create actual string classes
         */
        function createClassStrings(key) {
            if (!key) {
                return;
            }
            var startRegex = /^\./,
                tmpClass, obj;

            /**
             * Creates string classes with correct formatting from a reference class (className => .className) and adds them to antother object for reference.
             * If the `className` already contains a leading period
             * @param keyName {String} The key name for the object to use based on the `options` object
             * @returns {object} The newly created strings object
             */
            function createStrings(keyName) {
                var obj = options[keyName];
                if (!obj) {
                    return;
                }
                var _obj = options['_' + keyName] = {}, klass;
                for (klass in obj) {
                    if (obj.hasOwnProperty(klass)) {
                        tmpClass = obj[klass];
                        if (!startRegex.test(tmpClass)) {
                            tmpClass = '.' + tmpClass;
                        }
                        _obj[klass] = tmpClass;
                    }
                }
                return _obj;
            }

            if (Object.prototype.toString.call(key) === '[object Array]') {
                for (var i = 0, len = key.length; i < len; i++) {
                    createStrings(key[i]);
                }
            } else {
                createStrings(key);
            }


        }

        this.setup = function () {

            api.find(options._classes.masterTrigger).click(function () {
                var $this = $(this),
                    master = $this.parents(options._classes.master),
                    head = $this.parent(options._classes.listHead);

                head.toggleClass('master-expanded');

                if (master.length && master.is(':visible')) {
                    master.find('.accordion-list').slideToggle();
                }
                return false;
            });

            api.find(options._classes.listTrigger).click(function (e) {
                var $this = $(this),
                    $heads = $(options._classes.listHead),
                    $myHead = $this.parent(options._classes.listHead),
                    $items = $this.siblings(options._classes.listItems);

                if (e.target) {
                    if (e.target.nodeName.toLowerCase() === 'a') {
                        // this takes care of any links nested inside the trigger
                        // since you cannot nest anchor tags inside anchor tags, this works out
                        // solves for the "clear" link
                        return;
                    }
                }

                if (!options.allowAllOpened) {
                    $allItems.slideUp();
                }

                $heads
                    .removeClass('is-expanded')
                    .addClass('is-collapsed');

                if ($items.is(':hidden')) {
                    $myHead
                        .removeClass('is-collapsed')
                        .addClass('is-expanded');
                    if (!options.allowAnimation) {
                        // fire this state if on mobile
                        // otherwise animation looks crappy
                        // no animation on the initial open
                        $items.css({
                            'display': 'block'
                        });
                    } else {
                        $items.slideDown(function () {
                            console.log("done sliding down")
                        });
                    }
                } else {
                    if (!options.allowAnimation) {
                        // fire this state if on mobile
                        // otherwise animation looks crappy
                        // no animation on the initial open
                        $items.css({
                            'display': 'none'
                        });
                    } else {
                        $items.slideUp(function () {
                            console.log("done slidign up");
                        });
                    }
                }
                return false;
            });

            if (options.defaultTrigger) {
                $(options.defaultTrigger).click();
            }
        };

        this.fireEvent = function (event) {
            if ($.publish && event) { // based on the simple pub/sub found in core/dibs.js
                // only want arguments after the `event` argument
                $.publish(event, [].slice.call(arguments, 1));
            }
        };

        init(settings);

        return this;
    };
})(jQuery);
