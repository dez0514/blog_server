const jwt = require('jsonwebtoken');
const NodeRSA = require('node-rsa');
const crypto = require('crypto');
// https://www.cnblogs.com/lonae/p/14033508.html
const secret = new NodeRSA({
  b: 512
}).exportKey('public');
// 加密必要参数
const ALGORITHM = 'aes-192-cbc';
const PASSWORD = 'icanchangeit';
// 改为使用异步的 `crypto.scrypt()`。
const key = crypto.scryptSync(PASSWORD, 'zwadeisafunyboy', 24);
// 使用 `crypto.randomBytes()` 生成随机的 iv 而不是此处显示的静态的 iv。
const iv = Buffer.alloc(16, 16); // 初始化向量。

const getToken = (userInfo, time) => {
  // 创建token并导出
  const token = jwt.sign(userInfo, secret, {
    expiresIn: time
  }) // 60, "2 days", "10h", "7d".
  // token加密
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return {
    token,
    encrypted
  }
}
// 解析token // 形参tokens传入的是加密的token
const decodeToken = (tokens) => {
  if (!tokens) return null
  tokens = tokens.replace(/\s+/g, ''); // 空格替换
  // 解密
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  // 使用相同的算法、密钥和 iv 进行加密
  let decrypted = decipher.update(tokens, 'hex', 'utf8')
  try {
    decrypted += decipher.final('utf8')
  } catch (error) {
    return null
  }
  const decoded = jwt.decode(decrypted, secret) // jwt.verify
  // console.log('decoded===', decoded)
  return decoded
};
// 解析未加密的token: 例 refresh_token 没有在接口传递，存取都没加密
const decodeSimpleToken = (token) => {
  if (!token) return null
  const decoded = jwt.decode(token, secret)
  return decoded
}
module.exports = {
  getToken,
  decodeToken,
  decodeSimpleToken
}