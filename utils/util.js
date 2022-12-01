// 判断两个简单对象值是否相等
const isSimpleObjValEquel = (obj1, obj2) => {
  const arr = Object.keys(obj1)
  const temp = Object.keys(obj2)
  if(arr.length !== temp.length) return false
  const isEquel = arr.every(item => (item in obj2) && (obj2[item] === obj1[item]))
  return isEquel
}

const isFalse = (val) => {
  return val === '' || val === null || typeof val === 'undefined' || val === 'undefined'
}

const getRandomAvatar = () => {
  // 0 - 20 的随机数
  const num =  Math.floor(Math.random() * 20)
  // 通过 /blogSystemFile 代理
  return `/blogSystemFile/imgs/avatar/${num}.jpg`
}
module.exports = {
  isSimpleObjValEquel,
  isFalse,
  getRandomAvatar
}