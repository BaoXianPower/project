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
            size: 10, //每页显示条目个数不传默认10
            page: 1, //当前页码
        },
        inputVal: '',
        inputShowed: false, // 是否显示搜索框
        orderList: []
    },

    //搜索框事件
    showInput: function () {
        this.setData({
            inputShowed: true
        });
    },
    hideInput: function () {
        this.setData({
            inputVal: "",
            inputShowed: false,
            orderList: [],
            pager: {
                totalPage: 1, //总数量
                size: 10, //每页显示条目个数不传默认10
                page: 1, //当前页码
            }
        });
        this.getOrderList();
    },
    clearInput: function () {
        this.setData({
            inputVal: "",
        });
    },
    inputTyping: function (e) {
        this.setData({
            inputVal: e.detail.value
        });
    },

    toSearch: function () {
        this.setData({
            orderList: [],
            pager: {
                totalPage: 1, //总数量
                size: 32, //每页显示条目个数不传默认10
                page: 1, //当前页码
            }
        });
        this.getOrderList();
    },

    initHandler: function () {
        this.data.pager.page = 1;
        this.data.orderList = [];
        this.getOrderList();
    },

    getOrderList: function () {
        let pd = {
            start: (this.data.pager.page - 1) * this.data.pager.size,
            limit: this.data.pager.size,
            serial: this.data.inputVal,
            payedStates: "Finished,Debt,Wait"
        };
        WXAPI.orderList(pd).then((result) => {
            if (!result.success) {
                return;
            }
            this.data.pager.totalPage = Math.ceil(result.total / this.data.pager.size);
            let list = this.data.orderList;
            result.list.forEach((it, i) => {
                let tp = {
                    id: it.id,
                    shouldPay: it.shouldPay,
                    payedState: it.payedState,
                    placeTime: com.formatTime(it.placeTime),
                    predictTime: com.formatTime(it.placeTime + 8 * 3600 * 1000),
                    serial: it.serial,
                    payedMoney: it.payedMoney || it.orderItems.length,
                    tradeState: it.tradeState,
                    orderItems: this.initOrderItems(it.orderItems)
                };
                list.push(tp);
            });
            this.setData({
                orderList: list
            });
        });
    },

    initOrderItems: function (orderItems) {
        let list = [];
        orderItems.forEach((it, i) => {
            let resource = it.resource;
            let attr = JSON.parse(resource.attr);
            let tp = {
                thumbUrl: it.homePic,
                serial: resource.serial,
                fileType: resource.fileType,
                type: it.type,
                resourceCost: it.resourceCost,
                completeTime: com.formatTime(it.completeTime),
                ossPath: resource.ossPath,
                attr: {},
                price: it.resourceCost || 1,
                linkType: 'square',
                width: 400,
                height: 600,
                dpi: 300,
            };
            if (it.attr) {
                tp.attr = JSON.parse(it.attr);
                tp.linkType = tp.attr.linkType || 'square';
                if (tp.attr.width) {
                    tp.width = (tp.attr.width / 300 * 2.54).toFixed(0);
                    tp.height = (tp.attr.height / 300 * 2.54).toFixed(0);
                    tp.dpi = 300;
                } else {
                    tp.width = tp.attr.printSize[0];
                    tp.height = tp.attr.printSize[1];
                    tp.dpi = tp.attr.dpi[0];
                }
            }
            list.push(tp);
        });
        return list;
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

    deleteOrderHandler(e) {
        let me = this;
        wx.showModal({
            title: '提示',
            content: '确认删除？',
            confirmColor: '#3cc51f',
            success(res) {
                if (res.confirm) {
                    let pd = {
                        ids: e.currentTarget.dataset.id
                    };
                    WXAPI.deleteOrder(pd).then((res) => {
                        if (!res.success) {
                            return;
                        }
                        me.initHandler();
                    });
                }
            }
        })
    },

    downloadHandler: function () {
        wx.showModal({
            title: '提示',
            confirmColor: '#3cc51f',
            content: "请前往米绘官网下载！\r\n WWW.MIHUIAI.COM",
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

            this.setData({
                orderList: [],
                pager: {
                    totalPage: 1, //总数量
                    size: 10, //每页显示条目个数不传默认10
                    page: 1, //当前页码
                }
            });
            this.getOrderList();
        }, 100);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.pager.page < this.data.pager.totalPage) {
            this.data.pager.page++;
            this.getOrderList();
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