const express = require('express')
const router = express.Router()
const dayjs = require('dayjs')
const query = require('../utils/pool_async')
const json = require('../utils/response')
const util = require('../utils/util')
const redisCache = require('../redis/cache')
const configOption = require('../config/config')
const viewsExpires = configOption.viewsExpires
// 文章列表 (分页要查对应条件下的总条数)
// 1. 首页查询： 最新(默认就时间降序),最热（ishot），最热按照views降序，导航标签按照tag查询
// 2. keywords 检索匹配, 查 title,extra_title,文章的标签(关联表) 存在
router.get('/article_list', async function (req, res, next) {
  try {
    // console.log('see===', req.session)
    let params = req.query;
    let { pageSize, pageNum, ishot, tag, keyword } = params;
    if (!pageSize) { pageSize = 10 }
    if (!pageNum) { pageNum = 1 }
    let start = (pageNum - 1) * pageSize
    let sql = ''
    let keywordArr = []
    let sqlValArr = []
    let keywordWhere = ''
    let orderBY = ''
    if (ishot === 'true') {  // 最热：views降序，如果相等， 就按照时间降序
      orderBY = 'views DESC, IFNULL(update_time, create_time) DESC'
    } else { // 最新时间降序
      orderBY = 'IFNULL(update_time, create_time) DESC'
    }
    if (!tag) { // 没有tag时 考虑筛选keyword
      if (keyword) {
        // 先查 标签name中 包含keyword 的标签id, 然后查出关联表中这些标签id对应的文章id,
        const or_sql = `select article_id from article_tag t2 right join  tags t1 on t2.tag_id=t1.id where name like concat('%',?,'%')`
        keywordWhere = `where id in (${or_sql}) or title like concat('%',?,'%') or extra_title like concat('%',?,'%')`
        keywordArr = [keyword, keyword, keyword]
      }
      sql = `SELECT COUNT(*) FROM articles ${keywordWhere}; SELECT * FROM articles ${keywordWhere} ORDER BY ${orderBY} limit ${start},${pageSize};`
      sqlValArr = [...keywordArr, ...keywordArr] // 几个问号 就要写几个值
    } else { // 不考虑keyword
      // 接收到tag的name，查询tag表查出tag的id,查出id对应关联表中的tag_id, 查出文章id, 查出文章列表
      // 该tag的文章总数量 即查：先查出该标签id, 然后关联表中该标签id的数量即为 查询的tag条件下的 文章总数量
      const count_sql = `select count(*) from article_tag t2 right join tags t1 on t2.tag_id=t1.id where name=?;`
      const data_sql = `select t3.* from articles t3 right join(select t2.article_id from (select * from tags where id in (select tag_id from article_tag)) t1 left join article_tag t2 on t1.id=t2.tag_id where t1.name = ?) t4 on t3.id=t4.article_id;`
      // const data_sql = `select * from articles t1 right join(select * from article_tag where tag_id in (select id from tags where name=?)) t2 on t1.id=t2.article_id;`
      sql = `${count_sql}${data_sql}`
      sqlValArr = [tag, tag]
    }
    console.log('sql===', sql)
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
      const cmcSql = `select topic_id, count(*) as commentCount from comments where topic_type='articleComment' and topic_id in (${ids}) group by topic_id;`
      const commentCountArr = await query(cmcSql, [])
      // 标签与文章列表分类合并
      data.forEach(item => {
        item.tagList = []
        item.commentCount = 0
        const fc = commentCountArr.find(f => f.topic_id === item.id)
        if(fc) {
          item.commentCount = fc.commentCount || 0
        }
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
// 归档-文章列表  配合 year month 归档查询
router.get('/article_archive_list', async function (req, res, next) {
  try {
    let params = req.query;
    let { pageSize, pageNum, year, month } = params;
    if (!pageSize) { pageSize = 10 }
    if (!pageNum) { pageNum = 1 }
    let start = (pageNum - 1) * pageSize
    let sql = ''
    let sqlValArr = []
    let dateWhere = ''
    let dateArr = []
    if (year && Number(year) > 0) {
      if (!month || Number(month) === 0) { // 全年
        dateWhere = `WHERE year(IFNULL(update_time, create_time)) = ?`
        dateArr = [year]
      } else { // year, month
        dateWhere = `WHERE year(IFNULL(update_time, create_time)) = ? AND month(IFNULL(update_time, create_time)) = ?`
        dateArr = [year, month]
      }
    }
    sql = `SELECT COUNT(*) FROM articles ${dateWhere};
    SELECT * FROM articles ${dateWhere} ORDER BY IFNULL(update_time, create_time) DESC limit ${start},${pageSize};`
    sqlValArr = [...dateArr, ...dateArr] // 几个问号 就要写几个值
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
      const cmcSql = `select topic_id, count(*) as commentCount from comments where topic_type='articleComment' and topic_id in (${ids}) group by topic_id;`
      const commentCountArr = await query(cmcSql, [])
      // 标签与文章列表分类合并
      data.forEach(item => {
        item.tagList = []
        item.commentCount = 0
        const fc = commentCountArr.find(f => f.topic_id === item.id)
        if(fc) {
          item.commentCount = fc.commentCount || 0
        }
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
})
// 归档时间列表, 查询文章的创建和更新时间 处理成时间年月
router.get('/archive_timeline', async function (req, res, next) {
  try {
    const sql = `select create_time,update_time from articles`
    const result = await query(sql, [])
    const temp = [] // 格式：[{ year: xxx, monthArr: [xxx, xxx, xxx] }]
    result.forEach(item =>  {
      if (item.update_time) {
        const udate = dayjs(item.update_time).format('YYYY-MM')
        const [uyear, umonth] = udate.split('-')
        const findex = temp.findIndex(inner => inner.year === uyear)
        if(findex > -1) {
          if(!temp[findex].monthArr.includes(umonth)) {
            temp[findex].monthArr.push(umonth)
          }
        } else {
          temp.push({ year: uyear, monthArr: [umonth]})
        }
      } else if (item.create_time) { // 没有更新时间 就按照 创建时间
        const cdate = dayjs(item.create_time).format('YYYY-MM')
        const [cyear, cmonth] = cdate.split('-')
        const findex = temp.findIndex(inner => inner.year === cyear)
        if(findex > -1) { // 找到说明存在此年份，再找找有没有此月份，没有就push月,找到就说明有了
          if(!temp[findex].monthArr.includes(cmonth)) {
            temp[findex].monthArr.push(cmonth)
          }
        } else { // 没找到此年就push
          temp.push({ year: cyear, monthArr: [cmonth]})
        }
      }
    })
    json(res, 0, temp, '查询成功!')
  } catch(err) {
    json(res, 1, err, '查询失败!')
  }
})
// 不分页
router.get('/article_all_list', async function (req, res, next) {
  try {
    const sql = `SELECT * FROM articles`
    const result = await query(sql, [])
    if (result.length > 0) {
      const ids = result.map(item => item.id)
      const sqlstr = `select t.*, r.article_id from tags t left join article_tag r on t.id = r.tag_id where r.article_id in (${ids});`
      const tagData = await query(sqlstr, [])
      const cmcSql = `select topic_id, count(*) as commentCount from comments where topic_type='articleComment' and topic_id in (${ids}) group by topic_id;`
      const commentCountArr = await query(cmcSql, [])
      // 标签与文章列表分类合并
      result.forEach(item => {
        item.tagList = []
        item.commentCount = 0
        const fc = commentCountArr.find(f => f.topic_id === item.id)
        if(fc) {
          item.commentCount = fc.commentCount || 0
        }
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
    if(!id) {
      json(res, 1, null, '参数错误，缺少id!')
      return
    }
    // 查询文章浏览状态
    const ip = req.ipInfo.ip || req.ip
    const redisView = await redisCache.get(`views_${ip}_${id}`)
    if(!redisView) { // 访问+1
      await redisCache.set(`views_${ip}_${id}`, ip)
    }
    // 更新过期时间
    await redisCache.expire(`views_${ip}_${id}`, viewsExpires)
    if(!redisView) {
      const vwsql = `update articles set views=views + 1 where id=?`
      const result = await query(vwsql, [id])
      if(result && result.affectedRows && result.affectedRows === 0) {
        json(res, 1, result, '更新浏览量数据失败!')
        return
      }
    }
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
    }).filter(item => !util.isFalse(item.tagId))
    // 查询文章点赞状态
    const ssql = `select id,like_time from like_ips where like_ip=? and article_id=?`
    const likeRes = await query(ssql, [ip, id])
    const isLike = likeRes.length > 0 // 是否点赞过
    json(res, 0, { ...data, hasLike: isLike }, '查询成功')
  } catch (err) {
    json(res, 1, err, '查询失败!')
  }
});
// 点赞
router.post('/like', async function (req, res, next) {
  try {
    const id = req.body.id;
    // console.log(req.cookies)
    console.log(req.ip)
    if(!id) {
      json(res, 1, null, '参数错误，缺少id!')
      return
    }
    // like_ips
    const ssql = `select id,like_time from like_ips where like_ip=? and article_id=?`
    const ip = req.ipInfo.ip || req.ip
    const likeRes = await query(ssql, [ip, id])
    if(likeRes.length > 0) {
      json(res, 1, null, '您已经点过赞了!')
      return
    }
    const inSql = `insert into like_ips(like_ip, article_id, like_time) values(?,?,?);`
    const like_time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
    const likeResult = await query(inSql, [ip, id, like_time])
    if(likeResult && likeResult.affectedRows && likeResult.affectedRows === 0) {
      json(res, 1, likeResult, '点赞失败!')
      return
    }
    const sql = `update articles set likes=likes + 1 where id=?`
    const result = await query(sql, [id])
    if(result && result.affectedRows && result.affectedRows === 0) {
      json(res, 1, result, '点赞失败!')
      return
    }
    json(res, 0, null, '点赞成功!')
  } catch(err) {
    json(res, 1, err, '点赞失败!')
  }
})
// 1.新增文章时，文章表新增数据的同时，获取提交的标签id，关联表新增数据。
// 2.编辑文章时，根据标签id变化，先删除对应关联表数据，再新增。(粗暴)
router.post('/add_article', async function (req, res, next) {
  try {
    const params = req.body;
    const { title, author, extra_title, banner, tags, content, git } = params
    const tagIds = tags.split(',')
    let sql = ''
    const qsArr = new Array(tagIds.length).fill('(?, ?)')
    const valStr = qsArr.join(',')
    const relationSql = `INSERT INTO article_tag(article_id, tag_id) VALUES${valStr};`
    if (params.id) { // 编辑
      const update_time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
      // console.log('update_time===', update_time)
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