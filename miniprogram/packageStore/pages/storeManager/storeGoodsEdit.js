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
    edit: false,
    change: false,
    active: 0,
    goods: {},
    infoLen: 0,
    videoFilePath: null,
    imageUrls: [],
    oriStock: 0,
    changeImg: false,
    changeVideo: false,
    identify: 0,//0:无鉴定 1:可鉴定
    cropShow: false,
    imgType: 0,
    width: 250,
    height: 250,
    src: "",
  },
  onLoad: function (options) {
    that = this;
    this.setData({
      bar_Height: app.bar_Height * 2
    })
    console.log(app.editStoreGood);
    if (app.editStoreGood != null) {
      this.setData({
        goods: app.editStoreGood,
        change:app.editStoreGood.followStatus,
        oriStock: app.editStoreGood.stock,
        infoLen: app.editStoreGood.introduce.length,
        videoFilePath: app.editStoreGood.videoUrl,
        edit: true,
        identify: app.editStoreGood.identify
      })
      this.getImglistData();
      app.editStoreGood = null;
    }else{
      httphelper.api('store/findChangeStore', {ssoToken: app.ssoToken}, (serverData) => {
        if (serverData.code == 200) {
          console.log(serverData.data);
          this.setData({
            change:serverData.data,
            goods:{stock:1},
          })
        }
      });
    }
  },
  tagTo: function (e) {
    if (this.data.edit)
      this.setData({
        active: parseInt(e.currentTarget.dataset.index)
      })
  },
  problemInfo: function (e) {
    let key = "goods.introduce"
    this.setData({
      [key]: e.detail.value,
      infoLen: e.detail.value.length
    })
  },
  changeName(e) {
    let key = "goods.name"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeGoodno(e) {
    let key = "goods.goodsNo"
    this.setData({
      [key]: e.detail.value
    })
  },
  changePrice(e) {
    let value = e.detail.value.replace(/[^\d\.]|^\./g, '').replace(/\.{2}/g, '.').replace(/^([1-9]\d*|0)(\.\d{1,2})(\.|\d{1})?$/, '$1$2').replace(/^0\d{1}/g, '0');
    let key = "goods.price"
    let cost = "goods.costPrice"
    this.setData({
      [key]: value,
      [cost]: value
    })
  },
  changeCostPrice(e) {
    let value = e.detail.value.replace(/[^\d\.]|^\./g, '').replace(/\.{2}/g, '.').replace(/^([1-9]\d*|0)(\.\d{1,2})(\.|\d{1})?$/, '$1$2').replace(/^0\d{1}/g, '0');
    let key = "goods.costPrice"
    this.setData({
      [key]: value
    })
  },
  changeStock(e) {
    let key = "goods.stock"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeIdentify() {
    this.setData({
      identify: this.data.identify == 0 ? 1 : 0
    })
  },
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
        that.setData({
          videoFilePath: res.tempFilePath,
          changeVideo: true,
        })
      },
      fail: function (res) {
      }
    });
  },
  confirm: function () {
    if (this.data.edit) {
      if (this.data.active == 0) {
        if (this.checkBasic()) {
          wx.showLoading({
            title: '信息提交中',
            mask: true
          });
          if (that.data.changeVideo) {
            that.setData({
              changeVideo: false
            })
            that.uploadVideoFile(() => {
              that.updateGoodsInfo();
            })
          } else {
            that.updateGoodsInfo();
          }
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
          wx.showLoading({
            title: '信息提交中',
            mask: true
          });
          wx.uploadFile({
            url: app.url + "store/addGoods",
            filePath: that.data.goods.listImageUrl,
            name: 'uploadImageUrl',
            formData: {
              ssoToken: app.ssoToken,
              name: this.data.goods.name,
              price: this.data.goods.price,
              costPrice:this.data.goods.costPrice,
              stock: this.data.goods.stock,
              introduce: this.data.goods.introduce,
              identify: this.data.identify
            },
            success(res) {
              let serverdata = JSON.parse(res.data);
              if (serverdata.code == 200) {
                that.setData({
                  goods: serverdata.data
                })
                that.uploadVideoFile();
              } else {
                wx.hideLoading({
                  complete: () => {
                    wx.showToast({
                      icon: 'none',
                      title: serverdata.msg
                    });
                  },
                });
              }
            },
            fail(res) {
              wx.hideLoading({
                complete: () => {
                  wx.showToast({
                    icon: 'none',
                    title: res.errMsg
                  });
                },
              });
            }
          });
        }
      } else {
        common.goBackAfterMsg('添加商品成功');
      }
    }
  },
  checkBasic: function () {
    if (that.data.goods.name == null ||
      that.data.goods.price == null ||
      that.data.goods.stock == null ||
      that.data.goods.introduce == null ||
      that.data.goods.listImageUrl == null ||
      that.data.videoFilePath == null) {
      wx.showToast({
        icon: 'none',
        title: '请将信息填写完整'
      })
      return false;
    }
    return true;
  },
  /* 视频单独上传 */
  uploadVideoFile: function (callback = null) {
    wx.uploadFile({
      url: app.url + "store/updateGoodsVideo",
      filePath: this.data.videoFilePath,
      name: 'uploadVideoUrl',
      formData: {
        ssoToken: app.ssoToken,
        id: this.data.goods.id,
      },
      success(res) {
        let key = "goods.videoUrl";
        that.setData({
          [key]: JSON.parse(res.data).data
        })
        if (that.data.edit) {
          if (callback != null)
            callback();
        } else {
          that.setData({
            active: 1
          })
          wx.hideLoading({
            complete: () => {
              wx.showToast({
                icon: 'none',
                title: '基本信息提交成功'
              });
            },
          });
        }
      },
      fail(res) {
        wx.hideLoading({
          complete: () => {
            wx.showToast({
              icon: 'none',
              title: res.errMsg
            });
          },
        });
      }
    });
  },
  /* 修改商品基本信息 */
  updateGoodsInfo: function () {
    let files = [];
    if (this.data.changeImg) {
      this.setData({
        changeImg: false,
      })
      wx.uploadFile({
        url: app.url + "store/updateGoods",
        filePath: that.data.goods.listImageUrl,
        name: 'uploadImageUrl',
        formData: {
          ssoToken: app.ssoToken,
          id: that.data.goods.id,
          name: that.data.goods.name,
          price: that.data.goods.price,
          costPrice:that.data.goods.costPrice,
          stock: that.data.goods.stock,
          oldStock: that.data.oriStock,
          introduce: that.data.goods.introduce,
          videoUrl: that.data.goods.videoUrl,
          listImageUrl: that.data.goods.listImageUrl,
          identify: that.data.identify
        },
        success(res) {
          that.setData({
            oriStock: that.data.goods.stock
          })
          wx.hideLoading({
            complete: () => {
              wx.showToast({
                icon: 'none',
                title: '基本信息修改成功'
              });
            },
          });
        },
        fail(res) {
          wx.hideLoading({
            complete: () => {
              wx.showToast({
                icon: 'none',
                title: res.errMsg
              });
            },
          });
        }
      });
    } else {
      httphelper.api('store/updateGoods', {
        ssoToken: app.ssoToken,
        id: that.data.goods.id,
        name: that.data.goods.name,
        price: that.data.goods.price,
        costPrice:that.data.goods.costPrice,
        stock: that.data.goods.stock,
        oldStock: that.data.oriStock,
        introduce: that.data.goods.introduce,
        videoUrl: that.data.goods.videoUrl,
        listImageUrl: that.data.goods.listImageUrl,
        identify: that.data.identify
      }, (serverData) => {
        if (serverData.code == 200) {
          that.setData({
            oriStock: that.data.goods.stock
          })
          wx.hideLoading({
            complete: () => {
              wx.showToast({
                icon: 'none',
                title: '基本信息修改成功'
              });
            },
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: serverData.msg
          });
        }
      });
    }
  },
  /* 图集信息 */
  getImglistData: function () {
    let data = {};
    data.id = this.data.goods.imageId;
    httphelper.api('store/findStoreGoodsImage', data, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          imageUrls: serverData.data
        })
      }
    });
  },
  selectImage: function () {
    let that = this;
    wx.chooseImage({
      count: 8 - that.data.imageUrls.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        for (var i = 0; i < res.tempFiles.length; i++) {
          if (res.tempFiles[i].size > 1200000) {
            wx.showToast({
              icon: "none",
              title: '图片大小不得超过1M',
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
      fail: function (res) {
      }
    })
  },
  deleteImage: function (e) {
    wx.showModal({
      title: '删除图片',
      content: '确定要删除所选图片吗？',
      success(res) {
        if (res.confirm) {
          let data = {};
          data.id = that.data.goods.imageId;
          data.imageUrl = that.data.imageUrls[e.currentTarget.dataset.index];
          httphelper.api('store/delGoodsImage', data, (serverData) => {
            if (serverData.code == 200) {
              that.data.imageUrls.splice(e.currentTarget.dataset.index, 1);
              let temp = that.data.imageUrls;
              that.setData({
                imageUrls: temp
              })
            }
          });
        }
      }
    })
  },
  uploadImg: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        if (res.tempFiles[0].size > 1200000) {
          wx.showToast({
            icon: "none",
            title: '图片大小不得超过1M',
            duration: 3000
          })
          return;
        }
        wx.showLoading({
          title: '图片加载中',
        })
        let key = "goods.listImageUrl";
        that.setData({
          changeImg: true,
          cropShow: true,
          imgType: 0,
          [key]: res.tempFilePaths[0],
          src: res.tempFilePaths[0]
        })
      },
      fail: function (res) {
      }
    })
  },
  uploadImgList: function () {
    wx.uploadFile({
      url: app.url + "store/updateGoodsImage",
      filePath: that.data.filePaths[that.data.uploadIndex],
      name: 'image_1',
      formData: {
        ssoToken: app.ssoToken,
        id: this.data.goods.imageId
      },
      success(res) {
        that.setData({
          uploadIndex: that.data.uploadIndex + 1
        });
        if (that.data.uploadIndex == that.data.uploadCount) {
          that.setData({
            imageUrls: JSON.parse(res.data).data
          })
          console.log(that.data.imageUrls);
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
  // uploadImgList: function () {
  //   wx.showLoading({
  //     title: '图片加载中',
  //   });
  //   that.setData({
  //     cropShow: true,
  //     imgType: 1,
  //     src: that.data.filePaths[that.data.uploadIndex]
  //   })
  // },
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
    if (this.data.imgType == 0) {
      let key = "goods.listImageUrl";
      this.setData({
        cropShow: false,
        [key]: e.detail.url
      })
    } else {
      this.setData({
        cropShow: false
      })
      wx.showLoading({
        title: '图片上传中',
      });
      wx.uploadFile({
        url: app.url + "store/updateGoodsImage",
        filePath: e.detail.url,
        name: 'image_1',
        formData: {
          ssoToken: app.ssoToken,
          id: this.data.goods.imageId
        },
        success(res) {
          that.setData({
            uploadIndex: that.data.uploadIndex + 1
          });
          if (that.data.uploadIndex == that.data.uploadCount) {
            that.setData({
              cropShow: false,
              imageUrls: JSON.parse(res.data).data
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
            that.uploadImgList();
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
    }
  },
})