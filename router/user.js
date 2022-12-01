const express = require('express')
const router = express.Router()
const query = require('../utils/pool_async')
const json = require('../utils/response')
// const jwt = require('jsonwebtoken')
const tokenjs = require('../utils/token')
const axios = require('axios')
const utils = require('../utils/util')

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

    // const user = {
    //   username: username,
    //   token: token // 未加密
    // }
    // req.session.user = user

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
})

// 1.只接收到邮箱时：先查询 email 表，如果没有此邮箱, 响应提示输入 nickname，如果查到邮箱，登录成功
// 2.接收到邮箱和nickname时，先查email, 如果没有就添加，如果有就比对nickname,如果nickname不一致就响应不一致，如果一致就登录成功
router.post('/clientLogin', async function (req, res) {
  const params = req.body;
  try {
    const { email, nickname, weburl } = params
    if(!email) {
      json(res, 1, null, '请输入邮箱！')
      return
    }
    const sql = `select * from emails where email=?`
    const result = await query(sql, [email])
    if(result.length === 0) { // 无此邮箱
      if(!nickname) { // 提示输入nickname
        json(res, 1, null, '请输入昵称！')
        return
      }
      // nickname是否存在, 直接注册，unique, 如果重复会注册失败
      // 注册存一个， 头像：getRandomAvatar
      let fields = ['email', 'nickname', 'avatar']
      if (weburl) fields.push('weburl');
      const locs = new Array(fields.length).fill('?')
      const addSql = `INSERT INTO emails(${fields.join(',')}) VALUES(${locs.join(',')});`
      const randomAvatar = utils.getRandomAvatar()
      let vals = [email, nickname, randomAvatar]
      if (weburl) vals.push(weburl);
      const addResult = await query(addSql, vals)
      if(!addResult || !addResult.affectedRows || addResult.affectedRows === 0) {
        json(res, 1, addResult, '网络错误，数据库操作失败')
        return
      }
      const data = {
        email,
        nickname,
        avatar: randomAvatar,
        weburl
      }
      json(res, 0, data, '登录成功')
    } else { // 查到此用户，如果输了nickname 且与查到的不一致就提示
      if(nickname && result && result[0] && result[0].nickname && result[0].nickname !== nickname) { // 提示输入nickname
        json(res, 1, null, '与初次登录时设置的昵称不一致，可以仅用邮箱登录')
        return
      }
      // 如果首次没填weburl，后面登录时有 weburl 过来也给它update进去
      if(weburl && !(result && result[0] && result[0].weburl)) {
        const sql = `UPDATE emails SET weburl=? WHERE email=?`
        const updateResult = await query(sql, [weburl, email])
        if(!updateResult || !updateResult.affectedRows || updateResult.affectedRows === 0) {
          json(res, 1, updateResult, '网络错误，数据库操作失败')
          return
        }
        const info = {
          email,
          nickname: result[0] && result[0].nickname,
          avatar: result[0] && result[0].avatar,
          weburl: weburl // 更新后的
        }
        json(res, 0, info , '登录成功')
        return
      }
      const data = {
        email,
        nickname: result[0] && result[0].nickname,
        avatar: result[0] && result[0].avatar,
        weburl: (result[0] && result[0].weburl) || ''
      }
      // 没输入nickname, weburl 就直接登录成功
      json(res, 0, data, '登录成功')
    }
  } catch (err) {
    if(err.code === 'ER_DUP_ENTRY') {
      json(res, 1, err, '该昵称已被使用！')
      return
    }
    json(res, 1, err, '登录失败')
  }
})
router.get('/getClientInfo', async function (req, res) {
  const { email } = req.query;
  try {
    if(!email) {
      json(res, 1, null, '参数错误！')
      return
    }
    const sql = `select * from emails where email=?`
    const result = await query(sql, [email])
    if(result.length > 0) {
      const data = {
        email,
        nickname: result[0] && result[0].nickname,
        avatar: result[0] && result[0].avatar,
        weburl: (result[0] && result[0].weburl) || ''
      }
      json(res, 0, data, '该邮箱未注册')
    } else {
      json(res, 1, null, '该邮箱未注册')
    }
  } catch(err) {
    json(res, 1, err, '查询失败')
  }
})
router.post('/saveClientInfo', async function (req, res) {
  const params = req.body;
  try {
    const { email, nickname, weburl } = params
    if(!email) {
      json(res, 1, null, '参数错误')
      return
    }
    if(!nickname) {
      json(res, 1, null, '请输入昵称！')
      return
    }
    let url = weburl || ''
    const sql = `UPDATE emails SET nickname=?,weburl=? WHERE email=?`
    const result = await query(sql, [nickname, url, email])
    if(!result || !result.affectedRows || result.affectedRows === 0) {
      json(res, 1, result, '更新失败')
      return
    }
    const info = {
      email,
      nickname,
      weburl: url
    }
    json(res, 0, info, '更新成功')
  } catch (err) {
    json(res, 1, err, '更新失败')
  }
})
module.exports = router;
