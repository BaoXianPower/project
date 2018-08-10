let common = {
    regTel: /^(?=\d{11}$)^1(?:3\d|4[57]|5[^4\D]|7[^249\D]|8\d)\d{8}$/,
    regId: /(^\d{15}$)|(^\d{17}([0-9]|X)$)/,
    regPayPwd: /^\d{6}$/,

    /**
     * 功能：获取Cookie
     * name 必选项，cookie名称
     */
    getCookie: function (name) {
        let cookie_start = document.cookie.indexOf(name);
        let cookie_end = document.cookie.indexOf(";", cookie_start);
        return cookie_start == -1 ? '' : unescape(document.cookie.substring(cookie_start + name.length + 1, (cookie_end > cookie_start ? cookie_end : document.cookie.length)));
    },

    /**
     * 功能：设置Cookie
     * cookieName 必选项，cookie名称
     * cookieValue 必选项，cookie值
     * seconds 生存时间，可选项，单位：秒；默认时间是3600 * 24 * 7秒
     * path cookie存放路径，可选项
     * domain cookie域，可选项
     * secure 安全性，指定Cookie是否只能通过https协议访问，一般的Cookie使用HTTP协议既可访问，如果设置了Secure（没有值），则只有当使用https协议连接时cookie才可以被页面访问
     */
    setCookie: function (cookieName, cookieValue, seconds, path, domain, secure) {
        let expires = new Date();
        seconds = arguments[2] ? arguments[2] : 3600 * 24 * 7;
        expires.setTime(expires.getTime() + seconds * 1000);
        path = '/';

        document.cookie = escape(cookieName) + '=' + escape(cookieValue) + (expires ? ';expires=' + expires.toGMTString() : '') + (path ? ';path=' + path : '/') + (domain ? ';domain=' + domain : '') + (secure ? ';secure' : '');
    },

    /**
     * 功能：删除或清空Cookie
     * name 必选项，cookie名称
     */
    delCookie: function (name, value) {
        var value = arguments[1] ? arguments[1] : null;
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var val = common.getCookie(name);
        if (val != null) {
            document.cookie = name + '=' + value + ';expires=' + exp.toGMTString();
        }
    },

    /**
     * url参数
     */
    getUrlParams () {
        let lets = {};
        let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi,
            function (m, key, value) {
                lets[key] = value;
            }
        );
        return lets;
    },

    /**
     * @param name
     * @returns {*}
     */
    getQueryString (name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        let r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    },

    /**
     * @param name
     * @returns {string}
     */
    getQueryStringByName: function (name) {
        let result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
        if (result == null || result.length < 1) {
            return "";
        }
        return result[1];
    },

    /**
     * 判断系统 ios or android
     * @returns {string}
     */
    getSystem () {
        let agent = navigator.userAgent;
        if (agent.indexOf('iPhone') !== -1) {
            return 'ios';
        }
        else if (agent.indexOf('Android') !== -1) {
            return 'android';
        }
    },

    /**
     * 判断是否微信浏览器
     * @returns {boolean}
     */
    isWX () {
        let agent = navigator.userAgent;
        return agent.indexOf('MicroMessenger') !== -1;
    },

    /**
     * hack 更新微信标题
     * @param title
     */
    setTitle (title) {
        let body = document.getElementsByTagName('body')[0];
        document.title = title;
        let iframe = document.createElement("iframe");

        function fn() {
            setTimeout(function () {
                iframe.removeEventListener('load', fn);
                document.body.removeChild(iframe);
            }, 0);
        }

        iframe.addEventListener('load', fn);
        document.body.appendChild(iframe);
    },

    /**
     * 设置微信分享参数
     * @param callback
     */
    getWXParams () {
        let host = location.href.split('#')[0];
        if (host.indexOf('?') >= 0) {
            host = encodeURIComponent(host);
        }
    },

    /**
     * 微信初始化
     */
    wxInit () {
        this.getWXParams(params => {
            wx.config({
                debug: api.mode === 0, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: params.appId, // 必填，公众号的唯一标识
                timestamp: params.timestamp, // 必填，生成签名的时间戳
                nonceStr: params.noncestr, // 必填，生成签名的随机串
                signature: params.signature,// 必填，签名，见附录1
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'chooseWXPay'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
        });
    },

    /**
     * 分享到朋友圈
     * @param data
     */
    wxShareToMoment(data){
        wx.ready(() => {
            wx.onMenuShareTimeline({
                title: data.title, // 分享标题
                link: data.link, // 分享链接
                imgUrl: data.imgUrl, // 分享图标
                success: function () {
                    // 用户确认分享后执行的回调函数
                    console.log('分享到朋友圈成功');
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                    console.log('取消分享到朋友圈');
                }
            });
        })
    },

    /**
     * 分享给好友
     * @param data
     */
    wxShareToMessage(data){
        wx.ready(() => {
            wx.onMenuShareAppMessage({
                title: data.title, // 分享标题
                desc: data.desc, // 分享描述
                link: data.link, // 分享链接
                imgUrl: data.imgUrl, // 分享图标
                success: function () {
                    // 用户确认分享后执行的回调函数
                    console.log('分享给好友成功');
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                    console.log('取消分享给好友');
                }
            });
        });
    },

    /**
     * 微信支付
     * @param data
     * @param callback
     */
    wxPay(data, callback){
        wx.chooseWXPay({
            "timestamp": data.timeStamp,
            "nonceStr": data.nonceStr,
            "package": data.package1,
            "signType": data.signType,
            "paySign": data.paySign,
            success: function (res) {
                if (callback) {
                    callback(res);
                }
            }
        });
    },

    /**
     * 当天所属的 周一个开始时间
     * @param  date
     * @returns number
     */
    getFirstDayOfWeek (date) {
        let day = date.getDay() || 7;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
    },

    /**
     * 一个时间戳的 00 点 开始时间
     * @param time 必须为一个时间new Date() 类型的时间戳;
     * @returns number
     */
    startTime (time = new Date()) {
        return new Date(time.toLocaleDateString()).getTime();
    },

    /**
     * 一个时间戳的 23:59:59:999
     * @param  time  time 必须为一个时间格式
     * @returns number
     */
    endTime (time = new Date()) {
        time = time.getTime() + 24 * 3600 * 1000;
        return new Date(new Date(time).toLocaleDateString()).getTime() - 1;
    },

    /**
     * 默认本月的起始时间
     * @returns {*[]}
     */
    initDefaultTimeRange(){
        let now = new Date(),
            start = this.dateFormatter(Number(now), 'yyyy-MM'),
            end = this.dateFormatter(Number(now), 'yyyy-MM-dd');

        start = Number(new Date(start + '-01 00:00:00'));
        end = Number(new Date(end + ' 23:59:59'));

        return [start, end];
    },

    /**
     * 默认今天 前5天 后25天
     * @param {*} before
     * @param {*} after
     */
    initScheduleTimeRange(before = 5, after = 25){
        let s = Number(new Date()) - before * 24 * 3600 * 1000,
            e = Number(new Date()) + after * 24 * 3600 * 1000,
            start = this.dateFormatter(Number(s), 'yyyy-MM-dd'),
            end = this.dateFormatter(Number(e), 'yyyy-MM-dd');

        start = Number(new Date(start + ' 00:00:00'));
        end = Number(new Date(end + ' 23:59:59'));

        return [start, end];
    },

    /**
     * 计算前五天一个月的所有时间, 默认以6点为开始时间
     * @param now
     * @param hours
     * @returns {Array}
     */
    monthList (now = new Date(), hours = 6) {
        let day = 24 * 3600 * 1000,
            nowTime = now.getTime(),
            nowDate,
            fiveDay,
            list = [],
            index = 0;

        // 如果是跨天 重新计算
        if (now.getHours() < hours) {
            nowTime = nowTime - day;
        }
        nowDate = new Date(`${new Date(nowTime).toLocaleDateString()} 0${hours}:00:00`).getTime();
        fiveDay = nowDate - (2 * day);

        while (index < 30) {
            let time = fiveDay + (index * day);
            list.push(time);
            index++;
        }

        return list;
    },

    /**
     * 获取该时间段内, 每天的00点开始时间
     * @param startDate
     * @param endDate
     * @returns {Array}
     */
    initScheduleDayList(startDate, endDate){
        startDate = this.dateFormatter(Number(new Date(startDate)), 'yyyy-MM-dd');
        endDate = this.dateFormatter(Number(new Date(endDate)), 'yyyy-MM-dd');

        startDate = Number(new Date(startDate + ' 00:00:00'));
        endDate = Number(new Date(endDate + ' 00:59:59'));

        let list = [];

        for (let i = startDate; i < endDate; i += 24 * 3600 * 1000) {
            list.push(i)
        }

        return list;
    },

    /**
     * 转换时间段检索的 时分秒
     * @param timeRange
     * @returns {number[]}
     */
    parseTimeRange(timeRange){
        if (timeRange.length !== 2) {
            return [0, 0]
        }
        let start = this.dateFormatter(new Date(timeRange[0]), 'yyyy-MM-dd');
        let end = this.dateFormatter(new Date(timeRange[1]), 'yyyy-MM-dd');

        start = Number(new Date(start + ' 00:00:00'));
        end = Number(new Date(end + ' 23:59:59'));

        return [start, end];
    },

    /**
     * 日期格式化
     * @param timestamp
     * @param format
     * @param forToday
     * @returns {*}
     */
    dateFormatter(timestamp, format, forToday) {
        if (!timestamp) return;
        let result = '';
        let d = new Date(timestamp);
        let year = d.getFullYear(),
            month = d.getMonth() + 1,
            day = d.getDate(),
            hour = d.getHours(),
            minute = d.getMinutes(),
            week = d.getDay(),
            second = d.getSeconds();

        let dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            dayNames1 = ['周日', '周一', '周二', '周三', '周四', '周五', '周六',];

        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;
        hour = hour < 10 ? '0' + hour : hour;
        minute = minute < 10 ? '0' + minute : minute;
        second = second < 10 ? '0' + second : second;

        result = year + '-' + month + '-' + day;

        if (format == 2 || format == 'yyyy-MM-dd HH:mm:ss') {
            result += ' ' + hour + ':' + minute + ':' + second;
        } else if (format === 'HH:mm') {
            result = ' ' + hour + ':' + minute;
        } else if (format === 'yyyy-MM-dd HH:mm') {
            result = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
            if (hour >= 12) {
                result += ' PM'
            } else {
                result += ' AM'
            }

        } else if (format === 'YYYY-MM-DD HH:mm') {
            result = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
        } else if (format === 'yyyy-MM-dd') {
            result = year + '-' + month + '-' + day;
        } else if (format === 'yy-MM-dd') {
            result = year + '年 ' + month + '月' + day + '日';
        } else if (format === 'MM-dd') {
            result = month + '-' + day;
        } else if (format === 'MM-dd HH:mm') {
            result = month + '-' + day + ' ' + hour + ':' + minute;
        } else if (format === 'EEE') {
            result = dayNames[week];
        } else if (format === 'eee') {
            result = dayNames1[week];
        } else if (format === 'yyyy-MM') {
            result = year + '-' + month;
        }

        if (forToday) {
            if (this.isToday(new Date(timestamp))) {
                return hour + ':' + minute;
            } else {
                return result;
            }
        }

        return result;
    },

    /**
     * 与jQuery.extend方法，可用于浅拷贝，深拷贝
     * @returns {*|{}}
     */
    mix: function () {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        var oproto = Object.prototype;
        var serialize = oproto.toString;

        var isFunction = typeof alert === "object" ? function (fn) {
            try {
                return /^\s*\bfunction\b/.test(fn + "")
            } catch (e) {
                return false
            }
        } : function (fn) {
            return serialize.call(fn) === "[object Function]"
        }

        // 如果第一个参数为布尔,判定是否深拷贝
        if (typeof target === "boolean") {
            deep = target
            target = arguments[1] || {}
            i++
        }

        //确保接受方为一个复杂的数据类型
        if (typeof target !== "object" && !isFunction(target)) {
            target = {}
        }

        //如果只有一个参数，那么新成员添加于mix所在的对象上
        if (i === length) {
            target = this
            i--
        }

        for (; i < length; i++) {
            //只处理非空参数
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name]
                    try {
                        copy = options[name] //当options为VBS对象时报错
                    } catch (e) {
                        continue
                    }

                    // 防止环引用
                    if (target === copy) {
                        continue
                    }
                    if (deep && copy && (this.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {

                        if (copyIsArray) {
                            copyIsArray = false
                            clone = src && Array.isArray(src) ? src : []

                        } else {
                            clone = src && this.isPlainObject(src) ? src : {}
                        }

                        target[name] = this.mix(deep, clone, copy)
                    } else if (copy !== void 0) {
                        target[name] = copy
                    }
                }
            }
        }
        return target
    },

    /**
     * 判定是否是一个朴素的javascript对象（Object），
     * 不是DOM对象，
     * 不是BOM对象，
     * 不是自定义类的实例
     * @param obj
     * @param key
     * @returns {*}
     */
    isPlainObject: function (obj, key) {
        var oproto = Object.prototype;
        var ohasOwn = oproto.hasOwnProperty;
        var serialize = oproto.toString;
        var class2type = {};
        var rword = /[^, ]+/g;
        "Boolean Number String Function Array Date RegExp Object Error".replace(rword, function (name) {
            class2type["[object " + name + "]"] = name.toLowerCase();
        });

        var type = function (obj) { //取得目标的类型
            if (obj == null) {
                return String(obj)
            }
            // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
            return typeof obj === "object" || typeof obj === "function" ?
                class2type[serialize.call(obj)] || "object" :
                typeof obj
        };

        var isWindow = function (obj) {
            if (!obj)
                return false
            // 利用IE678 window == document为true,document == window竟然为false的神奇特性
            // 标准浏览器及IE9，IE10等使用 正则检测
            return obj == obj.document && obj.document != obj //jshint ignore:line
        }

        if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
            return false;
        }
        try { //IE内置对象没有constructor
            if (obj.constructor && !ohasOwn.call(obj, "constructor") && !ohasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) { //IE8 9会在这里抛错
            return false;
        }

        for (key in obj) {
        }
        return key === void 0 || ohasOwn.call(obj, key)
    },

    /**
     * 将ob 和oa 共有的key 的值 赋值给oa
     * @param oa
     * @param ob
     * @returns {*}
     */
    coverOaByOb: function (oa, ob) {
        let self = this;
        for (var k in oa) {
            if (oa.hasOwnProperty(k) && ob[k] !== null) {
                if (oa[k] === null) {
                    oa[k] = ob[k];
                } else if (Array.isArray(oa[k])) {
                    ob[k] = ob[k] || [];
                    oa[k] = self.mix(true, [], ob[k])
                } else if (oa[k] instanceof Date) {
                    oa[k] = ob[k] || '';
                } else if (typeof oa[k] === 'object') {
                    ob[k] = ob[k] || {};
                    oa[k] = self.mix(true, {}, ob[k])
                } else {
                    oa[k] = ob[k] || ''
                }
            }
        }
        return oa;
    },

    /**
     * 数组分组
     * @param list
     * @param type
     * @returns {Object}
     */
    groupList (list, type) {
        let obj = {};

        list.forEach(x => {

            let bool = true;

            for (let k in obj) {
                if (obj.hasOwnProperty(k) && x[type] === k) {
                    obj[k].push(this.mix(true, {}, x));
                    bool = false;
                }
            }

            if (bool) {
                obj[x[type]] = [];
                obj[x[type]].push(this.mix(true, {}, x));
            }

        });

        return obj;
    },

    /**
     * 数组去重
     * @param a
     * @returns {Array}
     */
    uniqueList (a) {
        var res = [];

        for (var i = 0, len = a.length; i < len; i++) {
            var item = a[i];

            for (var j = 0, jLen = res.length; j < jLen; j++) {
                if (Number(res[j]) === Number(item))
                    break;
            }

            if (j === jLen)
                res.push(item);
        }

        return res;
    },

    /**
     * 数组排序
     * @param attr
     * @param rev
     * @returns {function(*, *)}
     */
    sortBy (attr, rev) {
        if (rev == undefined) {
            rev = 1;
        } else {
            rev = rev ? 1 : -1;
        }
        return (a, b) => {
            a = a[attr];
            b = b[attr];
            if (a < b) {
                return rev * -1;
            }
            if (a > b) {
                return rev * 1;
            }
            return 0;
        }
    },

    /**
     * 数组索引查找
     * @param list
     * @param callback
     * @returns {number}
     */
    queryIndex (list, callback) {
        let index = -1;
        list.some((x, i) => {
            if (callback(x)) {
                index = i;
                return true;
            } else {
                return false;
            }
        });
        return index;
    },

    /**
     * 模拟扫码枪
     * @param {String} serial
     */
    simulateScan (serial) {
        return (serial.indexOf('JG') === 0 || serial.indexOf('FK') === 0 && serial.length === 10);
    },

    /**
     * 模拟按键
     * @param key
     */
    fullScreenChange (key) {
        let el = document.documentElement;
        let rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;//定义不同浏览器的全屏API
        //执行全屏
        if (typeof rfs !== "undefined" && rfs) {
            rfs.call(el);
        } else if (typeof window.ActiveXObject !== "undefined") {
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys('{' + key + '}');
            }
        }
    },

    /**
     * 监听 进入全屏 或退出 全屏事件
     * @param { } callbackConfirm
     * @param {*} callbackCancel
     */
    fullScreenChangeHandler (callbackConfirm, callbackCancel) {
        let document = window.document;
        document.addEventListener('webkitfullscreenchange', (e) => {
            if (document.webkitIsFullScreen) {
                callbackConfirm && callbackConfirm();
            } else {
                callbackCancel && callbackCancel();
            }
        }, false);
        document.addEventListener('fullscreenchange', (e) => {
            if (document.fullscreen) {
                callbackConfirm && callbackConfirm();
            } else {
                callbackCancel && callbackCancel();
            }
        }, false);
        document.addEventListener('mozfullscreenchange', (e) => {
            if (document.mozFullScreen) {
                callbackConfirm && callbackConfirm();
            } else {
                callbackCancel && callbackCancel();
            }
        }, false);
        document.addEventListener('msfullscreenchange', (e) => {
            if (document.msFullscreenElement) {
                callbackConfirm && callbackConfirm();
            } else {
                callbackCancel && callbackCancel();
            }
        }, false);
    }
};

export default common;
