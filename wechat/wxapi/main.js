// 小程序开发api接口工具包，https://github.com/gooking/wxapi
const CONFIG = require('./config.js');
// const API_BASE_URL = 'http://192.168.1.118:8085';
const API_BASE_URL = 'https://h5.mihuiai.com/r'

const request = (url, needSubDomain, method, data, urlPara) => {
    let _url = API_BASE_URL + (needSubDomain ? '/' + CONFIG.subDomain : '') + url;
    if (urlPara) {
        if (_url.indexOf("?") < 0) {
            _url += '?_dt=' + Math.random();
        }
        for (let k in data) {
            _url += '&' + k + '=' + data[k];
        }
    }
    return new Promise((resolve, reject) => {
        wx.request({
            url: _url,
            method: method,
            data: data,
            header: {
                'Content-Type': 'application/json;charset=UTF-8',
                'openid': wx.getStorageSync('openid'),
                'cookie': wx.getStorageSync('cookie') || ''
            },
            success(request) {
                let cookieStr = request.header['Set-Cookie'];
                if (cookieStr) {
                    wx.setStorageSync('cookie', cookieStr);
                }
                if (request.data.errCode == 40000) { //40000代表用户未登录
                    wx.navigateTo({
                        url: '../login/login',
                    })
                    return;
                }

                if (request.data.success !== undefined && !request.data.success) {
                    wx.showToast({
                        title: request.data.message,
                        icon: 'none'
                    })
                }


                resolve(request.data)
            },
            fail(error) {
                reject(error)
            },
            complete(aaa) {
                // 加载完成
            }
        })
    })
}

/**
 * 小程序的promise没有finally方法，自己扩展下
 */
Promise.prototype.finally = function (callback) {
    var Promise = this.constructor;
    return this.then(
        function (value) {
            Promise.resolve(callback()).then(
                function () {
                    return value;
                }
            );
        },
        function (reason) {
            Promise.resolve(callback()).then(
                function () {
                    throw reason;
                }
            );
        }
    );
}

module.exports = {
    request,
    getOpenId: (data) => {
        return request('/common/mobile-segment/location', false, 'get', data)
    },

    //登录
    login: (data) => {
        return request('/user/login', false, 'post', data)
    },

    //获取code换区openid
    getOpenid: (data) => {
        return request('/weixin/getOpenid', false, 'get', data)
    },

    //验证openid
    checkOpenid: (data) => {
        return request('/weixin/checkOpenid', false, 'get', data)
    },

    //绑定手机号
    bindPhone: (data) => {
        return request('/weixin/bindPhone', false, 'get', data)
    },
    //获取用户信息
    getUserInfo: (data) => {
        return request('/user/getUserInfo', false, 'get', data)
    },

    //获取首页花型
    getPattern: (data) => {
        return request('/resourceManage/pattern', false, 'post', data)
    },

    //获取设计图
    query: (data) => {
        return request('/resourceManage/query', false, 'post', data)
    },

    //获取上传签名
    getThumbnailPolicy: (data) => {
        return request('/oss/getThumbnailPolicy', false, 'get', data)
    },
    //获取花型详情
    getById: (data) => {
        return request('/resourceManage/getById', false, 'get', data)
    },
    //加入购物车
    addToShoppingCart: (data) => {
        return request('/order/addToShoppingCart', false, 'get', data)
    },
    //立即结算
    directOrder: (data) => {
        return request('/order/directOrder', false, 'put', data, true)
    },
    //获取订单列表
    orderList: (data) => {
        return request('/order/list', false, 'get', data)
    },
    //删除订单
    deleteOrder: (data) => {
        return request('/order/deleteOrder', false, 'delete', data, true)
    },
    //获取购物车列表
    getShoppingCart: (data) => {
        return request('/order/getShoppingCart', false, 'get', data)
    },
    //删除购物车
    removeFromShoppingCart: (data) => {
        return request('/order/removeFromShoppingCart', false, 'delete', data, true)
    },
    //shoppingCartOrder
    shoppingCartOrder: (data) => {
        return request('/order/shoppingCartOrder', false, 'put', data, true)
    },
    //getCodeUrl
    createCode: (data) => {
        return request('/mobile/share/createCode', false, 'post', data)
    },
    //getByCode
    getByCode: (data) => {
        return request('/mobile/share/getByCode', false, 'get', data)
    },

    //queryAiParaList
    queryAiParaList: (data) => {
        return request('/resourceManage/queryAiParaList', false, 'post', data)
    },

    //queryAiParaList
    aiPatternDesign: (data) => {
        return request('/stylePattern/aiPatternDesign', false, 'post', data)
    },

    /**
     * 智能仿图模板获取
     * @data value 用户上传几张图 value 就取几
     * @data start
     * @data limit
     */
    getPatchTemplateList: (data) => {
        return request('/stylePattern/getPatchTemplateList', false, 'get', data)
    },

    /**
     * 生成智能仿图
     * @data imgOssList {Array[string]}
     * @data templateList {Array[id]}
     */
    patchJoint: (data) => {
        return request('/stylePattern/patchJoint', false, 'post', data)
    },

    getImageInfo: (data) => {

    },

    //queryModel
    queryModel: (data) => {
        return request('/resourceManage/queryModel', false, 'get', data)
    },

    queryConfig: (data) => {
        return request('/config/get-value', true, 'get', data)
    },
    wxaQrcode: (data) => {
        return request('/qrcode/wxa/unlimit', true, 'post', data)
    },
}
