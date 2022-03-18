// packageInner/pages/analysis/analysis.js
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
    type: 1,
    entry: false,
    bar_Height: 0,
    book: {},
    bookData: {},
    date: "",
    year: "",
    iconList: [],
    curEntry: [],
    findEntryIdx: -1,
    monthData: {},
    yearData: {},
    entryData: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.setData({
      bar_Height: app.bar_Height,
      date: options.date,
      book: app.accountBook.users[options.bookIdx],
      year: options.date.substring(0, 4),
      iconList: app.recordEntry,
      curEntry: app.recordEntry.pay
    })
    wx.hideShareMenu({
      success: (res) => {},
    })
    this.getdata();
  },
  goBack() {
    wx.navigateBack();
  },
  getdata() {
    if (this.data.monthData[this.data.date] != null) {
      that.setData({
        bookData: this.data.monthData[this.data.date]
      })
      return;
    }
    httphelper.api("record/findRecord", {
      year: this.data.date,
      userId: this.data.book.userId
    }, function (serverdata) {
      if (serverdata.code == 200) {
        let result = {}
        result.income = serverdata.data[0];
        result.expend = serverdata.data[1];
        result.invest = serverdata.data[2];
        let key = "monthData." + that.data.date
        that.setData({
          bookData: result,
          [key]: result
        })
      }
    });
  },
  changeActive(e) {
    if (this.data.active == e.currentTarget.dataset.index)
      return;
    that.setData({
      active: e.currentTarget.dataset.index
    })
    if (this.data.active == 0) {
      that.setData({
        entry: false,
        findEntryIdx: -1,
      })
      this.getdata();
    } else {
      this.getYearData();
    }
  },
  changeType(e) {
    if (that.data.entry) {
      if (that.data.active == 0) {
        that.getdata();
      } else {
        that.getYearData();
      }
    }
    if (that.data.type == e.currentTarget.dataset.index) {
      that.setData({
        entry: false,
        findEntryIdx: -1,
      })
    } else {
      that.setData({
        type: e.currentTarget.dataset.index,
        entry: false,
        findEntryIdx: -1,
        curEntry: e.currentTarget.dataset.index == 0 ? app.recordEntry.income : (e.currentTarget.dataset.index == 1 ? app.recordEntry.pay : app.recordEntry.invest)
      })
    }
  },
  bindDateChange(e) {
    that.setData({
      date: e.detail.value
    })
    that.getdata();
  },
  bindEntryChange(e) {
    that.setData({
      entry: true,
      findEntryIdx: e.detail.value
    })
    that.getEntryData();
  },
  bindEntryCancel(e) {
    that.setData({
      entry: false,
      findEntryIdx: -1
    })
    that.getYearData();
  },
  bindYearChange(e) {
    that.setData({
      year: e.detail.value
    })
    if (that.data.entry) {
      that.getEntryData();
    } else {
      that.getYearData();
    }
  },
  getYearData() {
    if (this.data.yearData[this.data.year] != null) {
      that.setData({
        bookData: this.data.yearData[this.data.year]
      })
      return;
    }
    httphelper.api("record/findAnnualRecord", {
      year: this.data.year,
      userId: this.data.book.userId
    }, function (serverdata) {
      if (serverdata.code == 200) {
        let result = {}
        result.income = serverdata.data[0];
        result.expend = serverdata.data[1];
        result.invest = serverdata.data[2];
        let months = [];
        let incomePrice = 0;
        let expendPrice = 0;
        let investPrice = 0;
        for (let i = 1; i <= 12; i++) {
          let key = i < 10 ? '0' + i : i
          if (serverdata.data.months[key]) {
            let item = {};
            item.month = i;
            item.incomePrice = serverdata.data.months[key].incomePrice ? serverdata.data.months[key].incomePrice : 0;
            item.expendPrice = serverdata.data.months[key].payPrice ? serverdata.data.months[key].payPrice : 0;
            item.investPrice = serverdata.data.months[key].investPrice ? serverdata.data.months[key].investPrice : 0;
            item.profit = (item.incomePrice - item.expendPrice).toFixed(2);
            incomePrice += item.incomePrice;
            expendPrice += item.expendPrice;
            investPrice += item.investPrice;
            months.push(item)
          }
        }
        result.months = months;
        result.incomePrice = incomePrice.toFixed(2);
        result.expendPrice = expendPrice.toFixed(2);
        result.investPrice = investPrice.toFixed(2);
        result.profit = (incomePrice - expendPrice).toFixed(2);
        let key = "yearData." + that.data.year
        that.setData({
          bookData: result,
          [key]: result
        })
      }
    });
  },
  getEntryData() {
    let entryId = this.data.curEntry[this.data.findEntryIdx].id;
    if (this.data.yearData[this.data.year] && this.data.yearData[this.data.year][entryId] != null) {
      that.setData({
        bookData: this.data.yearData[this.data.year][entryId]
      })
      return;
    }
    httphelper.api("record/findRecordEntryAll", {
      year: this.data.year,
      userId: this.data.book.userId,
      entryId: entryId
    }, function (serverdata) {
      if (serverdata.code == 200) {
        let key = "yearData." + that.data.year + "." + entryId
        that.setData({
          bookData: serverdata.data,
          [key]: serverdata.data
        })
      }
    });
  },
})