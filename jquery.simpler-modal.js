/**
 * Created with JetBrains PhpStorm.
 * User: daletan
 * Date: 10/11/12
 * Time: 10:54 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {

	if ($.fn.dibsmodal) {
		return;
	}

	$.fn.dibsModal = function (options) {
		return new Modal(options);
	}

	function Modal(options) {

		var d = document,
			is_open = false,
			api = this,
			$container, $modalContent, $modalInnerContent, $modalClose, $modalBg,
			storage = {}, // used to keep track of modal content
			create_methods = {
				modal: function () {
					var $modal = $('body').find('#modalOverlay');
					if (!$modal.length) {
						var $div = $(d.createElement('div'))
							.attr('id', 'modalOverlay')
							.addClass('modal');
						$('body').append($div);
						$modal = $div;
					}
					$container = $modal;
					return this;
				},
				modal_content: function () {
					$modalContent = $container.find('#modalOverlay-content');
					if (!$modalContent.length) {
						var $div = $(d.createElement('div'))
							.attr('id', 'modalOverlay-content')
							.addClass('modal-content');
						$modalContent = $div;
						$container.append($div);
					}
					$modalInnerContent = $modalContent.find('#modalOverlay-inner-content');
					if (!$modalInnerContent.length) {
						var $inner = $(d.createElement('div'))
							.attr('id', 'modalOverlay-inner-content')
							.addClass('modal-inner-content');
						$modalInnerContent = $inner;
						$modalContent.append($inner);
					}
					$modalClose = $modalContent.find('#modalOverlay-close');
					if (!$modalClose.length) {
						var $close = $(d.createElement('div'))
								.attr('id', 'modalOverlay-close')
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
								'data-icon': 'x'
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
					$modalBg = $container.find('#modalOverlay-bg');
					if (!$modalBg.length) {
						var $div = $(d.createElement('div'))
							.attr('id', 'modalOverlay-bg')
							.addClass('modal-bg');
						$modalBg = $div;
						$container.append($div);
					}
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
			is_open = true;
			return false;
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
					return false;
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