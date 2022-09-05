const express = require('express')
const router = express.Router()
const fs = require('fs')
const upload = require("./uploadConfig")
const sqlTool = require('../utils/handle')
const dayjs = require('dayjs')
const qs = require('qs')
// code: 0 success, 1 err, 2 参数错误
// 文章列表 都做分页 3处接口 type 区分归档查询
// 1. 首页 分类查询 最新就是全部，其他 按照 tags 存在就有查询，字段用tag
// 2. year month 归档查询 查 createTime, updateTime
// 3. keywords 搜索查询 查 title,smallTitle,content,tags 存在
// 还要查对应条件下的 总条数。。。
router.get('/article_list', function (req, res, next) {
  let params = req.query;
  let {
    pageSize,
    pageNum,
    type,
    tag,
    keyword,
    year,
    month
  } = params;
  console.log('type===', type)
  if (!pageSize) {
    pageSize = 10
  }
  if (!pageNum) {
    pageNum = 1
  }
  let start = (pageNum - 1) * pageSize
  let sql = ''
  let tagArr = []
  let keywordArr = []
  let sqlValArr = []
  if (!type || type !== 'archive') { // 首页tag精确查找, 搜索keyword检索匹配查找
    let tagWhere = ''
    let keywordWhere = ''
    if(tag && tag !== 'lastest') {
      tagWhere = `FIND_IN_SET(?, tags)` // 改用占位符解决
      tagArr = [tag]
    }
    if(keyword) {
      keywordWhere = `(title like CONCAT('%',?,'%') OR extra_title like CONCAT('%',?,'%') OR tags like CONCAT('%',?,'%'))` // 改用占位符解决
      keywordArr = [keyword, keyword, keyword]
    }
    // 如果tag 和 keyword 都存在就是取交集 同时满足条件的数据
    let hasWhere = ''
    let hasAnd = ''
    if(tagWhere !== '' && keywordWhere !== '') { // 都不空
      hasWhere = 'WHERE'
      hasAnd = 'AND'
    } else if((tagWhere === '' && keywordWhere !== '') || (tagWhere !== '' && keywordWhere === '')) { // 一个空 一个不空
      hasWhere = 'WHERE'
    }
    const parseStr = `${hasWhere} ${tagWhere} ${hasAnd} ${keywordWhere}`
    sql = `SELECT COUNT(*) FROM articles ${parseStr}; SELECT * FROM articles ${parseStr} ORDER BY IFNULL(update_time, create_time) DESC limit ${start},${pageSize};`
    sqlValArr = [...tagArr, ...keywordArr, ...tagArr, ...keywordArr] // 几个问号 就要写几个值
  } else { // 归档 type === 'archive'; createTime updateTime
    // year=0 全部, month=0 全年， year=2022，month=1到12
    let dateWhere = ''
    let dateArr = []
    if(year && Number(year) > 0) {
      if (!month || Number(month) === 0) {
        // 全年
        dateWhere = `WHERE year(IFNULL(update_time, create_time)) = ?`
        dateArr = [year]
      } else {
        // year, month
        dateWhere = `WHERE year(IFNULL(update_time, create_time)) = ? AND month(IFNULL(update_time, create_time)) = ?`
        dateArr = [year, month]
      }
    }
    sql = `SELECT COUNT(*) FROM articles ${dateWhere};
    SELECT * FROM articles ${dateWhere} ORDER BY IFNULL(update_time, create_time) DESC limit ${start},${pageSize};`
    sqlValArr = [...dateArr, ...dateArr] // 几个问号 就要写几个值
  }
  // console.log('sql===', sql)
  if (!sql) return;
  sqlTool.queryAll(sql,sqlValArr, req, res, next, true);
});
// 不分页
router.get('/article_all_list', function (req, res, next) {
  const sql = `SELECT * FROM articles`
  sqlTool.queryAll(sql, [], req, res, next);
});

router.get('/article_detail', function (req, res, next) {
  const id = req.query.id;
  const sql = 'SELECT * FROM articles WHERE id=?'
  sqlTool.queryById(sql, id, res, next);
});
router.post('/add_article', function (req, res, next) {
  const params = req.body;
  const { title, author, extra_title, banner, tags, content, git } = params
  let sql = ''
  if (params.id) { // 编辑
    const update_time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
    console.log('update_time===', update_time)
    const temp = { title, author, extra_title, banner, tags, git, update_time, content }
    const str = Object.keys(temp).map(item => `${item}=?`).join(',')
    const values = Object.values(temp)
    sql = `UPDATE articles SET ${str} WHERE id=${params.id}`
    console.log('sql==', sql)
    sqlTool.update(sql,values, res, next);
  } else { // 新增
    sql = 'INSERT INTO articles(title, author, extra_title, banner, tags, content, git) VALUES(?,?,?,?,?,?,?)'
    const vallist = [title, author, extra_title, banner, tags, content, git]
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
router.get('/tag_all_list', function (req, res, next) {
  let sql = 'SELECT * FROM tags'
  sqlTool.queryAll(sql, [], req, res, next);
});
// 分页
router.get('/tag_list', function (req, res, next) {
  let params = req.query;
  let { pageSize, pageNum } = params
  if (!pageSize) { pageSize = 10 }
  if (!pageNum) { pageNum = 1 }
  let start = (pageNum - 1) * pageSize
  let sql = `SELECT COUNT(*) FROM tags; SELECT * FROM tags limit ${start},${pageSize};`
  sqlTool.queryAll(sql, [], req, res, next, true);
});
router.post('/add_tag', function (req, res, next) {
  let params = req.body;
  const { name, color, icon, id } = params
  const vallist = [name, color, icon]
  let sql = ''
  if(id) { // 编辑
    sql = `UPDATE tags SET name=?, color=?, icon=? WHERE id=${id}`
    sqlTool.update(sql, vallist, res, next);
  } else {
    sql = 'INSERT INTO tags(name, color, icon) VALUES(?,?,?)'
    sqlTool.add(sql, vallist, res, next);
  }
});
// 批量
router.post('/add_taglist', function (req, res, next) {
  const params = req.body;
  const { taglist } = qs.parse(params)
  // console.log('taglist==', taglist)
  if(!Array.isArray(taglist)) {
    res.json({
      code: 1,
      message: '参数错误!'
    })
    return
  }
  let vq = ''
  let temp = []
  taglist.forEach((item, index) => {
    const { name, color, icon } = item
    const vallist = [name, color, icon]
    vq = vq + ((index ===  taglist.length - 1) ? '(?,?,?)' : '(?,?,?),')
    temp = temp.concat(vallist)
  })
  let sql = `INSERT INTO tags(name, color, icon) VALUES ${vq}`
  sqlTool.add(sql, temp, res, next);
});
router.post('/delete_tag', function (req, res, next) {
  const id = req.body.id;
  const sql =  `DELETE FROM tags WHERE id=?`
  sqlTool.delete(sql, id, res, next);
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