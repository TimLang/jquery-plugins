/****
 *  @TODO 可以仿照新浪微博，分页至一定页数后，增加整个页面的分页按钮，不然页面太大会卡死，尤其IE
 *  
 *  based on jquery 1.4.4
 *  
 *  @author Tim_Lang
 *  
 *  @since 2011.9.27
 */
(function ($) {

    var PLUGIN_NAME = "scrollPagination";
    var pageCount = 2;
    //防止滚动条重复触发的锁
    var lock = true;

    function scrollLoad(target) {
        if (target.scrollTop + target.clientHeight == target.scrollHeight) {
            if (lock) {
                lock = false;
                ajaxLoad(target);
            }
        }
    }

    function ajaxLoad(target) {
        var opts = $.data(target, PLUGIN_NAME).options;
        var domObj = $(target);
        var ajaxLoading = $('#' + opts.ajaxLoadingId);

        if (domObj.find('#' + opts.ajaxLoadingId).size() == 0) {
            domObj.append($('<div id="' + opts.ajaxLoadingId + '" style="display:none"><img src="' + opts.ajaxLoadingImgSrc + '" /></div>'));
        }

        $.ajax({
            url: generatePaginateUrl(target, opts.ajaxUrl),
            beforeSend: function () {
                ajaxLoading.show();
            },
            complete: function () {
                ajaxLoading.hide();
                lock = true;
            },
            success: function (data) {
                opts.callBack(data);
                ajaxLoading.appendTo(domObj);
                pageCount++;
            }
        });
    }

    function generatePaginateUrl(target, url) {
        var opts = $.data(target, PLUGIN_NAME).options;
        var paramsSymbol = "&";

        if (url.indexOf("?") == -1) {
            paramsSymbol = "?";
        }
        //如果url是以"/"结尾，替换为之
        return url.replace(/(.)\/+$/, "$1").concat(paramsSymbol) + opts.ajaxPerPageName + "=" + opts.ajaxPerPageSize;
    }

    $.fn.scrollPagination = function (options) {

        options = options || {};

        return this.each(function () {
            var state = $.data(this, PLUGIN_NAME);
            if (state) {
                $.extend(state.options, options);
            } else {
                state = $.data(this, PLUGIN_NAME, {
                    options: $.extend({}, $.fn.scrollPagination.defaults, options)
                });
                $(this).scroll(function () {
                    scrollLoad(this, state.options.callBack);
                });
            }
        });

    };

    $.fn.scrollPagination.defaults = {
        perSize: 10,
        callBack: function () {},
        ajaxLoadingId: 'ajaxLoading',
        ajaxLoadingImgSrc: undefined,
        ajaxUrl: undefined,
        //默认分页的参数名
        ajaxPerPageName: 'perPage',
        //默认分页数
        ajaxPerPageSize: 10,
        isNeedAjaxLoading: true
    };

})(jQuery);