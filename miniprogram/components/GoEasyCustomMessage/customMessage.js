/* customMessage.js */
Component({
	data: {
		to: null,//接收方
		type: "", //私聊还是群聊
		show: false,//是否展示自定义消息组件

		goods : '',
		price : '',
		number : ''
	},
	methods:{
		setNumber(e){
			this.setData({
				number: e.detail.value
			});
		},
		setGoods(e){
			this.setData({goods: e.detail.value});
		},
		setPrice(e){
			this.setData({
				price: e.detail.value
			});
		},
		createCustomMessage () {
			let customMessage = wx.im.createCustomMessage({
				type : 'order',
				payload : {
					name : this.data.number,
					image : this.data.goods,
					path : this.data.price
				},
				to: {
					id : this.data.to.uuid,
					type : this.data.type,
					data : {name : this.data.to.name, avatar: this.data.to.avatar}
				}
			});
			console.log(this.data);
			this.triggerEvent("sendCustomMessage",customMessage);
			this.close();
		},
		close () {
			this.setData({
				show: false
			});
		}
	}
})
