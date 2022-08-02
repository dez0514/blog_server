const express = require('express')
// const multer = require('multer')
// const cros = require('cors');
const app = express()
const path = require('path')
const api = require('./router')

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

app.use('/api', api)
app.use('/imgs', express.static(path.join(__dirname, 'imgs')))

app.get('/', (req, res) => {
  res.send('Hello World');
})
// const upload = multer({ dest: 'uploads/' });
// app.post('/upload', cros(), upload.single('uploads') ,(req, res) => {
//   // res.set('Access-Control-Allow-Origin', '*');
//   console.log('1234')
//   res.send(`http://localhost:7777/preview/${req.file.filename}`)
// })

// app.get('/preview/:key',cros() , (req, res) => {
//   res.sendFile(`/uploads/${req.params.key}`, {
//     root: __dirname,
//     headers: {
//       'Content-Type': 'image/png',
//     }
//   }, (error) => {
//     console.log(error)
//   })
// })
const port = process.env.PORT || 3002
app.listen(port, () => {
  console.log(`${port}端口已开启`)
})
module.exports = app