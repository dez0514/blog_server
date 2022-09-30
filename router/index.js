const express = require('express')
const router = express.Router()
const dayjs = require('dayjs')
const query = require('../utils/pool_async')
const json = require('../utils/response')
// code: 0 success, 1 err, 2 参数错误
// 文章列表 都做分页 3处接口 type 区分归档查询
// 1. 首页 分类查询 最新就是全部，其他 按照 tags 存在就有查询，字段用tag
// 2. year month 归档查询 查 createTime, updateTime
// 3. keywords 搜索查询 查 title,smallTitle,content,tags 存在
// 还要查对应条件下的 总条数。。。
router.get('/article_list', async function (req, res, next) {
  try {
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
      if (tag && tag !== 'lastest') {
        tagWhere = `FIND_IN_SET(?, tags)` // 改用占位符解决
        tagArr = [tag]
      }
      if (keyword) {
        keywordWhere = `(title like CONCAT('%',?,'%') OR extra_title like CONCAT('%',?,'%') OR tags like CONCAT('%',?,'%'))` // 改用占位符解决
        keywordArr = [keyword, keyword, keyword]
      }
      // 如果tag 和 keyword 都存在就是取交集 同时满足条件的数据
      let hasWhere = ''
      let hasAnd = ''
      if (tagWhere !== '' && keywordWhere !== '') { // 都不空
        hasWhere = 'WHERE'
        hasAnd = 'AND'
      } else if ((tagWhere === '' && keywordWhere !== '') || (tagWhere !== '' && keywordWhere === '')) { // 一个空 一个不空
        hasWhere = 'WHERE'
      }
      const parseStr = `${hasWhere} ${tagWhere} ${hasAnd} ${keywordWhere}`
      sql = `SELECT COUNT(*) FROM articles ${parseStr}; SELECT * FROM articles ${parseStr} ORDER BY IFNULL(update_time, create_time) DESC limit ${start},${pageSize};`
      sqlValArr = [...tagArr, ...keywordArr, ...tagArr, ...keywordArr] // 几个问号 就要写几个值
    } else { // 归档 type === 'archive'; createTime updateTime
      // year=0 全部, month=0 全年， year=2022，month=1到12
      let dateWhere = ''
      let dateArr = []
      if (year && Number(year) > 0) {
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
    if (!sql) {
      json(res, 1, null, '查询失败!')
      return
    }
    const result = await query(sql, sqlValArr)
    const total = (result && result[0] && result[0][0] && (result[0][0]['COUNT(*)'] || result[0][0]['COUNT(1)'])) || 0
    const data = (result && result.length > 1) ? result[1] : []
    if (data.length > 0) {
      const ids = data.map(item => item.id)
      const sqlstr = `select t.*, r.article_id from tags t left join article_tag r on t.id = r.tag_id where r.article_id in (${ids});`
      const tagData = await query(sqlstr, [])
      // 标签与文章列表分类合并
      data.forEach(item => {
        item.tagList = []
        tagData.forEach(inner => {
          if (inner && inner.article_id === item.id) {
            item.tagList.push({
              tagId: inner.id,
              name: inner.name,
              color: inner.color,
              icon: inner.icon
            })
          }
        })
      })
    }
    json(res, 0, data, '查询成功!', total)
  } catch (err) {
    json(res, 1, err, '查询失败!')
  }
});
// 不分页
router.get('/article_all_list', async function (req, res, next) {
  try {
    const sql = `SELECT * FROM articles`
    const result = await query(sql, [])
    if (result.length > 0) {
      const ids = result.map(item => item.id)
      const sqlstr = `select t.*, r.article_id from tags t left join article_tag r on t.id = r.tag_id where r.article_id in (${ids});`
      const tagData = await query(sqlstr, [])
      // 标签与文章列表分类合并
      result.forEach(item => {
        item.tagList = []
        tagData.forEach(inner => {
          if (inner && inner.article_id === item.id) {
            item.tagList.push({
              tagId: inner.id,
              name: inner.name,
              color: inner.color,
              icon: inner.icon
            })
          }
        })
      })
    }
    json(res, 0, result, '查询成功')
  } catch (err) {
    json(res, 1, err, '查询失败!')
  }
});
// 查询文章详情，查询关联表中所有文章的标签
router.get('/article_detail', async function (req, res, next) {
  try {
    const id = req.query.id;
    const sql = 'SELECT * FROM articles WHERE id=?'
    const sql_tags = `SELECT t.* FROM tags t RIGHT JOIN (SELECT r.tag_id AS id FROM article_tag r RIGHT JOIN articles a ON a.id = r.article_id WHERE a.id=?) ra ON t.id=ra.id`
    const dataArticle = await query(sql, id)
    if (dataArticle.length === 0) {
      json(res, 1, null, '文章不存在!')
      return
    }
    const dataTags = await query(sql_tags, id) // 查询文章的标签
    let data = dataArticle[0]
    // console.log(dataTags)
    data.tagList = dataTags.map(item => {
      return {
        tagId: item.id,
        name: item.name,
        color: item.color,
        icon: item.icon
      }
    })
    json(res, 0, data, '查询成功')
  } catch (err) {
    json(res, 1, err, '查询失败!')
  }
});
// 1.新增文章时，文章表新增数据的同时，获取提交的标签id，关联表新增数据。
// 2.编辑文章时，根据标签id变化，先删除对应关联表数据，再新增。(粗暴)
router.post('/add_article', async function (req, res, next) {
  try {
    const params = req.body;
    const {
      title,
      author,
      extra_title,
      banner,
      tags, // 标签id集合 英文逗号拼接
      content,
      git
    } = params
    let sql = ''
    const tagIds = tags.split(',')
    const qsArr = new Array(tagIds.length).fill('(?, ?)')
    const valStr = qsArr.join(',')
    const relationSql = `INSERT INTO article_tag(article_id, tag_id) VALUES${valStr};`
    if (params.id) { // 编辑
      const update_time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
      console.log('update_time===', update_time)
      const temp = { title, author, extra_title, banner, git, update_time, content }
      const str = Object.keys(temp).map(item => `${item}=?`).join(',')
      const values = Object.values(temp)
      sql = `UPDATE articles SET ${str} WHERE id=?;`
      console.log('sql==', sql)
      const result = await query(sql, [...values, params.id])
      if (result && result.affectedRows && result.affectedRows === 0) {
        json(res, 1, result, '修改失败!')
        return
      }
      // 编辑文章时，先删除对应的所有关联表数据，再新增。
      const delSql =  `DELETE FROM article_tag WHERE article_id=?;`
      const delRes = await query(delSql, params.id)
      if (delRes && delRes.affectedRows && delRes.affectedRows === 0) {
        json(res, 1, delRes, '修改失败!')
        return
      }
      const tempArr = []
      tagIds.forEach(item => {
        tempArr.push(params.id)
        tempArr.push(item)
      })
      const lastRes = await query(relationSql, tempArr)
      if (lastRes && lastRes.affectedRows && lastRes.affectedRows === 0) {
        json(res, 1, lastRes, '修改失败!')
        return
      }
      json(res, 0, null, '修改成功!')
    } else { // 新增
      sql = 'INSERT INTO articles(title, author, extra_title, banner, content, git) VALUES(?,?,?,?,?,?)'
      const vallist = [title, author, extra_title, banner, content, git]
      const result = await query(sql, vallist)
      if (result && result.affectedRows && result.affectedRows === 0) {
        json(res, 1, result, '新增失败!')
        return
      }
      // 新增文章时，文章表新增数据的同时，获取提交的标签id，关联表新增数据。
      const articleId = result.insertId
      const tempArr = []
      tagIds.forEach(item => {
        tempArr.push(articleId)
        tempArr.push(item)
      })
      const addRes = await query(relationSql, tempArr)
      if (addRes && addRes.affectedRows && addRes.affectedRows === 0) {
        json(res, 1, addRes, '新增失败!')
        return
      }
      json(res, 0, null, '新增成功!')
    }
  } catch (err) {
    json(res, 1, err, '操作失败!')
  }
});
// 删除文章 删除关联表中 该文章
router.post('/delete_article', async function (req, res, next) {
  try {
    const id = req.body.id;
    const sql = `DELETE FROM articles WHERE id=?;`
    const delRes = await query(sql, id)
    if (delRes && delRes.affectedRows && delRes.affectedRows === 0) {
      json(res, 1, delRes, '删除失败!')
      return
    }
    // 删除关联表中的文章
    const delSql =  `DELETE FROM article_tag WHERE article_id=?;`
    const lastRes = await query(delSql, id)
    if (lastRes && lastRes.affectedRows && lastRes.affectedRows === 0) {
      json(res, 1, lastRes, '删除失败!')
      return
    }
    json(res, 0, null, '删除成功!')
  } catch (err) {
    json(res, 1, err, '删除失败!')
  }
});

module.exports = router;