// pages/resultPattern/resultPattern.js
const app = getApp();
const CONFIG = require('../../config.js');
const WXAPI = require('../../wxapi/main');
import com from '../../utils/common'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        motto: 'index',
        login: true,
        inputVal: '',
        inputShowed: false, // 是否显示搜索框
        pager: {
            totalPage: 0, //总数量
            size: 32, //每页显示条目个数不传默认10
            page: 1, //当前页码
        },
        patternList: [],
        sharing: false,
        shareTitle: '',
        showTitle: false,
        modelList: [],

        bus_x: 0,
        bus_y: 0,
        hide_good_box: true,
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
            patternList: [],
            pager: {
                totalPage: 1, //总数量
                size: 32, //每页显示条目个数不传默认10
                page: 1, //当前页码
            }
        });
        this.getPatterList();
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
            patternList: [],
            pager: {
                totalPage: 1, //总数量
                size: 32, //每页显示条目个数不传默认10
                page: 1, //当前页码
            }
        });
        this.getPatterList();
    },

    toShareHandler: function () {
        this.data.patternList.forEach((it, i) => {
            it.select = false;
        });
        this.setData({
            sharing: true,
            patternList: this.data.patternList
        });
    },
    selectHandler: function (e) {
        let index = e.currentTarget.dataset.index;
        this.data.patternList[index].select = !this.data.patternList[index].select;
        this.setData({
            patternList: this.data.patternList
        });
    },
    cancelShareHandler: function () {
        this.data.sharing = false;
        this.data.patternList.forEach((it, i) => {
            it.select = false;
        });
        this.setData({
            showTitle: false,
            sharing: this.data.sharing,
            patternList: this.data.patternList
        });
    },

    shareHandler() {
        this.initModelHandler();
        this.setData({
            showTitle: true
        });
    },

    initModelHandler() {
        if (this.data.modelList.length) {
            this.data.modelList.forEach((it, i) => {
                it.select = false;
            });
            this.setData({
                modelList: this.data.modelList
            });
            return;
        }
        let pd = {
            isPublic: false
        };
        WXAPI.queryModel(pd).then((res) => {
            if (!res.success) {
                return;
            }
            let modelList = [];
            res.list.forEach((it, i) => {
                let tp = {
                    title: it.title,
                    select: false,
                    list: []
                };
                it.list.forEach((itt, j) => {
                    tp.list.push(itt.id);
                });
                modelList.push(tp);
            });
            this.setData({
                modelList: modelList
            });

        });
    },

    selectModelHandler(e) {
        let index = e.currentTarget.dataset.index;
        this.data.modelList[index].select = !this.data.modelList[index].select;
        this.setData({
            modelList: this.data.modelList
        });
    },

    bindKeyInput(e) {
        this.setData({
            shareTitle: e.detail.value
        })
    },

    confirmShareHandler: function () {
        let ids = [];
        this.data.patternList.forEach((it, i) => {
            if (it.select) {
                ids.push(it.id);
            }
        });
        if (!ids.length) {
            return;
        }

        let pd = {
            list: [],
            title: this.data.shareTitle
        };

        let modelIds = [];
        this.data.modelList.forEach((it, i) => {
            if (it.select) {
                modelIds = modelIds.concat(it.list);
            }
        });
        ids.forEach((it, i) => {
            let tp = {
                id: it
            };
            if (modelIds.length) {
                let index = Math.floor(Math.random() * modelIds.length);
                tp.modelId = modelIds[index];
                console.log(index);
            }
            pd.list.push(tp);
        });

        WXAPI.createCode(pd).then((res) => {
            if (res.success) {
                let code = res.value;
                wx.navigateTo({
                    url: '../share/share?code=' + code
                })
            }
        });
    },

    getPatterList: function () {
        let pd = {
            serial: this.data.inputVal, //this.tag
            types: ['USER_DESIGN', 'AI_DESIGN', 'RECOLORED_USERIMG'],
            orderBy: 'createTime',
            start: (this.data.pager.page - 1) * this.data.pager.size,
            limit: this.data.pager.size,
        };

        WXAPI.query(pd).then((result) => {
            if (!result.success) {
                return;
            }
            this.data.pager.totalPage = Math.ceil(result.total / this.data.pager.size);
            let list = this.data.patternList;
            result.list.forEach((it, i) => {
                let attr = JSON.parse(it.attr);
                let tp = {
                    id: it.id,
                    styleId: it.styleId,
                    serial: it.serial,
                    status: it.status,
                    thumbUrl: it.thumbnailOssPath,
                    type: it.type,
                    select: false
                };
                list.push(tp);
            });
            this.setData({
                patternList: list
            });
        });
    },

    detailHandler: function (e) {
        wx.navigateTo({
            url: '../patternDetail/patternDetail?id=' + e.currentTarget.dataset.id,
        })
    },

    addAnimate: function (e) {
        this.finger = {};
        let topPoint = {};
        this.finger['x'] = e.touches["0"].clientX; //点击的位置
        this.finger['y'] = e.touches["0"].clientY;

        if (this.finger['y'] < this.busPos['y']) {
            topPoint['y'] = this.finger['y'] - 150;
        } else {
            topPoint['y'] = this.busPos['y'] - 150;
        }
        topPoint['x'] = Math.abs(this.finger['x'] - this.busPos['x']) / 2;

        if (this.finger['x'] > this.busPos['x']) {
            topPoint['x'] = (this.finger['x'] - this.busPos['x']) / 2 + this.busPos['x'];
        } else { //
            topPoint['x'] = (this.busPos['x'] - this.finger['x']) / 2 + this.finger['x'];
        }

        this.linePos = com.bezier([this.busPos, topPoint, this.finger], 30);
        this.startAnimation(e);
    },

    startAnimation: function (e) {
        var index = 0,
            that = this,
            bezier_points = that.linePos['bezier_points'];
        this.setData({
            hide_good_box: false,
            bus_x: that.finger['x'],
            bus_y: that.finger['y']
        })

        var len = bezier_points.length;
        index = len;
        this.timer = setInterval(function () {
            if (len) {
                len--;
                that.setData({
                    bus_x: bezier_points[len]['x'],
                    bus_y: bezier_points[len]['y']
                })
            } else {
                clearInterval(that.timer);
                that.addTocartHandler(e);
                that.setData({
                    hide_good_box: true
                })
            }
        }, 15);
    },

    addTocartHandler: function (e) {
        let pd = {
            ids: e.currentTarget.dataset.id
        };
        WXAPI.addToShoppingCart(pd).then((res) => {
            if (!res.success) {
                return;
            }
            let cartNum = res.total;
            wx.setTabBarBadge({
                index: 3,
                text: cartNum.toString()
            });
        });
    },

    initHandler: function () {
        this.setData({
            patternList: [],
            pager: {
                totalPage: 0, //总数量
                size: 32, //每页显示条目个数不传默认10
                page: 1, //当前页码
            },
            inputVal: '',
            sharing: false
        });

        this.cancelShareHandler();
        this.getPatterList();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.busPos = {};
        this.busPos['x'] = app.globalData.ww * 0.7; //购物车的位置
        this.busPos['y'] = app.globalData.hh;
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
        if (this.data.sharing) {
            return;
        }
        setTimeout(() => {
            wx.showToast({
                title: '努力加载中',
                icon: 'success',
                duration: 1000
            })

            this.setData({
                patternList: [],
                pager: {
                    totalPage: 1, //总数量
                    size: 32, //每页显示条目个数不传默认10
                    page: 1, //当前页码
                }
            });
            this.getPatterList();
        }, 100);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.pager.page < this.data.pager.totalPage) {
            this.data.pager.page++;
            this.getPatterList();
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