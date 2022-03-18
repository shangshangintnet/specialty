/* contacts.js */

import restapi from "../../../static/lib/restapi";

const app = getApp()

Page({
	data: {
		groups:[],
		friends:[],
	},
	onShow () {
		let currentUser = app.globalData.imService.currentUser;
		let groups = restapi.findGroups(currentUser);
		let friends = restapi.findFriends(currentUser);
		this.setData({
			groups:	groups,
			friends: friends,
		});
	},
	onUnload(){
		app.globalData.imService.disconnect();
	},
	enterChat (e) {//进入私聊
		let type = e.currentTarget.dataset.type;
		let conversation = e.currentTarget.dataset.conversation;
		let path = type === wx.GoEasyIM.SCENE.PRIVATE?
			'../chat/privateChat/privateChat?to='+conversation.uuid
			:'../chat/groupChat/groupChat?to='+ conversation.uuid;
		wx.navigateTo({
			url : path
		});
	}
})