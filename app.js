const express = require('express')
const app = express()
const morgan = require('morgan')
require('colors')
const dotenv = require('dotenv')
const path = require('path')
const articleApi = require('./router')
const tagApi = require('./router/tag')
const fileApi = require('./router/file')
const userApi = require('./router/user')
// const tokenjs = require('./utils/token')
// const json = require('./utils/response')
// const query = require('./utils/pool_async')

dotenv.config({
  path: path.join(__dirname, './config/config.env')
});

app.all('*', function(req, res, next){
  res.header("Access-Control-Allow-Credentials", true)
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  // res.header("Content-Type", "application/json;charset=utf-8") // node 图片中文文件名时乱码
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Authorization')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept,X-Requested-With')
  // res.header('X-Powered-By', ' 3.2.1')
  next()
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(morgan("dev"))

app.get('/', (req, res) => {
  res.status(404).send({
    data: null,
    code: 404,
    message: 'Not Found'
  })
})

//  拦截 /api 下的所有请求 验证 token
app.use('/api', async(req, res, next) => {
  // const noNeedCheckUrls = ['/user/register', '/user/login']
  // if (noNeedCheckUrls.includes(req.path)) { // 无需校验token的接口
  //   next()
  //   return
  // }
  // const token = (req.headers && req.headers.authorization) || ''
  // const decoded = tokenjs.decodeToken(token)
  // const isTokenValid = (decoded && decoded.exp > new Date() / 1000) || false
  // if (!isTokenValid) {
  //   const username = (decoded && decoded.username) || ''
  //   if (!username) {
  //     json(res, 417, null, 'invalid token!')
  //     return
  //   }
  //   const sql = 'SELECT refresh_token FROM users WHERE username=?;'
  //   const result = await query(sql, [username])
  //   if(!result || result.length === 0 || !result[0].refresh_token) {
  //     json(res, 417, null, 'invalid token!')
  //     return
  //   }
  //   const refresh_token = result[0].refresh_token
  //   const decodeRefresh = tokenjs.decodeSimpleToken(refresh_token)
  //   console.log('decodeRefresh===', decodeRefresh)
  //   const refreshIsValid = (decodeRefresh && decodeRefresh.exp > new Date() / 1000) || false
  //   if (!refreshIsValid) {
  //     json(res, 417, null, 'invalid token!')
  //     return
  //   }
  //   // todo: 如果失效，判断 refresh_token 是否有效，有效就刷新token，否则再报417
  //   const newToken = tokenjs.getToken({ username }, '120s')
  //   const updateSql = `UPDATE users SET token=? WHERE username=?;`
  //   const updateResult = await query(updateSql, [newToken.token, username])
  //   if (Number(updateResult.affectedRows) !== 1) {
  //     json(res, 417, null, 'invalid token!')
  //     return
  //   }
  //   res.setHeader('Authorization', newToken.encrypted) // 设置响应头
  //   next()
  // }
  next()
})

app.use('/imgs', express.static(path.join(__dirname, 'imgs')))
app.use('/api/article', articleApi)
app.use('/api/tag', tagApi)
app.use('/api/file', fileApi)
app.use('/api/user', userApi)

const port = process.env.PORT
app.listen(port, () => {
  // console.log(`Server环境：${process.env.NODE_ENV}，端口：${port}`.magenta.bold)
  const log = 'Server环境：'.magenta + `${process.env.NODE_ENV}`.red + '，端口：'.magenta + `${port}`.red
  console.log(log.bold)
})
module.exports = app