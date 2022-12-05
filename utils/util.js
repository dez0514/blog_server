const nodemailer = require('nodemailer')
// 判断两个简单对象值是否相等
const isSimpleObjValEquel = (obj1, obj2) => {
  const arr = Object.keys(obj1)
  const temp = Object.keys(obj2)
  if(arr.length !== temp.length) return false
  const isEquel = arr.every(item => (item in obj2) && (obj2[item] === obj1[item]))
  return isEquel
}

const isFalse = (val) => {
  return val === '' || val === null || typeof val === 'undefined' || val === 'undefined'
}

const getRandomAvatar = () => {
  // 0 - 20 的随机数
  const num =  Math.floor(Math.random() * 20)
  // 通过 /blogSystemFile 代理
  return `/blogSystemFile/imgs/avatar/${num}.jpg`
}

const userEmail = '***@qq.com'
const userCode = '***'
const sendEmail = (to_email, subject, text) => {
  let transporter = nodemailer.createTransport({
    service: "qq", // from邮箱是什么就写什么,qq/163
    secure: true, // 安全的发送模式
    auth: {
      user: userEmail, // 全局变量 发件人邮箱
      pass: userCode // 授权码
    }
  })
  let mailOptions = {
    from: userEmail,
    to: to_email,
    subject: subject,
    text: text
  }
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log('err==', err);
    } else {
      console.log('发送成功==', data);
    }
  })
}

module.exports = {
  isSimpleObjValEquel,
  isFalse,
  getRandomAvatar,
  sendEmail
}