const CONFIG = require('../config.js');
const WXAPI = require('../wxapi/main');

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const toLogin = () => {
  wx.checkSession({
    success() {
      if (!wx.getStorageSync('login')) {
        if (!wx.getStorageSync('openid')) {
          wxlogin();
        } else {
          setTimeout(() => {
            if (needLogin()) {
              wx.navigateTo({
                url: '../login/login'
              })
            }
          }, 100);
        }
      }
    },
    fail() {
      wxlogin();
    }
  })
}

const wxlogin=()=>{
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      if (res.code) {
        // 发起网络请求
        WXAPI.getOpenid({
          code: res.code
        }).then(function (res) {
          if (res.success) {
            wx.setStorageSync('openid', res.value.openid);
            wx.setStorageSync('login', res.value.isLoggedIn);
            if (!res.value.isLoggedIn) {
              setTimeout(() => {
                if (needLogin()) {
                  wx.navigateTo({
                    url: '../login/login'
                  })
                }
              }, 100);
            }
          }
        });
      } else {
        console.log('登录失败！' + res.errMsg)
      }
    }
  })
}

const needLogin = () => {
  let pages = getCurrentPages();
  let url = pages[pages.length - 1].route;
  console.log(url);
  if (url.indexOf('pages/share/share') > -1 || url.indexOf('pages/login/login') > -1) {
    return false;
  } else {
    return true;
  }
}

module.exports = {
  formatTime: formatTime,
  toLogin: toLogin,
  wxlogin: wxlogin
}