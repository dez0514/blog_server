const NodeRSA = require('node-rsa');
const secretkey = new NodeRSA({ b: 512 }).exportKey('public');
// 注意：每次保存代码时，此盐值就不一样了，所以登录的token加解密都不一样了，会跳出登录
module.exports = {
  secret: secretkey,
  passwordSecret: 'password', // 密码加密的盐值
  tokenExpOptions: {
    tokenExpires: '2h', // "2 days", "10h", "7d"， 创建token时用, token自身有效时间
    redisTtl: 2 * 60 * 60 // 秒数 ，redis key 的过期时间2h
  },
  cookieOptions: {
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
    expires: 2 * 60 * 60 * 1000 // 使用时用当前时间加此时间
    // maxAge: 200000,
  },
  github: {
    username: '',
    token: '',
    oauth: {
      url: 'https://github.com/login/oauth/authorize',
      redirect_uri: '',
      client_id: '',
      client_secret: ''
    }
  },
  qq: {
    oauth: {
      url: 'https://graph.qq.com/oauth2.0/authorize',
      redirect_uri: '',
      appId: '',
      appKey: ''
    }
  }
}
