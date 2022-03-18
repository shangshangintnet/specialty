const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    bar_Height: 0,
    edit: false,
    beUser: false, //普通用户或店主(雕刻师)
    user: null,
    stone: {
      type: 0,
      payStatus: 0,
      uploadType: 0,
    },
    storeList: [],
    typeItems: [{
        value: 0,
        name: '原料'
      },
      {
        value: 1,
        name: '废料'
      }
    ],
    payType: [{
        value: 0,
        name: '未支付'
      },
      {
        value: 1,
        name: '已支付'
      }
    ],
    imageUrls: [],
    staffPrice: {},
    order: {},
    uploadType: [{
        value: 0,
        name: '仅原料'
      },
      {
        value: 1,
        name: '原料和解料'
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    let edit = options.edit != null;
    this.setData({
      bar_Height: app.bar_Height,
      edit: edit,
      user: app.user,
      beUser: app.user.carveType != 1,
      storeList: app.carveStoreList
    })
    if (edit) {
      let price = {};
      price.name = app.carveMap[app.curStone.storeId].staff[0].name;
      price.value = (app.curStone.price * 0.35).toFixed(2);
      this.setData({
        stone: app.curStone,
        imageUrls: app.curStone.images ? app.curStone.images.split(',') : [],
        staffPrice: price
      })
    } else {
      if (!this.data.beUser) {
        if (options.type) {
          //店主或雕刻师 上传废料
          let userId = "stone.userId";
          let mobile = "stone.mobile";
          let type = "stone.type";
          this.setData({
            [userId]: app.user.id,
            [mobile]: app.user.mobile,
            [type]: 1
          })
        } else {
          //店主或雕刻师 帮助 用户上传原料
          let mobile = "stone.mobile";
          let userName = "stone.userName";
          this.setData({
            [mobile]: wx.getStorageSync('stone_mobile'),
            [userName]: wx.getStorageSync('stone_userName')
          })
        }
      } else {
        //用户自己上传原料
        let userId = "stone.userId";
        let mobile = "stone.mobile";
        this.setData({
          [userId]: app.user.id,
          [mobile]: app.user.mobile
        })
      }
      let key = "stone.storeId"
      let key2 = "stone.storeName"
      this.setData({
        [key]: this.data.storeList[0].id,
        [key2]: this.data.storeList[0].name
      })
    }
  },
  tagTo: function (e) {
    if (this.data.edit) {
      this.setData({
        active: parseInt(e.currentTarget.dataset.index)
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '请继续完善信息',
      })
    }
  },
  changename(e) {
    let key = "stone.name"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeStore: function (e) {
    let key = "stone.storeId"
    let key2 = "stone.storeName"
    this.setData({
      [key]: this.data.storeList[e.detail.value].id,
      [key2]: this.data.storeList[e.detail.value].name
    })
  },
  changeweight(e) {
    let key = "stone.weight"
    this.setData({
      [key]: e.detail.value
    })
  },
  changecount(e) {
    let key = "stone.count"
    this.setData({
      [key]: e.detail.value
    })
  },
  changemobile(e) {
    let key = "stone.mobile"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeUserName(e) {
    let key = "stone.userName"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeprice(e) {
    let key = "stone.price"
    this.setData({
      [key]: e.detail.value
    })
  },
  changePayType(e) {
    let key = "stone.payStatus"
    this.setData({
      [key]: this.data.payType[e.detail.value].value
    })
  },
  changeUploadType(e) {
    let key = "stone.uploadType"
    this.setData({
      [key]: this.data.uploadType[e.detail.value].value
    })
  },
  confirm: function () {
    if (this.data.edit) {
      if (this.data.beUser && this.data.stone.payStatus == 0) {
        //支付
        httphelper.api("carve/createOrder", null, function (serverdata) {
          if (serverdata.code == 200) {
            that.setData({
              order: serverdata.data
            })
            that.selectComponent("#carve").open(serverdata.data);
          }
        });
        return;
      }
      if (this.data.active == 0) {
        if (this.checkBasic()) {
          let solutionId = "stone.solutionId";
          that.setData({
            [solutionId]: 0
          })
          httphelper.api("carve/updateMaterial", that.data.stone, function (serverdata) {
            if (serverdata.code == 200) {
              let price = {};
              price.name = app.carveMap[that.data.stone.storeId].staff[0].name;
              price.value = (that.data.stone.price * 0.35).toFixed(2);
              that.setData({
                staffPrice: price
              })
              wx.showToast({
                icon: 'none',
                title: '请求成功'
              });
            }
          });
        }
      } else {
        wx.showToast({
          icon: 'none',
          title: '图集信息提交成功'
        });
      }
    } else {
      if (this.data.active == 0) {
        if (this.checkBasic()) {
          httphelper.api("carve/addMaterial", that.data.stone, function (serverdata) {
            if (serverdata.code == 200) {
              that.setData({
                stone: serverdata.data,
                active: 1
              })
              wx.setStorage({
                data: that.data.stone.mobile,
                key: 'stone_mobile',
              })
              wx.setStorage({
                data: that.data.stone.userName,
                key: 'stone_userName',
              })
            }
          });
        }
      } else {
        common.goBackAfterMsg('原料添加成功');
      }
    }
  },
  payOrder(e) {
    common.carvePay(this.data.order.id, (res) => {
      if (res) {
        that.selectComponent("#carve").close_order();
        let key = "stone.payStatus";
        that.setData({
          [key]: 1
        })
      }
    })
  },
  checkBasic: function () {
    if (that.data.stone.name == null || that.data.stone.name == "" ||
      that.data.stone.storeId == null
    ) {
      wx.showToast({
        icon: 'none',
        title: '请将信息填写完整'
      })
      return false;
    }
    if ((that.data.user.storeId != null || that.data.user.carvingId != null) &&
      (that.data.stone.mobile == null || that.data.stone.mobile == "" ||
        that.data.stone.price == null || (that.data.stone.price == "" && that.data.stone.price != 0))) {
      wx.showToast({
        icon: 'none',
        title: '请将信息填写完整'
      })
      return false;
    }
    return true;
  },
  /* 图集信息 */
  selectImage: function () {
    if (this.data.edit && this.data.beUser)
      return;
    let that = this;
    wx.chooseImage({
      count: 3 - that.data.imageUrls.length,
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
          uploadIndex: 0
        })
        wx.showLoading({
          title: '图片上传中',
        });
        that.uploadImgList();
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
    if (this.data.edit && this.data.beUser)
      return;
    wx.showModal({
      title: '删除图片',
      content: '确定要删除所选图片吗？',
      success(res) {
        if (res.confirm) {
          let data = {};
          data.id = that.data.stone.id;
          data.imageUrl = that.data.imageUrls[e.currentTarget.dataset.index];
          data.type = 0;
          httphelper.api('carve/delImage', data, (serverData) => {
            if (serverData.code == 200) {
              that.data.imageUrls.splice(e.currentTarget.dataset.index, 1);
              let temp = that.data.imageUrls;
              let images = "stone.images";
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
    formdata.id = this.data.stone.id;
    if (this.data.stone.solutionId == null) {
      formdata.type = 0;
    } else {
      formdata.type = 2;
      formdata.solutionId = this.data.stone.solutionId;
    }
    wx.uploadFile({
      url: app.url + "carve/uploadFile",
      filePath: that.data.filePaths[that.data.uploadIndex],
      name: 'image_1',
      formData: formdata,
      success(res) {
        that.setData({
          uploadIndex: that.data.uploadIndex + 1
        });
        if (that.data.uploadIndex == that.data.uploadCount) {
          let data = JSON.parse(res.data);
          if (data.code == 200) {
            var imgs = data.data.split(',');
            let images = "stone.images";
            that.setData({
              imageUrls: imgs,
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
            wx.showToast({
              icon: "none",
              title: data.msg,
            })
          }
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
})