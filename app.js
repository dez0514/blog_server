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
const tokenjs = require('./utils/token')
const json = require('./utils/response')

dotenv.config({
  path: path.join(__dirname, './config/config.env')
});

app.all('*', function(req, res, next){
  res.header("Access-Control-Allow-Credentials", true)
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  // res.header("Content-Type", "application/json;charset=utf-8") // node 图片中文文件名时乱码
  // res.setHeader('Content-Type', 'application/json;charset=utf-8')

  // res.header('Access-Control-Allow-Headers', 'X-Requested-With, mytoken')
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
app.use('/api', (req, res, next) => {
  // console.log('req path====', req.path)
  // console.log('req token====', req.headers.authorization)
  const noNeedCheckUrls = ['/user/register', '/user/login']
  if (noNeedCheckUrls.includes(req.path)) { // 无需校验token的接口
    next()
    return
  }
  const token = (req.headers && req.headers.authorization) || ''
  const isTokenValid = tokenjs.checkToken(token)
  console.log('app token isValid==', isTokenValid)
  if (!isTokenValid) {
    // todo: 如果失效，判断 refresh_token 是否有效，有效就刷新token为有效，否则再报417
    json(res, 417, null, 'invalid token!')
    return
  }
  //todo: 如果有效 更新token的有效时间（用户有操作时，一直有效，停止一段时间操作时就跳登录）
  next()
})

app.use('/imgs', express.static(path.join(__dirname, 'imgs')))
app.use('/api/article', articleApi)
app.use('/api/tag', tagApi)
app.use('/api/file', fileApi)
app.use('/api/user', userApi)

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server环境：${process.env.NODE_ENV}，端口：${port}`.magenta.bold)
})
module.exports = app