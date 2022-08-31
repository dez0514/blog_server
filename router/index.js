const express = require('express')
const router = express.Router()
const fs = require('fs')
const upload = require("./uploadConfig")
const sqlTool = require('../utils/handle')
const dayjs = require('dayjs')
/*
    // insert:'INSERT INTO test(id, name, age) VALUES(?,?,?)',
    // update:'UPDATE test SET name=?, age=? WHERE id=?',
    // delete: 'DELETE FROM test WHERE id=?',
    // queryById: 'SELECT * FROM test WHERE id=?',
    // queryAll: 'SELECT * FROM articles'
    search: 'select * from user where concat(name,idcard,sex,···)  like '%word%''
*/
// code: 0 success, 1 err, 2 参数错误

// 文章列表 都做分页 3处接口 type 区分 0，1，2
// 1. 首页 分类查询 最新就是全部，其他 按照 tags 存在就有查询，字段用tag
// 2. year month 归档查询 查 createTime, updateTime
// 3. keywords 搜索查询 查 title,smallTitle,content,tags 存在
// 还要查对应条件下的 总条数。。。
router.get('/article_list', function (req, res, next) {
  let params = req.query;
  let {
    pageSize,
    pageNum,
    type
  } = params;
  console.log('type===', type)
  let sql = ''
  if (!pageSize) {
    pageSize = 10
  }
  if (!pageNum) {
    pageSize = 1
  }
  let start = (pageNum - 1) * pageSize
  if (!type) {
    res.json({
      code: 2,
      message: '参数有误，请检查参数'
    })
    return
  }
  if (Number(type) === 1) { // 首页
    let tag = params.tag;
    if (!tag || tag === 'lastest') {
      sql = `SELECT COUNT(*) FROM articles;SELECT * FROM articles limit ${start},${pageSize}`
    } else {
      sql = `SELECT * FROM articles FIND_IN_SET(${tag},tags) limit ${start},${pageSize}`
    }
  } else if (Number(type) === 2) { // 归档 createTime updateTime

  } else if (Number(type) === 3) { // 搜索 keyword

  }
  console.log('sql===', sql)
  if (!sql) return;
  sqlTool.queryAll(sql, req, res, next, true);
});
// 不分页
router.get('/article_all_list', function (req, res, next) {
  const sql = `SELECT * FROM articles`
  sqlTool.queryAll(sql, req, res, next);
});

router.get('/article_detail', function (req, res, next) {
  const id = req.query.id;
  const sql = 'SELECT * FROM articles WHERE id=?'
  sqlTool.queryById(sql, id, res, next);
});
router.post('/add_article', function (req, res, next) {
  const params = req.body;
  const {
    title,
    author,
    extra_title,
    banner,
    tags,
    content,
    git
  } = params
  const views = 0, likes = 0;
  const create_time = new Date();
  let sql = ''
  if (params.id) { // 编辑
    const update_time = dayjs(new Date()).format('YYYY-MM-DD HH:MM:ss')
    const temp = { title, author, extra_title, banner, tags, content, git, update_time }
    const str = Object.keys(temp).map(item => {
      return `${item}='${temp[item]}'` // 注意字段值包单引号，null又不能包引号，心累
    }).join(',')
    sql = `UPDATE articles SET ${str} WHERE id=${params.id}`
    sqlTool.update(sql, res, next);
  } else { // 新增
    sql = 'INSERT INTO articles(title, author, extra_title, banner, tags, content, git, views, likes, create_time) VALUES(?,?,?,?,?,?,?,?,?,?)'
    const vallist = [title, author, extra_title, banner, tags, content, git, views, likes, create_time]
    sqlTool.add(sql, vallist, res, next);
  }
});
// 删除文章
router.post('/delete_article', function (req, res, next) {
  const id = req.body.id;
  const sql =  `DELETE FROM articles WHERE id=?`
  sqlTool.delete(sql, id, res, next);
});
// 标签列表
router.get('/tag_list', function (req, res, next) {
  let sql = 'SELECT * FROM tags'
  sqlTool.queryAll(sql, req, res, next);
});
router.post('/add_tag', function (req, res, next) {
  let sql = 'INSERT INTO tags(name, color, icon) VALUES(?,?,?)'
  let params = req.body;
  const {
    name,
    color,
    icon
  } = params
  const vallist = [name, color, icon]
  sqlTool.add(sql, vallist, res, next);
});

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