import API from '../config/api'
import TOOL from '../config/utils'
import $ from 'zepto-webpack'
import '../less/reset.less'
import '../less/pay.less'

$(function() {

    /**
     * 十五分钟倒计时
     */
    var curBranch = 15;
    var curSecond = 0;
    var loading = false;
    var isWeiXin = window.isWeiXin;

    var timer = setInterval(function() {
        if (curBranch <= 0 && curSecond <= 0) {
            clearInterval(timer);
            timer = null;
            $('#branch').html('00');
            $('#second').html('00');
            return;
        }

        if (curSecond <= 0) {
            curSecond = 59;
            curBranch--;
            $('#branch').html(curBranch <= 9 ? ('0' + curBranch) : curBranch);
        } else {
            curSecond--;
        }
        $('#second').html(curSecond <= 9 ? ('0' + curSecond) : curSecond);

    }, 1000);

    /**
     * 获取JSAPI支付 参数
     * @param serial
     * @param okCall
     * @param failCall
     */
    function getWeiXinJSAPIParam(serial, okCall, failCall) {
        TOOL.ajax(
            API['getJsWXPayForExperience'],
            {orderSerial: serial},
            {
                success: function(result) {
                    if (!result.success) {
                        failCall && failCall(result);
                        return;
                    }

                    okCall && okCall(result);
                },
                error: function(res){
                    loading = false;
                    TOOL.toast('获取微信支付参数接口出错了');
                }
            }
        )
    }

    /**
     * 重新发起支付
     */
    $('#repayment').on('click', function(e) {
        var serial = window.sessionStorage.getItem('serial');
        if (!serial) {
            TOOL.toast('serial不存在, 请重试!');
            return;
        }

        if (loading) {
            return;
        }

        loading = true;

        if (isWeiXin) {
            getWeiXinJSAPIParam(serial, function(data2) {
                var param = data2.value || {};

                // 调起微信支付
                TOOL.wxPay({
                    appId: param.appId,
                    timeStamp: param.timeStamp,
                    nonceStr: param.nonceStr,
                    package: param.package1,
                    signType: param.signType,
                    paySign: param.paySign,
                }, {
                    okFunc: function() {},
                    cancelFunc: function() {},
                    failFunc: function() {}
                }, function() {
                    loading = false;
                });

            }, function () {
                loading = false;
                TOOL.toast('获取微信支付参数错误');
            })
        }
    });


    var arr = window.location.search.split('=');
    var H5Serial;

    if (arr.length >= 2) {
        H5Serial = arr[1];
    }

    if (!isWeiXin && !H5Serial) {
        TOOL.toast('serial 不存在, 取消定时任务');
        return;
    }

});
