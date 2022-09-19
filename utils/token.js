const jwt = require('jsonwebtoken');
const NodeRSA = require('node-rsa');
const crypto = require('crypto');

// const secret = 'token'; // 密钥，不能丢
const secret = new NodeRSA({ b: 512 }).exportKey('public');
// 加密必要参数
const ALGORITHM = 'aes-192-cbc';
const PASSWORD = 'icanchangeit';
// 改为使用异步的 `crypto.scrypt()`。
const key = crypto.scryptSync(PASSWORD, 'zwadeisafunyboy', 24);
// 使用 `crypto.randomBytes()` 生成随机的 iv 而不是此处显示的静态的 iv。
const iv = Buffer.alloc(16, 16); // 初始化向量。

/**
 * token生成
 * @param <Object> userInfo - 用户信息
 * @param <string | Number> time - 过期时间
 */
const getToken = (userInfo, time) => {
    // 创建token并导出
    const token = jwt.sign(userInfo, secret, {
      expiresIn: time
    }) // 60, "2 days", "10h", "7d".
    // token加密
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(token, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return { token , encrypted }
};

/**
 * token验证
 * @param String tokens
 * @param bool type, token: true,refreshToken: false
 * @return bool 过期: false, 不过期: true
 */
const checkToken = (tokens) => {
    tokens = tokens.replace(/\s+/g, ''); // 空格替换
    // 解密
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    // 使用相同的算法、密钥和 iv 进行加密
    let decrypted = decipher.update(tokens, 'hex', 'utf8')
    try {
        decrypted += decipher.final('utf8')
    } catch (error) {
        return false
    }
    const decoded = jwt.decode(decrypted, secret)
    // 600秒过期预警 refreshToken用
    // if (type && decoded.exp > new Date() / 1000 && decoded.exp < new Date() / 1000 + 600) {
    //     ctx.append('refresh', true);
    // } else {
    //     ctx.remove('refresh');
    // }
    console.log('decoded===', decoded)
    return !(decoded && decoded.exp <= new Date() / 1000);
};

module.exports = { getToken, checkToken }