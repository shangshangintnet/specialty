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
    //数组赋值
    setGoodsValue(data) {
      this.setData({
        goodsList: data,
        page: 1,
        isLoading: false,
        isFinish: false,
        waitText: "",
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
            waitText: serverData.data[pos] == null ? "没有更多的商品了~" : serverData.msg,
            isFinish: true,
          })
          return;
        }
        that.setData({
          goodsList: that.data.goodsList.concat(serverData.data[pos]),
          isLoading: false,
        })
      }, false)
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
      if (api == "store/findGoodsPageNum") {
        data.page = nextPage;
      }
      httphelper.api(api, data, function (serverData) {
        // if (api == "classification/queryGoodJade") {
          if (serverData.code == 200) {
            if (serverData.data == null || (pos != null && serverData.data[pos] == null)) {
              that.setData({
                isLoading: false,
              })
              that.onQueryNext(api, data, pos);
            } else {
              that.setData({
                page: nextPage,
                goodsList: that.data.goodsList.concat(pos == null ? serverData.data : serverData.data[pos]),
                isLoading: false,
              })
            }
          } else {
            that.setData({
              waitText: "没有更多的商品了~",
              isFinish: true,
            })
            return;
          }
        // } else {
        //   if (serverData.code == 200) {
        //     if (pos == null && (serverData.data == null || serverData.data.length == 0)) {
        //       that.setData({
        //         isLoading: false,
        //       })
        //       that.onQueryNext(api, data, pos);
        //       return;
        //     }
        //     if (pos != null && serverData.data != null && (serverData.data[pos] == null || serverData.data[pos].length == 0)) {
        //       that.setData({
        //         isLoading: false,
        //       })
        //       that.onQueryNext(api, data, pos);
        //       return;
        //     }
        //     that.setData({
        //       page: nextPage,
        //       goodsList: that.data.goodsList.concat(pos == null ? serverData.data : serverData.data[pos]),
        //       isLoading: false,
        //     })
        //   } else {
        //     that.setData({
        //       waitText: "没有更多的商品了~",
        //       isFinish: true,
        //     })
        //   }
        // }
      }, false)
    },
    onMoveToGoods(e) {
      common.onMoveToGoods(e);
    }
  }
})