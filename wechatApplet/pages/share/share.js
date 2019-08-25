// pages/share/share.js
const app = getApp();
const CONFIG = require('../../config.js');
const WXAPI = require('../../wxapi/main');
import com from '../../utils/common'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        patternList: [],
        sharing: false,
        code: '',
        shareTitle: '',
        withModel: false,
        showTitle: false
    },

    initHandler: function () {
        this.setData({
            patternList: [],
            code: '',
            sharing: false
        });
    },

    backHandler: function () {
        wx.switchTab({
            url: '../index/index',
        })
    },

    getPatterList: function (code) {
        this.setData({
            code: code
        });
        let pd = {
            code: code
        };
        WXAPI.getByCode(pd).then((result) => {
            if (!result.success) {
                return;
            }
            let list = [];
            let withModel = false;
            result.value.data.forEach((it, i) => {
                let tp = {
                    id: it.id,
                    modelId: it.modelId || '',
                    select: false,
                    serial: it.serial,
                    type: 'pattern',
                    thumbUrl: it.thumbnailOssPath,
                    modelUrl: it.modelThumbPath
                };
                list.push(tp);

                if (it.modelId) {
                    withModel = true;
                    let tp2 = {
                        id: it.id,
                        modelId: it.modelId || '',
                        select: false,
                        serial: it.serial,
                        type: 'model',
                        thumbUrl: it.thumbnailOssPath,
                        modelUrl: it.modelThumbPath
                    };
                    list.push(tp2);
                }
            });
            this.setData({
                shareTitle: result.value.title,
                patternList: list,
                withModel: withModel
            });
        });
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

    sharehandler() {
        this.setData({
            showTitle: true
        });
    },

    bindKeyInput(e) {
        this.setData({
            shareTitle: e.detail.value
        })
    },

    confirmShareHandler: function () {
        let list = [];
        this.data.patternList.forEach((it, i) => {
            if (it.select) {
                let tp = {
                    id: it.id
                };
                if (it.modelId) {
                    tp.modelId = it.modelId
                }
                list.push(tp);
            }
        });
        if (!list.length) {
            return;
        }
        let pd = {
            list: list,
            title: this.data.shareTitle
        };
        WXAPI.createCode(pd).then((res) => {
            if (res.success) {
                let code = res.value;
                this.cancelShareHandler();
                this.getPatterList(code);
            }
        });
    },

    previewHandler: function (e) {
        if (this.data.sharing) {
            return;
        }
        let index = e.currentTarget.dataset.index,
            curType = this.data.patternList[index].type,
            imgArr = [];

        this.data.patternList.forEach((it, i) => {
            if (it.type === curType) {
                imgArr.push(it.thumbUrl);
            }
        });

        index = parseInt(index / 2);
        
        wx.previewImage({
            current: imgArr[index], //当前图片地址
            urls: imgArr, //所有要预览的图片的地址集合 数组形式
            success: function (res) {},
            fail: function (res) {},
            complete: function (res) {},
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.initHandler();
        if (options.code) {
            this.data.code = options.code;
        } else {
            let scene = decodeURIComponent(options.scene);
            this.data.code = scene.split('=')[1];
        }
        this.getPatterList(this.data.code);
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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: this.data.shareTitle,
            path: 'pages/share/share?code=' + this.data.code
        }
    }
})