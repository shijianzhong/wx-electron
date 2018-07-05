const Padchat = require('padchat-sdk')
const qrcode  = require('qrcode-terminal')
const url     = 'ws://52.80.34.207:7777'
const wx      = new Padchat(url)

wx
  .on('open', async () => {
    let ret
    ret = await wx.init()
    if (!ret.success) {
      console.error('初始化失败! ret:', ret)
      return
    }
    console.log('初始化成功! ret:', ret)

    ret = await wx.login()
    if (!ret.success) {
      console.error('请求登录失败! ret:', ret)
      return
    }
    console.log('请求登录成功! ret:', ret)
  })
  .on('qrcode', data => {
    if (data.url) {
      console.log('登陆二维码url: %s ,请扫码登陆：', data.url)
      qrcode.generate(data.url)
      return
    } else if (data.qrCode) {
      console.log('登陆二维码图片数据，请输出到文件扫码。')
      return
    }
    console.error('没有发现二维码数据!')
  })
  .on('scan', data => {
    switch (data.status) {
      case 0:
        console.log('等待扫码...', data)
        break;
      case 1:
        console.log('已扫码，请在手机端确认登陆...', data)
        break;
      case 2:
        switch (data.subStatus) {
          case 0:
            console.log('扫码成功！登陆成功！', data)
            break;
          case 1:
            console.log('扫码成功！登陆失败！', data)
            break;
          default:
            console.log('扫码成功！未知状态码！', data)
            break;
        }
        break;
      case 3:
        console.log('二维码已过期', data)
        break;
      case 4:
        console.log('手机端已取消登陆！', data)
        break;
      default:
        break;
    }
  })
  .on('login', () => {
    console.log('登陆成功!')
  })
  .on('loaded', () => {
    console.log('载入通讯录完成!')
  })
  .on('push', data => {
    if (data.mType === 2) {
      console.log('接收到联系人/群: %s', data.nickName)
      return
    }
    console.log('收到新消息: %o', data)
  })