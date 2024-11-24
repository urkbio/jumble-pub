import { app, ipcMain } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

export class StorageService {
  private path: string
  private config: Record<string, string> = {}
  private writeTimer: NodeJS.Timeout | null = null

  constructor() {
    this.path = path.join(app.getPath('userData'), 'config.json')
    this.checkConfigFile(this.path)
    const json = readFileSync(this.path, 'utf-8')
    this.config = JSON.parse(json)
  }

  init() {
    ipcMain.handle('storage:getItem', (_, key: string) => this.getItem(key))
    ipcMain.handle('storage:setItem', (_, key: string, value: string) => this.setItem(key, value))
  }

  getItem(key: string): string | undefined {
    const value = this.config[key]
    // backward compatibility
    if (value && typeof value !== 'string') return JSON.stringify(value)

    return value
  }

  setItem(key: string, value: string) {
    this.config[key] = value
    if (this.writeTimer) return

    this.writeTimer = setTimeout(() => {
      this.writeTimer = null
      writeFileSync(this.path, JSON.stringify(this.config))
    }, 1000)
  }

  private checkConfigFile(path: string) {
    try {
      if (!existsSync(path)) {
        writeFileSync(path, '{}')
      }
    } catch (err) {
      console.error(err)
    }
  }
}
