// pages/myOrder/myOrder.js
const app = getApp();
const CONFIG = require('../../config.js');
const WXAPI = require('../../wxapi/main');
import com from '../../utils/common';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pager: {
            totalPage: 1, //总数量
            size: 100, //每页显示条目个数不传默认10
            page: 1, //当前页码
        },
        freeNum: 0,
        payInfo: {},
        showPrice: false,
        selectAll: false,
        cartList: [],
        cartNum: 0,
        selNum: 0,
    },

    initHandler: function () {
        this.data.pager.page = 1;
        this.setData({
            selNum: 0,
            orderList: [],
            selectAll: 0
        });
        this.getCartList();
    },

    getUserInfoHandler: function () {
        let me = this;
        WXAPI.getUserInfo({}).then((res) => {
            if (res.success) {
                let userFreeCount = res.value.userFreeCount;
                me.setData({
                    freeNum: userFreeCount.free - userFreeCount.download
                });
            }
        })
    },

    getCartList: function () {
        let pd = {
            start: (this.data.pager.page - 1) * this.data.pager.size,
            limit: this.data.pager.size
        };
        WXAPI.getShoppingCart(pd).then((result) => {
            if (!result.success) {
                return;
            }
            let cartNum = result.total;
            if (cartNum) {
                wx.setTabBarBadge({
                    index: 3,
                    text: cartNum.toString()
                });
            } else {
                wx.removeTabBarBadge({
                    index: 3,
                })
            }

            this.data.pager.totalPage = Math.ceil(result.total / this.data.pager.size);
            let list = [{
                    name: '花型商城',
                    select: false,
                    type: 'Pattern',
                    list: [],
                },
                {
                    name: '我的工作室',
                    type: 'Design',
                    select: false,
                    list: [],
                }
            ];
            result.list.forEach((it, i) => {
                let itt = it.resource;
                let attr = JSON.parse(itt.attr);
                let tp = {
                    id: it.id,
                    resourceType: it.resource.type,
                    resourceId: it.resource.id,
                    select: false,
                    amount: 0,
                    shouldPay: 0,
                    buyout: false,
                    thumbUrl: it.homePic,
                    serial: itt.serial,
                    canPay: this.getCanPay(itt, it.type),
                    fileType: itt.fileType,
                    type: it.type || 1
                };

                if (tp.type == 1) {
                    tp.width = attr.printSize[0];
                    tp.height = attr.printSize[1];
                    tp.dpi = attr.dpi[0];
                    tp.price = 5;
                    list[0].list.push(tp);
                } else if (tp.type == 2) {
                    tp.width = attr.width;
                    tp.height = attr.height;
                    tp.dpi = attr.dpi;
                    tp.price = 1;
                    list[1].list.push(tp);
                } else if (tp.type == 3) {
                    tp.width = attr.printSize[0];
                    tp.height = attr.printSize[1];
                    tp.dpi = attr.dpi;
                    tp.price = 1;
                    list[1].list.push(tp);
                }
            });

            this.setData({
                cartList: list,
                cartNum: result.total,
                selectAll: false
            });
        });
    },

    getCanPay: function () {

    },

    selectAllHandler: function () {
        this.data.selectAll = !this.data.selectAll;
        this.data.cartList.forEach((it, i) => {
            it.select = this.data.selectAll;
            it.list.forEach((itt, j) => {
                itt.select = this.data.selectAll;
            });
        });

        this.setData({
            selectAll: this.data.selectAll
        });
        this.setData({
            cartList: this.data.cartList
        });
        this.getSelNum();
    },

    selectItemHandler: function (e) {
        let index = e.currentTarget.dataset.index;
        let bool = !this.data.cartList[index].select;
        this.data.cartList[index].select = bool;
        this.data.cartList[index].list.forEach((it, j) => {
            it.select = bool;
        });
        this.setData({
            cartList: this.data.cartList
        });
        this.getSelNum();
    },

    selectOneHandler: function (e) {
        let index = e.currentTarget.dataset.index;
        let index2 = e.currentTarget.dataset.index2;
        let bool = !this.data.cartList[index].list[index2].select;
        this.data.cartList[index].list[index2].select = bool;
        let num = 0;
        this.data.cartList[index].list.forEach((it, j) => {
            if (it.select) {
                num++;
            }
        });
        if (num == this.data.cartList[index].list.length) {
            this.data.cartList[index].select = true;
        } else {
            this.data.cartList[index].select = false;
        }
        this.setData({
            cartList: this.data.cartList
        });
        this.getSelNum();
    },

    getSelNum: function (e) {
        let num = 0;
        this.data.cartList.forEach((it, i) => {
            it.list.forEach((itt, j) => {
                if (itt.select) {
                    num++;
                }
            });
        });
        this.setData({
            selNum: num
        });
    },

    previewImg: function (e) {
        let index = e.currentTarget.dataset.index;
        let order = e.currentTarget.dataset.order;
        let imgArr = [];
        order.orderItems.forEach((it, i) => {
            imgArr.push(it.thumbUrl);
        });
        wx.previewImage({
            current: imgArr[index], //当前图片地址
            urls: imgArr, //所有要预览的图片的地址集合 数组形式
            success: function (res) {},
            fail: function (res) {},
            complete: function (res) {},
        });
    },

    deleteAllHandler() {
        let me = this;
        let ids = [];
        this.data.cartList.forEach((it, i) => {
            it.list.forEach((itt, j) => {
                if (itt.select) {
                    ids.push(itt.id);
                }
            });
        });
        if (!ids.length) {
            wx.showToast({
                title: '请先选择删除的图片！',
                icon: 'none',
                duration: 1000
            })
            return;
        }

        wx.showModal({
            title: '提示',
            content: '确认删除？',
            confirmColor: '#3cc51f',
            success(res) {
                if (res.confirm) {
                    let pd = {
                        ids: ids
                    };
                    WXAPI.removeFromShoppingCart(pd).then((res) => {
                        if (!res.success) {
                            return;
                        }
                        me.initHandler();
                    });
                }
            }
        })
    },

    buyNowHandler() {
        let me = this;
        let ids = [];
        let price = 0;
        this.data.cartList.forEach((it, i) => {
            it.list.forEach((itt, j) => {
                if (itt.select) {
                    ids.push(itt.id);
                    price += itt.price;
                }
            });
        });
        if (!ids.length) {
            wx.showToast({
                title: '请先选择购买的图片！',
                icon: 'none',
                duration: 1000
            })
            return;
        }
        let tmp = {
            ids: ids,
            preview: true,
        };
        WXAPI.shoppingCartOrder(tmp).then((res) => {
            if (!res.success) {
                return;
            }
            let tp = {
                ids: ids,
                needNum: 0,
                freePatternNum: 0,
            };
            res.list.forEach((it, i) => {
                tp.needNum += it.totalCost;
                tp.freePatternNum += it.freePatternNum;
            });

            if (this.data.freeNum < tp.needNum) {
                wx.showModal({
                    title: '提示',
                    content: '您的花型免费购买额度不足，请联系客服，TEL：13396712684',
                });
                return;
            }

            this.setData({
                payInfo: tp,
                showPrice: true
            });
        });

    },

    cancelHandler: function () {
        this.setData({
            showPrice: false
        });
    },

    confirmBuyHandler: function () {
        this.setData({
            showPrice: false
        });

        let pd = {
            ids: this.data.payInfo.ids
        };
        WXAPI.shoppingCartOrder(pd).then((res) => {
            if (!res.success) {
                return;
            }
            wx.switchTab({
                url: '../myOrder/myOrder',
            })
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.initHandler();
        this.getUserInfoHandler();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
        setTimeout(() => {
            wx.showToast({
                title: '努力加载中',
                icon: 'success',
                duration: 1000
            })
            this.initHandler();
        }, 100);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.pager.page < this.data.pager.totalPage) {
            this.data.pager.page++;
            this.getCartList();
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 点击tap
     */
    onTabItemTap: function(e) {
        wx.setStorage({
            key: 'curBar',
            data: e.pagePath
        })
    }
})