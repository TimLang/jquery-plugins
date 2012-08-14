var YourSuggest = window.YourSuggest || {};

(function (NS) {

    defaultConfig = {
        containerClass: "suggest-container",
        //提示层样式,
        selectedItemClass: 'suggest-selected-item',
        offsetLeft: 0,
        //左偏移，默认文本框左对齐，可以通过该值做调整
        offsetTop: 0,
        //上偏移
        timerDelay: 600,
        //延迟显示提示框
        resultFormat: "$result$件商品",
        closeBtnAlt: "关闭",
        showCloseBtn: false,
        //是否显示关闭按钮
        autoSubmit: false,
        //点击选项时，是否自动提交
        sugKeyClass: "suggest-result-content",
        //"提示内容"的样式
        sugResultClass: "suggest-result-count",
        //"提示数量"的样式
        emptyContent: "没有符合条件的数据",
        jsonKey: "result",
        // YMW_suggestCallback({"result":[["Rhone Valley","0"],["Alsace","0"],["Beaujolais","0"],["Beaujolais Nouveau","0"],["Languedoc","0"],["Rhone Valley","0"],["Bordeaux","0"],["Cotes de Bergerac Moelleux","0"],["Mediterranean","0"],["South France","0"]]})
        callbackName: "callback",
        //回调函数名
        callbackFn: 'Your_suggestCallback',
        //约定的全局的回调函数
        itemSelect: function () {},
        //选择下拉框时的回调函数
        beforeRequest: function () {},
        //请求前回调函数
        beforeShow: function () {} // 展示前回调函数
    };

    NS.Suggest = function (txtBox, source, config) {
        this.CONFIG = $.extend(defaultConfig, config || {});
        this.defSource = "http://suggest.taobao.com/sug?code=utf-8&extras=1&callback=callback&q=";
        this.source = source ? source : this.defSource;
        this.returnData = null;
        this.jsonSource = source instanceof Object ? source : null;
        this.$container = null; //主容器
        this.isIE = navigator.userAgent.indexOf("MSIE") > 0;
        this.mouseDownItem = null;
        this.$txtBox = $(txtBox);
        this.script = null; //加载脚本
        this.scriptLastestTime = ""; //脚本最后加载时间
        this.scriptTimeout = false; //脚本是过期
        this.selectedItem = null; //当前选中项索引
        this.dataCache = {}; //缓存查询数据
        this.queryStr = ""; //输入框的值
        this.timer = null; //计时器
        this.isRunning = false; //计时器是否处于运行状态
        this.pressingCount = 0; //按住按键，连续触发keydown事件
        this._init();
    };
    NS.Suggest.prototype = {
        //初始化
        _init: function () {
            var suggest = this;
            // onresize 时，调整提示层的位置
            $(window).resize(function () {
                suggest.setContainerRegion();
            });
            this.createSuggest(); //创建提示层
            this.initEvent();
        },
        //初始化事件绑定
        initEvent: function () {
            var instance = this;
            //先将autocomplete关闭
            this.$txtBox.attr("autocomplete", "off").focus(function () {
                instance.start();
            }).blur(function () {
                instance.stop().hide();
            }).keydown(function (event) {
                var keyCode = event.keyCode;
                switch (keyCode) {
                case 13:
                    this.CONFIG.itemSelect.call(this);
                    instance.submitForm();
                    break;
                case 27:
                    //ESC键，隐藏层并还原原输入值
                    instance.hide().setQueryStr();
                    break;
                case 38:
                case 40:
                    //按住按键，延时处理
                    if (instance.pressingCount++ == 0) {
                        if (instance.isRunning) instance.stop();
                        instance.selectItem(keyCode == 40);
                    } else if (instance.pressingCount >= 3) {
                        instance.pressingCount = 0;
                    }
                    break;
                }
                if (keyCode !== 38 && (keyCode !== 40) && (!instance.isRunning)) {
                    instance.start();
                }
            }).keyup(function () {
                instance.pressingCount = 0;
            });

            this.$container.bind("mousemove", function (event) {
                var target = event.target;
                $("#t").html(event.clientX);
                if (target.nodeName !== "LI") {
                    target = target.parentNode;
                }
                if (target.nodeName === "LI") {
                    if (target !== instance.selectedItem) {
                        instance.removeSelectedItem();
                        instance.selectedItem = target;
                        $(target).addClass(instance.CONFIG.selectedItemClass);
                    }
                }
            }).bind("mousedown", function (e) {
                this.mouseDownItem = e.target;
                //使输入框不会失去焦点
                //for IE
                instance.$txtBox[0].onbeforedeactivate = function () {
                    window.event.returnValue = false;
                    instance.$txtBox[0].onbeforedeactivate = null;
                };
                return false;
            }).bind("mouseup", function (event) {
                var e = event.target;
                if (this.mouseDownItem != e) return;
                var pNode = e.parentNode;
                if (pNode.className === "key-main" || (pNode.parentNode.className === "key-main")) {
                    instance.CONFIG.itemSelect.call(this);
                    instance.submitForm();
                }
                instance.hide();
                return;
            });
        },
        _getXY: function (el) {
            var left = 0,
                top = 0;
            if (typeof el.tagName !== "undefined") {
                while (el.parentNode !== null && el.offsetParent !== null) {
                    left += el.offsetLeft;
                    top += el.offsetTop;
                    el = el.offsetParent;
                }
            }
            return {
                x: left,
                y: top
            };
        },
        //添加提示层
        createSuggest: function () {
            this.$container = $('<div>' + '</div>').addClass(this.CONFIG.containerClass);
            $("body").append(this.$container);
            this.setContainerRegion();
            this.initShim();
        },
        //如果为IE6,则添加iframe shim
        initShim: function () {
            if ($.browser.isIE6) {
                this.$container.shim = $("<iframe></iframe>").width(this.$container.outerWidth()).attr({
                    "id": "sugIframe",
                    "src": "about:blank",
                    "class": "suggest-shim"
                }).css({
                    position: "absolute",
                    left: this.$txtBox.offset().left + this.CONFIG.offsetLeft,
                    top: this.$txtBox.offset().top + this.$txtBox.outerHeight() + this.CONFIG.offsetTop,
                    border: "none",
                    visibility: "hidden"
                });
                $("body").append(this.$container.shim);
            }
        },
        //更新提示层数据
        fillEleContainer: function (content) {
            if (content.length == 1) {
                this.$container.html("").prepend(content);
            } else {
                this.$container.html(content);
            }
            this.selectedItem = null;
        },
        //启动计时器，监听用户输入
        start: function () {
            var instance = this;
            NS.Suggest.focusInstance = this;
            this.timer = setInterval(function () {
                instance.updateInput();
            }, this.CONFIG.timerDelay);
            this.isRunning = true;
        },
        //停止计时器
        stop: function () {
            NS.Suggest.focusInstance = null;
            clearInterval(this.timer);
            this.isRunning = false;
            return this;
        },
        //是否需要更新信息
        needUpdate: function () {
            return this.$txtBox.val() != this.queryStr;
        },
        //更新当前文本框
        updateInput: function () {
            if (!this.needUpdate()) return;
            //查询，更新层内容，保存缓存
            this.queryStr = this.$txtBox.val();
            var q = this.queryStr;
            if (!$.trim(q).length) {
                this.fillEleContainer("");
                this.hide();
                return;
            }
            if (typeof this.dataCache[q] != "undefined") {
                //使用缓存数据
                this.fillEleContainer(this.dataCache[q]);
                this.displayContainer();
            } else if (this.jsonSource) {
                NS.Suggest.focusInstance.handleResponse(this.jsonSource[q]);
            } else {
                this.requestData();
            }

        },
        //根据内容显示或隐藏提示层
        displayContainer: function () {
            if (this.$container.html() == "") {
                //if(this.$container.children("ol").length == 0){
                this.hide();
            } else {
                this.show();
            }
        },
        //加载远程数据
        requestData: function () {
            var _this = this,
                _script = this.script;
            if (!this.isIE) _script = null;
            //非IE的，需要重新加载<script>
            if (!_script) {
                _script = $("<script />").attr("type", "text/javascript");
                document.getElementsByTagName("head")[0].insertBefore(_script[0], document.getElementsByTagName("head")[0].firstChild);
                if (!this.isIE) {
                    var t = new Date().getTime();
                    this.scriptLastestTime = t;
                    _script.attr("time", t);
                    _script.load(function (script) {
                        //判断返回的数据是否过期
                        _this.scriptTimeout = this.getAttribute("time") != _this.scriptLastestTime;
                    });
                }
            }
            this.CONFIG.beforeRequest.call(this);
            _script.attr("src", this.getCallbackUrlSource(this.source + encodeURIComponent(encodeURIComponent(this.queryStr))));

        },
        getCallbackUrlSource: function (dataSource) {
            dataSource += (dataSource.indexOf('?') === -1) ? '?' : '&';
            return dataSource += this.CONFIG.callbackName + "=" + this.CONFIG.callbackFn;
        },
        //处理获取到的数据
        handleResponse: function (data) {
            if (this.scriptTimeout) {
                return;
            }
            this.returnData = data && data[this.CONFIG.jsonKey];
            //格式化数据
            this.returnData = this.formatData(this.returnData);
            var len = this.returnData.length;
            if (len > 0) {
                var content = "";
                var $list = $("<ol class=\"key-main\">");
                for (var i = 0; i < len; i++) {
                    $list.append(this.formatItem(this.returnData[i]["key"], this.returnData[i]["result"]));
                }
                content = $list;
                //更新数据
                this.fillEleContainer(content);
                //添加关闭按钮
                this.appendCloseBtn();
            } else {
                this.fillEleContainer(this.CONFIG.emptyContent);
            }

            this.CONFIG.beforeShow.call(this);
            this.dataCache[this.queryStr] = this.$container.html();
            this.displayContainer();
        },
        //格式化结果数组(一或二维数组)
        //格式一：[["key1", "result1"], ["key2", "result2"], ...]
        //格式二：["key1", "key2", ...]
        formatData: function (data) {
            var arr = [],
                len;
            if (!data || !(len = data.length)) return arr;
            for (var i = 0; i < len; i++) {
                var item = data[i];
                if (typeof item === "string") {
                    arr[i] = {
                        "key": item
                    };
                } else if ($.isArray(item) && item.length > 1) {
                    arr[i] = {
                        "key": item[0],
                        "result": item[1]
                    };
                }
            }
            return arr;
        },
        //格式化输出项
        formatItem: function (key, result) {
            var reg = new RegExp('(' + this.$txtBox.val() + ')');
            //关键词突出显示
            var showedkey = key.replace(reg, '<em>$1</em>');

            var $li = $("<li></li>").append($('<span></span>').addClass(this.CONFIG.sugKeyClass).html(showedkey)).attr({
                "key": key,
                "val": result
            });
            if (typeof result !== "undefined") {
                var resultText = this.CONFIG.resultFormat.replace("$result$", result);
                $li.append($('<span></span>').addClass(this.CONFIG.sugResultClass).html(resultText));
            }
            return $li[0];
        },
        //更新当前文本框为选中的key
        updateInputFromKey: function () {
            this.$txtBox.val(this.getSelectedItemKey());
        },
        appendCloseBtn: function () {
            if (this.CONFIG.showCloseBtn) {
                $('<div class="suggest-close"></div>').append(
                $('<a href="javascript:void(0);">关闭</a>').attr({
                    "title": this.CONFIG.closeBtnAlt,
                    "target": "_self"
                })).appendTo(this.$container);
            }
        },
        //用键盘选择key
        selectItem: function (down) {
            //不存在搜索结果，直接返回
            this.stop();
            var items = this.$container.find("li");
            if (items.length == 0) return;
            //按ESc隐藏了，显示返回就可以
            if (this.isVisible()) {
                this.show();
                return;
            }
            var newSelectedItem;
            if (this.selectedItem) {
                newSelectedItem = down ? $(this.selectedItem).next() : $(this.selectedItem).prev();
            } else {
                newSelectedItem = items.eq(down ? 0 : items.length - 1);
            }
            newSelectedItem = newSelectedItem[0];
            this.removeSelectedItem();
            this.setSelecedItem(newSelectedItem);
            if (!newSelectedItem) {
                //回复原文本框值
                this.setQueryStr();
                return;
            }
            this.updateInputFromKey();
        },
        isVisible: function () {
            return this.$container.css("display") == "none";
        },
        //移除选中项
        removeSelectedItem: function () {
            $(this.selectedItem).removeClass(this.CONFIG.selectedItemClass);
            this.selectedItme = undefined;
        },
        //设置选中项
        setSelecedItem: function (target) {
            $(target).addClass(this.CONFIG.selectedItemClass);
            this.selectedItem = target;
        },
        //回复原文本框值
        setQueryStr: function () {
            this.$txtBox.val(this.queryStr);
        },
        //获取选中项的key
        getSelectedItemKey: function () {
            if (!this.selectedItem) return "";
            return $(this.selectedItem).attr("key");
        },
        //获取选中项的Val
        getSelectedItemVal: function () {
            if (!this.selectedItem) return "";
            return $(this.selectedItem).attr("val");
        },
        //显示提示层
        show: function () {
            if (this.$container.shim) {
                this.$container.shim.css({
                    height: this.$container.height(),
                    visibility: ""
                });
            }
            this.$container.show();
        },
        //隐藏提示层
        hide: function () {
            if (this.$container.shim) {
                this.$container.shim.css("visibility", "hidden");
            }
            this.$container.hide();
            return this;
        },
        submitForm: function () {
            if (this.selectedItem != null) {
                this.updateInputFromKey();
            }
            this.$txtBox.blur();
            var form = this.$txtBox[0].form;
            if (!form || !this.CONFIG.autoSubmit) return false;
            form.submit();
        },
        setContainerRegion: function () {
            var xy = this._getXY(this.$txtBox[0]);
            this.$container.css({
                position: "absolute",
                left: xy.x + this.CONFIG.offsetLeft,
                top: xy.y + this.$txtBox.outerHeight() + this.CONFIG.offsetTop
            });
            if (this.$container.width() == 0) {
                this.$container.css("width", this.$txtBox.outerWidth() - 2);
            }
        }
    };

    window[defaultConfig.callbackFn] = function (data) {
        if (!NS.Suggest.focusInstance) return;
        NS.Suggest.focusInstance.handleResponse(data);
    };
})(YourSuggest);