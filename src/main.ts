import { app,
        BrowserWindow,
        screen,
        Tray,
        nativeTheme,
        nativeImage,
        Notification,
        Menu, 
        shell, 
        ipcMain as bridge,
       } from 'electron'
import * as path from "path"
import * as icons from './icons'
import * as Logger from './Logger'
import * as os from 'os'
import isOnline  from 'is-online'
import Store from 'electron-store'
import si from 'systeminformation'
import { WindowsToaster } from 'node-Notifier'
import process from 'process'
import { Profile } from './modules/Profile';
import { NotificationService } from './wonder-bowl/NotificationService'
import { MachineSystem } from './modules/MachineSystem'
import { MenuItemConstructorOptions } from 'electron/main'
import { DefaultTheme as theme } from './WonderTheme'
import { autoUpdater } from 'electron-updater'
import { PluginManager } from './wonder-bowl/PluginManager'
import { APP_URL , TOKEN_URL, LOGOUT_URL } from './config'
import { RPCClient } from './Discord-RPC'
import { PluginStatus } from './wonder-bowl/models/PluginStatus'
import { PluginDefinition } from './wonder-bowl/models/PluginDefinition'
import { getPluginDefinitionsXMRig} from './wonder-bowl/plugins'
import { getPluginDefinitionsPhoenix } from './wonder-bowl/plugins'



const AutoLaunch = require('auto-launch')
const startCPU = 'start-CPU'
const stop = 'stop'
const startGPU = 'start-GPU'
const Login = 'Login'
const Logout = 'Logout'
const NotificationAction = 'notification-Action'

 
// The path to the `/static` folder. This is provided by electron-webpack.
declare const __static: string

Logger.connect()



let store = new Store()
let client = new RPCClient()
let mainWindow: BrowserWindow
let tray: Tray
let activeIconEnabled = false
let offlineWindow: BrowserWindow
let updateChecked = false 
let pluginManager: PluginManager | undefined
let darkTheme = nativeTheme.shouldUseDarkColors
let machineInfo: Promise<MachineSystem> | undefined
let TOKEN = store.get('login-token')


const getMachineInfo = (): Promise<MachineSystem> => {
  return Promise.allSettled([
    si.cpu(),
    si.graphics(),
    si.memLayout(),
    si.osInfo(),
    si.services('*'),
    si.system(),
    si.uuid(),
    si.version(),
    si.processes(),
  ]).then(([cpu, graphics, memLayout, osInfo, services, system, uuid, version, processes]) => {
    return {
      version: version.status === 'fulfilled' ? version.value : undefined,
      system: system.status === 'fulfilled' ? system.value : undefined,
      cpu: cpu.status === 'fulfilled' ? cpu.value : undefined,
      memLayout: memLayout.status === 'fulfilled' ? memLayout.value : undefined,
      graphics: graphics.status === 'fulfilled' ? graphics.value : undefined,
      os: osInfo.status === 'fulfilled' ? osInfo.value : undefined,
      platform: process.platform,
      processes: processes.status === 'fulfilled' ? processes.value : undefined,
      uuid: uuid.status === 'fulfilled' ? uuid.value : undefined,
      services: services.status === 'fulfilled' ? services.value : undefined,
    }
  })
}



app.disableHardwareAcceleration()


app.setAppUserModelId('Wonder-Miner-desktop-app')

var notifier = new WindowsToaster({
  withFallback: false,
  customPath: path
    .resolve(
      app.getAppPath(),
      'node_modules/node-notifier/vendor/snoreToast/snoretoast-x' + (os.arch() === 'x64' ? '64' : '86') + '.exe',
    )
    .replace('app.asar', 'app.asar.unpacked'),
})

client.login({ clientId: "954828605819609148" })

/** Ensure only 1 instance of the app ever run */
const checkForMultipleInstance = () => {
  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', () => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (!mainWindow.isVisible()) {
          mainWindow.show()
          if (process.platform === 'darwin') {
            app.dock.show()
          }
        }

        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }

        mainWindow.focus()
      }
    })
  }
}

const createOfflineWindow = () => {
  if (offlineWindow) {
    return
  }

  if (mainWindow) {
    return
  }

  offlineWindow = new BrowserWindow({
    backgroundColor: theme.black,
    center: true,
    frame: false,
    height: 350,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: theme.black,
      symbolColor: theme.white
    },
    icon: icons.WINDOW_ICON_PATH,
    resizable: false,
    title: 'Wonder',
    width: 300,
  })

  offlineWindow.loadURL(`file://${__static}/offline.html`)

  offlineWindow.on('close', () => {
    console.log('offline window close')
    app.quit()
  })
}

const createMainMenu = () => {
  if (process.platform === 'darwin') {
    const template: MenuItemConstructorOptions[] | null = [
      { role: 'appMenu' },
      { role: 'editMenu' },
      { role: 'windowMenu' },
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: () => shell.openExternal('https://wonder.software'),
          },
          {
            label: 'Support',
            click: () => shell.openExternal('https://wonderminer.net'),
          },
        ],
      },
    ]
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  } else {
    Menu.setApplicationMenu(null)
  }
}


const createMainWindow = () => {
  const mainScreen = screen;
  const size = mainScreen.getPrimaryDisplay().workAreaSize

  const wonderAutoLauncher = new AutoLaunch({
    name: 'Wonder Miner',
  }) 


  if (mainWindow) {
    if (tray) {
      tray.setContextMenu(createSystemTrayMenu(true))
    }

    mainWindow.show()
    return
  }
  let maximized = false

  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    backgroundColor: theme.white,
    icon: icons.WINDOW_ICON_PATH,
    center: true,
    title: 'Wonder Miner',
    height: size.height,
    frame: false,
    webPreferences: {
      nodeIntegration:true,
      preload: path.resolve(__dirname, './preload.js'),
    }
  });
  mainWindow.loadURL(APP_URL)

  mainWindow.on('closed', () => {
      app.quit()
   })


  mainWindow.once('ready-to-show', () => {
    tray = new Tray(nativeImage.createFromPath(darkTheme ? icons.DARK_TRAY_ICON_PATH : icons.TRAY_ICON_PATH))
    tray.setContextMenu(createSystemTrayMenu(true))
    tray.setToolTip('Wonder Miner')
    tray.on('double-click', () =>{
      if(mainWindow){
        if(mainWindow.isVisible()){
          tray.setContextMenu(createSystemTrayMenu(false))
          mainWindow.hide()
          if(process.platform === 'darwin') {
            app.dock.hide()
          }
        }else {
          tray.setContextMenu(createSystemTrayMenu(true))
          mainWindow.show()
          if(process.platform === 'darwin')
          app.dock.show()
        }
      }
    })
    mainWindow.show()

    if (offlineWindow) {
      offlineWindow.destroy()
    }
  })

  let notificationService = new NotificationService(mainWindow, (status) => {
    if (status === PluginStatus.Initializing || status === PluginStatus.Installing || status === PluginStatus.Running) {
      if (!activeIconEnabled) {
        activeIconEnabled = true
        if (mainWindow) {
          if (process.platform === 'win32') {
            mainWindow.setOverlayIcon(
              nativeImage.createFromPath(icons.TASKBAR_ACTIVE_OVERLAY_ICON_PATH),
              'Background Tasks Running',
            )
          } else if (process.platform === 'linux') {
            // TODO: Add Linux-specific icon management
          } else if (process.platform === 'darwin') {
            app.dock.setIcon(nativeImage.createFromPath(icons.DOCK_ACTIVE_ICON_PATH))
          }
        }

        if (tray) {
          tray.setImage(
            nativeImage.createFromPath(darkTheme ? icons.DARK_TRAY_ACTIVE_ICON_PATH : icons.TRAY_ACTIVE_ICON_PATH),
          )
        }
      }
    } else {
      if (activeIconEnabled) {
        activeIconEnabled = false
        if (mainWindow) {
          if (process.platform === 'win32') {
            mainWindow.setOverlayIcon(null, '')
          } else if (process.platform === 'linux') {
            // TODO: Add Linux-specific icon management
          } else if (process.platform === 'darwin') {
            app.dock.setIcon(nativeImage.createFromPath(icons.DOCK_ICON_PATH))
          }
        }

        if (tray) {
          tray.setImage(nativeImage.createFromPath(darkTheme ? icons.DARK_TRAY_ICON_PATH : icons.TRAY_ICON_PATH))
        }
      }
    }

  })

  let dataFolder = app.getPath('userData')
  console.log(`Path to Wonder plugins:${dataFolder}`)
  pluginManager = new PluginManager(dataFolder, notificationService)
   


  //Ipc.Main 
  bridge.handle('maximize-window', () => {
    if (!maximized) {
      mainWindow.maximize()
      maximized = true
      console.log('Maximizing Window')
    } else {
      mainWindow.unmaximize()
      maximized = false
      console.log('UnMaximizing Window')
    }
  })

  bridge.handle('minimize-window', () => {
    mainWindow.minimize()
    console.log('Minimizing Window')
  })

  bridge.handle('close-window', () => {
    console.log('Closing APP')
      app.quit()
  })

  bridge.handle('hide-window', () => {
    if (mainWindow && mainWindow.isVisible()) {
      tray.setContextMenu(createSystemTrayMenu(false))
      mainWindow.hide()
      if (process.platform === 'darwin') {
        app.dock.hide()
      }
    }
    notifier.notify({
      appID: "Wonder Miner",
      title: 'Wonder Miner',
      message: 'Arkaplan moduna geçildi',
      icon:  icons.DOCK_ACTIVE_ICON_PATH,
      sound: true,      
    })
  })

  bridge.handle(startCPU, (_event, profile: Profile, pluginDefinition: PluginDefinition) => {
    pluginDefinition = getPluginDefinitionsXMRig(profile)
    if (pluginManager) pluginManager.start(pluginDefinition)
  })
  bridge.handle(startGPU, (_event, profile: Profile , pluginDefinition: PluginDefinition) => {
    pluginDefinition = getPluginDefinitionsPhoenix(profile)
    if (pluginManager) pluginManager.start(pluginDefinition)
  })
 
  bridge.handle(stop, () => {
    if(pluginManager) pluginManager.stop()
  })

  bridge.on('get-stored-info', () => {
    mainWindow.webContents.send('set-system-info', store.get('system-info'))
  })
  
  bridge.on('get-system-info', () => {
    if (!store.get('system-info')) {
        if (machineInfo === undefined) {
            machineInfo = getMachineInfo()
        }

        machineInfo.then((info) => {
        mainWindow.webContents.send('set-system-info', JSON.parse(JSON.stringify(info)))
        store.set('system-info', JSON.parse(JSON.stringify(info)))
        });
    }
  })

  bridge.handle('enable-auto-launch', () => {
    wonderAutoLauncher.enable()
    notifier.notify({
      appID: "Wonder Miner",
      title: 'Wonder Miner',
      message: 'Açılışta başlatma aktif edildi',
      icon: icons.NOTIFICATION_ICON_PATH,
      sound: true
    })
  })

  bridge.handle('disable-auto-launch', () => {
    wonderAutoLauncher.disable()
    notifier.notify({
      appID: "Wonder Miner",
      title: 'Wonder Miner',
      message: 'Açılışta başlatma devre dışı bırakıldı',
      icon: icons.NOTIFICATION_ICON_PATH,
      sound: true,
    })
  })

  bridge.on(Login, (_event, profile: Profile) => {
    store.set('login-token', profile.login_token)
  })

  bridge.handle(Logout, () => {
    store.clear()
    mainWindow.webContents.loadURL(LOGOUT_URL)
  })

  bridge.on(NotificationAction, (_event,message: { title: string; message: string }) => {
    if (process.platform === 'win32') {
      notifier.notify(
        {
          ...message,
          icon: icons.NOTIFICATION_ICON_PATH,
          appID: 'Wonder Miner',
        },
        (err) => {
          if (err) {
            console.warn('Notification error')
            console.warn(err)
          }
        },
      )
    } else if (Notification.isSupported()) {
      let notification = new Notification({
        title: message.title,
        body: message.message,
        icon: icons.NOTIFICATION_ICON_PATH,
      })
      notification.show()
    }
  })
  
  mainWindow.webContents.on('new-window', (e: Electron.Event, url: string) => {
    console.log(`opening new window at ${url}`)
    e.preventDefault()
    shell.openExternal(url)
  })

  mainWindow.webContents.on('console-message', (_: Electron.Event, level: number, message: string, line: number) => {
    console.log(`console:${line}:${level}:${message}`)
  })

  mainWindow.webContents.once('did-finish-load', () => {
    if (!TOKEN){
      return
    }
    mainWindow.webContents.loadURL(TOKEN_URL+TOKEN)
  })

}



const checkForUpdates = () => {
  if (updateChecked) {
    return
  }
  updateChecked = true
  console.log('Checking for updates...')

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...')
  })
  autoUpdater.on('update-available', (info) => {
    console.log('Update available.' + info)
  })
  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available.' + info)
  })
  autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater.' + err)
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'download speed: ' + progressObj.bytesPerSecond
    log_message = log_message + ' - Download ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
    console.log(log_message)
  })
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update dwonloaded.' + info)
  })
  autoUpdater.logger = Logger.log
  autoUpdater.checkForUpdatesAndNotify()

}

const onReady = async () => {
  createMainMenu()
  if (await isOnline({ timeout: 10000 })) {
    createMainWindow()
    checkForUpdates()
  } else {
    createOfflineWindow()
  }
}

checkForMultipleInstance()



app.on("ready", () => { onReady()});

app.on('will-quit', () => {
  console.log('will quit')
  if (pluginManager) pluginManager.stop()

})

process.on('exit', () => {
  console.log('Process exit')
  if (pluginManager) pluginManager.stop()

})

app.on('window-all-closed', () => {
  console.log('window-all-closed')
  if (process.platform != 'darwin') {
      app.quit()
  }
})

const cleanExit = () => {
  console.log('clean-exit')
  if (pluginManager) pluginManager.stop()
  process.exit()
}

process.on('SIGINT', cleanExit) // catch ctrl-c
process.on('SIGTERM', cleanExit) // catch kill
console.log(`Running ${app.name} ${app.getVersion()}`)

function createSystemTrayMenu(isVisible: boolean): Menu {
  return Menu.buildFromTemplate([
    {
      label: isVisible ? 'Hide Wonder Miner Window' : 'Show Wonder Miner Window',
      click: isVisible
        ? () => {
            if (mainWindow) {
              tray.setContextMenu(createSystemTrayMenu(false))
              mainWindow.hide()
              if (process.platform === 'darwin') {
                app.dock.hide()
              }
            }
          }
        : () => {
            if (mainWindow) {
              tray.setContextMenu(createSystemTrayMenu(true))
              mainWindow.show()
              if (process.platform === 'darwin') {
                app.dock.show()
              }
            }
          },
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => {
        app.quit()
      },
    },
  ])
}

nativeTheme.on('updated', () => {
  darkTheme = nativeTheme.shouldUseDarkColors
  if (tray) {
    if (activeIconEnabled) {
      tray.setImage(
        nativeImage.createFromPath(darkTheme ? icons.DARK_TRAY_ACTIVE_ICON_PATH : icons.TRAY_ACTIVE_ICON_PATH),
      )
    } else {
      tray.setImage(nativeImage.createFromPath(darkTheme ? icons.DARK_TRAY_ICON_PATH : icons.TRAY_ICON_PATH))
    }
  }
})

