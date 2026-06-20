import { contextBridge, ipcRenderer } from 'electron'

// The only surface the renderer can touch. No Node, no API key, no ipcRenderer.
const api = {
  /** Send the conversation to the DM and resolve with the full reply text. */
  dmRespond: (payload: unknown): Promise<string> =>
    ipcRenderer.invoke('dm:respond', payload),

  /** Subscribe to streaming text deltas. Returns an unsubscribe function. */
  onDelta: (cb: (delta: string) => void): (() => void) => {
    const listener = (_e: unknown, delta: string): void => cb(delta)
    ipcRenderer.on('dm:delta', listener)
    return () => ipcRenderer.removeListener('dm:delta', listener)
  },

  saveGame: (state: unknown): Promise<void> => ipcRenderer.invoke('store:save', state),
  loadGame: (): Promise<unknown> => ipcRenderer.invoke('store:load'),
  clearGame: (): Promise<void> => ipcRenderer.invoke('store:clear')
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
