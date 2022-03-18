// packageMyself/pages/myself/cloudStore/cloudStore.js
const httphelper = require('../../../../httphelper.js')
const common = require('../../../../common.js')
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    state: 0,
    showPop: false,
    showAddress: false,
    price: 0, // 抵押金额           
    returnStatus: 0, // 0:无可退押金 1:有可退押金 2:存在审核中退押金
    addressIdx: 0,
    onlyPrice: 4980,
    orderCount: 1,
    beFirstIn: true,
    showUpload: false,
    showUploadVideo: false,
    imageUrls: [],
    images: [],
    video: null,
    verticalImages: [],
    verticalVideo: null,
    upImgType: 0,
  },
  jumpTo: common.jumpTo,

  /**
   * 立即联系
   */
  consulation: function () {
    let that = this;
    httphelper.api("cloudShop/addUser", null, function (data) {
      if (data.code == 200) {
        wx.showToast({
          icon: "none",
          title: '信息已提交，请耐心等待客服人员联系~',
          duration: 3000
        });
        that.setData({
          state: 1
        })
      }
    });
  },
  /**
   * 开启云店
   */
  createStore() {
    this.setData({
      showPop: true
    })
  },

  closePopup: function () {
    this.setData({
      showPop: false
    })
  },

  /**
   * 选择地址
   */
  selectAddress: function () {
    if (this.data.getAddress.length == 0) {
      wx.navigateTo({
        url: '/packageMyself/pages/myself/myaddress/createAddress/createAddress',
      })
    } else {
      this.setData({
        showAddress: true
      })
    }
  },

  closeAddress: function () {
    this.setData({
      showAddress: false
    })
  },

  onConfirm: function (e) {
    if (Number(e.detail.index)) {
      this.setData({
        addressIdx: e.detail.index,
        showAddress: false
      })
    } else {
      this.setData({
        addressIdx: 0,
        showAddress: false
      })
    }
  },

  /**
   * 订单数量
   */
  orderNum: function (e) {
    this.setData({
      orderCount: e.detail.value
    })
  },

  /**
   * 创建订单
   */
  createOrder: function () {
    if (this.data.getAddress == null) {
      wx.showToast({
        icon: 'none',
        title: '请选择收货地址',
        duration: 3000
      });
      return;
    }
    let that = this;
    var post = {};
    post.addressId = this.data.getAddress[this.data.addressIdx].id;
    post.count = this.data.orderCount;
    httphelper.api("cloudShop/createCloudShopOrder", post, function (data) {
      if (data.code = 200) {
        //支付订单
        var paydata = {};
        paydata.orderId = data.data.id;
        paydata.openId = wx.getStorageSync('openid');
        httphelper.api("cloudShop/wxSmallPay", paydata, function (serverdata) {
          if (serverdata.code == 200) {
            wx.showLoading({
              title: '加载中',
            });
            //向服务器下单成功，提示用户进行支付
            wx.requestPayment({
              timeStamp: serverdata.data.resultwx.timeStamp,
              nonceStr: serverdata.data.resultwx.nonce_str,
              package: 'prepay_id=' + serverdata.data.resultwx.prepay_id,
              signType: 'HMAC-SHA256',
              paySign: serverdata.data.resultwx.sign,
              complete(res) {
                setTimeout(() => {
                  wx.hideLoading();
                  that.refreshData();
                }, 2000);
              },
            })
          } else {
            wx.showToast({
              title: serverdata.msg,
            })
            setTimeout(() => {
              wx.hideToast({
                complete: (res) => { },
              })
              that.refreshData();
            }, 2000);
          }
        })
      }
    })
  },

  /**
   * 退押金
   */
  returnPrice: function () {
    let that = this;
    var post = {};
    post.returnType = 3;
    post.returnParam = wx.getStorageSync('openid');
    httphelper.api("cloudShop/addReturnPrice", post, function (data) {
      if (data.code == 200) {
        that.refreshData();
      }
    })
  },

  /**
   * 审核中
   */
  reviewPrice: function () {
    wx.showToast({
      icon: 'none',
      title: '您的退押金请求正在审核，请稍后',
      duration: 3000
    });
  },

  refreshData: function () {
    let that = this;
    httphelper.api("cloudShop/getUser", null, function (data) {
      if (data.code == 200) {
        if (data.data != null) {
          //已联系
          if (data.data.count > 0) {
            //已开店
            if (data.data.returnStatus != 0) {
              //有押金可退
              that.setData({
                state: 3,
                showPop: false,
                price: data.data.price,
                returnStatus: data.data.returnStatus,
                onlyPrice: data.data.onlyPrice,
                imageUrls: data.data.imageUrls ? data.data.imageUrls.split(',') : [],
                images: data.data.images ? data.data.images.split(',') : [],
                video: data.data.video,
                verticalImages: data.data.verticalImages ? data.data.verticalImages.split(',') : [],
                verticalVideo: data.data.verticalVideo
              })
            } else {
              //没有可退押金
              that.setData({
                state: 2,
                showPop: false,
                price: data.data.price,
                returnStatus: data.data.returnStatus,
                onlyPrice: data.data.onlyPrice,
                imageUrls: data.data.imageUrls ? data.data.imageUrls.split(',') : [],
                images: data.data.images ? data.data.images.split(',') : [],
                video: data.data.video,
                verticalImages: data.data.verticalImages ? data.data.verticalImages.split(',') : [],
                verticalVideo: data.data.verticalVideo
              })
            }
          } else {
            //未开店
            that.setData({
              state: 1,
              showPop: false,
              onlyPrice: data.data.onlyPrice,
            })
          }
        }
      }
    });
  },
  onGetAddress: function () {
    let that = this;
    httphelper.api("myInformation/addressManagement", null, function (server_data) {
      that.setData({
        getAddress: server_data.data.addresses
      })
    })
  },
  /**
   * 上传视频
   */
  changeUpImg(e) {
    this.setData({
      upImgType: e.currentTarget.dataset.index
    })
  },
  showUploadVideo() {
    this.setData({
      showUploadVideo: true
    });
  },
  cloaseUploadVideo: function () {
    this.setData({
      showUploadVideo: false
    });
  },
  deleteImage2: function (e) {
    let that = this;
    let type = that.data.upImgType == 0 ? 2 : 4;
    wx.showModal({
      title: '删除图片',
      content: '确定要删除所选图片吗？',
      success(res) {
        if (res.confirm) {
          httphelper.api("cloudShop/delImage", {
            imageUrl: e.currentTarget.dataset.url,
            type: type
          }, function (server_data) {
            if (type == 2) {
              that.data.images.splice(e.currentTarget.dataset.index, 1);
              var temp = that.data.images;
              that.setData({
                images: temp
              })
            } else {
              that.data.verticalImages.splice(e.currentTarget.dataset.index, 1);
              var temp = that.data.verticalImages;
              that.setData({
                verticalImages: temp
              })
            }
          })
        }
      }
    })
  },
  selectImage2: function () {
    let that = this;
    let count = that.data.upImgType == 0 ? 6 - that.data.images.length : 6 - that.data.verticalImages.length;
    wx.chooseImage({
      count: count,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        for (var i = 0; i < res.tempFiles.length; i++) {
          if (res.tempFiles[i].size > 5000000) {
            wx.showToast({
              title: '每张图片大小不得超过5M',
              duration: 3000
            })
            return;
          }
        }
        wx.showLoading({
          title: '图片上传中',
        })
        that.setData({
          uploadCount: res.tempFilePaths.length,
          filePaths: res.tempFilePaths,
          uploadIndex: 0
        })
        that.uploadImg2();
      }
    })
  },
  uploadImg2: function () {
    let that = this;
    let type = that.data.upImgType == 0 ? 2 : 4;
    wx.uploadFile({
      url: getApp().url + "cloudShop/uploadFile",
      filePath: that.data.filePaths[that.data.uploadIndex],
      name: 'file',
      formData: {
        ssoToken: getApp().ssoToken,
        type: type
      },
      success(res) {
        that.setData({
          uploadIndex: that.data.uploadIndex + 1
        });
        if (that.data.uploadIndex == that.data.uploadCount) {
          if (type == 2) {
            let data = JSON.parse(res.data);
            var imgs = data.data ? data.data.split(',') : [];
            that.setData({
              images: imgs
            })
            wx.hideLoading({
              complete: () => {
                wx.showToast({
                  title: '图片上传完成',
                  duration: 3000,
                });
              },
            })
          } else {
            let data = JSON.parse(res.data);
            var imgs = data.data ? data.data.split(',') : [];
            that.setData({
              verticalImages: imgs
            })
            wx.hideLoading({
              complete: () => {
                wx.showToast({
                  title: '图片上传完成',
                  duration: 3000,
                });
              },
            })
          }
        } else {
          that.uploadImg2();
        }
      }
    })
  },
  uploadVideo: function (e) {
    let that = this;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success(res) {
        if (res.size > 50000000) {
          wx.showToast({
            icon: "none",
            title: '视频大小不得超过50m',
            duration: 3000
          })
          return;
        }
        let type = that.data.upImgType == 0 ? 1 : 3;
        let formdata = {};
        formdata.ssoToken = app.ssoToken;
        formdata.type = type;
        wx.uploadFile({
          url: app.url + "cloudShop/uploadFile",
          filePath: res.tempFilePath,
          name: 'file',
          formData: formdata,
          success(res) {
            let data = JSON.parse(res.data);
            if (data.code == 200) {
              if (type == 1) {
                that.setData({
                  video: data.data
                })
              } else {
                that.setData({
                  verticalVideo: data.data
                })
              }
              wx.hideLoading({
                complete: () => {
                  wx.showToast({
                    title: '视频上传成功',
                    duration: 3000,
                  });
                },
              })
            } else {
              wx.hideLoading({
                complete: () => {
                  wx.showToast({
                    title: data.msg,
                    duration: 3000,
                  });
                },
              })
            }
          },
          fail(res) {
            wx.showToast({
              icon: 'none',
              title: res.errMsg
            });
          }
        });
      },
      fail: function (res) { }
    });
  },

  /**
   * 显示上传
   */
  showUpload: function () {
    this.setData({
      showUpload: true
    });
  },
  cloaseUpload: function () {
    this.setData({
      showUpload: false
    });
  },
  deleteImage: function (e) {
    let that = this;
    wx.showModal({
      title: '删除图片',
      content: '确定要删除所选图片吗？',
      success(res) {
        if (res.confirm) {
          httphelper.api("cloudShop/delImage", {
            imageUrl: e.currentTarget.dataset.url
          }, function (server_data) {
            that.data.imageUrls.splice(e.currentTarget.dataset.index, 1);
            var temp = that.data.imageUrls;
            that.setData({
              imageUrls: temp
            })
          })
        }
      }
    })
  },
  /**
   * 上传图片 640*1080 500kb
   */
  selectImage: function () {
    let that = this;
    wx.chooseImage({
      count: 6 - that.data.imageUrls.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        console.log(res);
        for (var i = 0; i < res.tempFiles.length; i++) {
          if (res.tempFiles[i].size > 500000) {
            wx.showToast({
              title: '每张图片大小不得超过500kb',
              duration: 3000
            })
            return;
          }
        }
        wx.showLoading({
          title: '图片上传中',
        })
        that.setData({
          uploadCount: res.tempFilePaths.length,
          filePaths: res.tempFilePaths,
          uploadIndex: 0
        })
        that.uploadImg();
      }
    })
  },
  uploadImg: function () {
    let that = this;
    wx.uploadFile({
      url: getApp().url + "cloudShop/uploadFile",
      filePath: that.data.filePaths[that.data.uploadIndex],
      name: 'file',
      formData: {
        ssoToken: getApp().ssoToken
      },
      success(res) {
        that.setData({
          uploadIndex: that.data.uploadIndex + 1
        });
        if (that.data.uploadIndex == that.data.uploadCount) {
          let data = JSON.parse(res.data);
          var imgs = data.data ? data.data.split(',') : [];
          that.setData({
            imageUrls: imgs
          })
          wx.hideLoading({
            complete: () => {
              wx.showToast({
                title: '图片上传完成',
                duration: 3000,
              });
            },
          })
        } else {
          that.uploadImg();
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().isShare = 0;
    let that = this;
    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.refreshData();
        that.onGetAddress();
      }
    } else {
      this.refreshData();
      this.onGetAddress();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.beFirstIn) {
      this.setData({
        beFirstIn: false
      })
    } else {
      this.onGetAddress();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: common.makeShareText(12),
      path: '/packageMyself/pages/myself/cloudStore/cloudStore?&scene=' + getApp().userId,
    }
  },
  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: common.makeShareText(12),
      query: 'userId=' + app.userId,
      path: '/packageMyself/pages/myself/cloudStore/cloudStore'
    }
  }
})