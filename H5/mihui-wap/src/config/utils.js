var TOOL = {
    toast: function(msg, callback, time) {
        time = time || 1500;
        $('#toast').html(msg).show();
        setTimeout(function() {
            $('#toast').html('').hide();
            callback && callback();
        }, time);
    },

    resize: function() {
        var desW = 750, docEl = document.documentElement || document.body;
        var resize = "orientationchange" in window ? 'orientationchange' : 'resize';
        var setRem = function () {
            var screenWidth = docEl.clientWidth || window.screen.width;
            var fontS = screenWidth < 750 ? 100 * screenWidth / desW : 100;
            docEl.style.fontSize = fontS + 'px';
        };
        setRem();
        window.addEventListener(resize, setRem, false);
    },

    /**
     * jsApp 微信支付
     * @param pd
     * @param callbackObj
     * @param callback
     */
    wxPay: function(pd, callbackObj, callback) {
        function onBridgeReady(data, callbackObj, callback){
            callbackObj = callbackObj || {};
            WeixinJSBridge.invoke(
                'getBrandWCPayRequest',
                data,
                function(res){
                    if(res.err_msg === "get_brand_wcpay_request:ok"){
                        // 支付成功 跳转到
                        if (callbackObj.okFunc) {
                            callbackObj.okFunc();
                        } else {
                            window.location.href = 'pay-success.html';
                        }
                    }

                    if(res.err_msg === "get_brand_wcpay_request:cancel"){
                        // 支付失败
                        if (callbackObj.cancelFunc) {
                            callbackObj.cancelFunc();
                        } else {
                            window.location.href = 'pay-fail.html';
                        }
                    }

                    if(res.err_msg === "get_brand_wcpay_request:fail"){
                        // 支付失败
                        if (callbackObj.failFunc) {
                            callbackObj.failFunc();
                        } else {
                            window.location.href = 'pay-fail.html';
                        }
                    }

                    callback && callback();
                });
        }

        if (typeof WeixinJSBridge == "undefined"){
            if( document.addEventListener ){
                document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
            }else if (document.attachEvent){
                document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
            }
        }else{
            onBridgeReady(pd, callbackObj, callback);
        }
    },

    /**
     * ajax
     * @param api
     * @param data
     * @param callbackObj
     */
    ajax: function(api, data, callbackObj) {
        var url = api.url,
            type = api.method;

        callbackObj = callbackObj || {};

        if (type === 'GET') {
            $.ajax({
                url: url,
                type: type,
                data: data,
                dataType: 'json',
                success: function(result) {
                    callbackObj.success && callbackObj.success(result)
                },
                error: function(result) {
                    callbackObj.error && callbackObj.error(result);
                }
            })
        }

        if (type === 'POST') {
            $.ajax({
                url: url,
                type: type,
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: 'application/json',
                success: function(result) {
                    callbackObj.success && callbackObj.success(result)
                },
                error: function(result) {
                    callbackObj.error && callbackObj.error(result);
                }
            })
        }

    },

    /**
     * 获取查询 url 指定参数
     * @param name
     * @returns {string}
     */
    getQueryStringByName: function(name){
        var result = location.search.match(new RegExp("[\?\&]" + name+ "=([^\&]+)","i"));
        if(result == null || result.length < 1){
            return "";
        }
        return result[1];
    },
};

export default TOOL;
