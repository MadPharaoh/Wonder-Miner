import { BrowserWindow } from "electron";
import { INotificationService } from "./INotificationService";
import { ErrorMessage } from './models/ErrorMessage'
import { PluginStatus } from './models/PluginStatus'
import { StatusMessage } from './models/StatusMessage'

export class NotificationService implements INotificationService {
    constructor(private readonly window: BrowserWindow ,private readonly onStatusChange?: (status: PluginStatus) => void) {}

    sendStatus(message: StatusMessage): void {
        this.onStatusChange?.(message.status)
        if (message.status !== PluginStatus.Stopped) {
          this.window.webContents.send('mining-status', message = {
                  name: message.name,
                  status: PluginStatus.Running
          })
      } else if (message.status === PluginStatus.Stopped) {
              this.window.webContents.send('mining-status',message)
              }
    }
    
    sendError(message: ErrorMessage): void {
        this.window.webContents.send('mining-error', message)
        }
    }

