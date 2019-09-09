//app.js
const app = getApp();
const CONFIG = require('config.js');
const WXAPI = require('wxapi/main');
const utils = require("utils/util");

App({
  onLaunch: function() {
    // 展示本地存储能力
    let logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
    wx.setStorageSync('cookie', '');

    //登录逻辑
    utils.toLogin();

    let me = this;
    wx.getSystemInfo({//  获取页面的有关信息
      success: function (res) {
        wx.setStorageSync('systemInfo', res)
        let ww = res.windowWidth;
        let hh = res.windowHeight;
        me.globalData.ww = ww;
        me.globalData.hh = hh;
      }
    });
    
  },
  globalData: {
    userInfo: null,
    openid: '',
    phoneMobile: '',
    login: false
  }
})