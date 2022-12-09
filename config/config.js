module.exports = {
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
