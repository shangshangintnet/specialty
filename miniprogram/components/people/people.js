// components/guess_what/guess_what.js
const common = require('../../common.js');
const httphelper = require('../../httphelper.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsList: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    page: 1,
    waitText: "",
    isLoading: false,
    isFinish: false,
  },
  onReachBottom: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    console.log("on pull")
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  },
  /**
   * 组件的方法列表
   */
  methods: {
    jumpTo: common.jumpTo,
    //数组赋值
    setGoodsValue(data) {
      this.setData({
        goodsList: data,
        page: 1,
        isLoading: false,
        isFinish: false,
      })
    },
    onQueryFirst(api, data, pos) {
      let that = this;

      if (this.data.isLoading || this.data.isFinish) {
        console.log("正在刷新,或者暂无数据")
        return;
      }

      this.setData({
        isLoading: true,
        waitText: "正在加载...",
      })

      if (data == null) {
        data = {};
      }

      data.pageNum = 1;

      httphelper.api(api, data, function (serverData) {
        if (serverData.data == null) {
          that.setData({
            waitText: serverData.msg,
            isFinish: true,
          })
          return;
        }

        if (serverData.code == 400 || serverData.data[pos] == null) {
          that.setData({
            waitText: serverData.data[pos] == null ? "数据已到底了～" : serverData.msg,
            isFinish: true,
          })
          return;
        }

        that.setData({
          goodsList: that.data.goodsList.concat(serverData.data[pos]),
          isLoading: false,
        })
      })

    },
    onQueryNext(api, data, pos) {
      if (this.data.isLoading || this.data.isFinish) {
        console.log("正在刷新,或者暂无数据")
        return;
      }

      this.setData({
        isLoading: true,
        waitText: "正在加载...",
      })

      let that = this;
      let nextPage = ++this.data.page;

      if (data == null) {
        data = {};
      }
      data.pageNum = nextPage;



      httphelper.api(api, data, function (serverData) {
        if (serverData.data == null) {
          that.setData({
            waitText: serverData.msg,
            isFinish: true,
          })
          return;
        }


        if (serverData.code == 400 || serverData.data[pos] == null) {
          that.setData({
            waitText: serverData.data[pos] == null ? "数据已到底了～" : serverData.msg,
            isFinish: true,
          })
          return;
        }

        that.setData({
          page: nextPage,
          goodsList: that.data.goodsList.concat(serverData.data[pos]),
          isLoading: false,
        })
      })
    },
    sortBy(name) {
      var goodsList = this.data.goodsList;
      goodsList.sort(this.compare(name));

      this.setData({
        goodsList: goodsList
      })
    },
    onMoveToGoods: common.onMoveToGoods,
    sortByDesc(name) {
      var goodsList = this.data.goodsList;
      goodsList.sort(this.compareDesc(name));

      this.setData({
        goodsList: goodsList
      })
    },
    compare: function (property) {
      return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
      }
    },
    compareDesc: function (property) {
      return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value2 - value1;
      }
    }
  }
})