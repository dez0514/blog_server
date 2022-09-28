const express = require('express')
const router = express.Router()
const sqlTool = require('../utils/handle')
const dayjs = require('dayjs')
const query = require('../utils/pool_async')
const json = require('../utils/response')
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

router.get('/article_detail', async function (req, res, next) {
  try {
    const id = req.query.id;
    const sql = 'SELECT * FROM articles WHERE id=?'
    const sql_tags = `select * from tags t left join ( select r.tag_id as id  from article_tag r left join articles a on a.id = r.article_id where a.id = ?  ) ra on t.id = ra.id`
    const dataArticle = await query(sql, id)
    if(dataArticle.length === 0) {
      json(res, 1, null, '文章不存在!')
      return
    } 
    const dataTags = await query(sql_tags, id) // 查询文章的标签
    let data = dataArticle[0]
    // console.log(dataTags)
    data.tagList = dataTags.map(item => {
      return { ...item }
    })
    json(res, 0, data, '查询成功')
  } catch(err) {
    json(res, 1, err, '查询失败!')
  }
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

module.exports = router;