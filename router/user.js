const express = require('express')
const router = express.Router()
// const sqlTool = require('../utils/handle')
const query = require('../utils/pool_async')
const json = require('../utils/response')
const jwt = require('jsonwebtoken')

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
    // todo: jwt
    // 登陆成功生成 token 返回给客户端 第一个参数 是 组 ，第二个是 私钥
    const token = jwt.sign({ username }, 'zwdisagoodboy')
    json(res, 0, { token }, '登录成功!')
  } catch(err) {
    json(res, 1, err, '登录失败!')
  }
});

module.exports = router;
