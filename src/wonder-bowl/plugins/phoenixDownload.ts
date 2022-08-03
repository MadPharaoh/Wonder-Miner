const baseUrl = 'https://github.com/wonderglobal/plugin-downloads/releases/download'

interface download {
   version: string
   linuxUrl: string
   windowsUrl: string

}

export const download: download =  {
      version: '5.7b',
      linuxUrl: baseUrl + '/phoenixminer-5-7b/PhoenixMiner_6.2c_Linux.tar.gz',
      windowsUrl: baseUrl + '/phoenixminer-5-7b/phoenixminer-5-7b-windows.zip',
    }
