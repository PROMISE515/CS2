import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    getSetupStatus: () => ipcRenderer.invoke('get-setup-status'),
});
