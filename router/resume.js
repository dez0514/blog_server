const express = require('express')
const router = express.Router()
const query = require('../utils/pool_async')
const json = require('../utils/response')
const dayjs = require('dayjs')
// 列表第一条,只存一条，只查一条
router.get('/resume_detail', async function (req, res, next) {
  try {
    const sql = 'SELECT * FROM resumes LIMIT 0,1;'
    const data = await query(sql, [])
    // console.log(data)
    json(res, 0, data, '查询成功!')
  } catch (err) {
    json(res, 1, err, '查询失败!')
  }
});
router.post('/save_resume', async function (req, res, next) {
  try {
    // resumes 只存一条数据
    // 如果没数据 就新增，如果有数据 就直接更新第一条数据
    let params = req.body;
    const { name, gendar, school, profession, graduationDate, blog, github, phone, email, wechat, qq, job, extra, projectIds } = params
    let vallist = []
    let sql = ''
    const search_sql = 'SELECT * FROM resumes LIMIT 0,1;'
    const data = await query(search_sql, [])
    if (data.length > 0) {
      // 修改
      const resume_id = data[0].id
      const update_time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
      vallist = [name, gendar, school, profession, graduationDate, blog, github, phone, email, wechat, qq, job, extra, update_time]
      const str = vallist.map(item => `${item}=?`).join(',')
      sql = `UPDATE resumes SET ${str} WHERE id=?`
      const result = await query(sql, [...vallist, resume_id])
      if (result && result.affectedRows && result.affectedRows > 0) {
        // 删掉关联表中所有 resume_id === 此id 的数据， 再插入projectIds
        const delSql =  `DELETE FROM resume_project WHERE resume_id=?;`
        const delRes = await query(delSql, resume_id)
        if (delRes && delRes.affectedRows && delRes.affectedRows === 0) {
          json(res, 1, delRes, '编辑失败!')
          return
        }
        // const linkSql = `UPDATE resume_project SET company_id=? WHERE resume_id=?`
        // const linkArr = [companyId, id]
        // const linkResult = await query(linkSql, linkArr)
        // if (linkResult && linkResult.affectedRows && linkResult.affectedRows > 0) {
        //   json(res, 0, null, '编辑成功!')
        // } else {
        //   json(res, 1, linkResult, '编辑失败!')
        // }
      } else {
        json(res, 1, result, '编辑失败!')
      }
    } else {
      // 新增
      vallist = [name, gendar, school, profession, graduationDate, blog, github, phone, email, wechat, qq, job, extra]
      const str = vallist.join(',')
      const q = (new Array(vallist.length).fill('?')).join(',')
      sql = `INSERT INTO resumes(${str}) VALUES(${q})`
      const result = await query(sql, vallist)
      if (result && result.affectedRows && result.affectedRows > 0) {
        // const linkSql = `INSERT INTO company_project(company_id, project_id) VALUES(?,?)`
        // const projectId = result.insertId
        // const linkArr = [companyId, projectId]
        // const linkResult = await query(linkSql, linkArr)
        // if (linkResult && linkResult.affectedRows && linkResult.affectedRows > 0) {
        //   json(res, 0, null, '新增成功!')
        // } else {
        //   json(res, 1, linkResult, '新增失败!')
        // }
      } else {
        json(res, 1, result, '新增失败!')
      }
    }
  } catch(err) {
    json(res, 1, err, '操作失败!')
  }
});

module.exports = router;