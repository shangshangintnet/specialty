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
    uploadType: [{
        value: 1,
        name: '我要雕刻'
      },
      {
        value: 2,
        name: '我要抛光'
      },
      {
        value: 3,
        name: '我要镶嵌'
      }
    ],
    requireType: null, //订制类型
    storeList: [],
    storeName: null,
    user: null,
    stone: {
      uploadType: 1, //原料、解料一起传
    },
    imageUrls: [],
    imageUrls2: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    let userId = "stone.userId";
    let mobile = "stone.mobile";
    this.setData({
      bar_Height: app.bar_Height,
      user: app.user,
      [userId]: app.user.id,
      [mobile]: app.user.mobile,
    })
  },
  getStore() {
    httphelper.api("carve/getStore", {
      ability: this.data.requireType
    }, function (serverdata) {
      if (serverdata.code == 200) {
        that.setData({
          storeList: serverdata.data
        })
      }
    });
  },
  changeRequireType: function (e) {
    this.setData({
      requireType: this.data.uploadType[e.detail.value].value,
    })
    this.getStore();
  },
  changename(e) {
    let key = "stone.name"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeDemand(e) {
    let key = "stone.demand"
    this.setData({
      [key]: e.detail.value
    })
  },
  changePrice(e) {
    let key = "stone.budgetPrice"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeStore(e) {
    let key = "stone.storeId"
    this.setData({
      [key]: this.data.storeList[e.detail.value].id,
      storeName: this.data.storeList[e.detail.value].name
    })
  },
  confirm: function () {
    if (this.data.active == 0) {
      if (this.checkBasic()) {
        if (this.data.requireType == 1) {
          //雕刻
          httphelper.api("carve/addCarve", that.data.stone, function (serverdata) {
            if (serverdata.code == 200) {
              that.setData({
                stone: serverdata.data,
                active: 1
              })
            }
          });
        } else if (this.data.requireType == 2) {
          //抛光
          httphelper.api("carve/addPolish", that.data.stone, function (serverdata) {
            if (serverdata.code == 200) {
              that.setData({
                stone: serverdata.data,
                active: 1
              })
            }
          });
        } else {
          //镶嵌
          httphelper.api("carve/addInlay", that.data.stone, function (serverdata) {
            if (serverdata.code == 200) {
              that.setData({
                stone: serverdata.data,
                active: 1
              })
            }
          });
        }
      }
    } else {
      common.goBackAfterMsg('发布成功');
    }
  },
  checkBasic: function () {
    if (this.data.requireType == null) {
      wx.showToast({
        icon: 'none',
        title: '请选择订制类型'
      })
      return false;
    }
    if (that.data.stone.name == null || that.data.stone.name == "") {
      wx.showToast({
        icon: 'none',
        title: '请填写订制主题'
      })
      return false;
    }
    return true;
  },
  /* 图集信息 */
  selectImage: function () {
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
          if (that.data.requireType == 1) {
            let data = {};
            data.id = that.data.stone.id;
            data.imageUrl = that.data.imageUrls[e.currentTarget.dataset.index];
            data.type = 7;
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
          } else if (that.data.requireType == 2) {
            let data = {};
            data.id = that.data.stone.id;
            data.imageUrl = that.data.imageUrls[e.currentTarget.dataset.index];
            data.type = 6;
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
          } else {
            let data = {};
            data.id = that.data.stone.id;
            data.imageUrl = that.data.imageUrls[e.currentTarget.dataset.index];
            data.type = 5;
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
      }
    })
  },
  uploadImgList: function () {
    let formdata = {};
    formdata.ssoToken = app.ssoToken;
    formdata.id = this.data.stone.id;
    if (this.data.requireType == 1) {
      formdata.type = 7;
    } else if (this.data.requireType == 2) {
      formdata.type = 6;
    } else {
      formdata.type = 5;
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
          if (that.data.requireType == 1) {
            let images = "stone.images";
            that.setData({
              imageUrls: data.data.split(','),
              [images]: data.data
            })
          } else if (that.data.requireType == 2) {
            let images = "stone.images";
            that.setData({
              imageUrls: data.data.split(','),
              [images]: data.data
            })
          } else {
            let images = "stone.images";
            that.setData({
              imageUrls: data.data.split(','),
              [images]: data.data
            })
          }
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

  /* 参考图信息 */
  selectImage2: function () {
    wx.chooseImage({
      count: 1,
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
          referencefile: res.tempFilePaths[0],
        })
        wx.showLoading({
          title: '图片上传中',
        });
        that.uploadImgList2();
      },
      fail: function (res) {}
    })
  },
  previewImage2(e) {
    wx.previewImage({
      current: this.data.imageUrls2[0], // 当前显示图片的http链接
      urls: this.data.imageUrls2 // 需要预览的图片http链接列表
    })
  },
  deleteImage2: function (e) {
    wx.showModal({
      title: '删除图片',
      content: '确定要删除所选图片吗？',
      success(res) {
        if (res.confirm) {
          if (that.data.requireType == 1) {
            let data = {};
            data.id = that.data.stone.id;
            data.imageUrl = that.data.stone.consultUrl;
            data.type = 3;
            httphelper.api('carve/delImage', data, (serverData) => {
              if (serverData.code == 200) {
                let images = "stone.consultUrl";
                that.setData({
                  imageUrls2: [],
                  [images]: null
                })
              }
            });
          } else if (that.data.requireType == 3) {
            let data = {};
            data.id = that.data.stone.id;
            data.imageUrl = that.data.stone.consultUrl;
            data.type = 4;
            httphelper.api('carve/delImage', data, (serverData) => {
              if (serverData.code == 200) {
                let images = "stone.consultUrl";
                that.setData({
                  imageUrls2: [],
                  [images]: null
                })
              }
            });
          }
        }
      }
    })
  },
  uploadImgList2: function () {
    let formdata = {};
    formdata.ssoToken = app.ssoToken;
    formdata.id = this.data.stone.id;
    if (this.data.requireType == 1) {
      formdata.type = 3;
    } else if (this.data.requireType == 3) {
      formdata.type = 4;
    }
    wx.uploadFile({
      url: app.url + "carve/uploadFile",
      filePath: this.data.referencefile,
      name: 'image_1',
      formData: formdata,
      success(res) {
        let data = JSON.parse(res.data);
        if (that.data.requireType == 1) {
          let images = "stone.consultUrl";
          that.setData({
            imageUrls2: data.data.split(','),
            [images]: data.data
          })
        } else if (that.data.requireType == 3) {
          let images = "stone.consultUrl";
          that.setData({
            imageUrls2: data.data.split(','),
            [images]: data.data
          })
        }
        wx.hideLoading({
          complete: () => {
            wx.showToast({
              title: '参考图上传成功',
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
})