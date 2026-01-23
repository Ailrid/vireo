/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 15:31:59
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:33:19
 * @FilePath: /template/src/main/server/utils/net_ease/crypto.ts
 * @Description:网易云加密和解密算法
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import CryptoJS from 'crypto-js'
import forge from 'node-forge'
const iv = '0102030405060708'
const presetKey = '0CoJUm6Qyw8W8jud'
const linuxapiKey = 'rFgB&h#%2?^eDg:Q'
const base62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB
-----END PUBLIC KEY-----`
const eapiKey = 'e82ckenh8dichen8'
// 定义加密格式类型
type CryptoFormat = 'base64' | 'hex'

/**
 * 通用 AES 加密函数
 * @param text 待加密的明文
 * @param mode 加密模式 (如 'cbc', 'ecb')
 * @param key 密钥
 * @param iv 偏移量
 * @param format 输出格式 ('base64' 或 'hex')
 */
export const aesEncrypt = (
  text: string,
  mode: string,
  key: string,
  iv: string,
  format: CryptoFormat = 'base64'
): string => {
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(text),
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: CryptoJS.enc.Utf8.parse(iv),
      // @ts-ignore —— 动态访问 mode
      mode: CryptoJS.mode[mode.toUpperCase()],
      padding: CryptoJS.pad.Pkcs7
    }
  )
  if (format === 'base64') {
    return encrypted.toString()
  }
  return encrypted.ciphertext.toString().toUpperCase()
}

/**
 * 通用 AES 解密函数
 */
export const aesDecrypt = (
  ciphertext: string,
  key: string,
  iv: string,
  format: CryptoFormat = 'base64'
): string => {
  let bytes
  const keyHex = CryptoJS.enc.Utf8.parse(key)
  const ivHex = CryptoJS.enc.Utf8.parse(iv)
  const config = {
    iv: ivHex,
    mode: CryptoJS.mode.ECB, // 注意：你原代码里解密写死了 ECB
    padding: CryptoJS.pad.Pkcs7
  }

  if (format === 'base64') {
    bytes = CryptoJS.AES.decrypt(ciphertext, keyHex, config)
  } else {
    bytes = CryptoJS.AES.decrypt(
      // @ts-ignore xxx
      { ciphertext: CryptoJS.enc.Hex.parse(ciphertext) },
      keyHex,
      config
    )
  }
  return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * RSA 加密 (通常用于加密 AES 的随机密钥)
 * @param str 待加密字符串
 * @param key PEM 格式的公钥
 */
export const rsaEncrypt = (str: string, key: string): string => {
  const forgePublicKey = forge.pki.publicKeyFromPem(key) as forge.pki.rsa.PublicKey
  const encrypted = forgePublicKey.encrypt(str, 'NONE')
  return forge.util.bytesToHex(encrypted)
}

/**
 * WEAPI 方案：常用于 Web 端接口
 * 流程：JSON 数据 -> AES 加密 (presetKey) -> AES 加密 (随机 Key) -> 随机 Key 用 RSA 加密
 * @param object 请求参数对象
 */
export const weapi = (object: object): any => {
  const text = JSON.stringify(object)
  let secretKey = ''
  for (let i = 0; i < 16; i++) {
    secretKey += base62.charAt(Math.round(Math.random() * 61))
  }
  return {
    params: aesEncrypt(aesEncrypt(text, 'cbc', presetKey, iv), 'cbc', secretKey, iv),
    encSecKey: rsaEncrypt(secretKey.split('').reverse().join(''), publicKey)
  }
}

/**
 * LINUXAPI 方案：用于 Linux 客户端接口
 * 流程：直接使用 AES (ECB模式) 加密
 */
export const linuxapi = (object: object): any => {
  const text = JSON.stringify(object)
  return {
    eparams: aesEncrypt(text, 'ecb', linuxapiKey, '', 'hex')
  }
}

/**
 * EAPI 方案：常用于移动端接口
 * 流程：特定格式字符串 -> MD5 摘要 -> 拼接字符串 -> AES (ECB模式) 加密
 */
export const eapi = (url: string, object: string | object): any => {
  const text = typeof object === 'object' ? JSON.stringify(object) : object
  const message = `nobody${url}use${text}md5forencrypt`
  const digest = CryptoJS.MD5(message).toString()
  const data = `${url}-36cd479b6b5-${text}-36cd479b6b5-${digest}`
  return {
    params: aesEncrypt(data, 'ecb', eapiKey, '', 'hex')
  }
}

/**
 * EAPI 响应解密
 * @param encryptedParams 接口返回的 hex 字符串
 */
export const eapiResDecrypt = (encryptedParams: string): any => {
  const decryptedData = aesDecrypt(encryptedParams, eapiKey, '', 'hex')
  return JSON.parse(decryptedData)
}

/**
 * EAPI 请求参数逆向解析 (调试用)
 * @param encryptedParams 请求中的 params (hex 格式)
 */
export const eapiReqDecrypt = (encryptedParams: string): any => {
  const decryptedData = aesDecrypt(encryptedParams, eapiKey, '', 'hex')
  const match = decryptedData.match(/(.*?)-36cd479b6b5-(.*?)-36cd479b6b5-(.*)/)
  if (match) {
    const url = match[1]
    const data = JSON.parse(match[2] as string)
    return { url, data }
  }
  return null
}

/**
 * 通用 hex 格式 AES-ECB 解密
 */
export const decrypt = (cipher: string): string => {
  const decipher = CryptoJS.AES.decrypt(
    // @ts-ignore xxx
    { ciphertext: CryptoJS.enc.Hex.parse(cipher) },
    CryptoJS.enc.Utf8.parse(eapiKey),
    { mode: CryptoJS.mode.ECB }
  )
  return CryptoJS.enc.Utf8.stringify(decipher)
}
