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
    userId: null,
    iconIdx: 0,
    info: {
      type: 1
    },
    iconList: {
      income: [],
      invest: [],
      pay: []
    },
    sltVisible: false,
    addVisible: false,
    editVisible: false,
    sltData: [],
    iconData: null,
    curIcon: null,
    sltIconIdx: 0,
    addIconIdx: 0,
    longtap: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    let iconList = app.recordEntry;
    if (options.edit) {
      let iconIdx = 0;
      if (app.editRecord.type == 0) {
        for (let i = 0; i < iconList.income.length; i++) {
          if (iconList.income[i].id == app.editRecord.entryId) {
            iconIdx = i;
            break;
          }
        }
      } else if (app.editRecord.type == 1) {
        for (let i = 0; i < iconList.pay.length; i++) {
          if (iconList.pay[i].id == app.editRecord.entryId) {
            iconIdx = i;
            break;
          }
        }
      } else {
        for (let i = 0; i < iconList.invest.length; i++) {
          if (iconList.invest[i].id == app.editRecord.entryId) {
            iconIdx = i;
            break;
          }
        }
      }
      this.setData({
        bar_Height: app.bar_Height,
        edit: true,
        info: app.editRecord,
        iconList: iconList,
        iconIdx: iconIdx,
        userId: options.userId,
      })
    } else {
      this.setData({
        bar_Height: app.bar_Height,
        iconList: iconList,
        userId: options.userId,
      })
    }
    wx.hideShareMenu({
      success: (res) => {},
    })
  },
  changeType(e) {
    let type = "info.type"
    this.setData({
      [type]: e.currentTarget.dataset.index,
      iconIdx: 0
    })
  },
  changePrice(e) {
    let key = "info.price"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeContent(e) {
    let key = "info.content"
    this.setData({
      [key]: e.detail.value
    })
  },
  bindDateChange(e) {
    let key = "info.createTime"
    this.setData({
      [key]: e.detail.value,
    })
  },
  /* 选择分类 */
  selectItem(e) {
    let key = "info.entryId"
    that.setData({
      iconIdx: e.currentTarget.dataset.index,
      [key]: e.currentTarget.dataset.item.id,
    })
  },
  addItem(e) {
    this.setData({
      sltVisible: true,
      sltData: this.data.info.type == 0 ? app.entryData.income : (this.data.info.type == 1 ? app.entryData.pay : app.entryData.invest)
    })
  },
  /* 增加常用分类 */
  touchstart(e) {
    this.setData({
      longtap: false,
    })
  },
  longPressItem(e) {
    if (e.currentTarget.dataset.item.id <= 1000) {
      that.setData({
        longtap: true,
      })
      wx.showToast({
        title: '默认分类不可编辑',
        icon: "none"
      })
      return;
    }
    that.setData({
      longtap: true,
      editVisible: true,
      curEditItem: e.currentTarget.dataset.item,
      curEditIndex: e.currentTarget.dataset.index
    })
  },
  closeEdit(e) {
    that.setData({
      editVisible: false,
      curEditItem: null,
    })
  },
  editItem(e) {
    that.addItem2();
    let idx = 0;
    for (let i = 0; i < that.data.curIcon.length; i++) {
      if (that.data.curEditItem.icon == that.data.curIcon[i].icon) {
        idx = i;
        break;
      }
    }
    that.setData({
      editVisible: false,
      addIconIdx: idx,
      entryName: that.data.curEditItem.name,
    })
  },
  deleteItem(e) {
    wx.showModal({
      title: '删除分类',
      content: '确定删除分类' + that.data.curEditItem.name,
      success: function (res) {
        if (res.confirm) {
          httphelper.api("record/delRecordEntry", {
            id: that.data.curEditItem.id,
            type: that.data.info.type,
            userId: that.data.userId
          }, function (serverdata) {
            if (serverdata.code == 200) {
              wx.showToast({
                title: '删除成功',
              })
              let sltdata = that.data.sltData;
              sltdata.splice(that.data.curEditIndex, 1);
              that.deleteIconList();
              that.setData({
                editVisible: false,
                curEditItem: null,
                sltData: sltdata
              })
            } else {
              that.setData({
                editVisible: false,
                curEditItem: null,
              })
            }
          });
        }
      }
    });
  },
  /*** 删除常用列表元素 */
  deleteIconList() {
    let iconList = that.data.iconList;
    let flag = false;
    if (that.data.info.type == 0) {
      for (let i = 0; i < iconList.income.length; i++) {
        if (iconList.income[i].id == that.data.curEditItem.id) {
          flag = true;
          iconList.income.splice(i, 1);
          break;
        }
      }
    } else if (that.data.info.type == 1) {
      for (let i = 0; i < iconList.pay.length; i++) {
        if (iconList.pay[i].id == that.data.curEditItem.id) {
          flag = true;
          iconList.pay.splice(i, 1);
          break;
        }
      }
    } else {
      for (let i = 0; i < iconList.invest.length; i++) {
        if (iconList.invest[i].id == that.data.curEditItem.id) {
          flag = true;
          iconList.invest.splice(i, 1);
          break;
        }
      }
    }
    if (flag) {
      that.setData({
        iconList: iconList
      })
      let post = {};
      post.userId = that.data.userId;
      post.detail = JSON.stringify(iconList);
      httphelper.api("record/updateRecordEntryByUser", post, function (serverdata) {});
    }
  },
  /*** 修改常用列表元素 */
  updateIconList() {
    let iconList = that.data.iconList;
    let flag = false;
    if (that.data.info.type == 0) {
      for (let i = 0; i < iconList.income.length; i++) {
        if (iconList.income[i].id == that.data.curEditItem.id) {
          flag = true;
          iconList.income[i] = that.data.curEditItem;
          break;
        }
      }
    } else if (that.data.info.type == 1) {
      for (let i = 0; i < iconList.pay.length; i++) {
        if (iconList.pay[i].id == that.data.curEditItem.id) {
          flag = true;
          iconList.pay[i] = that.data.curEditItem;
          break;
        }
      }
    } else {
      for (let i = 0; i < iconList.invest.length; i++) {
        if (iconList.invest[i].id == that.data.curEditItem.id) {
          flag = true;
          iconList.invest[i] = that.data.curEditItem;
          break;
        }
      }
    }
    if (flag) {
      that.setData({
        iconList: iconList
      })
      let post = {};
      post.userId = that.data.userId;
      post.detail = JSON.stringify(iconList);
      httphelper.api("record/updateRecordEntryByUser", post, function (serverdata) {});
    }
  },
  selectItem2(e) {
    that.setData({
      sltIconIdx: e.currentTarget.dataset.index
    })
    if (that.data.longtap) {
      return;
    }
    wx.showModal({
      title: '添加常用分类',
      content: '确定添加' + e.currentTarget.dataset.item.name + '到常用分类',
      success: function (res) {
        if (res.confirm) {
          let iconList = that.data.iconList;
          let flag = true;
          if (that.data.info.type == 0) {
            iconList.income.map((val) => {
              if (val.id == e.currentTarget.dataset.item.id) {
                flag = false;
              }
            })
            if (flag)
              iconList.income.push(e.currentTarget.dataset.item)
          } else if (that.data.info.type == 1) {
            iconList.pay.map((val) => {
              if (val.id == e.currentTarget.dataset.item.id) {
                flag = false;
              }
            })
            if (flag)
              iconList.pay.push(e.currentTarget.dataset.item)
          } else {
            iconList.invest.map((val) => {
              if (val.id == e.currentTarget.dataset.item.id) {
                flag = false;
              }
            })
            if (flag)
              iconList.invest.push(e.currentTarget.dataset.item)
          }
          if (flag) {
            that.setData({
              iconList: iconList
            })
            let post = {};
            post.userId = that.data.userId;
            post.detail = JSON.stringify(iconList);
            httphelper.api("record/updateRecordEntryByUser", post, function (serverdata) {
              if (serverdata.code == 200) {
                wx.showToast({
                  title: '添加成功',
                })
              }
            });
          } else {
            wx.showToast({
              icon: "none",
              title: '已经是常用分类',
            })
          }
        }
      }
    })
  },
  addItem2(e) {
    if (this.data.iconData == null) {
      let iconData = {
        income: [],
        invest: [],
        pay: [],
      };
      let s = "https://img.ssw88.com/static/record/entity_icon/";
      for (let i = 1; i <= app.entryData.incomeCount; i++) {
        let item = {};
        item.icon = s + "income/" + i + ".png";
        item.icon_not = s + "income_not/" + i + ".png";
        iconData.income.push(item);
      }
      for (let i = 1; i <= app.entryData.payCount; i++) {
        let item = {};
        item.icon = s + "expend/" + i + ".png";
        item.icon_not = s + "expend_not/" + i + ".png";
        iconData.pay.push(item);
      }
      for (let i = 1; i <= app.entryData.investCount; i++) {
        let item = {};
        item.icon = s + "invest/" + i + ".png";
        item.icon_not = s + "invest_not/" + i + ".png";
        iconData.invest.push(item);
      }
      this.setData({
        iconData: iconData,
        addVisible: true,
        curIcon: this.data.info.type == 0 ? iconData.income : (this.data.info.type == 1 ? iconData.pay : iconData.invest)
      })
    } else {
      this.setData({
        addVisible: true,
        curIcon: this.data.info.type == 0 ? this.data.iconData.income : (this.data.info.type == 1 ? this.data.iconData.pay : this.data.iconData.invest)
      })
    }
  },
  closeSelect() {
    this.setData({
      sltVisible: false
    })
  },
  /* 增加分类 */
  addEntry() {
    if (this.data.entryName == null || this.data.entryName == "") {
      wx.showToast({
        icon: "none",
        title: '请输入分类名称',
      })
      return;
    }
    if (that.data.curEditItem) {
      httphelper.api("record/updateRecordEntry", {
        id: that.data.curEditItem.id,
        icon: this.data.curIcon[this.data.addIconIdx].icon,
        name: this.data.entryName,
        type: this.data.info.type,
        userId: this.data.userId
      }, function (serverdata) {
        if (serverdata.code == 200) {
          let item = that.data.curEditItem;
          item.name = that.data.entryName;
          item.icon = that.data.curIcon[that.data.addIconIdx].icon;
          item.icon_not = that.data.curIcon[that.data.addIconIdx].icon_not;
          let sltdata = that.data.sltData;
          sltdata[that.data.curEditIndex] = that.data.curEditItem;
          that.updateIconList();
          that.setData({
            addVisible: false,
            curEditItem: null,
            addIconIdx: 0,
            entryName: null,
            sltData: sltdata
          })
        }
      });
    } else {
      httphelper.api("record/addRecordEntry", {
        icon: this.data.curIcon[this.data.addIconIdx].icon,
        name: this.data.entryName,
        type: this.data.info.type,
        userId: this.data.userId
      }, function (serverdata) {
        if (serverdata.code == 200) {
          if (that.data.info.type == 0) {
            serverdata.data.icon_not = serverdata.data.icon.replace('income', 'income_not')
            app.entryData.income.push(serverdata.data);
            that.setData({
              sltData: app.entryData.income
            })
          } else if (that.data.info.type == 1) {
            serverdata.data.icon_not = serverdata.data.icon.replace('expend', 'expend_not')
            app.entryData.pay.push(serverdata.data);
            that.setData({
              sltData: app.entryData.pay
            })
          } else {
            serverdata.data.icon_not = serverdata.data.icon.replace('invest', 'invest_not')
            app.entryData.invest.push(serverdata.data);
            that.setData({
              sltData: app.entryData.invest
            })
          }
          that.setData({
            addVisible: false,
            curEditItem: null,
            addIconIdx: 0,
            entryName: null,
          })
        }
      });
    }
  },
  selectItem3(e) {
    this.setData({
      addIconIdx: e.currentTarget.dataset.index,
    })
  },
  changeEntryName(e) {
    this.setData({
      entryName: e.detail.value
    })
  },
  closeAdd() {
    this.setData({
      addVisible: false,
      curEditItem: null,
      addIconIdx: 0,
      entryName: null,
    })
  },
  /* 提交账目 */
  confirm() {
    if (this.data.edit) {
      if (this.data.info.price == null || this.data.info.price == "") {
        wx.showToast({
          icon: "none",
          title: '请填写金额',
        })
        return;
      }
      let data = {};
      data.id = this.data.info.id;
      data.userId = this.data.userId;
      data.entryId = this.data.info.entryId;
      data.price = this.data.info.price;
      if (this.data.info.content)
        data.content = this.data.info.content;
      data.createTime = this.data.info.createTime;
      data.type = this.data.info.type;
      httphelper.api("record/updateRecord", data, function (serverdata) {
        if (serverdata.code == 200) {
          common.goBackAfterMsg("修改成功")
        }
      });
    } else {
      if (this.data.info.price == null || this.data.info.price == "") {
        wx.showToast({
          icon: "none",
          title: '请填写金额',
        })
        return;
      }
      if (this.data.info.entryId == null) {
        let key = "info.entryId";
        if (that.data.info.type == 0) {
          if (that.data.iconList.income.length == 0) {
            wx.showToast({
              icon: "none",
              title: '请选择收入类型',
            })
            return;
          }
          that.setData({
            [key]: that.data.iconList.income[0].id
          })
        } else if (that.data.info.type == 1) {
          if (that.data.iconList.pay.length == 0) {
            wx.showToast({
              icon: "none",
              title: '请选择支出类型',
            })
            return;
          }
          that.setData({
            [key]: that.data.iconList.pay[0].id
          })
        } else {
          if (that.data.iconList.invest.length == 0) {
            wx.showToast({
              icon: "none",
              title: '请选择投资类型',
            })
            return;
          }
          that.setData({
            [key]: that.data.iconList.invest[0].id
          })
        }
      }
      if (this.data.info.createTime == null) {
        let key = "info.createTime"
        var date = new Date()
        this.setData({
          [key]: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        })
      }
      let data = {};
      data.userId = this.data.userId;
      data.entryId = this.data.info.entryId;
      data.price = this.data.info.price;
      if (this.data.info.content)
        data.content = this.data.info.content;
      data.createTime = this.data.info.createTime;
      data.type = this.data.info.type;
      httphelper.api("record/addRecord", data, function (serverdata) {
        if (serverdata.code == 200) {
          common.goBackAfterMsg("添加成功")
        }
      });
    }
  },
  delete() {
    httphelper.api("record/delRecord", {
      id: this.data.info.id,
      userId: this.data.userId
    }, function (serverdata) {
      if (serverdata.code == 200) {
        common.goBackAfterMsg("删除成功")
      }
    });
  },

  goBack() {
    wx.navigateBack();
  },

  /* 防点击穿透 */
  mask() {},
})