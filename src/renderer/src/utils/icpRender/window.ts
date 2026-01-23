import { IpcRenderRegister } from './icpRender'
export function closeWindow(): void {
  IpcRenderRegister.send('close-window')
}
export function minimizeWindow(): void {
  IpcRenderRegister.send('minimize-window')
}
export function maximizeWindow(): void {
  IpcRenderRegister.send('maximize-window')
}
export function hideWindow(): void {
  IpcRenderRegister.send('hide-window')
}
export function openUrl(url: string): void {
  IpcRenderRegister.send('open-url', url)
}
