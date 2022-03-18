// components/login/login.js
const httphelper = require('../../httphelper.js')
const common = require('../../common.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showModal: false,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 弹窗
     */
    showLoginModal: function() {
      this.setData({
        showModal: true
      })
    },
    /**
     * 隐藏模态对话框
     */
    hideLoginModal: function() {
      this.setData({
        showModal: false
      });
    },
    /**
     * 对话框微信验证按钮点击事件
     */
    onWechatNum: function(e) {
      let that = this;
      this.hideLoginModal();
      var _appid = wx.getStorageSync('appid');
      var _session = wx.getStorageSync('session_key');
      wx.cloud.callFunction({
        name: 'decode',
        data: {
          session_key: _session,
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData,
        },
        success: res => {
          // console.dir(res);
          wx.setStorageSync('phoneNum', res.result.phoneNumber);
          common.onLogin(res.result.phoneNumber);
        },
        fail: res => {
          console.log('fail' + res.result);
        }
      })
    },

    /**
     * 对话框手机按钮点击事件
     */
    onPhoneNum: function(e) {
      let that = this;
      wx.navigateTo({
        url: "/pages/login/login",
        success:function(){
          that.hideLoginModal();
        }
      });
    },
    /************授权对话框结束***********/
  }
})