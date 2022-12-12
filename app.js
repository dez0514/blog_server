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
// const utils = require('./utils/util')
const cookieParser = require('cookie-parser')
const schedule = require('node-schedule');
const expressip = require('express-ip');
const dayjs = require('dayjs')
const configOption = require('./config/config')
app.use(expressip().getIpInfoMiddleware); // req.ipInfo
// const session = require("express-session")
// const RedisStore = require("connect-redis")(session)
// const redis = require('./redis/redis.js').redis;
const { tokenExpires, dayjsExpiresNum, dayjsExpiresUnit } = configOption.tokenExpOptions
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
  const oldDecrypToken = (req.headers && req.headers.token) || '' // 传过来的是加密的
  // console.log('old des==', oldDecrypToken)
  const decoded = tokenjs.decodeToken(oldDecrypToken)
  const username = (decoded && decoded.username) || ''
  // console.log('decoded info==', decoded)
  if (!username) {
    json(res, 417, null, 'invalid token!')
    return
  }
  // 查询username的token(未加密的)，decode出来的信息 和 接口传入的一致 就通过
  const sql = 'SELECT token,expires_time FROM users WHERE username=?;'
  const result = await query(sql, [username])
  // console.log('search result==', result)
  if(!result || result.length === 0 || !result[0].token) {
    json(res, 417, null, 'invalid token!')
    return
  }
  const dbExp = result[0].expires_time
  const isOutExp = !dbExp || (dayjs(dbExp).valueOf() <= (new Date().getTime())) // 过期
  if(isOutExp) {
    json(res, 417, null, 'invalid token!')
    return
  }
  // console.log('isOutExp==', isOutExp, dbExp)
  // 没过期，有接口操作时 更新时间，如果token本身过期了就换token
  const isTokenExp = (decoded && (decoded.exp * 1000) > (new Date().getTime())) || false
  const new_expires_time = dayjs().add(dayjsExpiresNum, dayjsExpiresUnit).format('YYYY-MM-DD HH:mm:ss')
  if(isTokenExp) { // token本身没过期
    // console.log('isTokenExp==', isTokenExp)
    const updateSql = `UPDATE users SET expires_time=? WHERE username=?;`
    const updateResult = await query(updateSql, [new_expires_time, username])
    // console.log('updateResult result==', updateResult)
    if(updateResult && updateResult.affectedRows && updateResult.affectedRows === 0) {
      json(res, 417, null, '网络错误，数据更新失败!')
      return
    }
    next()
  } else {
    // console.log('isTokenExp222==', isTokenExp)
    const newTokenInfo = tokenjs.getToken({ username }, tokenExpires) // 新创建token 存未加密的 ，响应加密的
    const updateSql = `UPDATE users SET token=?,expires_time=? WHERE username=?;`
    const updateResult = await query(updateSql, [newTokenInfo.token, new_expires_time, username]) 
    // console.log('updateResult result222==', updateResult)
    if(updateResult && updateResult.affectedRows && updateResult.affectedRows === 0) {
      json(res, 417, null, '网络错误，数据更新失败!')
      return
    }
    res.setHeader('token', newTokenInfo.encrypted)
    next()
  }
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

// 定时任务 // 每天的凌晨0点0分0秒触发
schedule.scheduleJob('0 0 0 * * *', () => {
  console.log('===定时清除点赞和浏览过期的数据!===');
  // 清除 like_ips, view_ips 表里 过期数据
  const exp_stamp = new Date().getTime() - 24 * 60 * 60 * 1000
  const exp_date = dayjs(new Date(exp_stamp)).format('YYYY-MM-DD HH:mm:ss')
  const sql = `delete from like_ips where like_time <= ?`
  const sqlv = `delete from view_ips where view_time <= ?;`
  query(`${sql};${sqlv}`, [exp_date, exp_date])
});

const port = process.env.PORT
app.listen(port, () => {
  // console.log(`Server环境：${process.env.NODE_ENV}，端口：${port}`.magenta.bold)
  const log = 'Server环境：'.magenta + `${process.env.NODE_ENV}`.red + '，端口：'.magenta + `${port}`.red
  console.log(log.bold)
})
module.exports = app