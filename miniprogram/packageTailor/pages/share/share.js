// packageTailor/pages/share/share.js
const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;
// 在页面中定义插屏广告
let interstitialAd = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    rotationChart: [],
    shareId: 0,
    bar_Height: 0,
    flag: false,
    timer: 0,
    newpacket: 0,
    count: 0,
    balances: [],
    packetVisible: false, //领取红包view
    slider: {
      indicatorDots: true,
      autoplay: true,
      interval: 5000,
      duration: 200,
    },
  },

  /**
     * 生命周期函数--监听页面加载
     */
  onLoad: function (options) {
    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-93e0612c4abcc81c'
      })
      interstitialAd.onLoad(() => { })
      interstitialAd.onError((err) => { })
      interstitialAd.onClose(() => { })
    }

    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }


    that = this;
    console.log('options=' + options.q)
    if (options.q) {
      let queryAll = decodeURIComponent(options.q);
      let id = queryAll.substring(queryAll.lastIndexOf('&id') + 4);
      that.setData({
        shareId: id,
      })
    } else {
      that.setData({
        shareId: options.id
      });
    }
    wx.setStorageSync('shareId', this.data.shareId);
    that.getData();
  },
  onLogin: function () {
    if (!app.isShowLogin) {
      let that = this;
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      return;
    }
  },
  jumpTo: function (e) {
    if (e.currentTarget.dataset.url == '/pages/html/html') {
      var value = wx.getStorageSync('phoneNum')
      if (value) {
        common.jumpTo(e);
      } else {
        this.onLogin();
      }
    } else if (e.currentTarget.dataset.url == '/packageActivity/pages/redPacketRain/redPacketRain') {
      if (app.showRedPacket == 0) {
        common.jumpTo(e);
        app.showRedPacket = 1;
      }
    } else {
      common.jumpTo(e);
    }
  },

  //倒计时
  refresh_time: function () {
    let now = that.data.times;
    if (now > 0) {
      console.log(that.data.timer);
      if (that.data.timer) {
        clearInterval(that.data.timer);
      }
      that.timeStamp(now);
      that.setData({
        timer: setInterval(function () {
          --now;
          if (now > 0) {
            that.timeStamp(now);
          } else {
            clearInterval(that.data.timer);
            wx.showToast({
              title: "充电结束！",
              icon: 'success',
              duration: 2000
            });
            that.setData({
              timer: 0
            })
          }
        }, 1000)
      })
    }
    // let now = that.data.times;
    // if (that.data.times > 0) {
    //   if (that.data.timer != 0) {
    //     clearInterval(that.data.timer);
    //   }
    //   that.timeStamp(that.data.times);
    //   let timer = setInterval(function () {
    //     --that.data.times;
    //     if (that.data.times > 0) {
    //       that.timeStamp(that.data.times);
    //     } else {
    //       clearInterval(that.data.timer);
    //       wx.showToast({
    //         title: "充电结束！",
    //         icon: 'success',
    //         duration: 2000
    //       });
    //     }
    //   }, 1000);
    //   that.setData({
    //     timer: timer
    //   })
    // }
  },

  timeStamp: function (second_time) {
    var hour = parseInt(second_time / 3600);
    var min = parseInt(second_time / 60) % 60;
    var seconds = second_time % 60;
    this.setData({
      hour: hour > 9 ? hour : '0' + hour,
      min: min > 9 ? min : '0' + min,
      seconds: seconds > 9 ? seconds : '0' + seconds
    })
  },

  /**
   * 用户支付
   */
  pay: function (e) {
    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      if (app.ssoToken == "") {
        return;
      }
    }
    if (that.data.flag == false) {
      that.initBlue();
    } else {
      httphelper.api("share/createOrder", {
        id: e.currentTarget.dataset.tag,
        shareId: that.data.shareId,
      }, function (data) {
        if (data.code == 200) {
          wx.showToast({
            title: data.msg,
            icon: 'success',
            duration: 2000
          });
          that.setData({
            order: data.data
          });
          that.payOrder();
        } else if (data.code == 201) {
          that.setData({
            code: data.data.code
          })
          if (data.data.type == 0 || data.data.type == 2) {
            that.getCharacteId();
          } else {
            that.startBroadcasting();
          }
          that.getData();
        }
      });
    }
  },
  payOrder() {
    common.sharePay(that.data.order.id, (res) => {
      if (res) {
        httphelper.api("share/findCode", {
          id: that.data.order.id,
        }, function (data) {
          if (data.code == 200) {
            that.setData({
              code: data.data.code
            })
            if (data.data.type == 0 || data.data.type == 2) {
              that.getCharacteId();
            } else {
              that.startBroadcasting();
            }
            that.getData();
          }
        });
      }
    })
  },
  /**
     * 再次激活设备
     */
  getCode: function (e) {
    if (that.data.flag == false) {
      that.initBlue();
    } else {
      httphelper.api("share/getCode", {
      }, function (data) {
        if (data.code == 200) {
          that.setData({
            code: data.data.code
          })
          if (data.data.type == 0 || data.data.type == 2) {
            that.getCharacteId();
          } else {
            that.startBroadcasting();
          }
          that.getData();
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    that.getData();
  },
  getData() {
    httphelper.api("share/getBluetoothName", { id: that.data.shareId }, (serverData) => {
      console.log("server" + serverData.data)
      if (serverData.data == null) {
        that.getData();
      }
      that.setData({
        name: serverData.data.name,
        rotationChart: serverData.data.rotationChart,
        sharePrice: serverData.data.sharePrice,
        times: serverData.data.times,
        shareType: serverData.data.type,
        newpacket: serverData.data.newpacket,
      });
      console.log(serverData.data.similars)
      that.selectComponent('#guess_what').setGoodsValue(serverData.data.similars);
      wx.setStorageSync('inviter', serverData.data.userId);
      if (that.data.flag == false) {
        that.initBlue();
      }
      that.refresh_time();
    });
  },

  //下拉刷新
  onPullDownRefresh: function () {
    this.getData();
    wx.stopPullDownRefresh();
  },

  startBroadcasting: function (e) {
    // that.setData({
    //   code:"00001708-3000-3D85-800A-000FFFFFFFFF",
    // });
    wx.openBluetoothAdapter({
      mode: 'peripheral',
      success: e => {
        console.log(e)
        wx.createBLEPeripheralServer({
          success: (result) => {
            that.setData({
              server: result.server
            })
            console.log(that.data.code)
            that.data.server.startAdvertising({
              advertiseRequest: {
                connectable: true,
                // deviceName: that.data.name,
                serviceUuids: [that.data.code]
              }
            }).then(
              (res) => {
                wx.showToast({
                  title: "充电已开启！",
                  icon: 'success',
                  duration: 2000
                })
                setTimeout(() => {
                  that.oneClose();
                }, 5000)
                console.log('Adverstising.. ', res);
              },
              (res) => {
                console.warn('Advertising failed', res);
              });
          },
        })
      },
      fail: e => {
        console.log('初始化蓝牙失败，错误码：' + (e.errCode || e.errMsg));
        wx.showToast({
          title: "初始化蓝牙失败",
          icon: 'none'
        })
      }
    });
  },


  oneClose: function (e) {
    that.data.server.stopAdvertising();
    that.data.server.close({
      success(res) {
        console.log(res)
      },
      fail(fail) {
        console.log(fail)
      }
    })
    that.setData({
      flag: false
    })
  },
  /**
     * 初始化蓝牙设备
     */
  initBlue: function () {
    that.setData({
      flag: false,
    })
    wx.openBluetoothAdapter({//调用微信小程序api 打开蓝牙适配器接口
      success: function (res) {
        if (that.data.shareType == 1) {
          that.setData({
            flag: true,
          })
          return;
        }
        that.findBlue();//2.0
      },
      fail: function (res) {//如果手机上的蓝牙没有打开，可以提醒用户
        wx.showToast({
          title: '请开启蓝牙',
          icon: 'error',
          duration: 1500
        })
      }
    })
  },

  /**
  *开始搜索蓝牙设备
*/
  findBlue() {
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      interval: 0,
      success: function (res) {

        wx.showLoading({
          title: '正在搜索设备',
        })
        setTimeout(function () {
          //要延时执行的代码
          that.getBlue()//3.0
         }, 2000)
      }
    })
  },

  /**
    * 获取搜索到的设备信息
   */
  getBlue() {
    wx.getBluetoothDevices({
      success: function (res) {
        wx.hideLoading();
        console.log("devices=")
        console.log(res.devices)
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
            console.log('关闭蓝牙搜索');
          }
        })
        for (var i = 0; i < res.devices.length; i++) {
          //that.data.inputValue：
          /**表示的是需要连接的蓝牙设备ID，简单点来说就是我想要连接这个蓝牙设备，
          所以我去遍历我搜索到的蓝牙设备中是否有这个ID
          */

          if (res.devices[i].name == that.data.name ||
            res.devices[i].localName == that.data.name) {
            that.setData({
              deviceId: res.devices[i].deviceId,
            })
            that.connetBlue();//4.0
            return;
          }
        }
        
        if (that.data.count > 0) {
          that.data.count--;
          that.findBlue();
        } else if (!that.data.deviceId) {
          wx.showToast({
            title: '未找到连接设备',
            icon: 'error',
            duration: 2000
          })
          wx.closeBluetoothAdapter({
            success(res) {
              that.setData({
                flag: false,
                count: 0
              })
              console.log("关闭蓝牙模块")
            }
          })
        }
      },
      fail: function () {
        console.log("搜索蓝牙设备失败")
      }
    })
  },

  /**
    * 获取到设备之后连接蓝牙设备
   */
  connetBlue() {
    wx.createBLEConnection({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.data.deviceId,//设备id
      success: function (res) {
        wx.showToast({
          title: '连接成功',
          icon: 'fails',
          duration: 1500
        })
        console.log("连接蓝牙成功!")
        that.getServiceId()//5.0
      },
      fail: function(res){
        console.log(res);
        console.log(that.dataset.deviceId)
        wx.closeBluetoothAdapter({
          success(res) {
            that.setData({
              flag: false,
              count: 0
            })
            console.log("关闭蓝牙模块")
          }
        })
      }
    })
  },

  getServiceId() {
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.data.deviceId,
      success: function (res) {
        var model;
        if (that.data.shareType == 2) {
          model = res.services[0]
        } else {
          model = res.services[1]
        }
        console.log(res.services)
        console.log(model)
        console.log(that.data.shareType)
        that.setData({
          services: model.uuid
        })
        that.setData({
          flag: true,
        })
        //that.getCharacteId()//6.0
      }
    })
  },

  getCharacteId() {
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.services,
      success: function (res) {
        for (var i = 0; i < res.characteristics.length; i++) {//2个值
          var model = res.characteristics[i]
          if (model.properties.write == true) {
            that.setData({
              writeId: model.uuid//用来写入的值
            })
          }
          if (model.properties.notify == true) {
            that.setData({
              notifyId: model.uuid//监听的值
            })
            that.startNotice(model.uuid)//7.0
          }
        }
      }
    })
  },

  startNotice(uuid) {
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.services,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: uuid,  //第一步 开启监听 notityid  第二步发送指令 write
      success: function (res) {
        that.sendMy(that.stringToArrayBuffer(that.data.code));
      }
    })
  },

  sendMy(buffer) {
    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.services,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: that.data.writeId,//第二步写入的特征值
      // 这里的value是ArrayBuffer类型
      value: buffer,
      success: function (res) {
        httphelper.api("share/completeOrder", {
          id: that.data.order.id,
        }, function (data) {
          if (data.code == 200) {
            wx.showToast({
              title: "已开始充电",
              icon: 'success',
              duration: 2000
            });
          }
        });
      },
      fail: function () {
        wx.showToast({
          title: "开启充电失败",
          icon: 'error',
          duration: 2000
        });
      },
      complete: function () {
        wx.closeBluetoothAdapter({
          success(res) {
            that.setData({
              flag: false
            })
            console.log("关闭蓝牙模块")
          }
        })
      }
    })
  },

  reaceiveRedpacket() {
    httphelper.api("red/receiveShareRedPacket", null, (serverdata) => {
      if (serverdata.code == 200) {
        that.setData({
          packetVisible: true,
          balances: serverdata.data.balance,
        })
      }
    }, false)
  },

  getAward() {
    that.setData({
      newpacket: 0,
      packetVisible: false,
    })
  },

  /**
  * 将字符串转换成ArrayBufer
  */
  stringToArrayBuffer(str) {
    return new Uint8Array(str.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    })).buffer
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (that.data.timer) {
      clearInterval(that.data.timer);
      that.setData({
        timer: 0
      })
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (that.data.server) {
      that.data.server.stopAdvertising()
      that.data.server.close()
    }
    wx.closeBluetoothAdapter({
      success(res) {
        that.setData({
          flag: false
        })
        console.log("关闭蓝牙模块")
      }
    })
    if (that.data.timer) {
      clearInterval(that.data.timer);
      that.setData({
        timer: 0
      })
    }
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