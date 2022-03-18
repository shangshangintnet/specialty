// pages/live/live.js
let livePlayer = requirePlugin('live-player-plugin')
const httphelper = require("../../httphelper.js");
const common = require("../../common.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    room_info: [], //直播间
    replayInfo: [], //回放列表
    replay: false, //回放标识
    curreplay_url: null,
    tabIndex: 0,
    curFullId: -1,
    curVideoContext: null,
    fullScreen: false,
    liveMobile: null,
    shareRoomIn: false,
  },
  getLiveData: function () {
    let that = this;
    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.getLiveData();
      }
      return;
    }
    httphelper.api("broadcast/findSmallLiveInfo", null, (serverdata) => {
      if (serverdata.code == 200) {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        for (var i = 0; i < serverdata.data.length; i++) {
          serverdata.data[i].startTime = serverdata.data[i].startTime.substring(5, 16);
        }
        that.setData({
          room_info: serverdata.data.reverse(),
        })
        //存在需要跳转的直播间
        if (that.data.liveMobile && !that.data.shareRoomIn) {
          that.data.shareRoomIn = true;
          for (var i = 0; i < that.data.room_info.length; i++) {
            if (that.data.liveMobile == that.data.room_info[i].mobile) {
              var roomId = that.data.room_info[i].roomid;
              that.getLiveRoomSate(roomId);
              console.log(roomId);
              let customParams = {
                path: 'pages/liveRoom/liveRoom',
                pid: app.userId
              } // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节
              wx.navigateTo({
                url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${encodeURIComponent(JSON.stringify(customParams))}`
              })
            }
          }
        }
      }
    })
  },
  getReplayData: function (callback) {
    let that = this;
    httphelper.api("broadcast/findSmallReturnLiveInfo", null, (serverdata) => {
      if (serverdata.code == 200) {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        for (var i = 0; i < serverdata.data.length; i++) {
          if (serverdata.data[i].start_time < timestamp) {
            serverdata.data[i].startTime = "即将开始";
          } else {
            serverdata.data[i].startTime = serverdata.data[i].startTime.substring(5, 16);
          }
        }
        that.setData({
          replayInfo: serverdata.data,
        })
        //存在需要跳转的直播间
        if (that.data.liveMobile && !that.data.shareRoomIn) {
          that.data.shareRoomIn = true;
          for (var i = 0; i < that.data.replayInfo.length; i++) {
            if (that.data.liveMobile == that.data.replayInfo[i].mobile) {
              var roomId = that.data.replayInfo[i].roomid;
              that.getLiveRoomSate(roomId);
              console.log(roomId);
              let customParams = {
                path: 'pages/liveRoom/liveRoom',
                pid: app.userId
              }
              // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节
              wx.navigateTo({
                url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${encodeURIComponent(JSON.stringify(customParams))}`
              })
            }
          }
        }
      }
    })
  },

  formatTime: function (e) {
    var h = parseInt(e / 3600);
    e = e % 3600;
    var m = parseInt(e / 60);
    var s = e % 60;
    var str = s > 10 ? s + "" : "0" + s;
    str = m > 10 ? m + ":" + str : "0" + m + ":" + str;
    if (h > 0) {
      str = h + ":" + str;
    }
    return str;
  },

  /**
   * 播放视频
   * 
   */
  playVideo(e) {
    if (this.data.curFullId != e.currentTarget.dataset.id) {
      if (this.data.curFullId != -1) {
        this.data.curVideoContext.stop();
        this.data.curVideoContext.exitFullScreen();
      }
      this.setData({
        curFullId: e.currentTarget.dataset.id,
        replay: true,
        curreplay_url: e.currentTarget.dataset.url
      });
      this.data.curVideoContext = wx.createVideoContext('curplay', this);
      this.data.curVideoContext.requestFullScreen();
      this.data.curVideoContext.play();
      console.log(this.data.curFullId);
    } else {
      this.data.curVideoContext.requestFullScreen();
      this.data.curVideoContext.play();
    }
  },

  /**
   *  视屏进入、退出全屏
   */
  fullScreen(e) {
    //执行全屏方法  
    console.log(e);
    if (!e.detail.fullScreen) {
      this.data.curVideoContext.pause();
      this.data.curVideoContext.exitFullScreen();
    }
    //视屏全屏时显示加载video，非全屏时，不显示加载video
    this.setData({
      fullScreen: e.detail.fullScreen
    })
  },

  /**关闭视屏 */
  closeVideo(e) {
    console.log(e);
    if (this.data.curFullId != -1) {
      this.data.curVideoContext.exitFullScreen();
      this.data.curFullId = -1;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      this.setData({
        liveMobile: scene.split('@')[1]
      })
      console.log(this.data.liveMobile);
    }
  },

  /**
   * 进入直播间
   */
  enterLiveRoom: function (e) {
    console.log(e);
    var roomId = this.data.room_info[e.currentTarget.dataset.index].roomid;
    this.getLiveRoomSate(roomId);
    console.log(roomId);
    let customParams = {
      path: 'pages/liveRoom/liveRoom',
      pid: app.userId
    } // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节
    wx.navigateTo({
      url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${encodeURIComponent(JSON.stringify(customParams))}`
    })
    // 其中wx2b03c6e691cd7370是直播组件appid不能修改
  },
  /**
   * 直播间状态
   */
  getLiveRoomSate: function (e) {
    // 首次获取立马返回直播状态，往后间隔1分钟或更慢的频率去轮询获取直播状态
    const roomId = e // 房间 id
    livePlayer.getLiveStatus({
        room_id: roomId
      })
      .then(res => {
        // 101: 直播中, 102: 未开始, 103: 已结束, 104: 禁播, 105: 暂停中, 106: 异常，107：已过期 
        const liveStatus = res.liveStatus
        console.log('get live status', liveStatus)
      })
      .catch(err => {
        console.log('get live status', err)
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getLiveData();
    // this.getReplayData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getLiveData();
    // this.getReplayData(() => {
    //   wx.stopPullDownRefresh();
    // });
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
    let that = this;
    var id = app.userId;
    let name = common.makeShareText(13);
    return {
      title: name,
      path: '/pages/live/live?scene=' + id,
      imageUrl: that.data.room_info[0].share_img,
    }
  }
})