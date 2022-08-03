const express = require('express')
const morgan = require('morgan')
const colors = require('colors')
const dotenv = require('dotenv')
const path = require('path')
const api = require('./router')
const app = express()

dotenv.config({
  path: path.join(__dirname, './config/config.env')
});

app.all('*', function(req, res, next){
  res.header("Access-Control-Allow-Credentials", true)
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  // res.header("Content-Type", "application/json;charset=utf-8") // node 图片中文文件名时乱码
  next()
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(morgan("dev"))
app.use('/api', api)
app.use('/imgs', express.static(path.join(__dirname, 'imgs')))

app.get('/', (req, res) => {
  res.send('api')
})
const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server环境：${process.env.NODE_ENV}，端口：${port}`.magenta.bold)
})
module.exports = app