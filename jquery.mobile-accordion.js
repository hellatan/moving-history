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
 *          <ul class="mobile-accordion-list-items">
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
    $.fn.mobileAccordionList = function (settings) {
        var api = this,
            defaults = {
                allowAllOpened: false,
                baseClass: '.mobile-accordion-list',
                defaultTrigger: null,
                // having the parent class allows to search for some sort of ID
                parentClass: null,
                path: null,
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
                storage: {}
            },
            prevItems = {
                $masterHead: [],
                $heads: []
            },
            storage = {},
            options = $.extend(true, defaults, settings),
            $allItems = $('.mobile-accordion-list-items');

        var storageMethod = (function  (id, state) {
            var getItem, setItem;
            if (options.storageSettings.method) {
                if (options.storageSettings.method.getItem) {
                    getItem = function (id) {
                        return options.storageSettings.method.getItem.call(options.storageSettings.method, id);
                    };
                    setItem = function (id, state) {
                        options.storageSettings.method.setItem.call(options.storageSettings.method, id, state);
                    };
                } else {
                    // should be the $.cookie method
                    getItem = function (id) {
                        return options.storageSettings.method(id);
                    };
                    setItem = function (id, state) {
                        options.storageSettings.method(id, state);
                    };
                }
            } else {
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
        })();

        this.each(function (i, a) {
            var $this = $(this),
                id = $this.prop('id'),
                $listHead = $this.find('.mobile-accordion-list-head'),
                isExpanded = $listHead.hasClass('is-expanded'),
                state = isExpanded ? 'is-expanded' : 'is-collapsed',
                parentId;

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

            var tmp = storageMethod.getItem(id);
            console.log('we got a tmp: ', tmp, ' Id: ', id, ' state: ', state);
            if (!tmp) {
                storageMethod.setItem(id, state);
            } else {
                if (tmp !== state) {
                    storageMethod.setItem(id, state);
                }
                state = tmp;
            }

            console.log('id: ', storageMethod.getItem(id));
            $listHead.data('storageid', id).data('state', state);
            storage[id].state = state;

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
                $rootItem = $this,
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

            if (!options.allowAllOpened) {
                $allItems.each(function () {
                    var $thisItem = $(this),
                        $par = $thisItem.parent('.is-expanded');
                    $thisItem.removeClass('is-expanded').addClass('is-collapsed').height(0);
                    if ($par.length && !$rootItem.data('isExpanded')) {
                        // need to make sure that $par isn't the same as prevItems.$heads
                        $par.removeClass('is-expanded').addClass('is-collapsed');
                    }
                });
                $heads.each(function () {
                    if (prevItems.$heads.length && !prevItems.$heads.hasClass('is-expanded')) {
                        $(this).removeClass('is-expanded').addClass('is-collapsed');
                    }
                });
            }

            if ($curHead.hasClass('is-collapsed')) {
                var eventType = null;
                $curHead.removeClass('is-collapsed').addClass('is-expanded');
                console.log('height: ', $items.find('.mobile-accordion-measuring-wrap'), ' :: ', $items.find('.mobile-accordion-measuring-wrap').height());
                var h = $items.find('.mobile-accordion-measuring-wrap').outerHeight(true);
                if ($curMaster.length) {
                    if ($curMaster.hasClass('is-expanded')) {
                        var curMasterHeight = $curMaster.height(),
                            itemHeight = $this.outerHeight(true);
                        console.log("curMasterHeight: ", curMasterHeight);
                        $curMaster.find('.mobile-accordion-list.is-expanded').height(curMasterHeight + (h - itemHeight));
                    }
                }
                $items.removeClass('is-collapsed').addClass('is-expanded').height(h);
                prevItems.$heads = $curHead;
                $this.data('isExpanded', true);
                eventType = 'is-expanded';
            } else {
                $curHead.removeClass('is-expanded').addClass('is-collapsed');
                if ($curMaster.length) {
                    if ($curMaster.hasClass('is-expanded')) {
                        var h = $items.find('.mobile-accordion-measuring-wrap').outerHeight(true),
                            itemHeight = $this.outerHeight(true),
                            curMasterHeight = $curMaster.height();
                        console.log("curMasterHeight: ", curMasterHeight);
                        $curMaster.find('.mobile-accordion-list.is-expanded').height(curMasterHeight - (h + itemHeight));
                    }
                }
                // the first .height() function is set here so that initially "is-expanded" facets
                // will be able to animate correctly once the second .height(0) function is called
                // otherwise the initial closing/collapsing click jsut snaps and doesn't animate
                $items.height($items.outerHeight(true)).removeClass('is-expanded').addClass('is-collapsed').height(0);
                prevItems.$heads = [];
                // this means the user has clicked the same accordion trigger twice in a row - once to open it, the second time to close it
                $this.data('isExpanded', false);
                eventType = 'is-collapsed';
            }
            api.fireEvent('accordion:update-items', eventType);
            if (options.parentClass) {
                api.updateFacetStates($this.closest('.mobile-accordion-list-head'), eventType);
            }
            return false;
        });

        this.fireEvent = function (event) {
            if ($.publish && event) {
                $.publish(event, [].slice.call(arguments, 1));
            }
        };

        /**
         * This allows for updating the collapsed/expanded states of facets
         * after an ajax request rather than having to reinstantiating
         * @param facets
         */
        this.updateFacetStates = function ($facet, state) {
            console.log('facet: ', $facet.data());
            if ($facet.length && state) {
                var data = $facet.data();
                $facet.data('state', state);
                if (data.storageid) {
                    storageMethod.setItem(data.storageid, state)
                }
            }
        };

        return this;
    };
})(jQuery);
