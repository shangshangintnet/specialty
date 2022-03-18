// miniprogram/pages/login/login.js
const httphelper = require("../../httphelper.js");
const common = require("../../common.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    code_content:"发送验证码",
    phoneNumber:"",
    code:"",
  },
  bindPhone:function(event){
    this.setData({
      phoneNumber:event.detail.value
    })
  },
  bindCode: function (event) {
    this.setData({
      code: event.detail.value
    })
  },
  toSmsCodeLogin:function(event){
    common.toSmsCodeLogin(this.data.phoneNumber,this.data.code);
  },
  smsCode:function(){
    let data = {};
    let that = this;
    data.phoneNumber = this.data.phoneNumber;
    httphelper.api("sign/sMSCode",data,(serverdata)=>{
      if(serverdata.code == 200)
      {
         wx.showToast({
           title: serverdata.msg,
         })

         that.countdown();
      }
    })
  },
  countdown: function () {
    var nsecond = 60;
    var that = this;
    var appCount = setInterval(function () {
      nsecond -= 1;
      that.setData({
        code_content: nsecond
      })
      if (nsecond < 1) {
        clearInterval(appCount);

        //取消指定的setInterval函数将要执行的代码 
        that.setData({
          code_content: "重新发送",
        })
      }
    }, 1000);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //隐藏分享
    wx.hideShareMenu();
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