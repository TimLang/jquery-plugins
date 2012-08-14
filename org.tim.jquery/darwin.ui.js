
/*****
 * code from my workmate david.yu
 * 
 * contact with test.yu@gmail.com
 */
(function($) {

	if (window.console) {
		// can't using Function.apply() for safari/chrome console.
		// extend $.console using window.console, don't work in safari/chrome using $.extend()
		$.console = window.console;
	} else {
		// define $.console object for browsers without window.console.
		$.console = {};
		$.each(['assert', 'clear', 'info', 'log', 'warn', 'error'], function(index, name) {
			$.console[name] = $.noop;
		});
	}

	$.fn.debug = function(msg) {
		return this.each(function() {
			if ($.isFunction(msg)) {
				msg.apply(this);
			} else {
				$.console.log(msg);
			}
		});
	};

})(jQuery);

/**
 * jQuery http request query string parse plugin
 * http://blog.yuweijun.co.cc/2008/08/get-parameters-value-from-url-query.html
 */
(function($) {
	$.queryParams = {
		params: {},
		names: [],
		values: [],
		parse: function(queryStr) {
			queryStr = queryStr || window.location.search.slice(1);
			queryStr = queryStr ? queryStr.split(/&(?:amp;)*/) : [];
			for (var i = 0; i < queryStr.length; i++) {
				var single = queryStr[i].split('=');
				if (single[0]) {
					this.params[decodeURIComponent(single[0])] = decodeURIComponent(single[1]);
					this.names.push(decodeURIComponent(single[0]));
					this.values.push(decodeURIComponent(single[1]));
				}
			}
			return this;
		},
		getParamsFromUrl: function(url) {
			var arr = url.split('?');
			if (arr[1]) {
				return this.parse(arr[1]);
			} else {
				return this;
			}
		}
	};
})(jQuery);

/**
 * 根据cookie name，获取cookie
 */
(function($) {
	$.getCookie = function(cookie) {
		var reg = new RegExp('(?:^|\\s+)' + cookie + '=(.+?)(?:;|$)', 'i');
		var match = document.cookie.match(reg);
		// $.console.log(RegExp.$1);
		return match && match[1];
	}
})(jQuery);

/**
 * extend jQuery utilities, add number formmatter to jQuery object
 */
(function($) {
	$.numberFormatter = {
		// 做数字格式化的jQuery Util方法
		withDelimiter: function(num, delimiter) {
			var parts = num.toString().split('.');
			delimiter = delimiter === undefined ? ',' : delimiter;
			parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + delimiter);
			return parts.join('.');
		},
		toPrecision: function(num, precision) {
			return $.numberFormatter.withDelimiter(num.toFixed(precision || 2));
		},
		toPercent: function(num, precision) {
			return (num * 100).toFixed(precision || 2) + '%';
		}
	};
})(jQuery);

// http://gsgd.co.uk/sandbox/jquery/easing
// jQuery动画效果插件，选了其中2个作为常用效果
jQuery.extend(jQuery.easing, {
	easeOutBack: function(x, t, b, c, d, s) {
		if (s === undefined) {
			s = 1.70158;
		}
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	},
	easeOutBounce: function(x, t, b, c, d) {
		if ((t /= d) < (1 / 2.75)) {
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75)) {
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
		} else if (t < (2.5 / 2.75)) {
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
		} else {
			return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
		}
	}
});

// this plugin must include stylesheet: darwin.ui.css
(function($) {
	// jquery plugin for wrap content with a title.
	$.fn.wrapContentWithTitle = function(title) {
		return this.each(function() {
			var self = $(this),
			wrapper = '<div class="darwin-contents-background"></div>',
			beforeContent = $('<div class="darwin-title-left-corner">' + '<div class="darwin-title-right-corner">' + '<div class="darwin-title-background">' + '<div class="darwin-title-button"></div>' + '<div class="darwin-title">' + title + '</div></div></div></div>');
			self.addClass('darwin-contents').wrap(wrapper).parent().before(beforeContent);
			beforeContent.find('.darwin-title-button').mouseover(function() {
				$(this).addClass('darwin-title-button-hover');
			}).mouseout(function() {
				$(this).removeClass('darwin-title-button-hover');
			}).mousedown(function() {
				$(this).addClass('darwin-title-button-press');
			}).mouseup(function() {
				$(this).removeClass('darwin-title-button-press');
				$(this).toggleClass('darwin-title-button-fold');
				self.animate({
					height: 'toggle'
				},
				{
					duration: 1000,
					easing: 'easeOutBack'
				});
			});
		});
	};

	// jquery对象传入的DOM元素需要是一个DIV元素，并以其content作为button的值
	// buttonClassNames: object which contains keys: left, middle, right, leftPressed, middlePressed, rightPressed
	$.fn.wrapButton = function(buttonClassNames) {
		buttonClassNames = buttonClassNames || {};
		var left = buttonClassNames.left || 'darwin-slide-button-left',
		leftPressed = buttonClassNames.leftPressed || left + '-pressed',
		middle = buttonClassNames.middle || 'darwin-slide-button-middle',
		middlePressed = buttonClassNames.middlePressed || middle + '-pressed',
		right = buttonClassNames.right || 'darwin-slide-button-right',
		rightPressed = buttonClassNames.rightPressed || right + '-pressed';
		return this.each(function() {
			var value, self = $(this);
			if ($.nodeName(this, 'div')) {
				value = self.text();
				self.html('<div class="' + left + '"></div><div class="darwin-pointer ' + middle + '">' + value + '</div><div class="' + right + '"></div>').bind({
					mousedown: function(event) {
						$(this).find('.' + left).addClass(leftPressed);
						$(this).find('.' + middle).addClass(middlePressed);
						$(this).find('.' + right).addClass(rightPressed);
					},
					mouseup: function(event) {
						$(this).find('.' + left).removeClass(leftPressed);
						$(this).find('.' + middle).removeClass(middlePressed);
						$(this).find('.' + right).removeClass(rightPressed);
					}
				});
			}
		});
	};
})(jQuery);

/**
 * jQuery plugin
 * add global overlay object for window.
 */
(function($) {
	$.overlay = {
		init: function() {
			// 这个方法必须是在$(document).ready()中使用，因为需要将此DIV添加到document.body中
			var $div = $('#darwin-overlay'),
			size = $div.length;
			if (!size) {
				$div = $('<div/>', {
					id: 'darwin-overlay',
					width: $(document).width(),
					height: $(document).height(),
					css: {
						background: '#000',
						opacity: 0.5,
						position: 'absolute',
						top: 0,
						left: 0,
						zIndex: 1000
					}
				}).appendTo('body').end();
			}
			return $div;
		},
		show: function() {
			if ($('#darwin-overlay').length === 0) {
				$.overlay.init();
			}
			return $('#darwin-overlay').show();
		},
		hide: function() {
			return $('#darwin-overlay').hide();
		}
	};
})(jQuery);

/**
 * jQuery plugin
 * darwin modal windows, must include darwin.ui.css and $.overlay plugin
 */
(function($) {
	$.window = {
		settings: {
			width: 620,
			height: 300,
			left: '50%',
			top: '50%',
			marginLeft: - 310,
			marginTop: - 150,
			title: ''
		}
	};

	$.fn.attachWindow = function(options) {
		return this.each(function() {
			$.overlay.init().show();
			// TODO: 根据传进来的width/height进行修改内部所有DIV的对应width/height，目前是写死的。
			var settings = $.extend({},
			$.window.settings, options || {}),
			title = settings.title,
			box = $('<div class="darwin-modal-window-container"><div class="darwin-modal-window-top-left"></div><div class="darwin-modal-window-top-center"></div><div class="darwin-modal-window-top-right"></div><div class="darwin-modal-window-center-left"></div><div class="darwin-modal-window-center"><div class="darwin-modal-window-center-content"></div></div><div class="darwin-modal-window-center-right"></div><div class="darwin-modal-window-bottom-left"></div><div class="darwin-modal-window-bottom-center"></div><div class="darwin-modal-window-bottom-right"></div><div class="darwin-modal-window-title"><div class="darwin-modal-window-title-content"></div></div></div>'),
			// 将被window包括的内容$this显示出来
			$this = $(this),
			oldDisplay = $this.css('display');
			$this.data('oldDisplayOfStyle', oldDisplay);
			delete settings.title;

			$this.before(box.css(settings)).show();
			box.find('.darwin-modal-window-title-content').text(title).end().find('.darwin-modal-window-center-content').html($this);
		});
	};

	$.fn.detachWindow = function() {
		$.overlay.hide();
		this.closest('.darwin-modal-window-container').before(this).remove();
		this.css('display', this.data('oldDisplayOfStyle'));
	};
})(jQuery);

/**
 * jQuery date utilities
 */
(function($) {
	$.date = {
		addDays: function(days, date) {
			var date = date || new Date();
			return new Date(+ date + days * 24 * 60 * 60 * 1000);
		},
		dbDate: function(date) {
			var date = date || new Date(),
			month = date.getMonth() + 1,
			day = date.getDate(),
			fullMonth = (month < 10 ? '0' : '') + month,
			fullDay = (day < 10 ? '0' : '') + day;
			return [date.getFullYear(), fullMonth, fullDay].join('-');
		},
		dbDateTime: function(date) {
			var date = date || new Date(),
			hours = date.getHours(),
			minutes = date.getMinutes(),
			seconds = date.getSeconds(),
			fullHours = (hours < 10 ? '0' : '') + hours,
			fullMinutes = (minutes < 10 ? '0' : '') + minutes,
			fullSeconds = (seconds < 10 ? '0' : '') + seconds;
			return this.dbDate(date) + ' ' + [fullHours, fullMinutes, fullSeconds].join(':');
		},
		diff: function(date1, date2) {
			var d1 = date1.split('-');
			var d2 = date2.split('-');
			return (Date.UTC(d1[0], d1[1], d1[2]) - Date.UTC(d2[0], d2[1], d2[2])) / 1000 / 24 / 60 / 60;
		}
	};
})(jQuery);

/**
 * jQuery array utilites
 * example 1: $.array.diff(['Kevin', 'van', 'Zonneveld'], ['van', 'Zonneveld']);
 * returns 1: {0:'Kevin'}
 * reference http://phpjs.org/functions/array_diff:309
 */
(function($) {
	$.array = {
		diff: function() {
			var arr1 = arguments[0],
			retArr = {},
			k1 = '',
			i = 1,
			k = '',
			arr = {};
			arr1keys: for (k1 in arr1) {
				if (arr1.hasOwnProperty(k1)) {
					for (i = 1; i < arguments.length; i++) {
						arr = arguments[i];
						for (k in arr) {
							if (arr[k] === arr1[k1]) {
								// If it reaches here, it was found in at least one array, so try next value
								continue arr1keys;
							}
						}
						retArr[k1] = arr1[k1];
					}
				}
			}

			return retArr;
		}
	};
})(jQuery);

/**
 * extend $.fn with disabled and checked of form elements chain operation.
 * get first and set all.
 */
(function($) {
	$.extend($.fn, {
		// TODO: checked can be function and call function to return false or true
		checked: function(checked) {
			if (arguments.length === 0) {
				return this[0].checked;
			} else {
				return this.each(function() {
					this.checked = checked;
				});
			}
		},
		disabled: function(disabled) {
			if (arguments.length === 0) {
				return this[0].disabled;
			} else {
				return this.each(function() {
					this.disabled = disabled;
				});
			}
		},
		display: function(display) {
			if (arguments.length === 0) {
				return $(this).css('display');
			} else {
				return this.each(function() {
					this.style.display = display;
				});
			}
		},
		checkedByValue: function(value, fn) {
			// 这个方法主要是根据value，选中对应的radio
			return this.each(function() {
				if (this.value == value) {
					this.checked = true;
					if (fn && $.isFunction(fn)) {
						// 在选中的元素上调用fn
						fn.call(this, value);
					}
				}
			});
		}
	});
})(jQuery);

/**
 * 下面代码是为了修复jquery中$.event.special.change事件，在IE上该事件还是有较多小问题
 * 因为不能将代码加入到jQuery.event.special.change.filters中，所以另外以插件形式提供
 * 利用控件失去焦点从而触发绑定在元素上的change事件，其中click上绑定是为了修复IE6上的change事件需要双击才能触发，keyup是解决IE多选控件中正确触发change事件
 * Example:
 * $('#select_multiple').change(function(){alert('changed')})
 *		// IE6中需要双击才能发生change事件，利用失去焦点来触发单击事件
 *		.click($.event.fixChangeForIE)
 *		// 在IE中如果用键盘选择时，不能正确触发change事件，IE总是在第2次选择时才触发前一次的change事件，所以加一个键盘keyup监听事件
 *		.keyup($.event.fixChangeForIE);
 */
(function($) {
	$.extend($.event, {
		fixChangeForIE: function(e) {
			if (!$.support.changeBubbles) {
				// 通过下面blur/focus触发IE中的jQuery注册的change事件
				// 不要在事件处理器里用this.blur();this.focus();操作DOM，而是利用timer往javascript事件队列中添加新事件
				var self = this;
				setTimeout(function() {
					self.blur();
				},
				0);
				setTimeout(function() {
					self.focus();
				},
				0);
			}
		}
	});

	// TODO 或者是在这里覆写原来的filters
})(jQuery);

/**
 * 为jQuery.fn添加updatedisplay，检查并设置一个元素的显隐状态，并且当前元素显隐发生变化时，其对那些受其直接影响的元素进行检查
 */
(function($) {
	// 如果为一个对象只添加多个updateDisplay监听，可以用.bind('updatedisplay', fn)和.trigger('updatedisplay')绑定和触发事件
	$.event.special.updatedisplay = {
		setup: function(data, namespaces) {
			// 每个元素在发生第一次此类事件时，触发setup
		},
		teardown: function(namespaces) {
			// 当元素上所有的此类事件监听器被移除时触发teardown
		},
		add: function(handleObj) {
			var handler = handleObj.handler;
			// 每次添加这个事件都会调用add方法，主要在这个方法里用新的handler代理掉原来的handler，对原来的handler做特定的处理
			handleObj.handler = function(event) {
				// Call the originally-bound event handler and return its result.
				return handler.apply(this, arguments);
			};
		},
		remove: function(handleObj) {
			// 每次移除事件都会调用remove方法，相应add方法做一些清理性工作
		},
		_default: function(event) {
			// displaycheck事件触发后产生的默认行为
		}
	};

	// 如果为一个对象只添加一个updateDisplay监听，可以用下面缓存方式而非事件方式操作
	$.fn.updateDisplay = function(fn) {
		return fn ? this.data('updatedisplay', fn) : this.data('updatedisplay').call(this[0]);
	};

})(jQuery);

/**
 * slide door button and links
 */
(function($) {
	$.fn.slideDoor = function() {
		return this.wrap('<div class="darwin-css-button"/>');
	};
})(jQuery);

/**
 * jQuery plugin
 * tooltip like coda website, inspired by http://www.panic.com/coda/ 
 */
(function($) {
	$.easing.easeOutQuad = $.easing.easeOutQuad || function(x, t, b, c, d) {
		return - c * (t /= d) * (t - 2) + b;
	};

	$.tooltip = {
		settings: {
			content: 'tooltip content',
			duration: 250,
			opacity: 0.9,
			// 下面4个回调方法是作为tooltip指向的的DOM元素的方法调用的
			// on****Start方法如果返回false，则不会展现tooltip
			onShowStart: $.noop,
			onShown: $.noop,
			onHideStart: $.noop,
			onHidden: $.noop
		}
	};

	$.fn.tooltip = function(options) {
		// 如果只传入了一个字符串或者是jQuery对象，则将字符串内容作为tooltip的文本内容进行显示
		options = $.extend({},
		$.tooltip.settings, typeof options === 'string' || options instanceof $ ? {
			content: options
		}: options);

		return this.each(function() {
			// inprogressing 用于控制动画完成，避免在tooltip没有完成展开就被关闭
			var self = this,
			$this = $(this),
			inprogressing = false,
			// tooltip box
			box = $('<div class="darwin-tooltip"><div class="darwin-tooltip-top-left"></div><div class="darwin-tooltip-top-center"></div><div class="darwin-tooltip-top-right"></div><div class="darwin-tooltip-middle-left"></div><div class="darwin-tooltip-middle-center"><div class="darwin-tooltip-contents"></div></div><div class="darwin-tooltip-middle-right"></div><div class="darwin-tooltip-bottom-left"></div><div class="darwin-tooltip-bottom-center"><div class="darwin-tooltip-bottom-center-tail"></div></div><div class="darwin-tooltip-bottom-right"></div></div').css({
				opacity: 0,
				display: 'block'
			}).find('.darwin-tooltip-contents').html(options.content).end();

			// make $this absolute or relative for the sake of tooltip position.
			// if ($this.css('position') == 'static') {
			// $this.css('position', 'relative');
			// }
			// 为了方便下面对box的各组成部分计算宽高，需要先将box置为显示，只是将其置为全透明
			$(document.body).append(box);

			var offset = $this.offset(),
			width = $this.width(),
			topLeft = box.find('.darwin-tooltip-top-left'),
			topCenter = box.find('.darwin-tooltip-top-center'),
			topRight = box.find('.darwin-tooltip-top-right'),
			middleLeft = box.find('.darwin-tooltip-middle-left'),
			middleCenter = box.find('.darwin-tooltip-middle-center'),
			middleRight = box.find('.darwin-tooltip-middle-right'),
			bottomLeft = box.find('.darwin-tooltip-bottom-left'),
			bottomCenter = box.find('.darwin-tooltip-bottom-center'),
			bottomRight = box.find('.darwin-tooltip-bottom-right'),
			bottomTail = box.find('.darwin-tooltip-bottom-center-tail'),
			centerWidth = middleCenter.width(),
			centerHeight = middleCenter.height(),
			topLeftWidth = topLeft.width(),
			topLeftHeight = topLeft.height(),
			bottomLeftHeight = bottomLeft.height(),
			bottomLeftWidth = bottomLeft.width(),
			bottomTailWidth = bottomTail.width(),
			boxHeight = topLeftHeight + bottomLeftHeight + centerHeight,
			boxWidth = topLeftWidth + bottomLeftWidth + centerWidth;

			// tooltip部分与触发对象之间有10像素重合，计算box各部分的宽高完成，将box隐藏，并设置box的真实宽高，用于box.animate方法展示动画效果
			box.css({
				position: 'absolute',
				display: 'none',
				top: offset.top - boxHeight,
				left: offset.left,
				height: boxHeight,
				width: boxWidth
			});
			topCenter.css({
				width: centerWidth
			});
			topRight.css({
				left: centerWidth + topLeftWidth
			});
			middleLeft.css({
				height: centerHeight
			});
			middleRight.css({
				height: centerHeight,
				left: centerWidth + topLeftWidth
			});
			middleCenter.css({
				height: centerHeight,
				width: centerWidth
			});
			bottomLeft.css({
				top: topLeftHeight + centerHeight
			});
			bottomCenter.css({
				width: centerWidth,
				top: topLeftHeight + centerHeight
			});
			bottomTail.css({
				left: Math.floor(width / 2)
			});
			bottomRight.css({
				top: topLeftHeight + centerHeight,
				left: centerWidth + topLeftWidth
			});
			box.children().css({
				opacity: options.opacity
			});

			$this.mouseenter(function(event) {
				if (options.onShowStart.call(self, event) !== false && ! inprogressing) {
					inprogressing = true;
					box.animate({
						opacity: [1, 'easeOutQuad'],
						height: ['show', 'easeOutQuad']
					},
					options.duration, function() {
						inprogressing = false;
						$.proxy(options.onShown, self);
					});
				}
				return false;
			}).mouseleave(function(event) {
				if (options.onHideStart.call(self, event) !== false && ! inprogressing) {
					inprogressing = true;
					box.animate({
						opacity: [0, 'easeOutQuad'],
						height: ['hide', 'easeOutQuad']
					},
					options.duration, function() {
						inprogressing = false;
						$.proxy(options.onHidden, self);
					});
				}
				return false;
			});
		});
	};

})(jQuery);

/**
 * $('table').striped()
 */
(function($) {
	$.fn.striped = function() {
		return this.each(function() {
			$('tr:odd', this).addClass('darwin-odd');
			$('tr:even', this).addClass('darwin-even');
		});
	};
})(jQuery);

/**
 * extract from jquery plugin: jquery.validate.js
 * ajax mode: abort
 * usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
 * if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()
 */
(function($) {
	var ajax = $.ajax;
	var pendingRequests = {};
	$.ajax = function(settings) {
		// create settings for compatibility with ajaxSetup
		settings = $.extend(settings, $.extend({},
		$.ajaxSettings, settings));
		var port = settings.port;
		if (settings.mode == 'abort') {
			if (pendingRequests[port]) {
				pendingRequests[port].abort();
			}
			return (pendingRequests[port] = ajax.apply(this, arguments));
		}
		return ajax.apply(this, arguments);
	};
})(jQuery);

/**
 * jquery plugin for breadcrumb
 *
 * $('#breadcrumb').breadcrumb([{text:'111111111', href:'#'}, {text:'22222222', href:'#'}, {text:'333333', href:'#'}, '44444'], 3);
 */
(function($) {

	$.fn.breadcrumb = function(crumbList, selectedIndex) {
		return this.each(function() {
			if (!$.isArray(crumbList)) {
				return false;
			}

			if (selectedIndex === undefined) {
				selectedIndex = 0;
			}

			var crumbContainer = $('<ul class="darwin-breadcrumb"></ul>'),
			max = crumbList.length - 1;
			for (var i = 0; i <= max; i++) {
				var crumb = crumbList[i],
				text,
				href,
				left = $('<span class="darwin-breadcrumb-left"/>'),
				content = $('<span class="darwin-breadcrumb-text"/>'),
				right = $('<span class="darwin-breadcrumb-right"/>'),
				list = $('<li class="darwin-breadcrumb-list">').hover(function() {
					$(this).addClass('darwin-breadcrumb-list-hover');
				},
				function() {
					$(this).removeClass('darwin-breadcrumb-list-hover');
				});
				if ($.isPlainObject(crumb)) {
					text = crumb.text;
					href = crumb.href;
					content.html('<a href="' + href + '">' + text + '</a>');
				} else {
					text = crumb;
					content.html(text);
				}
				if (selectedIndex === i) {
					list.addClass('darwin-breadcrumb-list-choiced');
				}
				list.append(left).append(content).append(right).appendTo(crumbContainer);
			}

			$(this).prepend(crumbContainer);
		});
	};

})(jQuery);

/**
 * wrap content into container or smiple panel with title
 */
(function($) {
    $.fn.wrapContent = function() {
        return this.each(function() {
            var topLeft = $('<div class="darwin-messages-box-top-left"/>'),
            topCenter = $('<div class="darwin-messages-box-top-center"/>'),
            topRight = $('<div class="darwin-messages-box-top-right"/>'),
            topClear = $('<div class="darwin-clear"/>'),
            middleLeft = $('<div class="darwin-messages-box-middle-left"/>'),
            middleCenter = $('<div class="darwin-messages-box-middle-center"/>'),
            middleRight = $('<div class="darwin-messages-box-middle-right"/>'),
            middleClear = $('<div class="darwin-clear"/>'),
            bottomLeft = $('<div class="darwin-messages-box-bottom-left"/>'),
            bottomCenter = $('<div class="darwin-messages-box-bottom-center"/>'),
            bottomRight = $('<div class="darwin-messages-box-bottom-right"/>'),
            bottomClear = $('<div class="darwin-clear"/>'),
            container = $('<div/>').css({width: 475, cssFloat: 'left'});

            container.append(topLeft)
            .append(topCenter)
            .append(topRight)
            .append(topClear)
            .append(middleLeft)
            .append(middleCenter)
            .append(middleRight)
            .append(middleClear)
            .append(bottomLeft)
            .append(bottomCenter)
            .append(bottomRight)
            .append(bottomClear);
            
            $(this).after(container);
            middleCenter.html(this);
        });
    };
    
    $.fn.simplePanel = function(title) {
    	return this.each(function() {
    		var title = title || this.title,
    		box = $('<div class="darwin-box"><dl><dt class="darwin-box-top"></dt><dd class="darwin-box-center"><p class="darwin-box-title"></p><div class="darwin-box-content"></div></dd><dt class="darwin-box-bottom"></dt></dl></div>');
    		box.find('.darwin-box-title').html(title);
    		$(this).after(box);
    		box.find('.darwin-box-content').append(this);
    	});
    };

})(jQuery);

/**
 * jquery tag cloud plugin
 */
(function($) {
	// JSON RegExp
	var rvalidchars = /^[\],:{}\s]*$/;
	
	//create list for tag links
	$.tagCloud = function(data) {
		var container = $("<ul>").attr("class", "darwin-tag-list");
		if (typeof data === "string") {
			data = $.parseJSON(data);
		}
		$.each(data, function(i, val) {
			var li = $("<li>");
			$("<a>").text(val.tag).attr({title: val.tag, href: val.href}).appendTo(li);
			li.children().css({fontSize: val.size + "px", color: val.color});
			li.appendTo(container);
		});
		return container;
	};
	
	// data: url or json
	// json: [{"tag": "tagName", "size": 12, "href": "#", "color": "#ff0"}, {"tag": "tagName2", "size": 15, "href": "#", "color": "#f30"}]
	$.fn.tagCloud = function(data) {
		return this.each(function() {
			var self = $(this);
			if (rvalidchars.test(data)) {
				self.html($.tagCloud(data));
			} else {
				$.getJSON(data, function(response) {
					self.html($.tagCloud(response));
				});
			}
			self.after('<div class="darwin-clear"/>');
		});
	};

})(jQuery);

