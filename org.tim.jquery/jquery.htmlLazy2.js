
/*************
 * lazy load plugins for images or html source
 * 
 * based on jquery 1.4.4
 * 
 * @author Tim_Lang 
 * 
 * @since 2011.9
 */
(function ($) {

    var PLUGIN_NAME = "htmlLazy2";
    var DATA_TYPE_IMG = "img";
    var DATA_TYPE_HTML = "html";
    var DATA_TYPE_BOTH = "both";

    //it's a cache
    var cache = {
        loadURLS: {},
        loadIMGS: {}
    };

    function autoResize(target) {
        var opts = $.data(target, PLUGIN_NAME).options;

        var pResizeTimer = opts.pResizeTimer;

        if (pResizeTimer) return '';
        pResizeTimer = setTimeout(function () {
            resize_run(target);
            try {
                clearTimeout(pResizeTimer);
            } catch (e) {}
            pResizeTimer = null;
        }, 100);
    }

    function resize_run(target) {
        var minTop, minLeft, maxTop, maxLeft;
        var opts = $.data(target, PLUGIN_NAME).options;

        if (isDocumentObject(target)) {
            minTop = document.body.scrollTop || document.documentElement.scrollTop;
            minLeft = document.documentElement.scrollLeft;
            maxTop = minTop + document.documentElement.clientHeight;
            maxLeft = minLeft + document.documentElement.clientWidth;
        } else {
            minTop = target.scrollTop;
            minLeft = target.scrollLeft;
            maxTop = minTop + target.clientHeight;
            maxLeft = minLeft + target.clientWidth;
        }

        var min = {
            Top: minTop,
            Left: minLeft
        },
            max = {
                Top: maxTop,
                Left: maxLeft
            };

        if (opts.dataType === DATA_TYPE_IMG) {
            imgLazy(target, min, max);
        } else if (opts.dataType === DATA_TYPE_HTML) {
            htmlLazy(target, min, max);
        } else if (opts.dataType === DATA_TYPE_BOTH) {
            imgLazy(target, min, max);
            htmlLazy(target, min, max);
        }

    }

    function imgLazy(target, min, max) {
        var opts = $.data(target, PLUGIN_NAME).options;
        var imgs = $(target).find('img');

        if (imgs && imgs.length > 0) {
            imgs.each(function () {
                var self = $(this);

                var requestImgSrc = self.attr(opts.imgSrc);

                var _e = self[0];
                var wh = position(_e);

                if (isCanbeLoad(wh, min, max) && !cache.loadIMGS[requestImgSrc]) {
                    cache.loadIMGS[requestImgSrc] = " ";
                    self.attr('src', requestImgSrc);
                }
            });
        }
    }

    function htmlLazy(target, min, max) {
        var opts = $.data(target, PLUGIN_NAME).options;
        var lazyObj = $(target).find('[htmlLazy="true"]');

        if (lazyObj && lazyObj.length > 0) {
            lazyObj.each(function () {
                var self = $(this);

                var requestUrl = self.attr(opts.dataUrl);

                var _e = self[0];
                var wh = position(_e);
                if (isCanbeLoad(wh, min, max) && !cache.loadURLS[requestUrl]) {
                    cache.loadURLS[requestUrl] = " ";
                    self.load(requestUrl);
                }
            });
        }
    }

    function position(o) {
        var p = {
            Top: 0,
            Left: 0,
            clientWidth: 0,
            clientHeight: 0
        };

        p.clientWidth = o.clientWidth;
        p.clientHeight = o.clientHeight;

        while ( !! o) {
            p.Top += o.offsetTop;
            p.Left += o.offsetLeft;
            o = o.offsetParent;
        }
        return p;
    }

    function isDocumentObject(target) {
        return target.nodeType === 9;
    }

    function isCanbeLoad(wh, min, max) {
        return (wh.Top >= min.Top && wh.Top <= max.Top && wh.Left >= min.Left && wh.Left <= max.Left) || ((wh.Top + wh.clientHeight) >= min.Top && wh.Top <= max.Top && (wh.Left + wh.clientWidth) >= min.Left && wh.Left <= max.Left);
    }

    $.fn.htmlLazy2 = function (options) {

        options = options || {};

        return this.each(function () {
            var state = $.data(this, PLUGIN_NAME);
            if (state) {
                $.extend(state.options, options);
            } else {
                state = $.data(this, PLUGIN_NAME, {
                    options: $.extend({}, $.fn.htmlLazy2.defaults, options)
                });
                jQuery(this).scroll(function () {
                    autoResize(this);
                });
            }
        });

    };

    $.fn.htmlLazy2.defaults = {
        dataUrl: 'data_url',
        imgSrc: '_src',
        pResizeTimer: null,
        customImgs: [],
        dataType: DATA_TYPE_HTML
    };

})(jQuery);