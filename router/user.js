const express = require('express')
const router = express.Router()
// const sqlTool = require('../utils/handle')
const query = require('../utils/pool_async')
const json = require('../utils/response')
const jwt = require('jsonwebtoken')
const tokenjs = require('../utils/token')

// 注册
router.post('/register',async function (req, res) {
  const params = req.body;
  try {
    const { username, password } = params
    const sqlQuery = `SELECT username, password FROM users WHERE username=?;`
    const data = await query(sqlQuery, username)
    console.log(data)
    if(data && data.length > 0) {
      json(res, 1, null, '用户已存在!')
      return
    }
    const sql =  `INSERT INTO users(username, password) VALUES(?,?);`
    //todo: 加密
    const vals = [username, password]
    const insertData = await query(sql, vals)
    json(res, 0, insertData, '注册成功!')
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
    const { token, encrypted } = tokenjs.getToken({ username }, 6000) // 存未加密的 ，响应加密的
    const updateSql = `UPDATE users SET token=? WHERE username=?;`
    const updateResult = await query(updateSql, [token, username])
    console.log('updateResult===', updateResult)
    if (Number(updateResult.affectedRows) === 1) {
      json(res, 0, { token: encrypted, userinfo: { username } }, '登录成功!')
    }
  } catch(err) {
    console.log(err)
    json(res, 1, err, '登录失败!')
  }
});

module.exports = router;
