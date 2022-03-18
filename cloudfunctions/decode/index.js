// 云函数入口文件
const cloud = require('wx-server-sdk')
var WXBizDataCrypt = require('./WXBizDataCrypt')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  var pc = new WXBizDataCrypt(wxContext.APPID.toString(), event.session_key)
  var data = pc.decryptData(event.encryptedData, event.iv)
  return data;
}