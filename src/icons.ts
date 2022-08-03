import path from 'path'
import process from 'process'

// TODO: Move this to a separate `.d.ts` declaration file. This is injected by `electron-webpack`.
declare const __static: string

export const DOCK_ACTIVE_ICON_PATH = path.join(__static, 'icon.png')

export const DOCK_ICON_PATH = path.join(__static, 'icon.png')

export const NOTIFICATION_ICON_PATH = path.join(__static, 'icon.png')

export const TASKBAR_ACTIVE_OVERLAY_ICON_PATH = path.join(__static, 'icon-active.png')

export const TRAY_ACTIVE_ICON_PATH = path.join(
  __static,
  process.platform === 'darwin'
    ? 'icon.png'
    : process.platform === 'win32'
    ? 'icon.ico'
    : 'icon.png',
)

export const TRAY_ICON_PATH = path.join(
  __static,
  process.platform === 'darwin' ? 'icon.png' : process.platform === 'win32' ? 'icon.ico' : 'icon.png',
)

export const DARK_TRAY_ACTIVE_ICON_PATH =
  process.platform === 'darwin' ? path.join(__static, 'icon.png') : TRAY_ACTIVE_ICON_PATH

export const DARK_TRAY_ICON_PATH =
  process.platform === 'darwin' ? path.join(__static, 'icon.png') : TRAY_ICON_PATH

export const WINDOW_ICON_PATH = path.join(__static, process.platform === 'win32' ? 'icon.ico' : 'icon.png')
