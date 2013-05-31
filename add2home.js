/*!
 * Add to Homescreen v2.0.7 ~ Copyright (c) 2013 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */

/*
    for testing purposes:

    windowMock = $.extend(true, {}, window);
    windowMock.navigator = {
        platform: 'iPhone',
        appVersion: "5.0 (iPhone; CPU iPhone OS 6_1_4 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B350 Safari/8536.25",
    };
    a = dibs.addToHome(windowMock);

    You must have the GA tracking extension enabled and on (typically done in Chrome)
        1. go to the homepage (or any page)
            1. Copy and paste the code above into the console
            2. This should result in "Web App - Displayed prompt to install" as the action
        2. go to any page and add the query param mobileBookmark=true. Hit enter to make that
           query param stick in the url
            1. Copy and paste the code above into the console
            2. This should result in "Web App - User opened home screen shortcut" as the action
 */

(function($) {
"use strict";

var addToHome = function (w, addToHomeConfig) {
	var nav = w.navigator,
		isIDevice = 'platform' in nav && (/iphone|ipod|ipad/gi).test(nav.platform),
		isIPad,
		isRetina,
		isSafari,
		isStandalone,
		OSVersion,
		startX = 0,
		startY = 0,
        hasClosed = 0,
        currentUri,
		balloon,
        originalTitle,
        balloonHeader,
        balloonContent,
		overrideChecks,

		positionInterval,
		closeTimeout,


		options = {
			autostart: true,			// Automatically open the balloon
			returningVisitor: false,	// Show the balloon to returning visitors only (setting this to true is HIGHLY RECCOMENDED)
			animationIn: 'fade',		// drop || bubble || fade
			animationOut: 'fade',		// drop || bubble || fade
			startDelay: 2000,			// 2 seconds from page load before the balloon appears
			lifespan: 15000,			// 15 seconds before it is automatically destroyed
			bottomOffset: 14,			// Distance of the balloon from bottom
			expire: 0,					// Minutes to wait before showing the popup again (0 = always displayed)
			message: 'Tap %icon then select "Add to Home Screen" now.',
            headerText:'Add 1stdibs to your homescreen', // Header message
			touchIcon: true,			// Display the touch icon
			arrow: true,				// Display the balloon arrow
			closeButton: true,			// Let the user close the balloon
			iterations: 100,			// Internal/debug use
            addTo: 'body',               // Append popup to this element
            domain: ".1stdibs.com", // domain to use for cookies
            trackingCategory: 'Mobile prompts',
            appTitle: '1stdibs',
            addedFlagName: 'mobileBookmark', // The query param name to look for to see if user came froma  mobile bookmark
            addedFlagValue: 'true',  // the query param value to check against
            addedTrackingCategory: 'Clicks from Mobile Shortcut'
		};

	function init () {
		// Preliminary check, all further checks are performed on iDevices only
		if ( !isIDevice ) {
            return;
        }

		// Merge local with global options
		if ( addToHomeConfig ) {
			for (var i in addToHomeConfig ) {
                if (options.hasOwnProperty(i)) {
                    options[i] = addToHomeConfig[i];
                }
			}
		}

		isIPad = (/ipad/gi).test(nav.platform);
		isRetina = w.devicePixelRatio && w.devicePixelRatio > 1;
		isSafari = (/Safari/i).test(nav.appVersion) && !(/CriOS/i).test(nav.appVersion);
		isStandalone = nav.standalone;
		OSVersion = nav.appVersion.match(/OS (\d+_\d+)/i);
		OSVersion = OSVersion && OSVersion[1] ? +OSVersion[1].replace('_', '.') : 0;

        hasClosed = $.cookie('add2home-closed');

        if (options.autostart) {
            loaded();
        }

	}

	function loaded () {

        var touchIcon = '',
            platform = nav.platform.split(' ')[0],
            parsedUri = dibs.parseUri(w.location.href);

        // If user is launching from the bookmark (the tracking vars will be present)
        // do not show the prompt and add the cookie to prevent it from showing again.
        if (parsedUri.queryKey[options.addedFlagName] === options.addedFlagValue) {
            // remove mobileBookmark=true from url
            delete parsedUri.queryKey[options.addedFlagName];
            var queryParams = [];
            for (var p in parsedUri.queryKey) {
                if (parsedUri.queryKey.hasOwnProperty(p)) {
                    queryParams.push(p + '=' + parsedUri.queryKey[p]);
                }
            }
            currentUri = w.location.pathname + (queryParams.length ? "?" + queryParams.join('&') : "");
            updateHistory(currentUri);
            $.cookie('add2home-closed', 1, { expires: 30, domain: options.domain });
            fireTrackEvent(
                options.trackingCategory,
                'Web App - User opened home screen shortcut',
                w.location.protocol + '//' + w.location.host + currentUri
            );
            return;
        }

		if ( !overrideChecks && hasClosed ) {
            return;
        }

		balloon = document.createElement('div');
		balloon.id = 'addToHomeScreen';
		balloon.style.cssText += 'left:-9999px;-webkit-transition-property:-webkit-transform,opacity;-webkit-transition-duration:0;-webkit-transform:translate3d(0,0,0);position:' + (OSVersion < 5 ? 'absolute' : 'fixed');
        balloonHeader = document.createElement('div');
        balloonHeader.id = 'addToHomeScreenHeader';
        balloonHeader.innerHTML = options.headerText ? options.headerText : 'Install This Web App:';
        balloonContent = document.createElement('div');
        balloonContent.id = 'addToHomeScreenContent';
        balloonContent.className = 'cf';
        balloon.appendChild(balloonHeader);

		if ( options.touchIcon ) {
			touchIcon = isRetina ?
				document.querySelector('head link[rel^=apple-touch-icon][sizes="114x114"],head link[rel^=apple-touch-icon][sizes="144x144"],head link[rel^=apple-touch-icon]') :
				document.querySelector('head link[rel^=apple-touch-icon][sizes="57x57"],head link[rel^=apple-touch-icon]');

			if ( touchIcon ) {
				touchIcon = '<span style="background-image:url(' + touchIcon.href + ')" class="addToHomeTouchIcon"></span>';
			}
		}

		balloon.className = (isIPad ? 'addToHomeIpad' : 'addToHomeIphone') + (touchIcon ? ' addToHomeWide' : '');
		balloonContent.innerHTML += touchIcon +
            options.message.replace('%device', platform).replace('%icon', OSVersion >= 4.2 ? '<span class="addToHomeShare"></span>' : '<span class="addToHomePlus">+</span>') +
			(options.arrow ? '<span class="addToHomeArrow"></span>' : '') +
			(options.closeButton ? '<span class="addToHomeClose">\u00D7</span>' : '');

		balloon.appendChild(balloonContent);
		document.querySelector(options.addTo).appendChild(balloon);

		// Add the close action
		if ( options.closeButton ) {
            balloon.addEventListener('click', clicked, false);
        }

		if ( !isIPad && OSVersion >= 6 ) {
            window.addEventListener('orientationchange', orientationCheck, false);
        }

        fireTrackEvent(options.trackingCategory, 'Web App - Displayed prompt to install', 'ad text: ' + options.headerText + ', ' + options.message);
        addTrackingVariables();
        setTitle();
		setTimeout(show, options.startDelay);
	}

    function fireTrackEvent(category, action, label) {
        if (!category || !action || !label) {
            return false;
        }
        w._gas.push(['_trackEvent', category, action, label, null, true]);
    }

	function show () {
		var duration,
			iPadXShift = 208;

		// Set the initial position
		if ( isIPad ) {
			if ( OSVersion < 5 ) {
				startY = w.scrollY;
				startX = w.scrollX;
			} else if ( OSVersion < 6 ) {
				iPadXShift = 160;
			}

			balloon.style.top = startY + options.bottomOffset + 'px';
			balloon.style.left = 50 + startX + iPadXShift - Math.round(balloon.offsetWidth / 2) + 'px';

			switch ( options.animationIn ) {
				case 'drop':
					duration = '0.6s';
					balloon.style.webkitTransform = 'translate3d(0,' + -(w.scrollY + options.bottomOffset + balloon.offsetHeight) + 'px,0)';
					break;
				case 'bubble':
					duration = '0.6s';
					balloon.style.opacity = '0';
					balloon.style.webkitTransform = 'translate3d(0,' + (startY + 50) + 'px,0)';
					break;
				default:
					duration = '1s';
					balloon.style.opacity = '0';
			}
		} else {
			startY = w.innerHeight + w.scrollY;

			if ( OSVersion < 5 ) {
				startX = Math.round((w.innerWidth - balloon.offsetWidth) / 2) + w.scrollX;
				balloon.style.left = startX + 'px';
				balloon.style.top = startY - balloon.offsetHeight - options.bottomOffset + 'px';
			} else {
				balloon.style.left = '50%';
				balloon.style.marginLeft = -Math.round(balloon.offsetWidth / 2) - ( w.orientation%180 && OSVersion >= 6 ? 40 : 0 ) + 'px';
				balloon.style.bottom = options.bottomOffset + 'px';
			}

			switch (options.animationIn) {
				case 'drop':
					duration = '1s';
					balloon.style.webkitTransform = 'translate3d(0,' + -(startY + options.bottomOffset) + 'px,0)';
					break;
				case 'bubble':
					duration = '0.6s';
					balloon.style.webkitTransform = 'translate3d(0,' + (balloon.offsetHeight + options.bottomOffset + 50) + 'px,0)';
					break;
				default:
					duration = '1s';
					balloon.style.opacity = '0';
			}
		}

		balloon.offsetHeight;	// repaint trick: http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes
        balloon.style.webkitTransitionDuration = duration;
		balloon.style.opacity = '1';
		balloon.style.webkitTransform = 'translate3d(0,0,0)';
		balloon.addEventListener('webkitTransitionEnd', transitionEnd, false);

		closeTimeout = setTimeout(close, options.lifespan);
	}

	function manualShow (override) {
		if ( !isIDevice || balloon ) {
            return;
        }

		overrideChecks = override;
		loaded();
	}

	function close () {
		clearInterval( positionInterval );
		clearTimeout( closeTimeout );
		closeTimeout = null;

		// check if the popup is displayed and prevent errors
		if ( !balloon ) {
            return;
        }

		var posY = 0,
			posX = 0,
			opacity = '1',
			duration = '0';

		if ( options.closeButton ) {
            balloon.removeEventListener('click', clicked, false);
        }
		if ( !isIPad && OSVersion >= 6 ) {
            window.removeEventListener('orientationchange', orientationCheck, false);
        }

		if ( OSVersion < 5 ) {
			posY = isIPad ? w.scrollY - startY : w.scrollY + w.innerHeight - startY;
			posX = isIPad ? w.scrollX - startX : w.scrollX + Math.round((w.innerWidth - balloon.offsetWidth)/2) - startX;
		}

		balloon.style.webkitTransitionProperty = '-webkit-transform,opacity';

		switch ( options.animationOut ) {
			case 'drop':
				if ( isIPad ) {
					duration = '0.4s';
					opacity = '0';
					posY += 50;
				} else {
					duration = '0.6s';
					posY += balloon.offsetHeight + options.bottomOffset + 50;
				}
				break;
			case 'bubble':
				if ( isIPad ) {
					duration = '0.8s';
					posY -= balloon.offsetHeight + options.bottomOffset + 50;
				} else {
					duration = '0.4s';
					opacity = '0';
					posY -= 50;
				}
				break;
			default:
				duration = '0.8s';
				opacity = '0';
		}

		balloon.addEventListener('webkitTransitionEnd', transitionEnd, false);
		balloon.style.opacity = opacity;
		balloon.style.webkitTransitionDuration = duration;
		balloon.style.webkitTransform = 'translate3d(' + posX + 'px,' + posY + 'px,0)';
        removeTrackingVariables();
        resetTitle();
	}


	function clicked () {
        $.cookie('add2home-closed', 1,{ expires: 30, domain: options.domain });
        fireTrackEvent(
            options.trackingCategory,
            'Web App - User closed prompt to install',
            'ad text: ' + options.headerText + ', ' + options.message
        );
		close();
	}

	function transitionEnd () {
		balloon.removeEventListener('webkitTransitionEnd', transitionEnd, false);

		balloon.style.webkitTransitionProperty = '-webkit-transform';
		balloon.style.webkitTransitionDuration = '0.2s';

		// We reached the end!
		if ( !closeTimeout ) {
			balloon.parentNode.removeChild(balloon);
			balloon = null;
			return;
		}

		// On iOS 4 we start checking the element position
		if ( OSVersion < 5 && closeTimeout ) {
            positionInterval = setInterval(setPosition, options.iterations);
        }
	}

	function setPosition () {
		var matrix = new WebKitCSSMatrix(w.getComputedStyle(balloon, null).webkitTransform),
			posY = isIPad ? w.scrollY - startY : w.scrollY + w.innerHeight - startY,
			posX = isIPad ? w.scrollX - startX : w.scrollX + Math.round((w.innerWidth - balloon.offsetWidth) / 2) - startX;

		// Screen didn't move
		if ( posY === matrix.m42 && posX === matrix.m41 ) {
            return;
        }

		balloon.style.webkitTransform = 'translate3d(' + posX + 'px,' + posY + 'px,0)';
	}

	function orientationCheck () {
		balloon.style.marginLeft = -Math.round(balloon.offsetWidth / 2) - ( w.orientation%180 && OSVersion >= 6 ? 40 : 0 ) + 'px';
	}

    function updateQueryStringParameter(uri, key, value) {
        var re = new RegExp("([?|&])" + key + "=.*?(&|$)", "i"),
            separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
            return uri + separator + key + "=" + value;
        }
    }

    function addTrackingVariables() {
        var parsedUri = dibs.parseUri(w.location.href),
            newUri;
        newUri = parsedUri.query ? parsedUri.path + '?' + parsedUri.query : parsedUri.path;
        newUri = updateQueryStringParameter(newUri, options.addedFlagName, options.addedFlagValue);
        updateHistory(newUri);
    }

    function removeTrackingVariables() {
        /*

            VERY REDUNDANT FOR NOW - loaded() METHOD HAS SAME CODE
            NEED TO MAKE THIS DRY

         */
        var parsedUri = dibs.parseUri(w.location.href);
        delete parsedUri.queryKey[options.addedFlagName];
        var queryParams = [];
        for (var p in parsedUri.queryKey) {
            if (parsedUri.queryKey.hasOwnProperty(p)) {
                queryParams.push(p + '=' + parsedUri.queryKey[p]);
            }
        }
        currentUri = w.location.pathname + (queryParams.length ? "?" + queryParams.join('&') : "");
        updateHistory(currentUri);
    }
    function updateHistory(uri) {
        w.history.replaceState({}, '', uri);
    }

    function setTitle() {
        originalTitle = w.document.title;
        w.document.title = options.appTitle;
    }

    function resetTitle() {
        w.document.title = originalTitle;
    }

	// Bootstrap!
	init();

	return {
		show: manualShow,
		close: close,
        clicked: clicked
	};
};

    $(function () {
        dibs.createNamespace('dibs.addToHome', addToHome);
        $.publish('addToHome:loaded');
    });

    return addToHome(window, {});

}(jQuery));

