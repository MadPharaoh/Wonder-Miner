
const { ipcRenderer: ipc, contextBridge } = require("electron")

const Wonder_Api = {
  NotificationAction: (message) => ipc.send('notification-Action', message),
  MinimizeWindow: () => ipc.invoke('minimize-window'),
  MaximizeWindow: () => ipc.invoke('maximize-window'),
  CloseWindow: () => ipc.invoke('close-window'),
  HideWindow: () => ipc.invoke('hide-window'),
  startCPU: (message) => ipc.invoke('start-CPU', message),
  startGPU: (message) => ipc.invoke('start-GPU', message),
  stop: () => ipc.invoke('stop'),
  EnableAutoLaunch: () => ipc.invoke('enable-auto-launch'),
  DisableAutoLaunch: () => ipc.invoke('disable-auto-launch'),
  getStoredInfo: () => ipc.send('get-stored-info'),
  getSystemInfo: () => ipc.send('get-system-info'),
  setSystemInfo: () => ipc.on('set-system-info', (event, args) => {
    let gpu = document.querySelector('#gpuinfo')
    gpu.innerHTML = args.graphics.controllers.map((x) => x.model)
    let cpu = document.querySelector('#cpuinfo')
    cpu.innerHTML = `${args.cpu.manufacturer}` + `${args.cpu.brand}`
    let Ram = document.querySelector('#raminfo')
    Ram.innerHTML = args.memLayout.reduce((amount, memory) => amount + memory.size, 0) / (1024 * 1024 * 1024) + `GB`
    let Vram = document.querySelector('#vraminfo')
    Vram.innerHTML = args.graphics.controllers.map((x) => Math.round(x.vram / 256) / 4) + `GB`
    let Platform = document.querySelector('#platforminfo')
    if (args.platform == "win32") {
      Platform.innerHTML = 'Windows'
    }
  }),
  Login: (message) => ipc.send('Login', message),
  Logout: () => ipc.invoke('Logout'),
  MiningStatus: () => ipc.on('mining-status', (event, args) => {
    let replyDiv = document.querySelector('#Status');
    replyDiv.innerHTML = args.status;
    let replyDiv1 = document.querySelector('#Name');
    replyDiv1.innerHTML = args.name;
  }),
  MiningError: () => ipc.on('mining-error', (event, args) => {
    let Errormessage = document.querySelector('#Error-message')
    Errormessage.innerHTML = args.message
    let Errorcode = document.querySelector('#Error-code')
    Errorcode.innerHTML = args.errorCode
    let Errorcategory = document.querySelector('#Error-category')
    Errorcategory.innerHTML = args.errorCategory
  }),
}


contextBridge.exposeInMainWorld("wonder", Wonder_Api)

