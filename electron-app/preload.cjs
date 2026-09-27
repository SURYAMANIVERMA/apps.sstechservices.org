const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nexeus", {
  generateSession: () => ipcRenderer.invoke("nexeus:generate-session"),
  getProfile: () => ipcRenderer.invoke("nexeus:get-profile"),
  saveProfile: (profile) => ipcRenderer.invoke("nexeus:save-profile", profile),
  registerDevice: (payload) => ipcRenderer.invoke("nexeus:register-device", payload),
  copy: (text) => ipcRenderer.invoke("nexeus:copy", text),
  openExternal: (url) => ipcRenderer.invoke("nexeus:open-external", url),
  platform: process.platform,
  version: process.versions.electron,
});
