import axios from 'axios'
import rootConfig from '..config/config'
const qqHost = 'https://graph.qq.com'
// 获取access_token by qq
const getAccessTokenByQQ = async (code) => {
  const url = `${qqHost}/oauth2.0/token`
  const {
    data
  } = await axios({
    method: 'GET',
    url,
    params: {
      code,
      grant_type: 'authorization_code',
      client_id: rootConfig.qq.oauth.appId,
      client_secret: rootConfig.qq.oauth.appKey,
      redirect_uri: rootConfig.qq.oauth.redirect_uri,
      fmt: 'json'
    }
  })
  return data.access_token
}
// 获取openid
const getOpenIdByQQ = async (access_token) => {
  const url = `${qqHost}/oauth2.0/me`
  const {
    data
  } = await axios({
    method: 'GET',
    url,
    params: {
      access_token,
      fmt: 'json'
    }
  })
  return data.openid
}

// 获取QQ信息
const getUserInfoByQQ = async (access_token, openid) => {
  const {
    data
  } = await axios({
    method: 'get',
    url: `${qqHost}/user/get_user_info`,
    params: {
      access_token,
      oauth_consumer_key: rootConfig.qq.oauth.appId,
      openid
    }
  })
  return {
    name: data.nickname,
    avatar: data.figureurl_2
  }
}

// 获取access_token by github
const getAccessTokenByGithub = async (code) => {
  const url = `https://github.com/login/oauth/access_token?client_id=${rootConfig.github.oauth.client_id}&client_secret=${rootConfig.github.oauth.client_secret}&code=${code}`
  const {
    data
  } = await axios({
    method: 'POST',
    url,
    headers: {
      accept: 'application/json'
    }
  })
  return data.access_token
}
// 获取github信息
const getUserInfoByGithub = async (token) => {
  const {
    data
  } = await axios({
    method: 'get',
    url: `https://api.github.com/user`,
    headers: {
      accept: 'application/json',
      Authorization: `token ${token}`
    }
  })
  console.log(data)
  return {
    name: data.name,
    url: data.blog,
    email: data.email,
    avatar: data.avatar_url
  }
}
