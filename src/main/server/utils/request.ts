/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 15:45:19
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:33:32
 * @FilePath: /template/src/main/server/utils/net_ease/request.ts
 * @Description: 创建加密请求和解密请求的统一接口
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import axios from 'axios'
import CryptoJS from 'crypto-js'
import * as encrypt from './crypto.js' // 假设你刚才的文件叫这个
// 注意：如果你本地没有 index.cjs 的 TS 版，可以暂时用 @ts-ignore
// @ts-ignore xxx
import { cookieObjToString, toBoolean } from './utils.js'
// @ts-ignore xxx
import { APP_CONF } from './config.json'

// --- 类型定义 ---

interface OsConfig {
  os: string
  appver: string
  osver: string
  brand?: string
}

interface RequestOptions {
  crypto: 'weapi' | 'linuxapi' | 'eapi' | 'api'
  headers: Record<string, string>
  cookie: Record<string, any>
  ua?: string
  e_r?: boolean
}

// --- 常量配置 ---
const osMap: Record<string, OsConfig> = {
  pc: {
    os: 'pc',
    appver: '3.0.18.203152',
    osver: 'Microsoft-Windows-10-Professional-build-22631-64bit'
  },
  android: {
    os: 'android',
    appver: '9.1.71',
    osver: '14',
    brand: 'Redmi'
  },
  iphone: {
    os: 'iOS',
    appver: '9.0.90',
    osver: '16.2'
  }
}

/**
 * @description: 给不同的平台选择不同的 User-Agent头
 * @return {*}
 */
const chooseUserAgent = (
  crypto: 'weapi' | 'api',
  uaType: 'pc' | 'android' | 'iphone' = 'pc'
): string => {
  const userAgentMap = {
    weapi: {
      pc: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0'
    },
    api: {
      pc: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.0.18.203152',
      android:
        'NeteaseMusic/9.1.65.240927161425(9001065);Dalvik/2.1.0 (Linux; U; Android 14; 23013RK75C Build/UKQ1.230804.001)',
      iphone: 'NeteaseMusic 9.0.90/5038 (iPhone; iOS 16.2; zh_CN)'
    }
  }
  // @ts-ignore xxx
  return userAgentMap[crypto][uaType] || ''
}

const generateCookie = (cookie: Record<string, any>): any => {
  const _ntes_nuid = CryptoJS.lib.WordArray.random(32).toString()
  const os = osMap[cookie.os] || (osMap['android'] as OsConfig)

  return {
    ...cookie,
    __remember_me: 'true',
    ntes_kaola_ad: '1',
    _ntes_nuid: _ntes_nuid,
    _ntes_nnid: `${_ntes_nuid},${Date.now().toString()}`,
    osver: cookie.osver || os.osver,
    // @ts-ignore xxx
    deviceId: cookie.deviceId || global.deviceId || '',
    os: cookie.os || os.os,
    channel: cookie.channel || 'netease',
    appver: cookie.appver || os.appver
  }
}

/**
 * 创建网易云请求的核心函数
 */
export const createRequest = async (
  uri: string,
  data: any,
  options: RequestOptions
): Promise<any> => {
  //拿到头/cokkie/加密方式选择
  const headers = options.headers
  const cookie = generateCookie(options.cookie)
  const cryptoMethod = options.crypto

  //如果不是登陆相关接口，添加 NMTID
  if (uri.indexOf('login') === -1) {
    //@ts-ignore —— 添加一个随机 NMTID
    cookie['NMTID'] = CryptoJS.lib.WordArray.random(16).toString()
  }

  headers['Cookie'] = cookieObjToString(cookie)
  headers['Content-Type'] = 'application/x-www-form-urlencoded'

  let url = ''
  let encryptData: any = ''
  //@ts-ignore —— 携带上__csrf
  const csrfToken = cookie['__csrf'] || ''

  //根据不同的加密方式设置参数
  switch (cryptoMethod) {
    case 'weapi':
      headers['Referer'] = APP_CONF.domain
      headers['User-Agent'] = options.ua || chooseUserAgent('weapi', 'pc')
      data.csrf_token = csrfToken
      encryptData = encrypt.weapi(data)
      url = APP_CONF.domain + '/weapi/' + uri.substring(5)
      break

    case 'linuxapi':
      headers['User-Agent'] =
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
      encryptData = encrypt.linuxapi({
        method: 'POST',
        url: APP_CONF.apiDomain + uri,
        params: data
      })
      url = APP_CONF.apiDomain + '/api/linux/forward'
      break

    case 'eapi':
    case 'api': {
      const header = {
        ...cookie,
        versioncode: '9001071',
        mobilename: '23113RKC6C',
        buildver: Date.now().toString().substring(0, 10),
        resolution: '2560x1600',
        __csrf: csrfToken,
        requestId: `${Date.now()}_${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(4, '0')}`
      }

      headers['Cookie'] = cookieObjToString(header)
      // 根据 cookie 里的 os 选择 UA 类型
      const uaType =
        cookie.os === 'pc' || cookie.os === 'android' || cookie.os === 'iphone'
          ? cookie.os
          : 'android'
      headers['User-Agent'] = chooseUserAgent('api', uaType)

      if (cryptoMethod === 'eapi') {
        data.header = header
        const e_r =
          options.e_r !== undefined
            ? options.e_r
            : data.e_r !== undefined
              ? data.e_r
              : APP_CONF.encryptResponse
        data.e_r = toBoolean(e_r)
        encryptData = encrypt.eapi(uri, data)
        url = APP_CONF.apiDomain + '/eapi/' + uri.substring(5)
      } else {
        url = APP_CONF.apiDomain + uri
        encryptData = new URLSearchParams(data).toString() // 普通 api 传参方式
      }
      break
    }

    default:
      throw new Error('Unknown Crypto: ' + cryptoMethod)
  }

  const config = {
    url,
    headers,
    data: encryptData,
    method: 'POST'
  }
  const res = await axios(config)
  let resData = res.data
  const resCookie = (res.headers['set-cookie'] || []).map(x =>
    x.replace(/\s*Domain=[^(;|$)]+;*/, '')
  )

  try {
    // 如果 e_r 为 true，则需要解密响应
    // @ts-ignore —— 获取 e_r
    if (res.e_r) {
      // eapi接口返回值被加密，需要解密
      resData = encrypt.eapiResDecrypt(resData.toString('hex').toUpperCase())
    } else {
      resData = typeof resData == 'object' ? resData : JSON.parse(resData.toString())
    }
  } catch (e) {
    throw new Error('NetEaseCloud Response Error: ' + e)
  }

  return {
    status: res.status,
    data: resData,
    cookie: resCookie
  }
}
