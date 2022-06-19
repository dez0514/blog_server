const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  // 配置文件上传后存储的路径
  destination: function (req, file, cb) {
    // NodeJS的两个全局变量
    console.log('req_body===', req.body)
    // console.log(__dirname);  //获取当前文件在服务器上的完整目录 
    // console.log(__filename); //获取当前文件在服务器上的完整路径 
    const dir = !req.body.dest ? '../imgs' : '../imgs/' + req.body.dest
    cb(null, path.join(__dirname, dir))
  },
  // 配置文件上传后存储的路径和文件名
  filename: function (req, file, cb) {
    // console.log('file', file);
    cb(null, file.originalname)
  }
})
const upload = multer({
  storage: storage
})

module.exports = upload