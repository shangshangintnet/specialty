const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      bar_Height: app.bar_Height,
      goodsId: options.goodsId
    })
    if (!app.isShowLogin) {
      that.onLogin();
    } else {
      that.getdata();
    }
  },
  onReachBottom: function () {
  },
  //下拉刷新
  onPullDownRefresh: function () {
  },
  getdata() {
    let that = this;

    httphelper.api("storeFamous/findStoreFamousGoodsDetail", {
      id: that.data.goodsId,
    }, (serverData) => {
      if (serverData.code == 200) {
        var contents=serverData.data.content;
        for(var i = 0; i < contents.length; i++){
          if(contents[i].type==0){
            contents[i].detail=contents[i].detail.split('&hc').join('\n\t')
          }
        }
        that.setData({
          goods: serverData.data,
        })
      }
    });
  },
  onLogin: function () {
    if (!app.isShowLogin) {
      let that = this;
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.getdata();
      }
      return;
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var id = getApp().userId;
    return {
      title: that.data.goods.name,
      path: '/packageStoreFamous/pages/storeFamousGoods/storeFamousGoods?userId=' + id + '&goodsId=' + this.data.goods.id,
      imageUrl: that.data.goods.image
    }
  },
  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    var id = getApp().userId;
    return {
      title: that.data.goods.name,
      query: 'userId=' + id + '&goodsId=' + this.data.goods.id,
      imageUrl: that.data.goods.image
    }
  },
})