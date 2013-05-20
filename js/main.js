/* @author Adam Cox <adamdama@hotmail.com> */

// Avoid `console` errors in browsers that lack a console
if (!(window.console && console.log)) {
	(function() {
		var noop = function() {};
		var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
		var length = methods.length;
		var console = window.console = {};
		while (length--) {
			console[methods[length]] = noop;
		}
	}());
}

// Site code
$(function(){
	var $window,
		$nav,
		$navInner,
		$navItems,
		$content,
		$contentItems;

	var init = function(){
		$window = $(window);
		$nav = $('#nav');
		$navInner = $nav.children('.nav-inner');
		$navItems = $nav.find('li');
		$content = $('#content');
		$contentItems = $content.children('div');

		fixNavigationPosition();
		activateNavigation();
	};

	var activateNavigation = function(){
		// get the navigation and add click handler to the links
		$nav.find('a').on('click', function(e){
			e.preventDefault();

			var $this = $(this),
				index = $this.closest('li').index(),
				href = $this.attr('href'),
				path = href.replace(this.baseURI, ''),
				ext = href.lastIndexOf('.'),
				page = path.substr(0, ext >= 0 ? ext : path.length);

			$navItems.removeClass('active')
				.eq(index)
				.addClass('active');

			$contentItems.removeClass('active')
				.filter('[data-name="'+page+'"]')
				.addClass('active');
		});
	};

	var fixNavigationPosition = function(){
		var st, nh, wh, top;

		$window.on('scroll resize', function(){
			nh = $navInner.height();
			wh = $window.height();

			if(wh > nh) {
				$navInner.css('top', 0);
				$navInner.addClass('c-fixed');
			} else {
				st = $window.scrollTop();

				if(nh - st <= wh) {
					$navInner.css('top', wh - nh + 'px');
					$navInner.addClass('c-fixed');
				} else {
					$navInner.css('top', 0);
					$navInner.removeClass('c-fixed');
				}
			}
		});
	};

	init();
});

// Google Analytics
/*var _gaq=[['_setAccount','UA-XXXXX-X'],['_trackPageview']];
(function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
	g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
	s.parentNode.insertBefore(g,s)}(document,'script'));*/