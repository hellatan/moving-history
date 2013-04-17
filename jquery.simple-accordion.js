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

    /**
     *
     * @param key {String|Array} Either a string of the key to use or an array of keys to use to create actual string classes
     */
    function createClassStrings(options, key) {
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

        return options;

    }

    $.fn.simpleAccordionList = function(settings) {
        var api = this,
            defaults = {
                allowAllOpened: false,
                allowAnimation: false,
                classes: {
                    list: 'accordion-list',
                    trigger: 'accordion-list-trigger',
                    listItems: 'accordion-list-items'
                }
            },
            states = {
                closed: 'is-collapsed',
                opened: 'is-opened'
            },
            options,
            $allItems;

        function init(settings) {
            options = $.extend(true, defaults, settings);
            console.log(options);
            options = createClassStrings(options, ["classes", "stateClasses"]);
            $allItems = $(options._classes.listItems);
            api.setup();
        }

        this.setup = function () {
            var $trigger = $(options._classes.trigger),
                $par = $trigger.closest(options._classes.list);

            $par.on('click', $trigger, function (e) {
                e.preventDefault();
                var $this = $(this),
                    $items = $this.find('.accordion-list-items');

                if ($par.children($items).length) {
                    console.log('we have children');
                } else {
                    console.log('NOOOOOO')
                }


                console.log(this);
                console.log('hi', $items);

                if (!options.allowAllOpened) {
//                    $allItems.slideUp();
                    $this.siblings().find('.accordion-list-items').slideUp();
                }

                if ($items.hasClass(states.closed) || (!$items.hasClass(states.closed) && !$items.hasClass(states.opened))) {
                    console.log("opening")
                    $this.addClass(states.opened);
                    $items
                        .slideDown(function () {
                            $items
                                .removeClass(states.closed)
                                .addClass(states.opened);
                        });
                } else {
                    console.log("closing")
                    $this.removeClass(states.opened);
                    $items
                        .slideUp(function () {
                            $items
                                .removeClass(states.opened)
                                .addClass(states.closed);
                        });
                }
                return false;
            });

        };

        init(settings);

        return this;

    };

    $.fn.simpleAccordionList_old = function (settings) {
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
                    listItems: 'accordion-list-items',
                    measurements: 'accordion-list-measurements' // a container that just helps get the height for css3 animations
                },
                elements: {
                    triggerTag: 'span' // this case is when a link is inside the accordion trigger
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


        this.setup = function () {

            api.find(options._classes.masterTrigger).click(function () {
                var $this = $(this),
                    master = $this.parents(options._classes.master),
                    head = $this.parent(options._classes.listHead);

                head.toggleClass('master-expanded');

                if (master.length && master.is(':visible')) {
                    master.find(options._classes.accordionList).slideToggle();
                }
                return false;
            });

            api.find(options._classes.listTrigger).click(function (e) {
                var $this = $(this),
                    $heads = $(options._classes.listHead),
                    $myHead = $this.parent(options._classes.listHead),
                    $items = $this.siblings(options._classes.listItems);
console.log('e target: ', e.target);
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

                if (!options.allowAllOpened) {
                    $allItems.slideUp();
                }

                $heads
                    .removeClass('is-expanded')
                    .addClass('is-collapsed');

                var $heightWrapper = $items.find('.accordion-list-measurements');
                if ($items.is(':hidden') || parseInt($items.css('height'), 10) === 0) {
                    $myHead
                        .removeClass('is-collapsed')
                        .addClass('is-expanded');
                    if (!options.allowAnimation) {
                        // fire this state if on mobile
                        // otherwise animation looks crappy
                        // no animation on the initial open
//                        $items.css({
//                            'display': 'block'
//                        });

                        console.log('height: ', $items.find('.accordion-list-measurements').height());


                        if ($heightWrapper.length) {
                            $items.height($heightWrapper.outerHeight());
                        }

                        $items
                            .removeClass('is-closed')
                            .addClass('animate is-opened');
                    } else {
                        $items
                            .removeClass('is-closed')
                            .addClass('is-opened')
                            .slideDown(function () {
                                console.log("done sliding down")
                            });
                    }
                } else {
                    if (!options.allowAnimation) {
                        console.log(' close height: ', $items.height());
                        // fire this state if on mobile
                        // otherwise animation looks crappy
                        // no animation on the initial open
//                        $items.css({
//                            'display': 'none'
//                        });

                        if ($heightWrapper.length) {
                            $items.height(0);
                        }

                        $items
                            .removeClass('is-opened')
                            .addClass('animate is-closed');
                    } else {
                        $items
                            .removeClass('is-closed')
                            .addClass('is-opened')
                            .slideUp(function () {
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
