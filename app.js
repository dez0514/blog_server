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
const useToken = require('./utils/useToken')
const useCrypto = require('./utils/useCrypto')
const json = require('./utils/response')
const cookieParser = require('cookie-parser')
const expressip = require('express-ip');
const configOption = require('./config/config')
const redisCache = require('./redis/cache')
app.use(expressip().getIpInfoMiddleware); // req.ipInfo
const { tokenExpires, redisTtl } = configOption.tokenExpOptions
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
app.use(cookieParser())
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
  const receiveToken = (req.headers && req.headers.token) || '' // 传过来的是加密的
  // console.log('old des==', receiveToken)
  // 先解密，再解析
  const decryptToken = useCrypto.decryption(receiveToken)
  const decoded = useToken.decodeToken(decryptToken)
  const username = (decoded && decoded.username) || ''
  // console.log('decoded info==', decoded)
  if (!username) {
    json(res, 417, null, 'invalid token!')
    return
  }
  // 查询redis, 如果redis中失效就拿不到, 或者 解密token ！== redisToken
  const redisToken = await redisCache.get(username)
  if(!redisToken || redisToken !== decryptToken) {
    json(res, 417, null, 'invalid token!')
    return
  }
  // redis 没过期时，判断token自身是否过期， token自身没过期就只更新redis过期时间,过期就换token且更新redis过期时间
  const isTokenExp = (decoded && (decoded.exp * 1000) > Date.now()) || false
  if(isTokenExp) {
    await redisCache.expire(username, redisTtl)
    next()
  } else {
    const newToken = useToken.getToken({ username }, tokenExpires) // 存未加密的
    const newEncrypted = useCrypto.encryption(newToken) // 响应加密的
    await redisCache.set(username, newToken)
    await redisCache.expire(username, redisTtl)
    res.setHeader('token', newEncrypted)
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

const port = process.env.PORT
app.listen(port, () => {
  // console.log(`Server环境：${process.env.NODE_ENV}，端口：${port}`.magenta.bold)
  const log = 'Server环境：'.magenta + `${process.env.NODE_ENV}`.red + '，端口：'.magenta + `${port}`.red
  console.log(log.bold)
})
module.exports = app