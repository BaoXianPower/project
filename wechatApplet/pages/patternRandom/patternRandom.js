// pages/patternRandom/patternRandom.js
const WXAPI = require('../../wxapi/main');
import com from '../../utils/common'
Page({
    /**
     * 页面的初始数据
     */
    data: {
        motto: '',
        planList: [],
        mapList: [],
        upList: [],
        templateList: [],
        pageIndex: 1,
        pageSize: 5,
        pageTotal: 0,
        finishNum: 0,
        imageUrl: '',
        doing: false,
        imitationLoading: true
    },

    getPlanList: function () {
        let pd = {
            linkType: "square",
            aspectRatio: "2:3"
        };
        WXAPI.queryAiParaList(pd).then((res) => {
            let list = [];
            res.list.forEach((it, i) => {
                if (it.autoDefault) {
                    let tp = {
                        id: it.id,
                        percent: it.percent || 0,
                    };
                    list.push(tp);
                }
            });
            this.setData({
                planList: list
            });
            this.getMapList();
        });
    },

    getMapList() {
        let list = [];
        this.data.planList.forEach((it, i) => {
            for (let j = 0; j < it.percent; j++) {
                list.push(it.id);
            }
        });
        this.data.mapList = list;
    },

    initHandler: function () {
        this.setData({
            finishNum: 0,
            imageUrl: '',
            doing: false,
        });
    },

    getPlanId: function () {
        let index = Math.floor(Math.random() * this.data.mapList.length);
        return this.data.mapList[index];
    },

    getPatternHandler: function () {
        if (!this.data.doing) {
            return;
        }
        let pd = {
            id: this.getPlanId()
        };
        WXAPI.aiPatternDesign(pd).then((res) => {
            if (!this.data.doing) {
                return;
            }
            if (res.success) {
                this.data.finishNum++;
                this.setData({
                    imageUrl: res.value
                });
                if (this.data.finishNum >= 100) {
                    this.data.doing = false;
                    wx.switchTab({
                        url: '../resultPattern/resultPattern',
                    })
                } else {
                    this.getPatternHandler();
                }
            } else {
                this.getPatternHandler();
            }
        });
    },

    startHandler: function () {
        this.setData({
            doing: true
        });
        this.getPatternHandler();
    },

    stopHandler: function () {
        this.data.doing = false;
        wx.switchTab({
            url: '../resultPattern/resultPattern',
        })
    },

    upImgHandler: function () {
        if (this.data.upList.length >= 6) {
            wx.showToast({
                title: '最多上传六张图片'
            });
            return;
        }
        let count = 6 - this.data.upList.length;
        let me = this;

        //获取签名
        WXAPI.getThumbnailPolicy({}).then((res) => {
            let para = {
                accessid: res.accessid,
                dir: res.dir,
                expire: res.expire,
                host: res.host,
                policy: res.policy,
                signature: res.signature,
                uuid: res.uuid,
            };
            wx.chooseImage({
                count: count,
                sizeType: ['original'],
                success: function (res) {
                    me.uploadHandler(res, para);
                }
            });
        });
    },

    /**
     * 微信上传
     * @param {Object} res
     * @param {Object} para
     */
    uploadHandler: function (res, para) {
        wx.showLoading({
            title: '上传中...',
        })
        let me = this;
        let tempFilePaths = res.tempFilePaths;
        let tempFilePathLength = tempFilePaths.length;
        let myDate = new Date();
        let ossPath = para.dir + myDate.getFullYear();
        for (let i = 0, len = tempFilePaths.length; i < len; i++) {
            // 获取文件后缀
            var pathArr = tempFilePaths[i].split('.');
            //  随机生成文件名称
            var fileRandName = Date.now() + "" + parseInt(Math.random() * 1000);
            var fileName = fileRandName + '.' + pathArr[3];
            // 要提交的key
            var fileKey = ossPath + '/' + fileName;

            ! function (i, fileKey) {
                wx.uploadFile({
                    url: para.host,
                    filePath: tempFilePaths[i],
                    name: 'file',
                    region: 'cn-south',
                    formData: {
                        name: encodeURI(tempFilePaths[i]),
                        key: encodeURI(fileKey),
                        policy: encodeURI(para.policy),
                        OSSAccessKeyId: encodeURI(para.accessid),
                        signature: encodeURI(para.signature),
                        success_action_status: "200"
                    },
                    success: function (res) {
                        // 异步事件 (fileKey 可能只会取最后一个) 闭包缓存下
                        let url = com.getSmallPic(para.host + "/" + fileKey);

                        let originUrl = para.host + "/" + fileKey;

                        ! function (i) {
                            wx.request({
                                url: com.getImageInfo(originUrl),
                                success: function (imgResult) {
                                    let data = imgResult.data || {},
                                        ImageHeight = Number(data.ImageHeight.value || 0),
                                        ImageWidth = Number(data.ImageWidth.value || 0);

                                    if (ImageHeight < 2000 && ImageWidth < 2000) {
                                        wx.showToast({
                                            title: '您选择的图片像素点不够大, 请选择2000 x 2000',
                                            icon: 'none',
                                            duration: 2000
                                        });
                                        if (i === tempFilePathLength - 1) {
                                            setTimeout(function () {
                                                wx.hideLoading();
                                                me.getTemplateList(me.data.upList.length);
                                            }, 2000)
                                        }
                                        return;
                                    }

                                    me.data.upList.push({
                                        url: url,
                                        originUrl: originUrl
                                    });

                                    me.setData({
                                        upList: me.data.upList
                                    });

                                    if (i === tempFilePathLength - 1) {
                                        wx.hideLoading();
                                        me.getTemplateList(me.data.upList.length);
                                    }
                                }
                            });
                        }(i);

                    }
                })
            }(i, fileKey);
        }
    },

    /**
     * 取消上传图片
     * @param {Object} e
     */
    cancelHandler(e) {
        let index = e.currentTarget.dataset.index;

        this.data.upList.splice(index, 1);

        this.setData({
            upList: this.data.upList
        });

        this.getTemplateList(this.data.upList.length);
    },

    /**
     * 滚动判断 和 直接检索
     * @param {*} event
     * @returns
     */
    judgeGetTemplateList(event) {
        let templateList = this.data.templateList,
            value = event,
            isSearch = true;
        if (typeof event === 'object') {
            value = this.data.upList.length;
            isSearch = templateList.length < this.data.pageTotal;
            this.setData({
                pageIndex: ++this.data.pageIndex
            });
        } else {
            templateList = [];
            this.setData({
                pageIndex: 1,
                pageTotal: 0
            });
        }
        return {
            templateList,
            value,
            isSearch
        }
    },

    /**
     * 获取模板查询参数
     * @param {*} value
     * @returns
     */
    getTemplateListParams(value) {
        return {
            pd: {
                value: value,
                start: (this.data.pageIndex - 1) * this.data.pageSize || 0,
                limit: this.data.pageSize
            },
            originImg: { // 原图拼接
                thumbOss: '../../images/detail/originImg.png',
                id: 0,
                select: true
            }
        }
    },

    /**
     * 智能仿图模板获取
     * @param event 上传图片数量 (最多六张) / 滚动触发时是event事件
     */
    getTemplateList(event) {
        // 判断是否是滚动触发

        let {
            templateList,
            value,
            isSearch
        } = this.judgeGetTemplateList(event);

        if (!isSearch || !value) {
            return;
        }

        let {
            pd,
            originImg
        } = this.getTemplateListParams(value);

        WXAPI.getPatchTemplateList(pd)
            .then(res => {
                if (!res.success) {
                    console.log(res.message, "xxxxxx")
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    });
                    return;
                }

                let list = (res.list || []).map(item => {
                    item.content = typeof item.content === 'string' ?
                        JSON.parse(item.content) :
                        item.content;
                    item.thumbOss = item.content.thumbOss || '';
                    item.select = true;
                    return item;
                });

                // 添加原图拼接
                if (pd.value === 1 && typeof event === 'number') {
                    list.unshift(originImg);
                }

                this.setData({
                    templateList: [...templateList, ...list],
                    pageTotal: res.total
                })
            })
            .catch(req => {
                wx.showToast({
                    title: '获取模板失败',
                    icon: 'none'
                })
            })
    },

    /**
     * 选择模板
     * @param {Object} event
     */
    selectTempList(event) {
        // 最多只能选4个
        let index = event.currentTarget.dataset.index;
        let item = this.data.templateList[index];
        let len = 1;

        if (item.select) {
            this.data.templateList.forEach(item => {
                if (!item.select) {
                    len++;
                }
            });
            if (len > 4) {
                wx.showToast({
                    title: '最多选择4个模板!',
                    icon: 'none'
                })
                return;
            }
        }

        this.data.templateList[index].select = !this.data.templateList[index].select;

        this.setData({
            templateList: this.data.templateList
        });
    },

    /**
     * 获取选择数据
     * @returns {Array}
     */
    getSelectTempList() {
        let ids = [];
        this.data.templateList.forEach(item => {
            if (!item.select) {
                ids.push(item.id);
            }
        })

        return {
            imgOssList: this.data.upList.map(item => {
                return item.originUrl
            }),
            templateList: ids
        }
    },

    /**
     * 生成智能仿图
     */
    saveImitationDrawing() {
        let pd = this.getSelectTempList();

        if (!pd.templateList.length) {
            wx.showToast({
                title: '请选择模板',
                icon: 'none'
            });
            return;
        }

        this.setData({
            imitationLoading: false
        });

        // api 调用
        WXAPI.patchJoint(pd)
            .then(res => {
                if (!res.success) {
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    });
                    return;
                }

                this.setData({
                    upList: [],
                    templateList: [],
                    pageIndex: 1,
                    pageSize: 5,
                    pageTotal: 0,
                    imitationLoading: true
                });
                wx.switchTab({
                    url: '../resultPattern/resultPattern',
                })
            })
            .catch(req => {
                wx.showToast({
                    title: '仿图失败了, 请重试',
                    icon: 'none'
                });
                this.setData({
                    imitationLoading: true
                });
            })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getPlanList();
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
        this.data.doing = false;
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

    },

    /**
     * 点击tap
     */
    onTabItemTap: function (e) {
        let me = this;
        wx.getStorage({
            key: 'curBar',
            success: function (data) {
                if (data.data !== 'pages/patternRandom/patternRandom') {
                    me.setData({
                        upList: [],
                        templateList: [],
                        pageIndex: 1,
                        pageSize: 5,
                        pageTotal: 0,
                        imitationLoading: true
                    })
                }
            }
        })

        wx.setStorage({
            key: 'curBar',
            data: e.pagePath
        });
    }
})
