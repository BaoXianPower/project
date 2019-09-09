// pages/patternDetail2/patternDetail2.js
const app = getApp();
const CONFIG = require('../../config.js');
const WXAPI = require('../../wxapi/main');
import com from '../../utils/common'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    patternInfo: {},
    freeNum: 0,
    showPrice: false,
    selModel: {
      id: '',
      thumbUrl: ''
    },
    modelList: [{
        id: 1,
        thumbUrl: 'https://lire.oss-cn-hangzhou.aliyuncs.com/web_static/h5/mask1.png'
      },
      {
        id: 2,
        thumbUrl: 'https://lire.oss-cn-hangzhou.aliyuncs.com/web_static/h5/mask5.png'
      },
      {
        id: 3,
        thumbUrl: 'https://lire.oss-cn-hangzhou.aliyuncs.com/web_static/h5/mask3.png'
      },
      {
        id: 4,
        thumbUrl: 'https://lire.oss-cn-hangzhou.aliyuncs.com/web_static/h5/mask4.png'
      }
    ],
  },

  getPatternInfo: function() {
    let pd = {
      id: this.data.id
    };
    WXAPI.getById(pd).then((result) => {
      let it = result.value;
      let attr = JSON.parse(it.attr);
      let tags = '';
      if (it.tags) {
        tags = JSON.parse(it.tags).type || '';
      }
      let patternInfo = {
        id: it.id,
        price: 99,
        endPrice: 299,
        serial: it.serial,
        buyCount: it.buyCount || 0,
        fileType: it.fileType,
        width: attr.printSize[0],
        height: attr.printSize[1],
        dpi: attr.dpi[0],
        tags: tags ? tags.type : '',
        thumbUrl: it.thumbnailOssPath
      };
      this.setData({
        patternInfo: patternInfo
      });
    });

  },

  getUserInfoHandler: function() {
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

  selPatternHandler: function() {
    this.setData({
      selModel: {
        id: '',
        thumbUrl: ''
      }
    });
  },

  selModelHandler: function(item) {
    let data = item.currentTarget.dataset.item;
    this.setData({
      selModel: {
        id: data.id,
        thumbUrl: data.thumbUrl
      }
    });
  },

  addTocartHandler: function() {
    let pd = {
      ids: this.data.patternInfo.id
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
      wx.showModal({
        title: '成功加入购物',
        content: '去购物车查看？',
        confirmColor:'#3cc51f',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../myCart/myCart',
            })
          }
        }
      })
    });
  },

  buyNowHandler: function() {
    if (this.data.freeNum < 5) {
      wx.showModal({
        title: '提示',
        content: '您的花型免费购买额度不足，请联系客服，TEL：13396712684',
        confirmColor: '#3cc51f',
      });
      return;
    }

    this.setData({
      showPrice: true
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
      ids: this.data.patternInfo.id
    };
    WXAPI.directOrder(pd).then((res) => {
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
  onLoad: function(options) {
    this.setData({
      id: options.id
    });
    this.getPatternInfo();
    this.getUserInfoHandler();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})