const express = require('express')
const app = express()
const morgan = require('morgan')
require('colors')
const dotenv = require('dotenv')
const path = require('path')
const articleApi = require('./router')
const tagApi = require('./router/tag')
const companyApi = require('./router/company')
const projectApi = require('./router/projects')
const resumeApi = require('./router/resume')
const fileApi = require('./router/file')
const userApi = require('./router/user')
const commentApi = require('./router/comments')
const tokenjs = require('./utils/token')
const json = require('./utils/response')
const query = require('./utils/pool_async')
const utils = require('./utils/util')
const cookieParser = require('cookie-parser')
// const session = require("express-session")
// const RedisStore = require("connect-redis")(session)
// const redis = require('./redis/redis.js').redis;

dotenv.config({
  path: path.join(__dirname, './config/config.env')
});

app.all('*', function(req, res, next){
  res.header("Access-Control-Allow-Credentials", true)
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  // res.header("Content-Type", "application/json;charset=utf-8") // node 图片中文文件名时乱码
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, token, Accept,X-Requested-With')
  res.header('Access-Control-Expose-Headers', 'token')
  res.header('X-Powered-By', ' 3.2.1')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next()
  }
})
// const salt = 'sessiontest'
// app.use(session({
//   store: new RedisStore({
//     client: redis,
//     prefix: 'zwd'
//   }),
//   cookie: { maxAge: 1 * 60 * 60 * 1000 }, //默认1小时
//   secret: salt,
//   resave: true,
//   saveUninitialized: true
// }));
app.use(cookieParser())
// app.use(cookieParser(salt));
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
  const project = req.headers && req.headers.projectid || ''
  if (project === 'client') { // 前台项目接口 不需要token
    next()
    return
  }
  const noNeedCheckUrls = ['/user/register', '/user/login', '/user/repos', '/article/archive_timeline']
  if (noNeedCheckUrls.includes(req.path)) { // 无需校验token的接口
    next()
    return
  }
  const token = (req.headers && req.headers.token) || ''
  const decoded = tokenjs.decodeToken(token)
  const isTokenValid = (decoded && decoded.exp > new Date() / 1000) || false
  const username = (decoded && decoded.username) || ''
  if (!isTokenValid || !username) {
    json(res, 417, null, 'invalid token!')
    return
  }
  // 查询username的token(未加密的)，decode出来的信息 和 接口传入的一致 就通过
  const sql = 'SELECT token FROM users WHERE username=?;'
  const result = await query(sql, [username])
  if(!result || result.length === 0 || !result[0].token) {
    json(res, 417, null, 'invalid token!')
    return
  }
  const dbToken = result[0].token
  const dbDecode = tokenjs.decodeSimpleToken(dbToken)
  // console.log('decode===', decoded)
  // console.log('dbDecode===', dbDecode)
  if (!utils.isSimpleObjValEquel(decoded, dbDecode)) {
    json(res, 417, null, 'invalid token!')
    return
  }
  res.setHeader('token', token)
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
  //   res.setHeader('token', newToken.encrypted) // 设置响应头
  //   next()
  // }
  next()
})

app.use('/imgs', express.static(path.join(__dirname, 'imgs')))
app.use('/api/article', articleApi)
app.use('/api/tag', tagApi)
app.use('/api/company', companyApi)
app.use('/api/project', projectApi)
app.use('/api/resume', resumeApi)
app.use('/api/file', fileApi)
app.use('/api/user', userApi)
app.use('/api/comment', commentApi)

const port = process.env.PORT
app.listen(port, () => {
  // console.log(`Server环境：${process.env.NODE_ENV}，端口：${port}`.magenta.bold)
  const log = 'Server环境：'.magenta + `${process.env.NODE_ENV}`.red + '，端口：'.magenta + `${port}`.red
  console.log(log.bold)
})
module.exports = app