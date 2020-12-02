
/**
 * Created by zyp on 2019/7/11.
 */
import axios from 'axios'
import qs from 'qs'
import md5 from 'js-md5';
import { baseURL, zhuBaseURL} from './url'

// axios.defaults.baseURL = baseURL
axios.defaults.headers.post['Content-Type'] = 'application/json'

// 登录获取token  platform/Passport/login
export function getLogin (param) {
  const url = baseURL + 'platform/Passport/login'
  return axios.post(url, {
    account: param.account,
    pwd: md5(param.pwd)
  }).then((res) => {
    return Promise.resolve(res)
  })
}

// 获取APP列表  platform/AppAccount/list
export function getAppList (param) {
  const url = baseURL + 'platform/AppAccount/list'
  return axios.post(url,{
    page: param.page,
    size: param.size
  },{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

// 获取APP列表(包含子菜单)  platform/AndroidApps/subCategory
export function getList () {
  const url = baseURL + 'platform/AndroidApps/subCategory'
  return axios.get(url,{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

// 获取APP任务类型列表  platform/functions/list
export function getTaskList (id) {
  const url = baseURL + 'platform/functions/list'
  return axios.post(url,{
    android_app_id: id
  },{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

// 获取任务类型拓展列表  platform/FunctionsExtend/list
export function getTaskExpandList (id) {
  const url = baseURL + 'platform/FunctionsExtend/list'
  return axios.post(url,{
    function_id: id
  },{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//发布任务接口  platform/task/push
export function postTask (param) {
  // console.log(param)
  const url = baseURL + 'platform/task/push'
  return axios.post(url,{
    android_app_id: param.android_app_id,
    quantity: param.quantity,
    status: param.status,
    function_id: param.function_id,
    script_url: param.script_url,
    app_url:param.app_url,
    content: param.content,
    exec_type:param.exec_type,
    script_pkg_name:param.script_pkg_name,
    app_pkg_name:param.app_pkg_name
  },{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//获取任务列表  platform/task/list
export function getTask (param) {
  const url = baseURL + 'platform/task/list'
  return axios.post(url,{
    page: param.page,
    size: param.size
  },{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//登录阿法猪  login/password
export function bindAccount (mobile, password) {
  const url = zhuBaseURL + 'login/password'
  return axios.post(url,{
    mobile: mobile,
    password: password,
    encrypt: 0
  },{
    headers:{
      'X-Afagou-Domain': 'afazhu.com',
      'X-Afagou-User-Agent': 'api',
      'X-Afagou-Version': '1.0'
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//绑定阿法猪  platform/afazhu/edit
export function editAccount (param) {
  const url = baseURL + 'platform/afazhu/edit'
  return axios.post(url,{
    account: param.mobile,
    password: param.password,
  },{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//平台账号数量详情  platform/AppAccount/accountCountDetail
export function getAccountNum (param) {
  const url = baseURL + 'platform/AppAccount/accountCountDetail'
  return axios.get(url,{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//微博点赞  v2/orders/save
export function wbLike (param) {
  const url = zhuBaseURL + 'v2/orders/save'
  return axios.post(url,{
    number: param.number,
    goods_id: param.goods_id,
    parameters: {
      url: param.url
    }
  },{
    headers:{
      'X-Afagou-Domain': 'afazhu.com',
      'X-Afagou-User-Agent': 'api',
      'X-Afagou-Version': '1.0',
      'token': localStorage.getItem('access_token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//一级评论
export function firstComment (param) {
  const url = zhuBaseURL + 'v2/orders/save'
  return axios.post(url,{
    number: param.number,
    goods_id: param.goods_id,
    parameters: {
      url: param.url,
      comment_type: 7,
      comment_data: param.comment_data
    }
  },{
    headers:{
      'X-Afagou-Domain': 'afazhu.com',
      'X-Afagou-User-Agent': 'api',
      'X-Afagou-Version': '1.0',
      'token': localStorage.getItem('access_token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//一级评论点赞
export function firstCommentLike (param) {
  const url = zhuBaseURL + 'v2/orders/save'
  return axios.post(url,{
    number: param.number,
    goods_id: param.goods_id,
    parameters: {
      url: param.url,
      ztype: '2'
    }
  },{
    headers:{
      'X-Afagou-Domain': 'afazhu.com',
      'X-Afagou-User-Agent': 'api',
      'X-Afagou-Version': '1.0',
      'token': localStorage.getItem('access_token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//一级评论点赞
export function WbRelease (param) {
  const url = zhuBaseURL + 'v2/orders/save'
  return axios.post(url,{
    number: param.number,
    goods_id: param.goods_id,
    parameters: {
      url: param.url,
      category_theme: param.category_theme
    }
  },{
    headers:{
      'X-Afagou-Domain': 'afazhu.com',
      'X-Afagou-User-Agent': 'api',
      'X-Afagou-Version': '1.0',
      'token': localStorage.getItem('access_token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//订单管理
export function orderManagement (param) {
  const url = zhuBaseURL + 'orders?user_id='+param.user_id+'&status='+param.status+'&keyword='+param.keyword+'&keyword_type='+param.keyword_type+'&page='+param.current_page
  return axios.get(url,{
    headers:{
      'X-Afagou-Domain': 'afazhu.com',
      'X-Afagou-User-Agent': 'api',
      'X-Afagou-Version': '1.0',
      'token': localStorage.getItem('access_token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//订单管理
export function orderInfo (param) {
  const url = zhuBaseURL + 'orders/cards/'+param.order_id
  return axios.get(url,{
    headers:{
      'X-Afagou-Domain': 'afazhu.com',
      'X-Afagou-User-Agent': 'api',
      'X-Afagou-Version': '1.0',
      'token': localStorage.getItem('access_token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//判断是否上架
export function isShelf (param) {
  const url = zhuBaseURL + 'goods/'+param
  return axios.get(url,{
    headers:{
      'X-Afagou-Domain': 'afazhu.com',
      'X-Afagou-User-Agent': 'api',
      'X-Afagou-Version': '1.0',
      'token': localStorage.getItem('access_token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//获取应用列表  platform/AndroidApps/list
export function getTerraceList (param) {
  const url = baseURL + 'platform/AndroidApps/list'
  return axios.post(url, {
    page: param.page,
    size: param.size
  },{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//获取APP-OTA列表  platform/AppOta/getList
export function getAppOtaList (param) {
  const url = baseURL + 'platform/AppOta/getList'
  return axios.post(url, {
    page: param.page,
    size: param.size
  },{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//添加APP-OTA列表  platform/AppOta/add
export function addAppOtaList (param) {
  const url = baseURL + 'platform/AppOta/add'
  return axios.post(url, {
    name: param.name,
    url: param.url,
    desc: param.desc,
    version: param.version,
    status: param.status,
    channel: param.channel,
    android_app_id: param.android_app_id
  },{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//修改APP-OTA列表  platform/AppOta/edit
export function editAppOtaList (param) {
  const url = baseURL + 'platform/AppOta/edit'
  return axios.post(url, {
    id: param.id,
    name: param.name,
    url: param.url,
    desc: param.desc,
    version: param.version,
    status: param.status,
    channel: param.channel,
    android_app_id: param.android_app_id
  },{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//推送APP-OTA列表  platform/AppOta/push
export function pushAppOtaList (param) {
  const url = baseURL + 'platform/AppOta/push'
  return axios.post(url, {
    id: param.id
  },{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//微博账户删除 platform/AppAccount/del
export function delAppAccount (param) {
  const url = baseURL + 'platform/AppAccount/del'
  return axios.post(url, {
    id: param
  },{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}

//OTA新增 platform/Ota/add
export function addOTA (param) {
  const url = baseURL + 'platform/Ota/add'
  return axios.post(url, {
    device_type: 1,
    name: param.name,
    url: param.url,
    version: param.version,
    status: 1,
    md5: param.md5
  },{
    headers:{
      token: localStorage.getItem('Token')
    }
  }).then((res) => {
    return Promise.resolve(res)
  })
}