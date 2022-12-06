const express = require('express')
const router = express.Router()
// const qs = require('qs')
const query = require('../utils/pool_async')
const json = require('../utils/response')
// const dayjs = require('dayjs')

// 评论列表
router.get('/comments_list', async function (req, res, next) {
  try {
    let params = req.query;
    let { pageSize, pageNum, topicId } = params;
    let topicType = 'messageboard'
    let and = ''
    if(topicId) { // 有文章id就是文章评论 否则就是留言板
      topicType = 'articleComment'
      and = 'AND topic_id=?'
    }
    if (!pageSize) { pageSize = 10 }
    if (!pageNum) { pageNum = 1 }
    let start = (pageNum - 1) * pageSize
    // 将from_uid的 avatar,nickname,weburl 都left join带过来
    const sql = `SELECT COUNT(*) FROM comments WHERE topic_type=? ${and};SELECT c.*, e.avatar, e.nickname, e.weburl FROM comments c left join emails e on e.email=c.from_uid WHERE topic_type=? ${and} ORDER BY IFNULL(update_time, create_time) DESC limit ${start},${pageSize};`
    const vl = and === '' ? [topicType, topicType] : [topicType, topicId, topicType, topicId]
    const result = await query(sql, [...vl])
    const total = (result && result[0] && result[0][0] && (result[0][0]['COUNT(*)'] || result[0][0]['COUNT(1)'])) || 0
    const data = (result && result.length > 1) ? result[1] : []
    // todo: 查询评论的回复
    if (data.length > 0) {
      const ids = data.map(item => item.id)
      // 将from_uid, to_uid 各自的 avatar,nickname,weburl 都left join带过来
      // 这里先带一个，结果作为临时表，再left join一下
      // const sqlstr = `select r.*, e.nickname as from_nickname, e.avatar as from_avatar from replys r left join emails e on e.email=r.from_uid where comment_id in (${ids})`
      const sqlstr = `select a.*,em.nickname as to_nickname, em.avatar as to_avatar, em.weburl as to_weburl from (select r.*, e.nickname as from_nickname, e.avatar as from_avatar,e.weburl as from_weburl from replys r left join emails e on e.email=r.from_uid where comment_id in (${ids})) as a left join emails em on em.email=a.to_uid;`
      const replysRes = await query(sqlstr, [])
      data.forEach(item => {
        item.replyList = []
        if(replysRes.length > 0) {
          const temp = replysRes.filter(inner => inner.comment_id === item.id)
          item.replyList = temp
        }
      })
    }
    json(res, 0, data, '查询成功!', total)
  } catch (err) {
    json(res, 1, err, '查询失败!')
  }
});

router.post('/add_comments', async function (req, res, next) {
  try {
    let params = req.body;
    const { topicId, topicType, content, fromUid } = params
    if(!fromUid) {
      json(res, 1, null, '未登录!')
      return
    }
    if(!content) {
      json(res, 1, null, '请输入内容!')
      return
    }
    let vals = []
    let sql = ''
    if(!topicId) {
      vals = [topicType, content, fromUid]
      sql = 'INSERT INTO comments(topic_type, content, from_uid) VALUES(?,?,?)'
    } else {
      vals = [topicId, topicType, content, fromUid]
      sql = 'INSERT INTO comments(topic_id, topic_type, content, from_uid) VALUES(?,?,?,?)'
    }
    const result = await query(sql, vals)
    if (result && result.affectedRows && result.affectedRows === 0) {
      json(res, 1, result, '新增失败!')
      return
    }
    json(res, 0, null, '新增成功!')
  } catch(err) {
    json(res, 1, err, '操作失败!')
  }
});

router.post('/add_replys', async function (req, res, next) {
  try {
    let params = req.body;
    const { commentId, replyId, replyType, content, fromUid, toUid } = params
    if(!fromUid) {
      json(res, 1, null, '未登录!')
      return
    }
    if(!content) {
      json(res, 1, null, '请输入内容!')
      return
    }
    const vals = [commentId, replyId, replyType, content, fromUid, toUid]
    const sql = 'INSERT INTO replys(comment_id, reply_id, reply_type, content, from_uid, to_uid) VALUES(?,?,?,?,?,?)'
    const result = await query(sql, vals)
    if (result && result.affectedRows && result.affectedRows === 0) {
      json(res, 1, result, '新增失败!')
      return
    }
    json(res, 0, null, '新增成功!')
  } catch(err) {
    json(res, 1, err, '操作失败!')
  }
});
module.exports = router;