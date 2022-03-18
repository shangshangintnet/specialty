/* groupMember.js */

const app = getApp()

Page({
	data: {
		bar_Height: 0,
		currentUser: null,
		groupMembersMap: {},
		groupMemberNum: 0
	},
	onLoad(options) {
		var group = app.globalData.group;
		var groupMemberMap = app.globalData.groupMembersMap;
		console.log(groupMemberMap)
		console.log(groupMemberMap.length)
		var groupMemberNum = group.userList.length;
		this.setData({
			groupMemberNum: groupMemberNum,
			groupMembersMap: groupMemberMap,
			bar_Height: app.bar_Height
		});
	},
})