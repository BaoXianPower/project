import API from '../config/api'
import TOOL from '../config/utils'
import $ from 'zepto-webpack'
import '../less/reset.less'
import '../less/index.less'

$(function() {

    var isWeiXin = window.isWeiXin;
    var loading = false;
    var H5Serial = TOOL.getQueryStringByName('serial');
    var H5PhoneNum = TOOL.getQueryStringByName('phoneNum');
    var timer1;
    var hasPaySuccess = false;

    /**
     * 初始化
     */
    function init() {
        // 如果是微信
        if (isWeiXin) {
            $('#code').show();
            $('#loginOn').html('立即注册');
            $('#loginOnBottom').html('立即注册');
            $('#scan').show();
            $('#qrCode').show();
        } else {
            // 其他浏览器
            $('#userNameBox').show();
            $('#loginOn').html('马上获得');
            $('#loginOnBottom').html('马上获得');

            if (!H5Serial) {
                return;
            }

            // 显示弹窗
            $('#mask').show();

            timeTask();
        }
    }

    /**
     * 定时任务
     */
    function timeTask() {

        if (H5PhoneNum) {
            window.sessionStorage.setItem('phoneNumber', H5PhoneNum);
        }

        if (H5PhoneNum) {
            window.sessionStorage.setItem('serial', H5PhoneNum);
        }

        orderQueryResultForExp(
            H5Serial,
            function(result) {
                hasPaySuccess = true;
                window.location.href = window.location.protocol + "//" + window.location.host + '/pay-success.html';
            },
            function(result) {
                console.log('还未成功');
            }
        );

        timer1 = setInterval(function() {
            if (!H5Serial) {
                timer1 && clearInterval(timer1);
                timer1 = null;
                return;
            }

            orderQueryResultForExp(
                H5Serial,
                function(result) {
                    hasPaySuccess = true;
                    window.location.href = window.location.protocol + "//" + window.location.host + '/pay-success.html';
                },
                function(result) {
                    console.log('还未成功');
                }
            );
        }, 2000)
    }

    /**
     * 查询该单是否支付成功
     * @param serial
     * @param okCall
     * @param failCall
     */
    function orderQueryResultForExp(serial, okCall, failCall) {
        TOOL.ajax(
            API['orderQueryResultForExp'],
            {orderSerial: serial},
            {
                success: function (result) {
                    if (!result.success) {
                        failCall && failCall(result);
                        return;
                    }

                    okCall && okCall(result);
                },
                error: function(res){
                    loading = false;
                    TOOL.toast('');
                }
            }
        )
    }

    /**
     * 前端必填验证
     * @param phoneNum
     * @param verifyCode
     * @param userName
     * @returns {{msg: string, success: boolean}}
     */
    function loginVerifyHandler(phoneNum, verifyCode, userName) {
        var re = {
            success: true,
            msg: ''
        };

        if (!isWeiXin && !userName) {
            re.msg = '请填写姓名';
            re.success = false;
            return re;
        }

        if (!phoneNum) {
            re.msg = '请填写手机号码';
            re.success = false;
            return re;
        }

        if (!/^[1][3,4,5,7,8][0-9]{9}$/.test(phoneNum)) {
            re.msg = '请填写格式正确的手机号码';
            re.success = false;
            return re;
        }

        if (window.isWeiXin && !verifyCode) {
            re.msg = '请填写验证码';
            re.success = false;
            return re;
        }

        return re;
    }

    /**
     * 验证验证码
     * @param phoneNum
     * @param verifyCode
     * @param okCall
     * @param failCall
     */
    function verifyCodeHandler(phoneNum, verifyCode, okCall, failCall) {
        TOOL.ajax(
            API['verifyCode'],
            { phoneMobile: phoneNum, verifyCode: verifyCode},
            {
                success: function(result) {
                    if (!result.success) {
                        failCall && failCall(result);
                        return;
                    }
                    okCall && okCall(result);
                },
                error: function() {
                    loading = false;
                    TOOL.toast('验证验证码接口出错了');
                }
            })
    }

    /**
     * 下单接口
     * @param phoneNum
     * @param okCall
     * @param failCall
     */
    function orderFormHandler(phoneNum, okCall, failCall) {
        TOOL.ajax(
            API['orderForExperience'],
            { phoneMobile: phoneNum },
            {
                success: function(result) {
                    if (!result.success) {
                        failCall && failCall(result);
                        return;
                    }
                    okCall && okCall(result);
                },
                error: function (result) {
                    loading = false;
                    TOOL.toast('下单接口出错了');
                }
            }
        )
    }

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
     * 获取 H5支付 参数
     * @param serial
     * @param okCall
     * @param failCall
     */
    function getWeiXinH5Param(serial, okCall, failCall) {
        TOOL.ajax(
            API['weixinpay'],
            {orderSerial: serial},
            {
                success: function (result) {
                    if (!result.success) {
                        failCall && failCall(result);
                        return;
                    }

                    okCall && okCall(result);
                },
                error: function(res){
                    loading = false;
                    TOOL.toast('获取微信H5支付参数接口出错了');
                }
            }
        )
    }

    init();

    /**
     * 立即注册
     */
    $('#loginOn').on('click', function(e) {
        // 判断有没有输入电话号码
        // 判断有没有输入验证码

        var phoneNum = $('#phoneNum').val(),
            verifyCode = $('#verifyCode').val(),
            userName = $('#userName').val();

        var ver = loginVerifyHandler(phoneNum, verifyCode, userName);

        if (!ver.success) {
            TOOL.toast(ver.msg);
            return;
        }

        if (loading) {
            return;
        }

        loading = true;

        if (isWeiXin) {
            verifyCodeHandler(phoneNum, verifyCode, function() {
                orderFormHandler(phoneNum, function(result) {
                    var orderValue = result.value || {};
                    if (!orderValue.serial) {
                        loading = false;
                        TOOL.toast('下单serial不存在, 请重试');
                        return;
                    }

                    window.sessionStorage.setItem('phoneNumber', phoneNum);
                    window.sessionStorage.setItem('serial', orderValue.serial);

                    getWeiXinJSAPIParam(orderValue.serial, function(data2) {
                        var param = data2.value || {};

                        // 调起微信支付
                        TOOL.wxPay({
                            appId: param.appId,
                            timeStamp: param.timeStamp,
                            nonceStr: param.nonceStr,
                            package: param.package1,
                            signType: param.signType,
                            paySign: param.paySign,
                        }, {}, function() {
                            loading = false;
                        });

                    }, function (re) {
                        loading = false;
                        TOOL.toast(re.message);
                    })

                }, function(result) {
                    loading = false;
                    TOOL.toast(result.message);
                });
            }, function() {
                loading = false;
                TOOL.toast('验证码错误, 请重新获取');
            })
        } else {

            // 直接去下单
            orderFormHandler(phoneNum, function(result) {

                var orderValue = result.value || {};
                if (!orderValue.serial) {
                    loading = false;
                    TOOL.toast('下单serial不存在, 请重试');
                    return;
                }

                window.sessionStorage.setItem('phoneNumber', phoneNum);
                window.sessionStorage.setItem('serial', orderValue.serial);

                getWeiXinH5Param(orderValue.serial, function(data2) {
                    var value = data2.value || {};

                    // 调起微信H5支付
                    // 打开当前链接
                    var url = value.mweb_url || '';
                    if (!url) {
                        loading = false;
                        TOOL.toast('mweb_url不存在');
                        return;
                    }

                    var backUrl = window.location.protocol + "//" + window.location.host + '/index.html?serial=' + orderValue.serial + '&phoneNum=' + phoneNum;

                    url = url + '&redirect_url=' + encodeURIComponent(backUrl);

                    window.location.href = url;

                }, function (re) {
                    loading = false;
                    TOOL.toast(re.message);
                })

            }, function(result) {
                loading = false;
                TOOL.toast(result.message);
            });
        }
    });

    /**
     * 获取验证码
     */
    $('#codeBtn').on('click', function(e) {
        var phoneNum = $('#phoneNum').val();
        if (!phoneNum) {
            TOOL.toast('请填写手机号码')
            return;
        }

        if (!/^[1][3,4,5,7,8][0-9]{9}$/.test(phoneNum)) {
            TOOL.toast('请填写格式正确的手机号码');
            return;
        }

        // 发送请求
        var time = 60;
        var str = '已发送(' + time + 's)';

        $('#codeBtn')
            .val(str)
            .attr('disabled', true)
            .css('background', '#CCC');

        var timer = setInterval(function() {
            if (time <= 0) {
                clearInterval(timer);
                timer = null;
                $('#codeBtn')
                    .val('获取验证码')
                    .removeAttr('disabled')
                    .css('background', '#602DDA');
                return;
            }

            time--;
            str = '已发送(' + time + 's)';
            $('#codeBtn').val(str);
        }, 1000);


        /**
         * 请求发送验证码
         */
        $.ajax({
            url: API['getCodeWithUnauthorized'].url,
            type: API['getCodeWithUnauthorized'].method,
            data: {
                phoneMobile: phoneNum
            },
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    TOOL.toast('验证码发送成功');
                } else {
                    TOOL.toast('验证码发送失败');
                    clearInterval(timer);
                    timer = null;
                    $('#codeBtn')
                        .val('获取验证码')
                        .removeAttr('disabled')
                        .css('background', '#602DDA');
                }
            },
            error: function() {
                TOOL.toast('出错了');
            }
        })

    });

    /**
     * 禁止遮罩层滑动
     */
    $('#mask').on('touchmove mousewheel', function(e) {
        e.preventDefault();
    });

    /**
     * 遮罩层按钮 否
     */
    $('#pay-btn1').on('click', function(e) {
        $('#mask').hide();
    });

    /**
     * 遮罩层按钮 是
     */
    $('#pay-btn2').on('click', function(e) {
        $('#mask').hide();
        if (!hasPaySuccess) {
            alert('还未支付成功, 请稍后');
        }
    });
});
