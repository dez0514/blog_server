const cryptojs = require('crypto-js')
const configOption = require('../config/config')
const secretkey = configOption.secret
// 加密
function encryption(str, secret = secretkey) {
  const res = cryptojs.AES.encrypt(str, secret).toString()
  // console.log('加密内容:', res)
  return res
}
// 解密
function decryption(str, secret = secretkey) {
  const bytes = cryptojs.AES.decrypt(str, secret)
  const res = bytes.toString(cryptojs.enc.Utf8)
  // console.log('解密内容:', res)
  return res
}
module.exports = {
  encryption,
  decryption
}