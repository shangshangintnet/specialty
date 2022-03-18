const httphelper = require('../../httphelper.js');
const common = require('../../common.js');
const app = getApp();
let that;

Page({
  data: {
    bar_Height: 0,
    active: 1,
    pageNum: 1,
    videoList: [],
    list: [],
    readList: [],
    temp: [], //连续增加商品数组
    lastTimes: 0,
    stepTimer: null,
    step: 0,
    packetVisible: false, //领取红包view
    redpaetGif: false, //红包动画
    newpacket: null, //是否有未领取红包
    balances: [],
    //关注列表
    collectionGoods: [],
    collectionStore: false,
    attentionList: [],
    attentionReadList: [],
    att_temp: [], //连续增加商品数组
    att_pageNum: 1,
    hideMask: true,
  },
  tagTo(e) {
    if (this.data.active == e.currentTarget.dataset.index)
      return;
    this.setData({
      active: e.currentTarget.dataset.index
    })
    setTimeout(() => {
      if (that.data.active == 0) {
        that.setData({
          collectionStore: false,
          attentionList: [],
          att_temp: [], //连续增加商品数组
          att_pageNum: 1,
          hideMask: true,
        })
        that.getAttentiondata();
      } else {}
    }, 500);
  },
  goIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  onLoad(e) {
    that = this;
    var now = new Date().getDate();
    var day = wx.getStorageSync('video_day');
    var read = [];
    var attentionRead = [];
    if (day != now) {
      wx.setStorage({
        data: now,
        key: 'video_day',
      });
      wx.setStorage({
        data: [],
        key: 'video_read_list',
      })
      wx.setStorage({
        data: [],
        key: 'video_attention_read_list',
      })
    } else {
      read = wx.getStorageSync('video_read_list');
      if (read == null || read == "") {
        read = [];
      }
      attentionRead = wx.getStorageSync('video_attention_read_list');
      if (attentionRead == null || attentionRead == "") {
        attentionRead = [];
      }
    }
    this.setData({
      bar_Height: app.bar_Height,
      readList: read,
      attentionReadList: attentionRead,
      step: app.globalData.step,
    });
    this.getdata();
  },
  onUnload(e) {

  },
  onPlay(e) {
    if (this.data.active == 1) {
      let goodId = this.data.list[e.detail.activeId].id;
      if (this.data.readList.indexOf(goodId) === -1) {
        this.data.readList.push(goodId);
        wx.setStorage({
          data: this.data.readList,
          key: 'video_read_list',
        });
        if (that.data.stepTimer == null) {
          this.countInterval();
        }
      }
    } else {
      let goodId = this.data.attentionList[e.detail.activeId].id;
      if (this.data.attentionReadList.indexOf(goodId) === -1) {
        this.data.attentionReadList.push(goodId);
        wx.setStorage({
          data: this.data.attentionReadList,
          key: 'video_attention_read_list',
        });
      }
      if (this.data.stepTimer != null) {
        clearInterval(that.data.stepTimer);
        that.setData({
          stepTimer: null
        })
      }
    }
  },
  onPause(e) {},

  onEnded(e) {
    if (this.data.stepTimer != null) {
      clearInterval(that.data.stepTimer);
      that.setData({
        stepTimer: null
      })
    }
  },
  getdata() {
    httphelper.api("classification/recommendGoods", {
      pageNum: this.data.pageNum
    }, function (server_data) {
      if (server_data.code == 200) {
        let temp = [];
        server_data.data.goodsList.map((val) => {
          if (that.data.readList.indexOf(val.id) === -1) {
            temp.push(val);
          }
        });
        temp = that.data.temp.concat(temp);
        if (temp.length < 5) {
          if (that.data.pageNum == 1) {
            //初次进入数据不够，跳页码
            var page = Math.max(1, parseInt(that.data.readList.length / 10));
            that.setData({
              pageNum: that.data.pageNum + page,
              temp: temp,
              lastTimes: server_data.data.lastTimes
            })
          } else {
            that.setData({
              pageNum: that.data.pageNum + 1,
              temp: temp,
              lastTimes: server_data.data.lastTimes
            })
          }
          that.getdata();
        } else {
          temp.map((val, index) => {
            val.index = index + that.data.list.length;
          })
          that.setData({
            temp: [],
            videoList: temp,
            list: that.data.list.concat(temp),
            lastTimes: server_data.data.lastTimes,
          })
        }
        if (that.data.newpacket == null)
          that.setData({
            newpacket: server_data.data.count
          })
      }
    }, false)
  },
  getAttentiondata() {
    if (this.checkLogin()) {
      httphelper.api("myInformation/getCollectionAll", {
        pageNum: this.data.att_pageNum
      }, function (server_data) {
        if (server_data.code == 200) {
          let att_temp = [];
          server_data.data.collectionGoods.map((val) => {
            // if (that.data.attentionReadList.indexOf(val.id) === -1) {
            att_temp.push(val);
            // }
          });
          att_temp = that.data.att_temp.concat(att_temp);
          if (att_temp.length < 5) {
            // if (that.data.att_pageNum == 1) {
            //   //初次进入数据不够，跳页码
            //   var page = Math.max(1, parseInt(that.data.attentionReadList.length / 10));
            //   that.setData({
            //     att_pageNum: that.data.att_pageNum + page,
            //     att_temp: att_temp
            //   })
            // } else {
            that.setData({
              att_pageNum: that.data.att_pageNum + 1,
              att_temp: att_temp
            })
            // }
            if (!that.data.collectionStore)
              that.selectComponent("#attention_video").setStoreList(server_data.data.collectionStore, that.data.hideMask);
            that.setData({
              collectionStore: true
            })
            that.getAttentiondata();
          } else {
            att_temp.map((val, index) => {
              val.index = index + that.data.attentionList.length;
            })
            if (!that.data.collectionStore)
              that.selectComponent("#attention_video").setStoreList(server_data.data.collectionStore, that.data.hideMask);
            that.setData({
              att_temp: [],
              collectionGoods: att_temp,
              attentionList: that.data.attentionList.concat(att_temp),
              collectionStore: true
            })
          }
        } else {
          //暂无数据
          if (!that.data.collectionStore && server_data.data != null && server_data.data.collectionStore != null)
            that.selectComponent("#attention_video").setStoreList(server_data.data.collectionStore, that.data.hideMask);
          that.setData({
            collectionStore: true,
          })
          if (that.data.att_temp.length > 0) {
            that.setData({
              att_temp: [],
              collectionGoods: att_temp,
              attentionList: that.data.attentionList.concat(att_temp)
            })
          }
        }
      }, false)
    } else {
      //未登录 暂无数据

    }
  },
  onChange(e) {
    if (this.data.active == 1) {
      if (this.data.list.length - e.detail.activeId < 4) {
        this.data.pageNum++;
        this.getdata();
      }
    } else {
      if (this.data.attentionList.length - e.detail.activeId < 4) {
        this.data.att_pageNum++;
        this.getAttentiondata();
      }
    }
  },
  onStoreAttention(e) {
    if (this.checkLogin()) {
      let item = this.data.list[e.detail.activeId];
      httphelper.api("store/storeAttention", {
        id: item.storeId
      }, (serverData) => {
        wx.showToast({
          icon: 'none',
          title: serverData.msg
        });
        if (serverData.code == 200) {
          item.storeFollowStatus = 1;
          that.selectComponent("#video").storeAttentionHandle(e.detail.activeId);
        }
      });
    }
  },
  onLike(e) {
    if (this.checkLogin()) {
      if (this.data.active == 1) {
        let item = this.data.list[e.detail.activeId];
        common.toggleFavour(item.followStatus, item.id, function (data) {
          if (data.code == 200) {
            item.followStatus = 1 - item.followStatus;
            that.selectComponent("#video").likehandle(e.detail.activeId);
            that.data.videoList.map((val) => {
              if (val.id == item.id) {
                val.followStatus = item.followStatus;
              }
            })
            let temp = that.data.videoList;
            that.setData({
              videoList: temp
            })
          }
        })
      } else {
        let item = this.data.attentionList[e.detail.activeId];
        common.toggleFavour(item.followStatus, item.id, function (data) {
          if (data.code == 200) {
            item.followStatus = 1 - item.followStatus;
            that.selectComponent("#attention_video").likehandle(e.detail.activeId);
            that.data.collectionGoods.map((val) => {
              if (val.id == item.id) {
                val.followStatus = item.followStatus;
              }
            })
          }
        })
      }
    }
  },
  onAddCart(e) {
    if (this.checkLogin()) {
      if (this.data.active == 1) {
        let item = this.data.list[e.detail.activeId];
        common.addCart(item.id);
      } else {
        let item = this.data.attentionList[e.detail.activeId];
        common.addCart(item.id);
      }
    }
  },
  onBuy(e) {
    if (this.checkLogin()) {
      if (this.data.active == 1) {
        let item = this.data.list[e.detail.activeId];
        if ((item.extravagant == 3 && item.price == 0) || item.extravagant == 1) {
          wx.showToast({
            icon: "none",
            title: '请先咨询商家再进行购买',
          })
          return;
        }
        wx.navigateTo({
          url: "/pages/order/order_confirm/order_confirm?id=" + item.id + '&productQty=1&storeId=' + item.storeId + '&storeName=' + item.storeName,
        })
      } else {
        let item = this.data.attentionList[e.detail.activeId];
        if ((item.extravagant == 3 && item.price == 0) || item.extravagant == 1) {
          wx.showToast({
            icon: "none",
            title: '请先咨询商家再进行购买',
          })
          return;
        }
        wx.navigateTo({
          url: "/pages/order/order_confirm/order_confirm?id=" + item.id + '&productQty=1&storeId=' + item.storeId + '&storeName=' + item.storeName,
        })
      }
    }
  },

  checkLogin: function () {
    if (app.ssoToken == "") {
      wx.showModal({
        title: '登录或注册上商',
        content: '当前操作需要登录以后才能使用',
        confirmText: "前往登录",
        success: function (res) {
          if (res.confirm) {
            wx.reLaunch({
              url: '/pages/myself/myself',
            })
          } else if (res.cancel) {
            return false;
          }
        },
      })
    } else {
      return true;
    }
  },

  onError(e) {},

  onWaiting(e) {},

  onTimeUpdate(e) {},

  onProgress(e) {},

  onLoadedMetaData(e) {},
  onReady: function () {

  },
  onPageScroll: function (res) {
    if (res.scrollTop > 198 && this.data.active == 0 && this.data.hideMask) {
      that.selectComponent("#attention_video").hideMask();
      this.setData({
        hideMask: false
      })
    }
  },
  countInterval() {
    if (app.ssoToken != "") {
      var count = this.data.lastTimes * 10;
      var rate = count / 2;
      this.data.stepTimer = setInterval(() => {
        if (that.data.step <= count) {
          that.drawCircle(that.data.step / rate);
          that.data.step++;
          app.globalData.step = that.data.step;
        } else {
          if (that.data.stepTimer != null) {
            that.getRedpacket();
            clearInterval(that.data.stepTimer);
            that.setData({
              stepTimer: null
            })
          }
        }
      }, 100)
    }
  },
  drawCircle: function (step) {
    var context = wx.createCanvasContext('canvasArcCir', this);
    context.setLineWidth(2);
    context.setStrokeStyle('#ffef1a');
    context.setLineCap('round')
    context.beginPath(); //开始一个新的路径
    // step 从0到2为一周
    context.arc(30, 30, 25, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
    context.stroke(); //对当前路径进行描边
    context.draw()
  },
  getRedpacket() {
    if (app.ssoToken != "") {
      httphelper.api("red/addUpVideoRedPacket", null, (serverdata) => {
        if (serverdata.code == 200) {
          that.setData({
            lastTimes: serverdata.data.lastTimes,
            newpacket: that.data.newpacket + 1,
            step: 0,
            redpaetGif: true
          })
          setTimeout(() => {
            that.setData({
              redpaetGif: false
            })
          }, 3000);
          if (that.data.stepTimer == null)
            that.countInterval();
        }
      }, false)
    }
  },
  reaceiveRedpacket() {
    httphelper.api("red/receiveVideoRedPacket", null, (serverdata) => {
      if (serverdata.code == 200) {
        that.setData({
          packetVisible: true,
          newpacket: 0,
          balances: serverdata.data.balance,
        })
      }
    }, false)
  },
  getAward() {
    that.setData({
      packetVisible: false,
    })
  },
  onShareAppMessage(e) {
    if (e.target == null) {
      return {
        title: '看探宝视频  领大额红包  换精美珠宝！',
        path: '/pages/video-swiper/video-swiper?userId=' + app.userId,
        imageUrl: 'https://img.ssw88.com/static/red/red_share.jpg'
      }
    } else {
      let item = null;
      if (this.data.active == 1) {
        item = this.data.list[e.target.dataset.index];
      } else {
        item = this.data.attentionList[e.target.dataset.index];
      }
      if (item.extravagant == 3) {
        let name = null;
        if (item.price == 0) {
          name = '[' + item.storeName + ']推荐' + common.makeShareText(3, item.name);
        } else {
          name = '[' + item.storeName + ']推荐' + common.makeShareText(1, item.name, item.price);
        }
        return {
          title: name,
          path: '/packageStore/pages/storeGoodsDetail/storeGoodsDetail?scene=' + app.userId + '@' + item.id,
          imageUrl: item.listImageUrl
        }
      } else {
        let name = null;
        if (item.extravagant == 1) {
          name = common.makeShareText(3, item.name);
        } else {
          name = common.makeShareText(1, item.name, item.price);
        }
        return {
          title: name,
          path: '/pages/goods/goods_detail?userId=' + app.userId + '&isShare=1&goodsId=' + item.id,
          imageUrl: item.listImageUrl
        }
      }
    }
  },
})