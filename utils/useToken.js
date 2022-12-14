const jwt = require('jsonwebtoken');
const configOption = require('../config/config')
const secret = configOption.secret
// console.log('secret==', secret)
// 生成token
const getToken = (userInfo, time) => {
  const token = jwt.sign(userInfo, secret, { expiresIn: time }) // 60, "2 days", "10h", "7d".
  return token
}
// 解析token
const decodeToken = (token) => {
  if (!token) return null
  const decoded = jwt.decode(token, secret) // jwt.verify
  // console.log('decoded===', decoded)
  return decoded
};

module.exports = {
  getToken,
  decodeToken
}