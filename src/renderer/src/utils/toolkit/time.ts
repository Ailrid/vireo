/**
 * 将秒数转换为 00:00 或 00:00:00 格式
 * @param seconds 秒数
 */
export const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '00:00'

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const mm = m.toString().padStart(2, '0')
  const ss = s.toString().padStart(2, '0')
  return h > 0 ? `${h.toString().padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`
}
/**
 * 将秒数转换为 xxxx年xx月xx日日期
 * @param time 秒数
 */
export function convertDate(time: number): string {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // 月份从0开始，需要加1，并且确保是两位数
  const day = date.getDate().toString().padStart(2, '0') // 确保是两位数
  return `${year}-${month}-${day}`
}
