const express = require('express')
const router = express.Router()
const fs = require('fs')
const upload = require('../utils/uploadConfig')
// 图片操作接口
// 上传图片
router.post('/upload', upload.array("file"), (req, res) => {
  // upload.array('file',3) // 限制数量
  // upload.single("file")
  // const params = req.body
  // 上传成功再移动到指定目录
  const files = req.files
  if (files) {
    res.json({
      code: '0',
      data: files,
      message: '上传成功'
    })
  } else {
    res.json({
      code: '-1',
      message: '上传失败'
    })
  }
})

// 创建文件夹
router.post('/mkdir', function (req, res, next) {
  const params = req.body.name
  const isExist = fs.existsSync(`./imgs/${params}`)
  if (isExist) {
    res.json({
      code: '-1',
      message: '该目录已存在，请勿重复创建！'
    })
    return
  }
  fs.mkdir(`./imgs/${params}`, function (err) {
    if (err) {
      res.send(err)
    } else {
      res.json({
        code: '0',
        message: '创建成功！'
      })
    }
  })
})
// 删除文件夹
router.post('/deletedir', function (req, res, next) {
  const params = req.body.name
  const isExist = fs.existsSync(`./imgs/${params}`)
  if (isExist) {
    deleteFolder(`./imgs/${params}`, () => {
      res.json({
        code: '0',
        message: '删除成功'
      })
    }, () => {
      res.json({
        code: '-1',
        message: '删除失败'
      })
    })
  } else {
    res.json({
      code: '-1',
      message: '该目录不存在'
    })
    return
  }
})

function deleteFolder(path, callback, errorCallback) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      let curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolder(curPath, callback, errorCallback);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
    callback()
  } else {
    errorCallback()
  }
}

// 删除文件
router.post('/deletefile', function (req, res, next) {
  const params = req.body.name
  const isExist = fs.existsSync(`./imgs/${params}`)
  if (isExist) {
    fs.unlinkSync(`./imgs/${params}`)
    res.json({
      code: '0',
      message: '删除成功'
    })
  } else {
    res.json({
      code: '-1',
      message: '该文件不存在'
    })
  }
})
// 批量删除文件
router.post('/deletefiles', function (req, res, next) {
  try {
    const params = req.body.names
    // 传入时 英文逗号隔开
    const nameArr = params.split(',')
    if (nameArr.length === 0) {
      res.json({
        code: '-1',
        message: '未选择需要删除的数据'
      })
      return
    }
    console.log('ppp===', nameArr)
    nameArr.forEach(item => {
      const isExist = fs.existsSync(`./imgs/${item}`)
      if (isExist) {
        fs.unlinkSync(`./imgs/${item}`)
      }
    })
    res.json({
      code: '0',
      message: '删除成功'
    })
  } catch {
    res.json({
      code: '-1',
      message: '删除失败'
    })
  }

})
// 文件列表
router.post('/filelist', function (req, res, next) {
  const params = req.body.name
  let path = './imgs'
  if (params) {
    path = path + '/' + params
  }
  const files = fs.readdirSync(path);
  const data = []
  files.forEach(file => {
    const filePath = `${path}/${file}`;
    const stats = fs.statSync(filePath);
    const isFolder = stats.isDirectory()
    data.push({
      name: file,
      isFolder
    })
  })
  res.json({
    code: '0',
    data: data
  })
})

module.exports = router;