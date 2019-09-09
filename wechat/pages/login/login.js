//index.js
//获取应用实例
const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('../../wxapi/main')
const utils = require("../../utils/util");

Page({
  data: {
    userName: '',
    password: '',

    motto: 'MIHUI LOGIN',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  nameinput: function (e) {
    this.setData({ userName: e.detail.value });
  },
  pwdinput: function (e) {
    this.setData({ password: e.detail.value });
  },
  loginHandler:function(){
    let pd={
      autoLogin:'yes',
      userName: this.data.userName,
      password:this.data.password
    };
    WXAPI.login(pd).then((res)=>{
      if(res.success){
        console.log('success');
        wx.setStorageSync('login', true);
        wx.switchTab({
          url: '../index/index',
        })
      }
    });
  },

  onLoad: function() {
    if (wx.getStorageSync('openid')){
      this.checkOpenid();
    }  else{
      utils.wxlogin();
    }
  },

  onShow: function () {
    
  },

  checkOpenid:function(){  
    let pd={
      openid: wx.getStorageSync('openid'),
    };
    WXAPI.checkOpenid(pd).then((res)=>{
      if(!res.success){      
        utils.wxlogin();
      }
    });
  },

  bindHandler: function(e) {  
    let me = this;
    WXAPI.bindPhone({
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv,
      openid: wx.getStorageSync('openid')
    }).then(function(res) {
      if(res.success){
        wx.setStorageSync('login', true);
        wx.showModal({
          title: '提示',
          content: '绑定成功',
          showCancel: false,
          confirmColor: '#3cc51f',
          success(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../index/index'
              })            
            }
          }
        })      
      }else{
        wx.showModal({
          title: '提示',
          content: '绑定失败,请联系客服，TEL：+86 13396712684',
          confirmColor: '#3cc51f',
          showCancel: false
        })
      }
    })
  }

})