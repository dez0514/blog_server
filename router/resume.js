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
    // 查 resume_id
    if (data.length > 0) {
      const obj = data[0]
      const resume_id = obj.id
      const idsql = `select project_id from resume_project where resume_id=${resume_id}`
      const idResult = await query(idsql, [])
      if(idResult.length > 0) {
        const idArr = idResult.map(item => item.project_id)
        console.log(idArr)
        // 查询idArr项目的单位信息
        const sqlStr = `select c.id as companyId, c.name as companyName,c.durings, c.sort as companySort, cp.project_id, p.* from companys as c left join company_project as cp on cp.company_id = c.id left join projects as p on p.id = cp.project_id where cp.project_id in (${idArr})`
        const result = await query(sqlStr, [])
        json(res, 0, { ...obj, projectList: result }, '查询成功!')
      } else {
        // 无项目数据
        json(res, 0, { ...obj, projectList: [] }, '查询成功!')
      }
    } else {
      json(res, 0, null, '查询成功!')
    }
  } catch (err) {
    json(res, 1, err, '查询失败!')
  }
});
router.post('/save_resume', async function (req, res, next) {
  try {
    // resumes 只存一条数据
    // 如果没数据 就新增，如果有数据 就直接更新第一条数据
    let params = req.body;
    const { name, birthday, avatar, gendar, school, skills, location, profession, graduationDate, blog, github, phone, email, wechat, qq, job, extra, projectIds } = params
    let vallist = []
    let sql = ''
    const search_sql = 'SELECT * FROM resumes LIMIT 0,1;'
    const data = await query(search_sql, [])
    if (data.length > 0) {
      // 修改
      const resume_id = data[0].id
      const update_time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
      vallist = [name, birthday, avatar, gendar, school, skills, location, profession, graduationDate, blog, github, phone, email, wechat, qq, job, extra, update_time]
      const strArr = ['name', 'birthday', 'avatar',  'gendar', 'school', 'skills', 'location', 'profession', 'graduationDate', 'blog', 'github', 'phone', 'email', 'wechat', 'qq', 'job', 'extra', 'update_time']
      const str = strArr.map(item => `${item}=?`).join(',')
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
        const projectIdArr = projectIds.split(',')
        const valStr = new Array(projectIdArr.length).fill('(?, ?)').join(',')
        const relSql = `INSERT INTO resume_project(resume_id, project_id) VALUES${valStr};`
        const relArr = []
        projectIdArr.forEach(item => {
          relArr.push(resume_id)
          relArr.push(item)
        })
        const linkResult = await query(relSql, relArr)
        if (linkResult && linkResult.affectedRows && linkResult.affectedRows > 0) {
          json(res, 0, null, '编辑成功!')
        } else {
          json(res, 1, linkResult, '编辑失败!')
        }
      } else {
        json(res, 1, result, '编辑失败!')
      }
    } else {
      // 新增
      vallist = [name, birthday, avatar, gendar, school, skills, location, profession, graduationDate, blog, github, phone, email, wechat, qq, job, extra]
      const strArr = ['name', 'birthday', 'avatar', 'gendar', 'school', 'skills', 'location', 'profession', 'graduationDate', 'blog', 'github', 'phone', 'email', 'wechat', 'qq', 'job', 'extra']
      const str = strArr.join(',')
      const q = (new Array(vallist.length).fill('?')).join(',')
      sql = `INSERT INTO resumes(${str}) VALUES(${q})`
      const result = await query(sql, vallist)
      if (result && result.affectedRows && result.affectedRows > 0) {
        const projectIdArr = projectIds.split(',')
        const resume_id = result.insertId
        const valStr = new Array(projectIdArr.length).fill('(?, ?)').join(',')
        const relSql = `INSERT INTO resume_project(resume_id, project_id) VALUES${valStr};`
        const relArr = []
        projectIdArr.forEach(item => {
          relArr.push(resume_id)
          relArr.push(item)
        })
        const linkResult = await query(relSql, relArr)
        if (linkResult && linkResult.affectedRows && linkResult.affectedRows > 0) {
          json(res, 0, null, '新增成功!')
        } else {
          json(res, 1, linkResult, '新增失败!')
        }
      } else {
        json(res, 1, result, '新增失败!')
      }
    }
  } catch(err) {
    json(res, 1, err, '操作失败!')
  }
});

module.exports = router;