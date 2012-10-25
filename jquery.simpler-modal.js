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
(function () {

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
	}

})();

(function () {

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
			$container, $modalContent, $modalInnerContent, $modalClose, $modalBg,
			storage = {}, // used to keep track of modal content
			options = $.extend(true, {
				"modal_ids": {
					"modal": "modalOverlay",
					"content": "modalOverlay-content",
					"innerContent": "modalOverlay-inner-content",
					"close": "modalOverlay-close",
					"bg": "modalOverlay-bg"
				}
			}, opts),
			create_methods = {
				modal: function () {
					var id = options.modal_ids.modal
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
						api.close(e);
					});
					return this;
				}
			};

		this.update = function (name, $content) {
			if (!storage[name]) {
				storage[name] = !$content ? name : $content;
			} else if (name && $content) { // update the stored object with new $content
				storage[name] = $content;
			}
			$modalInnerContent.html(storage[name]);
			return this;
		};

		this.show = function () {
			$container.show();
			is_open = true;
			center();
			return this;
		};

		this.close = function (e) {
			e.preventDefault();
			$container.hide();
			is_open = false;
			return false;
		};
		
		this.check = function(name) {
			if (storage[name]) {
				return true;
			} else {
				return false;
			}
		};

		function init() {
			create_methods.modal().modal_content().modal_bg();
			$container.on('click', '#modalOverlay-close-btn', function (e) {
				api.close(e);
			});
		};

		function center() {
			var h = $modalContent.height(),
				win_h = $.fn.getViewport().height,
				top = (win_h - h) / 2;
			$modalContent.css('top', top);
		}

		var key_codes = {
			"27": "escape"
		};

		$(window).bind({
			resize: function () {
				center();
			},
			keyup: function (e) { // use keyCode for x-browser
				if (!is_open) {
					return;
				}
				if (e.keyCode === 27) { // escape
					api.close(e);
				}
			}
		});

		init();

		return this;
	}
}());
