// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')
const rp = require('request-promise')

// 初始化 cloud
cloud.init()

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看
  url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + wxContext.APPID + "&secret=6e1dd63a01e11764ac5e13885f9c4db1&js_code=" + event.code + "&grant_type=authorization_code";
  console.log("url " + url)
  return await rp(url, function(err, response, body) {
    if (!response.error && response.statusCode == 200) {
      console.log('res' + response)
    } else {
      console.log('resfail' + response.error)
    }
  })
}