// pages/patternSearch/patternSearch.js
const app = getApp();
const CONFIG = require('../../config.js');
const WXAPI = require('../../wxapi/main');
import com from '../../utils/common'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    upImg: '',
    pager: {
      totalPage: 0, //总数量
      size: 32, //每页显示条目个数不传默认10
      page: 1, //当前页码
    },
    loadImg: false,
    patternList: [],
  },

  getPatterList: function () {
    let pd = {
      queryKey:'',
      categoryList: [],
      imageUrl: wx.getStorageSync('upImg'),
      orderBy: 'random',
      start: (this.data.pager.page - 1) * this.data.pager.size,
      limit: this.data.pager.size,
    };
    this.data.loadImg = true;
    WXAPI.getPattern(pd).then((result) => {
      if (!result.success) {
        return;
      }
      this.data.pager.totalPage = Math.ceil(result.total / this.data.pager.size);
      let list = [];
      result.list.forEach((it, i) => {
        let attr = JSON.parse(it.attr);
        let tp = {
          thumbUrl: com.getSmallPic(it.thumbnailOssPath),
          id: it.id,
          type: it.type,
          select: false,
          serial: it.serial,
          width: attr.printSize[0],
          height: attr.printSize[1],
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
      url: '../patternDetail2/patternDetail2?id=' + e.currentTarget.dataset.id,
    })
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
      wx.showModal({
        title: '成功加入购物',
        content: '去购物车查看？',
        confirmColor: '#3cc51f',
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getPatterList();
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

  }
})