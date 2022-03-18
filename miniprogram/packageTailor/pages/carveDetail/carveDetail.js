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
    beUser: false, //需求方
    user: null,
    bar_Height: 0,
    addressData: [],
    addressIdx: 0,
    stone: {},
    status: [{
        value: 0,
        name: '待受理'
      },
      {
        value: 1,
        name: '商家受理中'
      },
      {
        value: 2,
        name: '待支付预付款'
      },
      {
        value: 3,
        name: '雕刻中'
      },
      {
        value: 4,
        name: '雕刻完成，待支付尾款'
      },
      {
        value: 5,
        name: '支付完成'
      },
      {
        value: 6,
        name: '交易完成'
      },
      {
        value: 7,
        name: '交易完成'
      }
    ],
    imageUrls: [],
    consultUrl: [],
    staffCheck: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    if (options.id) {
      this.setData({
        bar_Height: app.bar_Height,
        user: app.user,
      })
      this.getdata(options.id);
    } else {
      if (app.curStone.userAddress != null) {
        let userAddress = app.curStone.userAddress.split(',');
        app.curStone.userConcat = userAddress[0];
        app.curStone.userAdd = userAddress[1];
      }
      if (app.curStone.storeAddress != null) {
        let storeAddress = app.curStone.storeAddress.split(',');
        app.curStone.storeConcat = storeAddress[0];
        app.curStone.storeAdd = storeAddress[1];
      }
      let consultUrl = [];
      if (app.curStone.consultUrl != null)
        consultUrl.push(app.curStone.consultUrl);
      this.setData({
        bar_Height: app.bar_Height,
        stone: app.curStone,
        beUser: app.user.id == app.curStone.userId,
        user: app.user,
        imageUrls: app.curStone.imageUrl,
        consultUrl: consultUrl,
        view: options.view ? true : false,
        staffCheck: app.curStone.staffId != null,
      })
      this.getStore();
    }
  },
  onPullDownRefresh() {
    this.getdata(this.data.stone.id, false);
    wx.stopPullDownRefresh();
  },
  getdata(id, view = true) {
    httphelper.api("carve/findCarveById", {
      id: id,
      ability: 1
    }, function (serverdata) {
      if (serverdata.code == 200) {
        app.curStone = serverdata.data;
        if (app.curStone.userAddress != null) {
          let userAddress = app.curStone.userAddress.split(',');
          app.curStone.userConcat = userAddress[0];
          app.curStone.userAdd = userAddress[1];
        }
        if (app.curStone.storeAddress != null) {
          let storeAddress = app.curStone.storeAddress.split(',');
          app.curStone.storeConcat = storeAddress[0];
          app.curStone.storeAdd = storeAddress[1];
        }
        let consultUrl = [];
        if (app.curStone.consultUrl != null)
          consultUrl.push(app.curStone.consultUrl);
        that.setData({
          stone: app.curStone,
          beUser: app.user.id == app.curStone.userId,
          imageUrls: app.curStone.imageUrl,
          consultUrl: consultUrl,
          view: view
        })
        that.getStore();
      }
    });
  },
  getStore() {
    httphelper.api("carve/getStore", {
      ability: 1
    }, function (serverdata) {
      if (serverdata.code == 200) {
        that.setData({
          storeList: serverdata.data
        })
        if (that.data.stone.storeId) {
          serverdata.data.map((val) => {
            if (val.id == that.data.stone.storeId) {
              that.setData({
                storeName: val.name
              })
            }
          })
        }
      }
    });
  },
  tagTo: function (e) {
    this.setData({
      active: parseInt(e.currentTarget.dataset.index)
    })
  },
  changeDemand(e) {
    let key = "stone.demand"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeContent(e) {
    let key = "stone.content"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeBudgetPrice(e) {
    let key = "stone.budgetPrice"
    let value = e.detail.value.replace(/[^\d\.]|^\./g, '').replace(/\.{2}/g, '.').replace(/^([1-9]\d*|0)(\.\d{1,2})(\.|\d{1})?$/, '$1$2').replace(/^0\d{1}/g, '0');
    this.setData({
      [key]: value
    })
  },
  changePrice(e) {
    let key = "stone.price"
    let value = e.detail.value.replace(/[^\d\.]|^\./g, '').replace(/\.{2}/g, '.').replace(/^([1-9]\d*|0)(\.\d{1,2})(\.|\d{1})?$/, '$1$2').replace(/^0\d{1}/g, '0');
    this.setData({
      [key]: value
    })
  },
  changeCalcitePrice(e) {
    let key = "stone.calcitePrice"
    let value = e.detail.value.replace(/[^\d\.]|^\./g, '').replace(/\.{2}/g, '.').replace(/^([1-9]\d*|0)(\.\d{1,2})(\.|\d{1})?$/, '$1$2').replace(/^0\d{1}/g, '0');
    this.setData({
      [key]: value
    })
  },
  changeAdvancePrice(e) {
    let key = "stone.advancePrice"
    let value = e.detail.value.replace(/[^\d\.]|^\./g, '').replace(/\.{2}/g, '.').replace(/^([1-9]\d*|0)(\.\d{1,2})(\.|\d{1})?$/, '$1$2').replace(/^0\d{1}/g, '0');
    this.setData({
      [key]: value
    })
  },
  changeStatus: function (e) {
    if (this.data.stone.status == 1) {
      if (this.data.stone.price == 0) {
        wx.showToast({
          icon: "none",
          title: '请设置雕刻工费',
        })
        return;
      }
      wx.showModal({
        title: '等待支付预付款',
        content: '请确认已设置雕刻工费、解石费与预付款',
        success(res) {
          if (res.confirm) {
            let key = "stone.status"
            that.setData({
              [key]: 2,
            })
            that.confirm();
          }
        }
      })
    } else if (this.data.stone.status == 3) {
      if (this.data.stone.price == 0) {
        wx.showToast({
          icon: "none",
          title: '请设置雕刻工费',
        })
        return;
      }
      wx.showModal({
        title: '雕刻完成',
        content: '确定已完成雕刻工作，完成后不能再更改雕刻信息！！',
        success(res) {
          if (res.confirm) {
            let key = "stone.status"
            that.setData({
              [key]: 4,
            })
            that.confirm();
          }
        }
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '当前状态不可手动更改',
      })
    }
  },
  changeStore(e) {
    let key = "stone.storeId"
    this.setData({
      [key]: this.data.storeList[e.detail.value].id,
      storeName: this.data.storeList[e.detail.value].name
    })
  },
  switchChange(e) {
    this.setData({
      staffCheck: e.detail.value
    })
    if (e.detail.value) {
      wx.showToast({
        icon: "none",
        title: '邀请首席雕刻师雕刻',
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '邀请首席雕刻师雕刻',
      })
    }
  },
  /**
   * 选择地址
   */
  onGetAddress: function () {
    let that = this;
    httphelper.api("myInformation/addressManagement", null, function (server_data) {
      that.setData({
        addressData: server_data.data.addresses
      })
    })
  },
  selectAddress: function () {
    if (this.data.beUser) {
      if (this.data.addressData.length == 0) {
        wx.navigateTo({
          url: '/packageMyself/pages/myself/myaddress/createAddress/createAddress',
        })
      } else {
        this.setData({
          showAddress: true
        })
      }
    }
  },
  closeAddress: function () {
    this.setData({
      showAddress: false
    })
  },
  onConfirm: function (e) {
    if (Number(e.detail.index)) {
      if (this.data.addressData.length != 0) {
        let userAddress = "stone.userAdd";
        let userConcat = "stone.userConcat";
        let addressId = "stone.addressId";
        this.setData({
          addressIdx: e.detail.index,
          showAddress: false,
          [userConcat]: this.data.addressData[e.detail.index].realName + ' ' + this.data.addressData[e.detail.index].phoneNum,
          [userAddress]: this.data.addressData[e.detail.index].addressName,
          [addressId]: this.data.addressData[e.detail.index].id
        })
      } else {
        this.setData({
          addressIdx: e.detail.index,
          showAddress: false
        })
      }
    } else {
      if (this.data.addressData.length != 0) {
        let userAddress = "stone.userAdd";
        let userConcat = "stone.userConcat";
        let addressId = "stone.addressId";
        this.setData({
          addressIdx: 0,
          showAddress: false,
          [userConcat]: this.data.addressData[0].realName + ' ' + this.data.addressData[0].phoneNum,
          [userAddress]: this.data.addressData[0].addressName,
          [addressId]: this.data.addressData[0].id
        })
      } else {
        this.setData({
          addressIdx: 0,
          showAddress: false
        })
      }
    }
  },
  jumpTo(e) {
    common.jumpTo(e);
  },
  complete() {
    let status = "stone.status"
    this.setData({
      [status]: 6
    })
    this.confirm();
  },
  confirm() {
    if (this.data.stone.content == null)
      delete this.data.stone.content
    if (this.data.stone.demand == null)
      delete this.data.stone.demand
    if (this.data.stone.addressId == null)
      delete this.data.stone.addressId
    if (that.data.stone.storeId == null)
      delete that.data.stone.storeId;
    if (that.data.stone.logisticsNum == null)
      delete that.data.stone.logisticsNum;
    if (that.data.stone.storeLogisticsNum == null)
      delete that.data.stone.storeLogisticsNum;
    if (this.data.staffCheck) {
      let staffId = "stone.staffId";
      this.setData({
        [staffId]: app.carveMap[this.data.stone.storeId].staff[0].id
      })
    } else {
      delete that.data.stone.staffId;
    }
    httphelper.api("carve/updateCarve", that.data.stone, function (serverdata) {
      if (serverdata.code == 200) {
        if (serverdata.data.userAddress != null) {
          let userAddress = serverdata.data.userAddress.split(',');
          serverdata.data.userConcat = userAddress[0];
          serverdata.data.userAdd = userAddress[1];
        }
        if (serverdata.data.storeAddress != null) {
          let storeAddress = serverdata.data.storeAddress.split(',');
          serverdata.data.storeConcat = storeAddress[0];
          serverdata.data.storeAdd = storeAddress[1];
        }
        that.setData({
          stone: serverdata.data,
          view: false
        })
        wx.showToast({
          icon: "success",
          title: '提交成功',
        })
      }
    });
  },
  revoke(e) {
    if (this.data.stone.status == 0)
      return;
    wx.showModal({
      title: '撤销受理',
      content: '确定不接受当前商家的受理吗',
      success(res) {
        if (res.confirm) {
          if (that.data.stone.storeId == null)
            return;
          delete that.data.stone.staffId;
          delete that.data.stone.storeId;
          delete that.data.stone.logisticsNum;
          delete that.data.stone.storeLogisticsNum;
          if (that.data.stone.content == null)
            delete that.data.stone.content
          if (that.data.stone.demand == null)
            delete that.data.stone.demand
          if (that.data.stone.addressId == null)
            delete that.data.stone.addressId
          httphelper.api("carve/updateCarve", that.data.stone, function (serverdata) {
            if (serverdata.code == 200) {
              if (that.data.beUser) {
                if (serverdata.data.userAddress != null) {
                  let userAddress = serverdata.data.userAddress.split(',');
                  serverdata.data.userConcat = userAddress[0];
                  serverdata.data.userAdd = userAddress[1];
                }
                that.setData({
                  stone: serverdata.data,
                  staffCheck: false
                })
                wx.showToast({
                  icon: "none",
                  title: '受理已撤销，请等待其他商家接单',
                })
              } else {
                common.goBackAfterMsg("当前受理已成功撤销");
              }
            }
          });
        }
      }
    })
  },
  /**
   * 用户支付
   */
  pay: function (e) {
    httphelper.api("carve/createOrder", {
      type: 3
    }, function (data) {
      if (data.code == 200) {
        that.setData({
          order: data.data
        })
        that.selectComponent("#carve").open(data.data);
      }
    });
  },
  payOrder(e) {
    common.carvePay(this.data.order.id, (res) => {
      if (res) {
        that.selectComponent("#carve").close_order();
        this.getdata(this.data.stone.id, false);
      }
    })
  },
  /* 图集信息 */
  selectImage: function () {
    if (this.data.view)
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
    if (this.data.view)
      return;
    wx.showModal({
      title: '删除图片',
      content: '确定要删除所选图片吗？',
      success(res) {
        if (res.confirm) {
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
        }
      }
    })
  },
  uploadImgList: function () {
    let formdata = {};
    formdata.ssoToken = app.ssoToken;
    formdata.id = this.data.stone.id;
    formdata.type = 7;
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
    if (this.data.view)
      return;
    let that = this;
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
      current: this.data.consultUrl[0], // 当前显示图片的http链接
      urls: this.data.consultUrl // 需要预览的图片http链接列表
    })
  },
  deleteImage2: function (e) {
    if (this.data.view)
      return;
    wx.showModal({
      title: '删除图片',
      content: '确定要删除所选图片吗？',
      success(res) {
        if (res.confirm) {
          let data = {};
          data.id = that.data.stone.id;
          data.imageUrl = that.data.stone.consultUrl;
          data.type = 3;
          httphelper.api('carve/delImage', data, (serverData) => {
            if (serverData.code == 200) {
              let images = "stone.consultUrl";
              that.setData({
                consultUrl: [],
                [images]: null
              })
            }
          });
        }
      }
    })
  },
  uploadImgList2: function () {
    let formdata = {};
    formdata.ssoToken = app.ssoToken;
    formdata.id = this.data.stone.id;
    formdata.type = 3;
    wx.uploadFile({
      url: app.url + "carve/uploadFile",
      filePath: this.data.referencefile,
      name: 'image_1',
      formData: formdata,
      success(res) {
        let data = JSON.parse(res.data);
        let images = "stone.consultUrl";
        that.setData({
          consultUrl: data.data.split(','),
          [images]: data.data
        })
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
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.beUser)
      this.onGetAddress();
  },
  /**
   * 绑定物流
   */
  openLogistics(e) {
    that.selectComponent("#logistics").open();
  },
  bindLogdata(e) {
    if (this.data.beUser) {
      let logisticsNum = "stone.logisticsNum";
      let logisticsCode = "stone.logisticsCode";
      this.setData({
        [logisticsNum]: e.detail.logisticsNum,
        [logisticsCode]: e.detail.logisticsCode
      })
    } else {
      let storeLogisticsNum = "stone.storeLogisticsNum";
      let storeLogisticsCode = "stone.storeLogisticsCode"
      this.setData({
        [storeLogisticsNum]: e.detail.logisticsNum,
        [storeLogisticsCode]: e.detail.logisticsCode
      })
    }
    this.confirm();
  },
  viewUserLogistics(e) {
    if (this.data.stone.logisticsNum == null) {
      wx.showToast({
        icon: "none",
        title: '暂无用户快递信息，请联系用户获取详细信息',
      })
      return;
    }
    wx.navigateTo({
      url: '/pages/order/order_detail/express_detail/express_detail?type=0&id=' + this.data.stone.id,
    })
  },
  viewStoreLogistics(e) {
    if (this.data.stone.storeLogisticsNum == null) {
      wx.showToast({
        icon: "none",
        title: '暂无商户快递信息，请联系商户获取详细信息',
      })
      return;
    }
    wx.navigateTo({
      url: '/pages/order/order_detail/express_detail/express_detail?type=1&id=' + this.data.stone.id,
    })
  },
  /* 接收需求 */
  receive(e) {
    let storeId = "stone.storeId"
    this.setData({
      [storeId]: this.data.user.storeId
    })
    this.confirm();
  },

  /* 通讯 */
  gokefu(e) {
    if (this.data.beUser) {
      if (this.data.stone.storeId == null) {
        wx.showToast({
          icon: "none",
          title: '暂无受理店铺，请稍后~',
        })
        return;
      }
      let msg = {};
      msg.name = that.data.stone.name;
      if (that.data.stone.imageUrl && that.data.stone.imageUrl.length > 0)
        msg.image = that.data.stone.imageUrl[0];
      msg.path = "/packageTailor/pages/carveDetail/carveDetail?id=" + this.data.stone.id;
      let post = {};
      post.storeIds = that.data.stone.storeId;
      let imId = "store" + that.data.stone.storeId;
      common.findUserImInfo(post, (res) => {
        common.goKefu(imId, res[imId].name, res[imId].avatar, msg);
      })
    } else {
      let msg = {};
      msg.name = that.data.stone.name;
      if (that.data.stone.imageUrl && that.data.stone.imageUrl.length > 0)
        msg.image = that.data.stone.imageUrl[0];
      msg.path = "/packageTailor/pages/carveDetail/carveDetail?id=" + this.data.stone.id;
      httphelper.api("carve/queryUserChatInformation", {
        userId: this.data.stone.userId
      }, function (serverdata) {
        if (serverdata.code == 200) {
          if (serverdata.data.uuid == null) {
            common.goKefu(that.data.stone.userId, serverdata.data.name, serverdata.data.avatar, msg);
          } else {
            common.goKefu('store' + serverdata.data.uuid, serverdata.data.name, serverdata.data.avatar, msg);
          }
        }
      });
    }
  },
})