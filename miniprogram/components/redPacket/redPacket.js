const _ANIMATION_TOP = "-10vh";
const _ANIMATION_END = "110vh";
// components/redPacket/redPacket.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {

  },
  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    animationList: [],
    downAnim: null,
    startTop: _ANIMATION_TOP,
    startLeft: [{
      left: "50vw",
      anim: null,
    }, {
      left: "80vw",
      anim: null,
    }, {
      left: "70vw",
      anim: null,
    }, {
      left: "20vw",
      anim: null,
    }, {
      left: "60vw",
      anim: null,
    }, {
      left: "30vw",
      anim: null,
    }, {
      left: "20vw",
      anim: null,
    }, {
      left: "40vw",
      anim: null,
    }, {
      left: "60vw",
      anim: null,
    }, {
      left: "50vw",
      anim: null,
    }],
    coinLeft: [{
      left: "10vw",
      anim: null,
    }, {
      left: "30vw",
      anim: null,
    }, {
      left: "20vw",
      anim: null,
    }, {
      left: "40vw",
      anim: null,
    }, {
      left: "60vw",
      anim: null,
    }, {
      left: "50vw",
      anim: null,
    }, {
      left: "80vw",
      anim: null,
    }, {
      left: "70vw",
      anim: null,
    }, {
      left: "20vw",
      anim: null,
    }, {
      left: "60vw",
      anim: null,
    }, {
      left: "30vw",
      anim: null,
    }, {
      left: "20vw",
      anim: null,
    }, {
      left: "40vw",
      anim: null,
    }, {
      left: "60vw",
      anim: null,
    }, {
      left: "50vw",
      anim: null,
    }, ],
    isPlaying: false,
    isEnd: false,
    isGetResult: false,
    showResult: false,
    getCoinPacket: 0,
    getMonetPacket: 0,
    redPacket: 0,
    redPacketEme: 0,
    realPacket: 0,
    realPacketEme: 0,
    current: 0,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    showModal: function (redPacketEme, redPacket, current) {
      console.log(redPacketEme);
      console.log(redPacket);
      this.setData({
        show: true,
        redPacketEme: redPacketEme,
        redPacket: redPacket,
        current: current
      });

      if (!this.data.isPlaying)
        this.clickAnim();
    },
    jumpToWallet: function () {
      wx.navigateTo({
        url: "/packageMyself/pages/myself/mywallet/myBalance/myBalance",
      })
    },
    isPlaying: function () {
      return this.data.isPlaying;
    },
    //开启中奖
    clickAnim: function () {
      if (this.data.isEnd) {
        this.setData({
          show: false
        })

        this.triggerEvent('refreshData');
      }
      if (this.data.isPlaying) return;
      let delay = 0;
      let that = this;
      this.maxCoinPacket = this.data.startLeft.length;
      this.maxMoneyPacket = this.data.coinLeft.length;
      this.setData({
        isPlaying: true,
        getCoinPacket: 0,
        getMonetPacket: 0
      })

      for (let i = 0; i < this.data.startLeft.length; ++i) {
        setTimeout(function () {
          that.animStart(i, 4000, "startLeft");
        }, delay)
        delay += 300+ 1000 * Math.random();
      };

      delay = 1000;
      for (let i = 0; i < this.data.coinLeft.length; ++i) {
        if (i + 1 == this.data.coinLeft.length) {
          setTimeout(function () {
            that.animStart(i, 5000, "coinLeft");
          }, delay)

          setTimeout(function () {
            that.setData({
              isEnd: true,
            })

            if (!that.data.isGetResult) {
              that.getResult();
            }
            //console.dir(that.data.isPlaying);
          }, 5000 + delay);
          break;
        }

        setTimeout(function () {
          that.animStart(i, 5000, "coinLeft");
        }, delay)
        delay += 2000 * Math.random();
      };
    },
    getResult: function () {
      let that = this;
      let data = {};
      data.redPacketEme = parseInt(((this.data.getCoinPacket / this.data.coinLeft.length) * this.data.redPacketEme));
      //(this.data.getMonetPacket / this.data.coinLeft.length)
      //(this.data.getCoinPacket / this.data.startLeft.length)
      data.redPacket = ((this.data.getMonetPacket / this.data.startLeft.length) * this.data.redPacket).toFixed(2);

      data.current = this.data.current;

      this.setData({
        realPacketEme: data.redPacketEme,
        realPacket: data.redPacket
      })
      this.triggerEvent('requestResult', data);

    },
    showResult: function () {
      this.setData({
        showResult: true
      })
    },
    animStart: function (index, timeOut, arrayName, callback = null) {
      let that = this;
      var animation = wx.createAnimation({})
      animation.top(_ANIMATION_END).step({
        duration: timeOut
      })

      let str = arrayName + "[" + index + "].anim"
      this.setData({
        [str]: animation.export()
      })

      setTimeout(function () {
        that.animEnd(index, arrayName, callback);
      }, timeOut)
    },
    clickEnd: function (e) {
      if (!this.data.isPlaying) return;

      let index = e.currentTarget.dataset.index;
      let arrayName = e.currentTarget.dataset.arrayName;
      if (arrayName == "coinLeft") {
        this.setData({
          getCoinPacket: this.data.getCoinPacket + 1
        })

        if (index + 1 == this.data.coinLeft.length) {
          this.setData({
            isGetResult: true
          })
          this.getResult();
        }

      } else {
        this.setData({
          getMonetPacket: ++this.data.getMonetPacket
        })
      }
      this.animEnd(index, arrayName);

      //this.animEnd(index,arrayName,callback);
    },
    animEnd: function (index, arrayName, callback = null) {
      var animation = wx.createAnimation({})
      animation.top(_ANIMATION_TOP).step({
        duration: 0
      })
      let str = arrayName + "[" + index + "].anim"
      this.setData({
        [str]: animation.export()
      })
      if (callback != null) callback();
    },

  }
})