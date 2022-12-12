module.exports = {
  tokenExpOptions: {
    tokenExpires: '4h', // "2 days", "10h", "7d"， 创建token时用, token自身有效时间
    dayjsExpiresNum: 2,  // 存表时 计算用。存在表中的有效时间（存表时的当前时间 + dayjsExpiresNum）
    dayjsExpiresUnit: 'hour', // day, hour, second
  },
  cookieOptions: {
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false
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
