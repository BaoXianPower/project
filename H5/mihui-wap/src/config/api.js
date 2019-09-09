var HOST_URL = window.location.protocol + "//" + window.location.host + "/r/";

if (location.href.indexOf('localhost') >= 0 ||
    location.href.indexOf('127.0.0.1') >= 0 ||
    location.href.indexOf('192.168') >= 0) {
    HOST_URL = window.location.protocol + "//" + window.location.host + "/r/";
}

var API = {
    getCodeWithUnauthorized: {
        url: HOST_URL + 'mobileVerify/getCodeWithUnauthorized',
        method: 'GET'
    },
    verifyCode: {
        url: HOST_URL + 'user/verify',
        method: 'GET'
    },
    orderForExperience: {
        url: HOST_URL + 'order/orderForExperience',
        method: 'POST'
    },
    getJsWXPayForExperience: {
        url: HOST_URL + 'weixinpay/getJsWXPayForExperience',
        method: 'GET'
    },
    weixinpay: {
        url: HOST_URL + 'weixinpay/getMWebPay',
        method: 'GET'
    },
    orderQueryResultForExp: {
        url: HOST_URL + 'weixinpay/orderQueryResultForExp',
        method: 'GET'
    }
};

export default API;


