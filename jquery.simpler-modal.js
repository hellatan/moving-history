/*!
 * jquery.simpler-modal.js by Dale
 */
/**
 * Created with JetBrains PhpStorm.
 * User: daletan
 * Date: 10/11/12
 * Time: 10:54 AM
 * To change this template use File | Settings | File Templates.
 */
/** @namespace $.fn.dibsmodal */

(function () {

    "use strict";

    if ($.fn.getViewport) {
        return;
    }

    $.fn.getViewport = function () { // $(window).height() is returning incorrect values
        var viewPortWidth = window.innerWidth
            || document.documentElement.clientWidth
            || document.getElementsByTagName('body')[0].clientWidth,

            viewPortHeight = window.innerHeight
            || document.documentElement.clientHeight
            || document.getElementsByTagName('body')[0].clientHeight;

        return {
            "width": viewPortWidth,
            "height": viewPortHeight
        };
    };

})();

(function () {

    "use strict";

    if ($.fn.dibsmodal) {
        return;
    }

    $.fn.dibsModal = function (options) {
        return new Modal(options);
    };

    function Modal(opts) {
        var d = document,
            is_open = false,
            api = this,
            $body = $('body'),
            $window = $(window),
            $container, $modalContent, $modalInnerContent, $modalClose, $modalBg,
            // used to keep track of modal content
            storage = {},
            // current modal name
            c_name = '',
            // callback functions
            call_backs = {
                'onClose': {}
            },
            options = $.extend(true, {
                "modal_ids": {
                    "modal": "modalOverlay",
                    "content": "modalOverlay-content",
                    "innerContent": "modalOverlay-inner-content",
                    "close": "modalOverlay-close",
                    "bg": "modalOverlay-bg"
                },
                toggle : {
                    mayClose : true
                }
            }, opts),
            create_methods = {
                modal: function () {
                    var id = options.modal_ids.modal,
                        $modal = $body.find('#' + id);
                    if (!$modal.length) {
                        var $div = $(d.createElement('div'))
                            .attr('id', id)
                            .addClass('modal');
                        $body.append($div);
                        $modal = $div;
                    }
                    $container = $modal;
                    return this;
                },
                modal_content: function () {
                    var content_id = options.modal_ids.content,
                        inner_content_id = options.modal_ids.innerContent,
                        close_id = options.modal_ids.close;
                    $modalContent = $container.find('#' + content_id);
                    if (!$modalContent.length) {
                        var $div = $(d.createElement('div'))
                            .attr('id', content_id)
                            .addClass('modal-content');
                        $modalContent = $div;
                        $container.append($div);
                    }
                    $modalInnerContent = $modalContent.find('#' + inner_content_id);
                    if (!$modalInnerContent.length) {
                        var $inner = $(d.createElement('div'))
                            .attr('id', inner_content_id)
                            .addClass('modal-inner-content');
                        $modalInnerContent = $inner;
                        $modalContent.append($inner);
                    }
                    $modalClose = $modalContent.find('#' + close_id);
                    if (!$modalClose.length) {
                        var $close = $(d.createElement('div'))
                                .attr('id', close_id)
                                .addClass('modal-close'),
                            $close_link = $(d.createElement('a'))
                                .attr({
                                    'id': 'modalOverlay-close-btn',
                                    'href': '#close-modal'
                                })
                                .addClass('modal-close-btn'),
                            close_btn = this.close_button();
                        $modalClose = $close;
                        $close_link.append(close_btn.icon, close_btn.screen);
                        $close.html($close_link);
                        $modalContent.prepend($close);
                    }
                    if (!options.toggle.mayClose) {
                        $modalClose.hide();
                    }
                    return this;
                },
                close_button: function () {
                    var $icon = $(d.createElement('span'))
                            .attr({
                                'aria-hidden': 'true',
                                'data-icon': '8'
                            })
                            .addClass('icon-only is-lowercase'),
                        $screen = $(d.createElement('span'))
                            .addClass('screen-reader-text')
                            .text('Close');
                    return {
                        "icon": $icon,
                        "screen": $screen
                    };
                },
                modal_bg: function () {
                    var bg_id = options.modal_ids.bg;
                    $modalBg = $container.find('#' + bg_id);
                    if (!$modalBg.length) {
                        var $div = $(d.createElement('div'))
                            .attr('id', bg_id)
                            .addClass('modal-bg');
                        $modalBg = $div;
                        $container.append($div);
                    }
                    $modalBg.bind('click', function (e) {
                        e.preventDefault();
                        $.publish('modal:close', e);
    //						api.close(e);
                    });
                    return this;
                }
            };

        this.update = function (name, $content) {
            c_name = name;					// set current modal name
            if (!storage[name]) {
                storage[name] = !$content ? storage[name] : $content;
            } else if (name && $content) {	// update the stored object with new $content
                storage[name] = $content;
            }
            $modalInnerContent.html(storage[name]);
            $.publish('modal:update', [api, $modalContent]);
            return this;
        };

        /**
         * Opens up a modal
         * @param eventName {String} Optional. The event to fire, otherwise defaults to "modal:show"
         * @returns {*}
         */
        this.show = function (eventName) {
            // Prevent page scrolling
            $body.addClass('modal-open');

            $container.addClass(c_name).show();
            is_open = true;
            center();
            $.publish((eventName || 'modal:show'), [api, $modalContent]);
            return this;
        };

        this.close = function (e) {
            e.preventDefault();
            // Allow page scrolling
            $body.removeClass('modal-open');

            $container.hide().removeClass(c_name);
            if (call_backs.onClose[c_name]) {
                call_backs.onClose[c_name]();
            }
            is_open = false;
            c_name = '';
            return false;
        };

        this.enableClose = function () {
            options.toggle.mayClose = true;
            $modalClose.show();
            return this;
        };

        this.disableClose = function () {
            $modalClose.hide();
            options.toggle.mayClose = false;
            return this;
        }

        this.onClose = function(name, callback) {
            call_backs.onClose[name] = callback;
        };

        this.check = function(name) {
            return storage[name];
        };

        function init() {
            create_methods.modal().modal_content().modal_bg();
            $container.on('click', '#modalOverlay-close-btn', function (e) {
                $.publish('modal:close', e);
                return false;
            });
            $.subscribe('modal:close', function (e) {
                if (!options.toggle.mayClose) {
                    $.publish('modal:close:prevented', e);
                    return;
                }
                api.close(e);
            });
        }

        function center() {
            var h = $modalContent.height(),
                win_h = $.fn.getViewport().height,
                top = (win_h - h) / 2;
            if(top < 0){
                top = 0;
            }
            $modalContent.css('top', top);
            $container.css('position', 'fixed');
        }

        function checkScrollBar() {
            var outer = $('<div class="modal-measure-scrollbar" />').prependTo($body),
                inner = $('<div class="inner" />').appendTo(outer),
                width = outer.width() - inner.width();
            outer.remove();

            if (width > 0) {
                var css = '.modal-open #header .header-wrap{max-width: '+($('#page').width()+width)+'px;}.modal-open, .modal-open #header .header-search-box,.modal-open #header #toggleNavSearch{margin-right: '+width+'px;}';
                $('head').append('<style type="text/css">'+css+'</style>');
            }
        }

        this.center = center;

        $window.bind({
            resize: function () {
                center();
            },
            keyup: function (e) { // use keyCode for x-browser
                if (!is_open) {
                    return;
                }
                if (e.keyCode === 27) { // escape
                    $.publish('modal:close', e);
                }
            }
        });

        checkScrollBar();
        init();

        return this;
	}
}());
