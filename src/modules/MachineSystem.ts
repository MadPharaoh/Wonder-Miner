import * as si from "systeminformation";

export interface MachineSystem {
    cpu?: si.Systeminformation.CpuData
    graphics?: si.Systeminformation.GraphicsData
    memLayout?: si.Systeminformation.MemLayoutData[]
    platform?:
    | 'aix'
    | 'android'
    | 'cygwin'
    | 'darwin'
    | 'freebsd'
    | 'haiku'
    | 'linux'
    | 'netbsd'
    | 'openbsd'
    | 'sunos'
    | 'win32'
    processes?: si.Systeminformation.ProcessesData
    services?: si.Systeminformation.ServicesData[]
    system?: si.Systeminformation.SystemData
    uuid?: si.Systeminformation.UuidData
    version?: string
}