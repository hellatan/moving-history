/*! /dibs/assets/js/dibs/mobile-accordion.js  */
/**
 * Created by daletan, modified from jquery.simple-accordion.js by timwhidden
 * Date: 24/04/2013
 * Time: 17:43
 * Copyright 1stdibs.com, Inc. 2013. All Rights Reserved.
 *
 * markup structure must be like so:
 *
 * <ul class="mobile-accordion-list">
 *      <li class="mobile-accordion-list-head is-collapsed">
 *          <a href="#" class="mobile-accordion-list-trigger">head item (expands the list)</a>
 *          <div class="mobile-accordion-list-items">
 *              <ul class="mobile-accordion-measuring-wrap">
 *                  <li><a href="#">item</a></li>
 *                  <li><a href="#">item</a></li>
 *                  ...etc..
 *              </ul>
 *          </div>
 *      </li>
 * </ul>
 *
 * *** INCLUDE scss/plugins/mobile-accordion.scss IN YOUR TEMPLATE ***
 *
 * The wrapping UL which has the accordion method applied to it can be classed or ID'd in any way
 *      - The list head must have 'mobile-accordion-list-head' class
 *          - it can be expanded (.is-expanded) or collapsed (.is-collapsed) by default, depending on which class is applied
 *      - The actual trigger to expanded/collapse the list must have a 'mobile-accordion-list-trigger' class
 *      - A div with 'mobile-accordion-list-items' class must be around the actual list
 *      - The actual list must have a 'mobile-accordion-measuring-wrap' class
 *      - The `mobile-accordion-list-trigger` and the `mobile-accordion-list-items` must be in this order in the DOM
 *
 * usage (after DOM is ready):
 * - initializing:
 *      $('.my-class').mobileAccordionList(settings) (settings optional)
 * - public methods:
 *      - $('.my-class').mobileAccordionList('height')
 *      - $('.my-class').mobileAccordionList('originalHeight')
 *      - $('.my-class').mobileAccordionList('fullHeight', height) (height optional)
 *      - $('.my-class').mobileAccordionList('changeHeight', height) (height required)
 */
(function ($) {
    "use strict";

    var defaults = {
            allowAllOpened: false,
            baseClass: '.mobile-accordion-list',
            defaultTrigger: null,
            // having the parent class allows to search for some sort of ID
            parentClass: null,
            path: null,
            classes: {
                expanded: "is-expanded",
                collapsed: "is-collapsed"
            },
            elements: {
                triggerTag: 'span' // this case is when a link is inside the accordion trigger
            },
            storageSettings: {
                prefix: 'accordion-list-status',
                // override this with dibs.utils.localStorage
                // use the "storage.method" property if trying to
                // remember the user state of the accordion
                method: null// window.localStorage || $.cookie
            },
            deviceWidths: {
                // just going to hardcode these dimensions for now
                mobile: 568,
                tablet: 1024
            },
            storage: {}
        },
        events = {
            accordionUpdate: 'accordion:update-items',
            accordionClicked: 'accordion:clicked'
        },
        prevItems = {
            $masterHead: [],
            $heads: []
        },
        storage = {},
        period_reg = /^\./,
        windowW = $(window).width(),
        $allItems = $('.mobile-accordion-list-items'),
        $listItems, options, deviceType,
        expanded, collapsed,
        _expanded, _collapsed;

    /**
     * A wrapper around the options.storageSettings.method value passed in
     * This will support localStorage, cookies, and private variable references
     */
    var getStorageMethod = function  (options) {
        if (!options) {
            return;
        }
        var getItem, setItem;
        if ((options.storageSettings.method && options.storageSettings.method.getItem)) {
            // browser has localStorage
            getItem = function (id) {
                return options.storageSettings.method.getItem.call(options.storageSettings.method, id);
            };
            setItem = function (id, state) {
                // http://stackoverflow.com/questions/5887326/is-localstorage-reliable-on-an-ipad
                // remove the item before setting the item again
                options.storageSettings.method.deleteItem.call(options.storageSettings.method);
                options.storageSettings.method.setItem.call(options.storageSettings.method, id, state);
            };
        } else if (typeof options.storageSettings.method === 'function') {
            // should be the $.cookie method
            getItem = function (id) {
                return options.storageSettings.method(id);
            };
            setItem = function (id, state) {
                options.storageSettings.method(id, state);
            };
        } else {
            // no localStorage and no $.cookie plugin
            getItem = function (id) {
                return storage[id];
            };
            setItem = function (id, state) {
                if (!storage[id]) {
                    storage[id] = {};
                }
                storage[id].state = state;
            };
        }
        return  {
            getItem: getItem,
            setItem: setItem
        };
    },
    storageMethod;



    /**
     * Similar to jQuery's `.closest()` method, but finding the closest child instead
     * This is currently here since the .mobileAccordionList references this plugin
     * @param filter {Mixed?} Supposed to be the same arguments as `.closest()`? (need to look into this)
     * @returns {*}
     */
    $.fn.closestChild = function(filter) {
        var $currentSet = this, // Current place
            $found;
        while ($currentSet.length) {
            $found = $currentSet.filter(filter);
            if ($found.length) {
                // At least one match: break loop
                break;
            }
            // Get all children of the current set
            $currentSet = $currentSet.children();
        }
        return $found.first(); // Return first match of the collection
    };

    /**
     * @param method {Object|String} Optional
     * - if Object, then it `init`s the plugin
     * - if String, then it looks for the method or property attached to the plugin
     * @returns {*}
     */
    $.fn.mobileAccordionList = function (method) {
        var api = this;

        function init(settings) {
            options = $.extend(true, defaults, settings);
            deviceType = windowW <= options.deviceWidths.mobile ? 'mobile' : windowW > options.deviceWidths.tablet ? 'desktop' : 'tablet';
            // need to rethink this way of setting this method since it only should
            // be created on initial page load and stored in memory
            storageMethod = getStorageMethod(options);

            options._classes = {};
            var klasses = options.classes;
            for (var p in klasses) {
                if (options.classes.hasOwnProperty(p)) {
                    var klass = klasses[p];
                    if (!period_reg.test(klass)) {
                        options._classes[p] = '.' + klass;
                    }
                }
            }

            expanded = options.classes.expanded;
            collapsed = options.classes.collapsed;
            _expanded = options._classes.expanded;
            _collapsed = options._classes.collapsed;

            api.each(function (i, a) {
                var $this = $(this),
                    data = $this.data(),
                    id = $this.prop('id'),
                    $listHead = $this.find('.mobile-accordion-list-head'),
                    isExpanded = $listHead.hasClass(expanded),
                    state = isExpanded ? expanded : collapsed,
                    storageId = id,
                    parentId, storedState, height, clickedStoredState;

                if (options.parentClass) {
                    parentId = $this.closest('.' + options.parentClass).prop('id');
                }

                if (!id && !parentId) {
                    id = options.storageSettings.prefix + ':' + i;
                } else {
                    if (parentId) {
                        id = options.storageSettings.prefix + ':' + parentId;
                    } else {
                        id = options.storageSettings.prefix + ':' + id;
                    }
                }

                if (!storage[id]) {
                    storage[id] = {};
                }

                if (data) {
                    for (var p in data) {
                        if (data.hasOwnProperty(p)) {
                            if (p.indexOf('initialstate') === 0) {
                                var viewType = p.substring('initialstate'.length);
                                if (!storage[id][viewType]) {
                                    storage[id][viewType] = data[p];
                                }
                            }
                        }
                    }
                }

                if (storage[id][deviceType]) {
                    storageId = id + ':' + deviceType;
                }

                storedState = storageMethod.getItem(storageId);
                $listItems = $listHead.find('.mobile-accordion-list-items');
                height = $listItems.find('.mobile-accordion-measuring-wrap').outerHeight(true);

                if (!storedState) {
                    storageMethod.setItem(storageId, state);
                } else {
                    if (storedState !== state) {
                        if (storedState === expanded) {
                            $listHead.removeClass(collapsed).addClass(expanded);
                            $listItems.data('originalHeight', height).height(height).removeClass(collapsed).addClass(expanded);
                        } else {
                            $listHead.removeClass(expanded).addClass(collapsed);
                            $listItems.height(height).removeClass(expanded).addClass(collapsed).height(0);
                        }
                        fireEvent(events.accordionUpdate, null, $listHead, storedState);
                    }
                    state = storedState;
                }

                if (deviceType === 'desktop') {
                    clickedStoredState = storageMethod.getItem(storageId + ':clicked');
                    if (!clickedStoredState && state === collapsed) {
                        $listHead.removeClass(collapsed).addClass(expanded);
                        $listItems.data('originalHeight', height).height(height).removeClass(collapsed).addClass(expanded);
                        fireEvent(events.accordionUpdate, null, $listHead, expanded);
                    }
                }

                $listHead.data('storageid', storageId).data('state', state);
                storage[id].state = state;

            });

            api.find('.master-mobile-accordion-list-trigger').click(function () {
                var $master = $(this).parents('.master'),
                    head = $(this).parent('.mobile-accordion-list-head');

                head.toggleClass('master-expanded');

                if ($master.length) {
                    var $list = $master.find('.mobile-accordion-list'),
                        height = $list.children('.mobile-accordion-measuring-wrap').outerHeight(true),
                        isExpanded = $list.hasClass(expanded);
                    if (isExpanded) {
                        $master.removeClass(expanded).addClass(collapsed);
                        $list.height(height).removeClass(expanded).addClass(collapsed).height(0);
                    } else {
                        $master.removeClass(collapsed).addClass(expanded);
                        $list.height(height).removeClass(collapsed).addClass(expanded);
                    }
                }
                return false;
            });

            api.find('.mobile-accordion-list-trigger').click(function (e) {
                var $this = $(this),
                    $rootItem = $this,
                    $heads = $('.mobile-accordion-list-head'),
                    $curMaster = $this.parents('.master'),
                    $curHead = $this.parent('.mobile-accordion-list-head'),
                    $items = $this.siblings('.mobile-accordion-list-items'),
                    measuringHeight, curMasterHeight, itemHeight, facetState;

                if (e.target) {
                    if ($(e.target).parent(options.elements.triggerTag).length) {
                        if (e.target.nodeName.toLowerCase() === 'a') {
                            // this takes care of any links nested inside the trigger
                            // since you cannot nest anchor tags inside anchor tags,
                            // this works out solves for the "clear" link
                            return;
                        }
                    }
                }

                if (!options.allowAllOpened) {
                    $allItems.each(function () {
                        var $thisItem = $(this),
                            $par = $thisItem.parent(_expanded);
                        $thisItem.removeClass(expanded).addClass(collapsed).height(0);
                        if ($par.length && !$rootItem.data('isExpanded')) {
                            // need to make sure that $par isn't the same as prevItems.$heads
                            $par.removeClass(expanded).addClass(collapsed);
                        }
                    });
                    $heads.each(function () {
                        if (prevItems.$heads.length && !prevItems.$heads.hasClass(expanded)) {
                            $(this).removeClass(expanded).addClass(collapsed);
                        }
                    });
                }

                measuringHeight = $items.find('.mobile-accordion-measuring-wrap').outerHeight(true);
                itemHeight = $this.outerHeight(true);

                if ($curHead.hasClass(collapsed)) {
                    $curHead.removeClass(collapsed).addClass(expanded);
                    if ($curMaster.length) {
                        if ($curMaster.hasClass(expanded)) {
                            curMasterHeight = $curMaster.height();
                            $curMaster.find('.mobile-accordion-list' + _expanded).height(curMasterHeight + (measuringHeight - itemHeight));
                        }
                    }
                    // give it a height before applying the classes otherwise the first animation
                    // will not happen and the accordion will just snap in but on subsequent expands
                    // it will animate since there is a height assigned to it
                    // this works fine in chrome unlike the case stated below
                    $items.height(measuringHeight).removeClass(collapsed).addClass(expanded).height(measuringHeight);
                    prevItems.$heads = $curHead;
                    $this.data('isExpanded', true);
                    facetState = expanded;
                } else {
                    $curHead.removeClass(expanded).addClass(collapsed);
                    if ($curMaster.length) {
                        if ($curMaster.hasClass(expanded)) {
                            curMasterHeight = $curMaster.height();
                            $curMaster.find('.mobile-accordion-list' + _expanded).height(curMasterHeight - (measuringHeight + itemHeight));
                        }
                    }
                    // the first .height() function is set here so that initially "is-expanded" facets
                    // will be able to animate correctly once the second .height(0) function is called
                    // otherwise the initial closing/collapsing click just snaps and doesn't animate
                    // this seems to be fine in firefox but does not apply to chrome
                    $items.height($items.outerHeight(true)).removeClass(expanded).addClass(collapsed).height(0);
                    prevItems.$heads = [];
                    // this means the user has clicked the same accordion trigger twice in a row - once to open it, the second time to close it
                    $this.data('isExpanded', false);
                    facetState = collapsed;
                }
                fireEvent(events.accordionUpdate, e, $this, facetState);
                // this ensures this is an actual click for tracking purposes
                fireEvent(events.accordionClicked, e, $this, facetState);
                if (options.parentClass) {
                    updateFacetStates($this.closest('.mobile-accordion-list-head'), facetState);
                }
                return false;
            });
        }

        /**
         * just a wrapper for the $.publish handler
         * @param event {String} The event name
         * @param arguments {Mixed} 1..n Any number of arguments to pass along to the publisher
         */
        function fireEvent(event) {
            if ($.publish && event) {
                $.publish(event, [].slice.call(arguments, 1));
            }
        }

        /**
         * updates the storage state of the facets
         * @param $facet
         * @param state
         */
        function updateFacetStates($facet, state) {
            if ($facet.length && state) {
                var data = $facet.data();
                $facet.data('state', state);
                if (data.storageid) {
                    storageMethod.setItem(data.storageid, state);
                    storageMethod.setItem(data.storageid + ':clicked', state);
                }
            }
        }

        /**
         * Returns the current height of the measuring div
         * @returns {Number}
         */
        this.height = function () {
            return $(this).closestChild('.mobile-accordion-measuring-wrap').height();
        };

        /**
         * Gets the original height of the accordion when
         * @returns {Number}
         */
        this.originalHeight = function() {
            var $child = $(this).closestChild('.mobile-accordion-list-items'),
                ret = $child.data('originalHeight');
            if (!ret) { // this case should never happen, but just in case...
                ret = $child.closestChild('.mobile-accordion-measuring-wrap').outerHeight(true);
                $child.data('originalHeight', ret);
            }
            return ret;
        };

        /**
         * Gets the height of the accordion if it has been expanded beyond its original height
         * If there is no "fullHeight" data attribute value set yet, a height value must be passed in
         * in order to set the height for storage reasons
         * @param height
         * @returns {Number}
         */
        this.fullHeight = function (height) {
            var $child = $(this).closestChild('.mobile-accordion-list-items'),
                ret = $child.data('fullHeight');
            if (ret) {
                return ret;
            }
            if (arguments.length === 2) {
                $child.data('fullHeight', height);
            }
            return height;
        };

        /**
         * Changes the height of accordion
         * @param height
         * @returns {*}
         */
        this.changeHeight = function (height) {
            $(this).closestChild('.mobile-accordion-list-items').height(height);
            return api;
        };

        /**
         * recommended jQuery plugin structure in order to expose public methods
         * scenarios:
         * - if `settings` is a string...
         * -- and results in a method on `this` object, return and apply any arguments (minus the method name) to the resulting method
         * -- otherwise return the property value
         * - if `settings` is an object or there is no `settings` argument passed in, call the `init` method and apply all arguments
         * - if all else fails, throw an error
         */
        if (api[method]) {
            if (typeof api[method] === 'function') {
                return api[method].apply(api, [].slice.call( arguments, 1 ));
            }
            return api[method];
        } else if ( typeof method === 'object' || !method ) {
            return init.apply(api, arguments);
        } else {
            $.error( 'Method ' + method + ' does not exist on jQuery.mobileAccordionList' );
        }

        return this;
    };

})(jQuery);
