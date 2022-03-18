const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp()
let that;
Page({
	data: {
		bar_Height: 0,
		conversations: [],
		action: {
			conversation: null,
			show: false,
			toastMessage: '',
			showToast: false
		},
		friends: null,
	},
	onLoad() {
		that = this;
		that.setData({
			bar_Height: app.bar_Height
		})
	},
	onShow(e) {
		if (wx.im.getStatus() === 'disconnected') {
			app.globalData.imService = new IMService(wx.im);
			app.globalData.imService.connectIM(currentUser);
		}
		wx.showLoading({
			title: '加载中'
		});
		//监听会话列表变化
		wx.im.on(wx.GoEasyIM.EVENT.CONVERSATIONS_UPDATED, (conversations) => {
			// 设置tabBar未读消息总数以及conversation
			that.setConversations(conversations);
		});
		//加载会话列表
		wx.im.latestConversations()
			.then(res => {
				that.setConversations(res.content);
				wx.hideLoading();
			})
			.catch(e => {
				console.log(e);
				wx.hideLoading();
			});
	},
	onHide(e) {
		// 销毁conversation监听器
		wx.im.on(wx.GoEasyIM.EVENT.CONVERSATIONS_UPDATED, (conversations) => {});
	},
	onUnload(e) {
		// 销毁conversation监听器
		wx.im.on(wx.GoEasyIM.EVENT.CONVERSATIONS_UPDATED, (conversations) => {});
	},
	setConversations(conversations) {
		console.log(conversations)
		let storeId = [];
		let highId = [];
		let userId = [];
		let temp = [];
		conversations.conversations && conversations.conversations.map((item) => {
			item.lastMessage.date = app.formatDate(item.lastMessage.timestamp)
			if (item.type === wx.GoEasyIM.SCENE.PRIVATE) {
				if (item.userId.startsWith('store')) {
					storeId.push(item.userId.substring(5));
				} else if (item.userId.startsWith('high')) {
					highId.push(item.userId.substring(4));
				} else {
					userId.push(item.userId);
				}
				temp.push(item);
			} else {
				item.storeId = item.groupId.substring(8);
				item.userId = "store" + item.storeId;
				storeId.push(item.storeId);
				temp.push(item);
			}
		})
		conversations.conversations = temp;
		this.setData({
			conversations: conversations
		})
		let post = {};
		post.storeIds = storeId.join();
		post.userIds = userId.join();
		post.highIds = highId.join();
		common.findUserImInfo(post, (res) => {
			that.setData({
				friends: res
			});
		})
	},
	navigateToChat(e) {
		let conversation = e.currentTarget.dataset.conversation;
		if (conversation.type == 'private') {
			app.globalData.friend = this.data.friends[conversation.userId];
			wx.navigateTo({
				url: '../privateChat/privateChat'
			})
		} else {
			var imService = app.globalData.imService;
			//进入房间 服务器
			httphelper.api("classification/addChatRoom", {
				uuid: imService.currentUser.uuid,
				storeId: conversation.storeId
			}, (serverData) => {
				if (serverData.code == 200) {
					serverData.data.uuid = "chatRoom" + serverData.data.uuid;
					common.goChatRoom(serverData.data);
				}
			});
		}
	},
})