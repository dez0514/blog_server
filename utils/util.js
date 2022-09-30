// 判断两个简单对象值是否相等
const isSimpleObjValEquel = (obj1, obj2) => {
  const arr = Object.keys(obj1)
  const temp = Object.keys(obj2)
  if(arr.length !== temp.length) return false
  const isEquel = arr.every(item => (item in obj2) && (obj2[item] === obj1[item]))
  return isEquel
}

module.exports = {
  isSimpleObjValEquel
}