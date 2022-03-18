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
    date: "",
    month: "",
    books: [],
    bookIdx: 0,
    bookbg: 'background-image: url(https://img.ssw88.com/static/wechatImg/account_book_bg0.png)',
    bookData: {},
    entryData: {},
    type: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    var date = new Date()
    this.setData({
      bar_Height: app.bar_Height,
      user: app.user,
      date: date.getFullYear() + "-" + (date.getMonth() + 1),
      month: date.getMonth() + 1,
      books: app.accountBook.users
    })
    wx.hideShareMenu({
      success: (res) => {},
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    that.getdata();
    that.getRecordEntry();
  },
  goBack: function () {
    wx.navigateBack({
      delta: 0,
    })
  },
  bindBookChange: function (e) {
    this.setData({
      bookIdx: e.detail.value,
      bookbg: 'background-image: url(https://img.ssw88.com/static/wechatImg/account_book_bg' + e.detail.value % 3 + '.png)',
    })
    this.getdata();
    this.getRecordEntry();
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value,
      month: e.detail.value.substring(5),
      type: -1,
    })
    this.getdata();
  },
  changeType(e) {
    if (that.data.type == e.currentTarget.dataset.index) {
      that.setData({
        type: -1,
      })
    } else {
      that.setData({
        type: e.currentTarget.dataset.index
      })
    }
  },
  getRecordEntry() {
    httphelper.api("record/findRecordEntry", {
      userId: this.data.books[this.data.bookIdx].userId
    }, function (serverdata) {
      if (serverdata.code == 200) {
        let count = serverdata.data.iconCount.split(',');
        serverdata.data.incomeCount = Number(count[0]);
        serverdata.data.payCount = Number(count[1]);
        serverdata.data.investCount = Number(count[2]);
        serverdata.data.income.map((val) => {
          val.icon_not = val.icon.replace('income', 'income_not')
        })
        serverdata.data.pay.map((val) => {
          val.icon_not = val.icon.replace('expend', 'expend_not')
        })
        serverdata.data.invest.map((val) => {
          val.icon_not = val.icon.replace('invest', 'invest_not')
        })
        that.setData({
          entryData: serverdata.data
        })
        app.entryData = serverdata.data;
      }
    });
  },

  getdata() {
    httphelper.api("record/findRecord", {
      year: this.data.date,
      userId: this.data.books[this.data.bookIdx].userId
    }, function (serverdata) {
      if (serverdata.code == 200) {
        let bookData = {}
        bookData.records = serverdata.data.records;
        bookData.income = serverdata.data[0];
        bookData.expend = serverdata.data[1];
        bookData.invest = serverdata.data[2];
        bookData.records.map((val) => {
          let income = 0;
          let expend = 0;
          let invest = 0;
          val.map((v1) => {
            if (v1.type == 0) {
              income += v1.price;
            } else if (v1.type == 1) {
              expend += v1.price;
            } else {
              invest += v1.price;
            }
          })
          val[0].income = income.toFixed(2);
          val[0].expend = expend.toFixed(2);
          val[0].invest = invest.toFixed(2);
        })
        that.setData({
          bookData: bookData
        })
        if (serverdata.data.recordEntry) {
          app.recordEntry = JSON.parse(serverdata.data.recordEntry);
        } else {
          app.recordEntry = {
            income: [],
            invest: [],
            pay: []
          }
        }
      }
    });
  },
  openEdit(e) {
    if (e.currentTarget.dataset.item != null) {
      app.editRecord = e.currentTarget.dataset.item;
      wx.navigateTo({
        url: '../recordDetail/recordDetail?edit=1&userId=' + this.data.books[this.data.bookIdx].userId,
      })
    } else {
      wx.navigateTo({
        url: '../recordDetail/recordDetail?userId=' + this.data.books[this.data.bookIdx].userId,
      })
    }
  },
  viewData() {
    wx.navigateTo({
      url: '../analysis/analysis?date=' + this.data.date + '&bookIdx=' + this.data.bookIdx,
    })
  },
  lock() {
    let date = new Date();
    let month = date.getFullYear() + "-" + (date.getMonth() + 1);
    let time = month + "-" + date.getDate();
    wx.showModal({
      title: '锁定账本至 ' + month,
      content: '确定锁定' + that.data.books[that.data.bookIdx].name + '账本，锁定后账本不能再修改',
      success: function (res) {
        if (res.confirm) {
          httphelper.api("record/updateRecordLockTimes", {
            times: time,
            userId: that.data.books[that.data.bookIdx].userId
          }, function (serverdata) {
            if (serverdata.code == 200) {
              wx.showToast({
                title: '锁定成功',
              })
            }
          });
        }
      }
    });
  },
})