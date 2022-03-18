/* privateChat.js */
import EmojiDecoder from "../../../static/lib/EmojiDecoder";
const app = getApp()
let emojiUrl = 'https://imgcache.qq.com/open/qcloud/tim/assets/emoji/';
let emojiMap = {
	'[么么哒]': 'emoji_3@2x.png',
	'[乒乓]': 'emoji_4@2x.png',
	'[便便]': 'emoji_5@2x.png',
	'[信封]': 'emoji_6@2x.png',
	'[偷笑]': 'emoji_7@2x.png',
	'[傲慢]': 'emoji_8@2x.png'
};

Page({
	data: {
		bar_Height: 0,
		content: '',
		friend: null,
		currentUser: null,
		messages: [],
		//默认为false展示输入框, 为true时显示录音按钮
		recordVisible: false,
		//所有历史消息加载完成标识
		allHistoryLoaded: false,
		//定义表情列表
		emoji: {
			url: emojiUrl,
			map: emojiMap,
			show: false,
			decoder: new EmojiDecoder(emojiUrl, emojiMap),
		},
		more: { //更多按钮
			show: false
		},
		imService: null,
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
			duration: 100,
			success(e) {
				console.log(e);
			},
			fail(e) {
				console.log(e)
			}
		})
	},
	//失去聚焦
	blur: function (e) {
		this.setData({
			bottom: 0
		})
		wx.pageScrollTo({
			scrollTop: this.data.scrollTop,
			duration: 100,
			success(e) {
				console.log(e);
			},
			fail(e) {
				console.log(e)
			}
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
	onLoad: function (options) {
		// 获取初始数据并加载
		var imService = app.globalData.imService;
		var friend = app.globalData.friend;
		let friendId = app.globalData.friend.uuid;
		var currentUser = imService.currentUser;
		this.setData({
			bar_Height: app.bar_Height,
			friend: friend,
			imService: imService,
			currentUser: currentUser,
		});

		// 获取消息
		let messages = this.data.imService.getPrivateMessages(friendId);
		// 渲染表情与消息间隔5分钟显示时间
		this.renderMessages(messages);
		this.scrollToBottom();
		// 收到的消息设置为已读
		if (this.data.messages.length !== 0) {
			this.markPrivateMessageAsRead(friendId);
		}
		//传入监听器，收到一条私聊消息总是滚到到页面底部
		this.data.imService.onNewPrivateMessageReceive = (friendId, message) => {
			console.log(this.data.messages)
			if (friendId === this.data.friend.uuid) {
				this.renderMessages(this.data.messages);
				this.scrollToBottom();
				// 如果是好友发送则清除未读消息
				this.markPrivateMessageAsRead(friendId);
			}
		};
		if (options.msg) {
			let customMessage = wx.im.createCustomMessage({
				type: 'order',
				payload: app.globalData.ImMsg,
				to: {
					id: this.data.friend.uuid,
					type: 'private',
					data: {
						name: this.data.friend.name,
						avatar: this.data.friend.avatar
					}
				}
			});
			this.sendMessage(customMessage);
		}
	},
	onUnload() {
		//退出聊天页面之前，清空页面传入的监听器
		if (this.data.imService) {
			this.data.imService.onNewPrivateMessageReceive = (friendId, message) => {};
		}
	},
	onRecordStop(res) {
		// 发送语音
		let audioMessage = wx.im.createAudioMessage({
			to: {
				id: this.data.friend.uuid,
				type: wx.GoEasyIM.SCENE.PRIVATE,
				data: {
					name: this.data.friend.name,
					avatar: this.data.friend.avatar
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
					id: this.data.friend.uuid,
					type: wx.GoEasyIM.SCENE.PRIVATE,
					data: {
						name: this.data.friend.name,
						avatar: this.data.friend.avatar
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
						id: self.data.friend.uuid,
						type: wx.GoEasyIM.SCENE.PRIVATE,
						data: {
							name: self.data.friend.name,
							avatar: self.data.friend.avatar
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
						id: self.data.friend.uuid,
						type: wx.GoEasyIM.SCENE.PRIVATE,
						data: {
							name: self.data.friend.name,
							avatar: self.data.friend.avatar
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
		this.scrollToBottom();
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
		let self = this;
		let customMessage = this.selectComponent("#customMessage");
		customMessage.setData({
			show: true,
			to: self.data.friend,
			type: wx.GoEasyIM.SCENE.PRIVATE
		});
	},

	sendCustomMessage(event) {
		let customerMessage = event.detail;
		this.sendMessage(customerMessage);
		// 发送自定义消息关闭更多菜单栏
		this.setData({
			["more.show"]: false,
			["emoji.show"]: false,
		});
	},
	loadMoreHistoryMessage() {
		//历史消息
		let friendId = this.data.friend.uuid;
		let lastMessageTimeStamp = Date.now();
		let lastMessage = this.data.messages[0];
		if (lastMessage) {
			lastMessageTimeStamp = lastMessage.timestamp;
		}
		let currentLength = this.data.messages.length;
		let promise = app.globalData.imService.loadPrivateHistoryMessage(friendId, lastMessageTimeStamp);
		promise.then(messages => {
			console.log(messages)
			if (messages.length === currentLength) {
				this.setData({
					allHistoryLoaded: true
				})
			}
			this.renderMessages(this.data.messages);
			wx.stopPullDownRefresh();
		}).catch(e => {
			console.log(e)
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

	markPrivateMessageAsRead(friendId) {
		wx.im.markPrivateMessageAsRead(friendId)
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
	goCustomDetail(e) {
		console.log(e.currentTarget.dataset.item);
		wx.navigateTo({
			url: e.currentTarget.dataset.item.path,
		})
	}
})