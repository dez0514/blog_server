const express = require('express')
const router = express.Router()
const qs = require('qs')
const query = require('../utils/pool_async')
const json = require('../utils/response')
const dayjs = require('dayjs')
// 公司经历列表
router.get('/company_list', async function (req, res, next) {
  try {
    const sql = 'SELECT * FROM companys ORDER BY sort ASC, IFNULL(update_time, create_time) DESC'
    const data = await query(sql, [])
    // console.log(data)
    json(res, 0, data, '查询成功!')
  } catch (err) {
    // console.log(err)
    json(res, 1, err, '查询失败!')
  }
});
// 新增与编辑
router.post('/add_company', async function (req, res, next) {
  try {
    let params = req.body;
    const { name, durings, id } = params
    const sort = params.sort || 0 // 没有就 0
    let vallist = []
    let sql = ''
    if(id) { // 编辑
      const update_time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
      vallist = [name, durings, sort, update_time]
      sql = `UPDATE companys SET name=?, durings=?, sort=? ,update_time=? WHERE id=?`
      const list = [...vallist, id]
      const result = await query(sql, list)
      if (result && result.affectedRows && result.affectedRows > 0) {
        json(res, 0, null, '编辑成功!')
      } else {
        json(res, 1, result, '编辑失败!')
      }
    } else {
      vallist = [name, durings, sort]
      sql = 'INSERT INTO companys(name, durings, sort) VALUES(?,?,?)'
      const result = await query(sql, vallist)
      if (result && result.affectedRows && result.affectedRows > 0) {
        json(res, 0, null, '新增成功!')
      } else {
        json(res, 1, result, '新增失败!')
      }
    }
  } catch(err) {
    json(res, 1, err, '操作失败!')
  }
});
// 批量新增
router.post('/add_company_list', async function (req, res, next) {
  try {
    const params = req.body;
    const { companys } = qs.parse(params)
    if(!Array.isArray(companys)) {
      json(res, 1, null, '参数错误!')
      return
    }
    let vq = ''
    let temp = []
    companys.forEach((item, index) => {
      const { name, durings } = item
      const sort = item.sort || 0
      const vallist = [name, durings, sort]
      vq = vq + ((index ===  companys.length - 1) ? '(?,?,?)' : '(?,?,?),')
      temp = temp.concat(vallist)
    })
    let sql = `INSERT INTO companys(name, durings, sort) VALUES${vq};`
    const result = await query(sql, temp)
    if (result && result.affectedRows && result.affectedRows > 0) {
      json(res, 0, null, '新增成功!')
    } else {
      json(res, 1, result, '新增失败!')
    }
  } catch(err) {
    json(res, 1, err, '操作失败!')
  }
});
// 更新排序，sort
router.post('/sort_company', async function (req, res, next) {
  try {
    const params = req.body;
    const { companys } = qs.parse(params)
    if(!Array.isArray(companys)) {
      json(res, 1, null, '参数错误!')
      return
    }
    // 批量update方式
    // 方式1，replace into test_tbl (id, sort) values (1,'2'),(2,'3'),...(x,'y');
    // 如果不存在会新增，必须有唯一键
    const qstr = companys.map(item => `(?, ?, ?, ?)`).join(',')
    let temp = []
    companys.forEach(item => {
      temp.push(item.id)
      temp.push(item.name)
      temp.push(item.durings)
      temp.push(item.sort)
    })
    const sql = `replace into companys (id, name, durings, sort) values ${qstr}`
    const result = await query(sql, [...temp])
    if (result && result.affectedRows && result.affectedRows > 0) {
      json(res, 0, null, '操作成功!')
    } else {
      json(res, 1, result, '操作失败!')
    }
    // 方式2，创建临时表，更新临时表，从临时表更新过来。
    // create temporary table tmp(id int(4) primary key,sort varchar(50));
    // insert into tmp values  (0,'gone'), (1,'xx'),...(m,'yy');
    // update test_tbl, tmp set test_tbl.sort=tmp.sort where test_tbl.id=tmp.id;
  } catch(err) {
    json(res, 1, err, '操作失败!')
  }
})
router.post('/delete_company', async function (req, res, next) {
  try {
    const id = req.body.id;
    const sql = `DELETE FROM companys WHERE id=?`
    const dataResult = await query(sql, id)
    if (dataResult && dataResult.affectedRows && dataResult.affectedRows === 0) {
      json(res, 1, dataResult, '删除失败!')
      return
    }
    const delSql = `DELETE FROM company_project WHERE company_id=?`
    // 删除关联表里 对应的 company_id 数据
    const result = await query(delSql, id)
    if (result && result.affectedRows && result.affectedRows > 0) {
      json(res, 0, null, '删除成功!')
    } else {
      json(res, 1, result, '删除失败!')
    }
  } catch(err) {
    json(res, 1, err, '删除失败!')
  }
});

module.exports = router;