const baseUrl = 'https://github.com/wonderglobal/plugin-downloads/releases/download'

interface download {
  version:string
  linuxUrl:string
  macOSUrl:string
  windowsUrl:string
}

export const download: download = {
        version: '6.12.1',
        linuxUrl: baseUrl + '/xmrig-6.16.4/xmrig-6.17.0-linux.tar.gz',
        macOSUrl: baseUrl + '/xmrig-6.16.4/xmrig-6.12.1-macos.tar.gz',
        windowsUrl: baseUrl + '/xmrig-6.16.4/xmrig-6.16.4-windows.zip',
      
}