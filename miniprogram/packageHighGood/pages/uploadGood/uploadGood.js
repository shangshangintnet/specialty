const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    edit: false,
    active: 0,
    bar_Height: 0,
    user: {},
    adviser: {
    },
    owner: {},
    good: {
      status: 0
    },
    goodType: [{
        value: 0,
        name: '天然宝石'
      },
      {
        value: 1,
        name: '天然玉石'
      },
      {
        value: 2,
        name: '生物宝石'
      }
    ],
    status: [{
        value: 0,
        name: '上架'
      },
      {
        value: 1,
        name: '已售'
      },
      {
        value: 2,
        name: '下架'
      }
    ],
    imageUrls: [],
    cropShow: false,
    imgType: false,
    width: 250,
    height: 250,
    src: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    if (options.edit) {
      this.setData({
        edit: true,
        bar_Height: app.bar_Height,
        good: app.curHighGood,
        imageUrls: app.curHighGood.imageUrl
      })
      if (app.curHighGood.mobile) {
        that.findUser(app.curHighGood.mobile, 0, 1)
      }
    } else {
      this.setData({
        edit: false,
        bar_Height: app.bar_Height,
      })
    }
  },
  tagTo(e) {
    if (that.data.edit) {
      that.setData({
        active: e.currentTarget.dataset.index
      })
    }
  },
  changeGoodType(e) {
    that.setData({
      ["good.type"]: that.data.goodType[e.detail.value].value
    })
  },
  changeStatus(e) {
    that.setData({
      ["good.status"]: that.data.status[e.detail.value].value
    })
  },
  changeGoodsName(e) {
    that.setData({
      ["good.goodsName"]: e.detail.value
    })
  },
  changeContent(e) {
    that.setData({
      ["good.content"]: e.detail.value
    })
  },
  changequotePrice(e) {
    that.setData({
      ["good.quotePrice"]: e.detail.value
    })
  },
  changeexpectedPrice(e) {
    that.setData({
      ["good.expectedPrice"]: e.detail.value
    })
  },
  changecostPrice(e) {
    that.setData({
      ["good.costPrice"]: e.detail.value
    })
  },
  changefinalPrice(e) {
    that.setData({
      ["good.finalPrice"]: e.detail.value
    })
  },
  changeprice(e) {
    that.setData({
      ["good.price"]: e.detail.value
    })
  },
  changeAddress(e) {
    that.setData({
      ["good.address"]: e.detail.value
    })
  },
  switchChange(e) {
    that.setData({
      imgType: !that.data.imgType
    })
  },
  /** 销售顾问 ***/
  changeAdMobile(e) {
    that.setData({
      ["adviser.mobile"]: e.detail.value
    })
    if (e.detail.value.length == 11)
      this.findUser(e.detail.value, 0, 0);
  },
  changeOwnerMobile(e) {
    that.setData({
      ["owner.mobile"]: e.detail.value
    })
    if (e.detail.value.length == 11)
      this.findUser(e.detail.value, 0, 1);
  },
  changeUserMobile(e) {
    that.setData({
      ["user.mobile"]: e.detail.value
    })
    if (e.detail.value.length == 11)
      this.findUser(e.detail.value, 0, 2);
  },
  findUser(mobile, type, userIdx) {
    let data = {};
    data.mobile = mobile;
    data.type = type;
    if (userIdx == 1) {
      data.address = 1;
    }
    httphelper.api("high/findUserByMoblie", data, (serverdata) => {
      if (serverdata.data == null) {
        wx.showModal({
          title: '暂无用户',
          content: '是否添加手机号码为' + mobile + '的用户',
          success: function (res) {
            if (res.confirm) {
              that.findUser(mobile, 1, userIdx);
            }
          }
        });
      } else {
        serverdata.data.mobile = mobile;
        if (userIdx == 0) {
          that.setData({
            adviser: serverdata.data,
            ["good.saleId"]: serverdata.data.id
          })
        } else if (userIdx == 1) {
          if (that.data.good.address) {
            that.setData({
              owner: serverdata.data,
              ["good.ownerId"]: serverdata.data.id,
              ["good.mobile"]: serverdata.data.mobile,
              ["good.name"]: serverdata.data.name ? serverdata.data.name : serverdata.data.nickName,
            })
          } else {
            that.setData({
              owner: serverdata.data,
              ["good.ownerId"]: serverdata.data.id,
              ["good.mobile"]: serverdata.data.mobile,
              ["good.name"]: serverdata.data.name ? serverdata.data.name : serverdata.data.nickName,
              ["good.address"]: serverdata.data.address
            })
          }
        } else {
          that.setData({
            user: serverdata.data,
            ["good.userId"]: serverdata.data.id
          })
        }
      }
    })
  },
  /* 图集信息 */
  selectImage: function () {
    wx.chooseImage({
      count: 9 - that.data.imageUrls.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        for (var i = 0; i < res.tempFiles.length; i++) {
          if (res.tempFiles[i].size > 500000) {
            wx.showToast({
              icon: "none",
              title: '图片大小不得超过500kb',
              duration: 3000
            })
            return;
          }
        }
        that.setData({
          uploadCount: res.tempFilePaths.length,
          filePaths: res.tempFilePaths,
          uploadIndex: 0,
        })
        if (that.data.imgType) {
          that.uploadImgListCrop();
        } else {
          wx.showLoading({
            title: '图片上传中',
          });
          that.uploadImgList();
        }
      },
      fail: function (res) {}
    })
  },
  previewImage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.item, // 当前显示图片的http链接
      urls: this.data.imageUrls // 需要预览的图片http链接列表
    })
  },
  deleteImage: function (e) {
    wx.showModal({
      title: '删除图片',
      content: '确定要删除所选图片吗？',
      success(res) {
        if (res.confirm) {
          let data = {};
          data.id = that.data.good.id;
          data.imageUrl = that.data.imageUrls[e.currentTarget.dataset.index];
          data.type = 0;
          httphelper.api('high/delImage', data, (serverData) => {
            if (serverData.code == 200) {
              that.data.imageUrls.splice(e.currentTarget.dataset.index, 1);
              let temp = that.data.imageUrls;
              let images = "good.images";
              that.setData({
                imageUrls: temp,
                [images]: temp.join()
              })
            }
          });
        }
      }
    })
  },
  uploadImgList: function () {
    let formdata = {};
    formdata.ssoToken = app.ssoToken;
    formdata.id = that.data.good.id;
    formdata.type = 0;
    wx.uploadFile({
      url: app.url + "high/uploadFile",
      filePath: that.data.filePaths[that.data.uploadIndex],
      name: 'image_1',
      formData: formdata,
      success(res) {
        that.setData({
          uploadIndex: that.data.uploadIndex + 1
        });
        if (that.data.uploadIndex == that.data.uploadCount) {
          let data = JSON.parse(res.data);
          let images = "good.images";
          that.setData({
            imageUrls: data.data.split(','),
            [images]: data.data
          })
          wx.hideLoading({
            complete: () => {
              wx.showToast({
                title: '图集上传成功',
                duration: 3000,
              });
            },
          })
        } else {
          that.uploadImgList();
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
  //截图上传
  uploadImgListCrop: function () {
    wx.showLoading({
      title: '图片加载中',
    });
    that.setData({
      cropShow: true,
      src: that.data.filePaths[that.data.uploadIndex]
    })
  },
  //截取图片
  cropperload(e) {
    console.log("cropper初始化完成");
  },
  loadimage(e) {
    wx.hideLoading(); //重置图片角度、缩放、位置
    this.selectComponent("#image-cropper").imgReset();
  },
  clickcut(e) {
    wx.previewImage({
      current: e.detail.url, // 当前显示图片的http链接
      urls: [e.detail.url] // 需要预览的图片http链接列表
    })
  },
  getImg(e) {
    this.setData({
      cropShow: false
    })
    wx.showLoading({
      title: '图片上传中',
    });
    let formdata = {};
    formdata.ssoToken = app.ssoToken;
    formdata.id = that.data.good.id;
    formdata.type = 0;
    wx.uploadFile({
      url: app.url + "high/uploadFile",
      filePath: e.detail.url,
      name: 'image_1',
      formData: formdata,
      success(res) {
        that.setData({
          uploadIndex: that.data.uploadIndex + 1
        });
        if (that.data.uploadIndex == that.data.uploadCount) {
          let data = JSON.parse(res.data);
          let images = "good.images";
          that.setData({
            imageUrls: data.data.split(','),
            [images]: data.data
          })
          wx.hideLoading({
            complete: () => {
              wx.showToast({
                title: '图集上传成功',
                duration: 3000,
              });
            },
          })
        } else {
          wx.hideLoading();
          that.uploadImgListCrop();
        }
      },
      fail(res) {
        wx.hideLoading({
          complete: () => {
            wx.showToast({
              icon: 'none',
              title: res.errMsg
            });
          }
        });
      }
    });
  },
  /* 视频 */
  uploadVideo() {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success(res) {
        if (res.size > 10000000) {
          wx.showToast({
            icon: "none",
            title: '视频大小不得超过10m',
            duration: 3000
          })
          return;
        }
        let formdata = {};
        formdata.ssoToken = app.ssoToken;
        formdata.id = that.data.good.id;
        formdata.type = 1;
        wx.uploadFile({
          url: app.url + "high/uploadFile",
          filePath: res.tempFilePath,
          name: 'image_1',
          formData: formdata,
          success(res) {
            let data = JSON.parse(res.data);
            let video = "good.video";
            that.setData({
              [video]: data.data
            })
            wx.hideLoading({
              complete: () => {
                wx.showToast({
                  title: '视频上传成功',
                  duration: 3000,
                });
              },
            })
          },
          fail(res) {
            wx.showToast({
              icon: 'none',
              title: res.errMsg
            });
          }
        });
      },
      fail: function (res) {}
    });
  },
  /* 提交 */
  confirm(e) {
    if (that.data.edit) {
      if (that.data.active == 0) {
        if (!that.data.good.userId)
          delete that.data.good.userId;
        if (!that.data.good.saleId)
          delete that.data.good.saleId;
        if (!that.data.good.price)
          delete that.data.good.price;
        if (!that.data.good.finalPrice)
          delete that.data.good.finalPrice;
        httphelper.api("high/updateHighGoods", that.data.good, (serverdata) => {
          if (serverdata.code == 200) {
            that.setData({
              good: serverdata.data
            })
            app.curHighGood = serverdata.data;
            wx.showToast({
              title: '修改成功',
            })
          }
        });
      } else {
        common.goBackAfterMsg('修改成功')
      }
    } else {
      if (that.data.active == 0) {
        if (that.checkBasic()) {
          httphelper.api("high/addHighGoods", that.data.good, (serverdata) => {
            if (serverdata.code == 200) {
              that.setData({
                good: serverdata.data,
                active: 1,
              })
              wx.showToast({
                title: '基本信息添加成功',
              })
            }
          });
        }
      } else {
        common.goBackAfterMsg('添加成功')
      }
    }
  },
  checkBasic: function () {
    if (that.data.good.type == null ||
      that.data.owner.mobile == null || that.data.user.mobile == "" ||
      that.data.good.status == null ||
      that.data.good.goodsName == null || that.data.good.goodsName == "" ||
      that.data.good.content == null || that.data.good.content == "" ||
      that.data.good.quotePrice == null || that.data.good.quotePrice == "" ||
      that.data.good.expectedPrice == null || that.data.good.expectedPrice == ""
    ) {
      wx.showToast({
        icon: 'none',
        title: '请填写完整信息'
      })
      return false;
    }
    return true;
  },
})