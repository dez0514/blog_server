const express = require('express')
const router = express.Router()
const query = require('../utils/pool_async')
const json = require('../utils/response')
// const jwt = require('jsonwebtoken')
const tokenjs = require('../utils/token')
const axios = require('axios')

// 注册
router.post('/register', async function (req, res) {
  const params = req.body;
  try {
    const { username, password } = params
    const sqlQuery = `SELECT username, password FROM users WHERE username=?;`
    const data = await query(sqlQuery, username)
    // console.log(data)
    if(data && data.length > 0) {
      json(res, 1, null, '用户已存在!')
      return
    }
    const sql =  `INSERT INTO users(username, password) VALUES(?,?);`
    //todo: 加密
    const vals = [username, password]
    const insertData = await query(sql, vals)
    if (insertData && insertData.affectedRows && insertData.affectedRows > 0) {
      json(res, 0, insertData, '注册成功!')
    } else {
      json(res, 1, insertData, '注册失败!')
    }
  } catch(err) {
    json(res, 1, err, '注册失败!')
  }
});
// 登录
router.post('/login', async function (req, res) {
  const params = req.body;
  try {
    const { username, password } = params
    const sqlQuery = `SELECT username, password FROM users WHERE username=?;`
    const data = await query(sqlQuery, username)
    console.log(data[0])
    if(!data || data.length === 0) {
      json(res, 1, null, '用户不存在!')
      return
    }
    if(!data[0].username || data[0].password !== password) {
      json(res, 1, null, '用户名或密码不正确!')
      return
    }
    const { token, encrypted } = tokenjs.getToken({ username }, '1day') // 120s 存未加密的 ，响应加密的
    const updateSql = `UPDATE users SET token=? WHERE username=?;`
    const updateResult = await query(updateSql, [token, username])
    // const refreshTokenData = tokenjs.getToken({ username }, '600s')
    // const refresh_token = refreshTokenData.token
    // const updateSql = `UPDATE users SET token=?,refresh_token=? WHERE username=?;`
    // const updateResult = await query(updateSql, [token, refresh_token, username])
    // console.log('updateResult===', updateResult)
    if (updateResult && updateResult.affectedRows && updateResult.affectedRows > 0) {
      json(res, 0, { token: encrypted, userinfo: { username } }, '登录成功!')
    } else {
      json(res, 1, updateResult, '登录失败!')
    }
  } catch(err) {
    console.log(err)
    json(res, 1, err, '登录失败!')
  }
});

router.get('/userinfo', function(req, res) {
  const token = req.headers.token || ''
  const data = tokenjs.decodeToken(token)
  const username = data.username
  json(res, 0, { username }, '查询成功!')
})
// 退出登录 删掉 用户表中token // 其实token可能还有效，但是不给用了
// 每次接口token校验时先判断当前token在不在表中，不在直接417
router.post('/logout', async function (req, res) {
  try {
    const token = req.headers.token || ''
    const data = tokenjs.decodeToken(token)
    const username = data.username
    const sql = `UPDATE users SET token=NULL WHERE username=?`
    const result = await query(sql, [username])
    console.log(result)
    if (result && result.affectedRows && result.affectedRows > 0) {
      json(res, 0, null, '退出成功!')
    } else {
      json(res, 1, result, '退出失败!')
    }
  } catch(err) {
    json(res, 1, err, '退出失败!')
  }
})

router.get('/repos', async function (req, res) {
  try {    
    const response = await axios({
      method: 'get',
      url: 'http://api.github.com/users/dez0514/repos'
    })
    if (response && ('data' in response)) {
      const list = response.data.map(item => {
        return {
          id: item.id,
          name: item.name,
          html_url: item.html_url,
          created_at: item.created_at,
          updated_at: item.updated_at,
          description: item.description,
          forks_count: item.forks_count,
          stargazers_count: item.stargazers_count,
          subscribers_count: item.subscribers_count
        }
      })
      json(res, 0, list, '查询成功！')
    } else {
      json(res, 1, response, '查询失败!')
    }
  } catch(err) {
    json(res, 1, err, '查询失败!')
  }
  // request.get('http://api.github.com/users/dez0514/repos', {
  //   headers: {
  //     'User-Agent': 'request'
  //   },
  //   json: true
  // }, (error, response, body) => {
  //   console.log(response)
  //   const list = body.map(item => {
  //     return {
  //       id: item.id,
  //       name: item.name,
  //       html_url: item.html_url,
  //       created_at: item.created_at,
  //       updated_at: item.updated_at,
  //       description: item.description,
  //       forks_count: item.forks_count,
  //       stargazers_count: item.stargazers_count,
  //       subscribers_count: item.subscribers_count
  //     }
  //   })
  //   json(res, 0, list, '查询成功！')
  // })
})

module.exports = router;
