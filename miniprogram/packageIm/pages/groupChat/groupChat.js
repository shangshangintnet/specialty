/* groupChat.js */
import EmojiDecoder from "../../../static/lib/EmojiDecoder";
const common = require('../../../common.js');
let emojiUrl = 'https://imgcache.qq.com/open/qcloud/tim/assets/emoji/';
let emojiMap = {
	'[么么哒]': 'emoji_3@2x.png',
	'[乒乓]': 'emoji_4@2x.png',
	'[便便]': 'emoji_5@2x.png',
	'[信封]': 'emoji_6@2x.png',
	'[偷笑]': 'emoji_7@2x.png',
	'[傲慢]': 'emoji_8@2x.png'
};
const httphelper = require('../../../httphelper.js');
const app = getApp()
let that;

Page({
	data: {
		bar_Height: 0,
		content: '',
		group: null,
		messages: [],
		//默认为false展示输入框, 为true时显示录音按钮
		recordVisible: false,
		currentUser: null,
		groupMemberNum: 0,
		groupMembers: {},
		allHistoryLoaded: false,
		// 表情
		emoji: {
			url: emojiUrl,
			map: emojiMap,
			show: false,
			decoder: new EmojiDecoder(emojiUrl, emojiMap)
		},
		more: { //更多按钮
			show: false
		},
		imService: null,
		groupMembersMap: {},
		bottom: 0,
		scrollTop: 0,
	},
	//输入聚焦
	foucus: function (e) {
		this.setData({
			bottom: e.detail.height - 1
		})
		let top = this.data.bottom + this.data.scrollTop;
		wx.pageScrollTo({
			scrollTop: top,
			duration: 100
		})
	},
	//失去聚焦
	blur: function (e) {
		this.setData({
			bottom: 0
		})
		wx.pageScrollTo({
			scrollTop: this.data.scrollTop,
			duration: 100
		})
	},
	onPageScroll(res) {
		this.setData({
			scrollTop: res.scrollTop
		})
	},
	onPullDownRefresh() {
		this.loadMoreHistoryMessage();
	},
	onLoad(options) {
		that = this;
		var group = app.globalData.group;
		let groupId = group.uuid;
		var imService = app.globalData.imService;
		var groupMemberNum = group.userList.length;
		this.setData({
			bar_Height: app.bar_Height,
			group: group,
			imService: imService,
			groupMemberNum: groupMemberNum,
			currentUser: imService.currentUser,
		});
		//groupMembersMap
		let storeId = [];
		let userId = [];
		let highId = [];
		group.userList.map((item) => {
			if (item.toString().startsWith('store')) {
				storeId.push(item.substring(5));
			} else if (item.startsWith('high')) {
				highId.push(item.substring(4));
			} else {
				userId.push(item);
			}
		})
		let post = {};
		post.storeIds = storeId.join();
		post.userIds = userId.join();
		post.highIds = highId.join();
		common.findUserImInfo(post, (res) => {
			that.setData({
				groupMembersMap: res,
			});
		})
		//订阅群消息
		this.data.imService.subscribeGroupMessage(groupId);
		// 获取群消息
		let messages = this.data.imService.getGroupMessages(groupId);
		// 渲染表情与消息间隔5分钟显示时间
		this.renderMessages(messages);
		this.scrollToBottom();
		// 收到的消息设置为已读
		if (this.data.messages.length !== 0) {
			this.markGroupMessageAsRead(groupId);
		}
		// 监听群消息
		this.data.imService.onNewGroupMessageReceive = (groupId, message) => {
			if (groupId === this.data.group.uuid) {
				// 渲染messages
				this.renderMessages(this.data.messages);
				this.scrollToBottom();
				// 如果收到当前群消息则清除当前群的未读消息
				this.markGroupMessageAsRead(groupId);
			}
		};
	},
	onUnload() {
		// 退出聊天页面之前，清空页面传入的监听器
		if (this.data.imService) {
			this.data.imService.onNewGroupMessageReceive = function () {};
		}
	},

	onRecordStop(res) {
		// 发送语音
		let audioMessage = wx.im.createAudioMessage({
			to: {
				id: this.data.group.uuid,
				type: wx.GoEasyIM.SCENE.GROUP,
				data: {
					name: this.data.group.name,
					avatar: this.data.group.avatar
				}
			},
			file: res.detail,
			onProgress: function (progress) {
				console.log(progress)
			}
		});
		this.sendMessage(audioMessage);
	},
	sendTextMessage() {
		// 发送文本与表情
		if (this.data.content.trim() !== '') {
			let textMessage = wx.im.createTextMessage({
				text: this.data.content,
				to: {
					id: this.data.group.uuid,
					type: wx.GoEasyIM.SCENE.GROUP,
					data: {
						name: this.data.group.name,
						avatar: this.data.group.avatar
					}
				}
			});
			this.sendMessage(textMessage);
		}
		this.setData({
			content: ""
		});
	},
	sendImage() {
		// 发送图片
		let self = this;
		wx.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success(res) {
				let imageMessage = wx.im.createImageMessage({
					to: {
						id: self.data.group.uuid,
						type: wx.GoEasyIM.SCENE.GROUP,
						data: {
							name: self.data.group.name,
							avatar: self.data.group.avatar
						}
					},
					file: res,
					onProgress: function (progress) {
						console.log(progress)
					}
				});
				self.sendMessage(imageMessage);
			}
		});
	},
	sendVideo() {
		// 发送视频
		let self = this;
		wx.chooseVideo({
			sourceType: ['album', 'camera'],
			maxDuration: 60,
			camera: 'back',
			success(res) {
				let videoMessage = wx.im.createVideoMessage({
					to: {
						id: self.data.group.uuid,
						type: wx.GoEasyIM.SCENE.GROUP,
						data: {
							name: self.data.group.name,
							avatar: self.data.group.avatar
						}
					},
					file: res,
					onProgress: function (progress) {
						console.log(progress)
					}
				});
				self.sendMessage(videoMessage);
			}
		})
	},
	sendMessage(message) {
		let self = this;
		this.data.messages.push(message);
		this.renderMessages(this.data.messages);
		self.scrollToBottom();
		let promise = wx.im.sendMessage(message);
		promise.then((res) => {
				console.log('发送消息成功');
				self.renderMessages(self.data.messages);
			})
			.catch(e => {
				console.log('发送失败', e)
			});
	},
	showCustomMessageForm() {
		// 展示自定义消息页面
		let self = this;
		let customMessage = this.selectComponent("#customMessage");
		customMessage.setData({
			show: true,
			to: self.data.group,
			type: wx.GoEasyIM.SCENE.GROUP
		});
	},
	sendCustomMessage(event) {
		let customMessage = event.detail;
		this.sendMessage(customMessage);
		// 发送自定义消息关闭更多菜单栏
		this.setData({
			["more.show"]: false,
			["emoji.show"]: false,
		});
	},
	loadMoreHistoryMessage() { //历史消息
		//历史消息
		let lastMessageTimeStamp = Date.now();
		let lastMessage = this.data.messages[0];
		if (lastMessage) {
			lastMessageTimeStamp = lastMessage.timestamp;
		}
		let currentLength = this.data.messages.length;
		let promise = this.data.imService.loadGroupHistoryMessage(this.data.group.uuid, lastMessageTimeStamp);
		promise.then(messages => {
			if (messages.length === currentLength) {
				this.setData({
					allHistoryLoaded: true
				})
			}
			this.renderMessages(this.data.messages);
			wx.stopPullDownRefresh();
		}).catch(e => {
			console.log(e);
			wx.stopPullDownRefresh();
		})
	},
	renderMessages(messages) {
		messages.forEach((message, index) => {
			if (index === 0) {
				// 当页面只有一条消息时，显示发送时间
				message.showTime = app.formatDate(message.timestamp);
			} else {
				// 当前消息与上条消息的发送时间进行比对，超过5分钟则显示当前消息的发送时间
				if (message.timestamp - messages[index - 1].timestamp > 5 * 60 * 1000) {
					message.showTime = app.formatDate(message.timestamp);
				}
			}
			if (message.type === 'text') {
				// 渲染表情与文本消息
				let text = this.data.emoji.decoder.decode(message.payload.text);
				message.node = text;
			}
		});
		this.setData({
			messages: messages
		});
	},
	markGroupMessageAsRead(groupId) {
		wx.im.markGroupMessageAsRead(groupId)
			.then(() => {
				console.log('标记为已读成功')
			})
			.catch(e => {
				console.log('标记为已读失败', e)
			})
	},
	setContent(e) {
		// 监听输入的消息
		let content = e.detail.value;
		this.setData({
			content: content
		});
	},
	switchAudioKeyboard() {
		// 语音录制按钮和键盘输入的切换
		this.setData({
			recordVisible: !this.data.recordVisible
		});
		if (this.data.more.show || this.data.emoji.show) {
			this.setData({
				["more.show"]: false,
				["emoji.show"]: false
			});
		}
		if (this.data.recordVisible) {
			// 录音授权
			wx.authorize({
				scope: 'scope.record',
				success() {}
			});
		}
	},
	playVideo(e) {
		//播放视频
		this.selectComponent("#videoPlayer").play({
			url: e.currentTarget.dataset.url,
			duration: e.currentTarget.dataset.duration
		})
	},
	previewImage(event) {
		// 预览图片
		let imagesUrl = [event.currentTarget.dataset.src];
		wx.previewImage({
			urls: imagesUrl // 需要预览的图片http链接列表
		})
	},
	selectEmoji(e) {
		// 选择表情
		let emojiKey = e.currentTarget.dataset.emojikey;
		emojiKey = this.data.content + emojiKey;
		this.setData({
			content: emojiKey
		});
	},
	messageInputFocusin(e) {
		//处理键盘
		this.setData({
			bottom: e.detail.height - 1
		})
		let top = this.data.bottom + this.data.scrollTop;
		wx.pageScrollTo({
			scrollTop: top,
			duration: 100
		})
		this.setData({
			["more.show"]: false,
			["emoji.show"]: false
		});
	},
	showEmoji() {
		this.setData({
			["emoji.show"]: true,
			["more.show"]: false,
			recordVisible: false
		});
		// 关闭手机键盘
		wx.hideKeyboard();
	},
	showMore() {
		this.setData({
			["more.show"]: true,
			["emoji.show"]: false
		});
		// 关闭手机键盘
		wx.hideKeyboard();
	},
	scrollToBottom() { // 滑动到最底部
		wx.pageScrollTo({
			scrollTop: 200000,
			duration: 10
		})
	},
	showMembers() { //显示群成员
		app.globalData.groupMembersMap = this.data.groupMembersMap;
		wx.navigateTo({
			url: '../groupMember/groupMember'
		});
	},
})